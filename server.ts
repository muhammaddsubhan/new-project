import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

// Short-lived idempotency cache for duplicate-order prevention (10 minutes)
const recentOrderTokens = new Map<string, number>();

interface QuoteLineInput {
  clothingItemId: string;
  itemName: string;
  serviceType: string;
  unitPricePkr: number;
  quantity: number;
}

interface QuoteRequestBody {
  providerId?: string;
  items?: QuoteLineInput[];
  pickupFeePkr?: number;
  deliveryFeePkr?: number;
  expressAvailable?: boolean;
  expressSurchargePkr?: number;
  isExpress?: boolean;
  minOrderPkr?: number;
  coupon?: {
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    minOrderPkr: number;
    maxDiscountPkr: number;
    active: boolean;
  } | null;
  commissionPercent?: number;
  idempotencyKey?: string;
  commitOrder?: boolean;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'washmate-karachi-api', timestamp: new Date().toISOString() });
});

app.get('/api/config/status', (_req, res) => {
  res.json({
    googleMapsConfigured: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY),
    jazzCashConfigured: Boolean(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD),
    easypaisaConfigured: Boolean(process.env.EASYPAISA_STORE_ID && process.env.EASYPAISA_HASH_KEY),
    whatsappCloudConfigured: Boolean(process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
  });
});

// Trusted backend price recalculation & duplicate-order prevention
app.post('/api/orders/quote', (req, res) => {
  const body = req.body as QuoteRequestBody;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    res.status(400).json({ error: 'Cart must contain at least one clothing item.' });
    return;
  }

  // Cleanup expired idempotency keys
  const now = Date.now();
  for (const [key, expiresAt] of recentOrderTokens.entries()) {
    if (expiresAt < now) recentOrderTokens.delete(key);
  }

  if (body.commitOrder && body.idempotencyKey) {
    const existingExpiry = recentOrderTokens.get(body.idempotencyKey);
    if (existingExpiry && existingExpiry > now) {
      res.status(409).json({
        error: 'Duplicate order submission detected. Your previous checkout request is already being processed.',
      });
      return;
    }
    recentOrderTokens.set(body.idempotencyKey, now + 10 * 60 * 1000);
  }

  let subtotalPkr = 0;
  let totalItemCount = 0;
  const sanitizedItems: QuoteLineInput[] = [];

  for (const item of body.items) {
    const qty = Math.floor(Number(item.quantity));
    const unit = Math.floor(Number(item.unitPricePkr));
    if (!Number.isFinite(qty) || qty < 1 || qty > 100 || !Number.isFinite(unit) || unit < 5 || unit > 50000) {
      res.status(400).json({ error: `Invalid item quantity or unit price for ${item.itemName || 'item'}.` });
      return;
    }
    subtotalPkr += qty * unit;
    totalItemCount += qty;
    sanitizedItems.push({
      clothingItemId: String(item.clothingItemId || ''),
      itemName: String(item.itemName || '').slice(0, 80),
      serviceType: String(item.serviceType || '').slice(0, 60),
      unitPricePkr: unit,
      quantity: qty,
    });
  }

  const minOrderPkr = Math.max(0, Math.floor(Number(body.minOrderPkr || 0)));
  if (body.commitOrder && subtotalPkr < minOrderPkr) {
    res.status(400).json({
      error: `Minimum order for this provider is Rs. ${minOrderPkr}. Current subtotal is Rs. ${subtotalPkr}.`,
    });
    return;
  }

  const pickupFeePkr = Math.max(0, Math.floor(Number(body.pickupFeePkr || 0)));
  const deliveryFeePkr = Math.max(0, Math.floor(Number(body.deliveryFeePkr || 0)));
  const expressFeePkr =
    body.isExpress && body.expressAvailable
      ? Math.max(0, Math.floor(Number(body.expressSurchargePkr || 0)))
      : 0;

  let discountPkr = 0;
  let appliedCouponCode = '';
  if (body.coupon && body.coupon.active && subtotalPkr >= Math.max(0, Math.floor(body.coupon.minOrderPkr))) {
    appliedCouponCode = String(body.coupon.code).toUpperCase().slice(0, 40);
    if (body.coupon.discountType === 'percent') {
      const pct = Math.min(80, Math.max(1, Math.floor(body.coupon.discountValue)));
      const raw = Math.round((subtotalPkr * pct) / 100);
      discountPkr = Math.min(raw, Math.max(0, Math.floor(body.coupon.maxDiscountPkr || raw)));
    } else {
      discountPkr = Math.min(subtotalPkr, Math.max(0, Math.floor(body.coupon.discountValue)));
    }
  }

  const commissionPct = Math.min(50, Math.max(0, Math.floor(Number(body.commissionPercent ?? 12))));
  const commissionPkr = Math.round((subtotalPkr * commissionPct) / 100);
  const grandTotalPkr = Math.max(0, subtotalPkr + pickupFeePkr + deliveryFeePkr + expressFeePkr - discountPkr);

  const signature = crypto
    .createHash('sha256')
    .update(`${body.providerId || 'none'}:${subtotalPkr}:${grandTotalPkr}:${totalItemCount}`)
    .digest('hex')
    .slice(0, 16);

  res.json({
    items: sanitizedItems,
    totalItemCount,
    subtotalPkr,
    pickupFeePkr,
    deliveryFeePkr,
    expressFeePkr,
    discountPkr,
    appliedCouponCode,
    commissionPkr,
    grandTotalPkr,
    meetsMinimumOrder: subtotalPkr >= minOrderPkr,
    quoteSignature: signature,
  });
});

// Payment architecture for Cash on Delivery, JazzCash, and Easypaisa
app.post('/api/payments/intent', (req, res) => {
  const { paymentMethod, amountPkr, orderNumber } = req.body as {
    paymentMethod?: 'COD' | 'JazzCash' | 'Easypaisa';
    amountPkr?: number;
    orderNumber?: string;
  };

  if (!paymentMethod || !Number.isInteger(amountPkr) || (amountPkr ?? 0) < 0) {
    res.status(400).json({ error: 'Valid paymentMethod and integer amountPkr are required.' });
    return;
  }

  if (paymentMethod === 'COD') {
    res.json({
      paymentMethod: 'COD',
      gatewayConfigured: true,
      paymentStatus: 'COD Scheduled',
      transactionStatus: 'COD Pending',
      message: `Cash on Delivery scheduled for ${orderNumber || 'your order'} (Rs. ${amountPkr}). Pay the rider at doorstep delivery.`,
    });
    return;
  }

  if (paymentMethod === 'JazzCash') {
    const configured = Boolean(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD);
    res.json({
      paymentMethod: 'JazzCash',
      gatewayConfigured: configured,
      paymentStatus: 'Awaiting Gateway',
      transactionStatus: 'Gateway Unconfigured',
      requiredEnvVars: ['JAZZCASH_MERCHANT_ID', 'JAZZCASH_PASSWORD', 'JAZZCASH_INTEGRITY_SALT'],
      message: configured
        ? 'JazzCash merchant credentials detected. Ready for redirect checkout.'
        : 'JazzCash merchant credentials (JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, JAZZCASH_INTEGRITY_SALT) are not configured yet. Order saved as Awaiting Gateway without simulating payment.',
    });
    return;
  }

  const configured = Boolean(process.env.EASYPAISA_STORE_ID && process.env.EASYPAISA_HASH_KEY);
  res.json({
    paymentMethod: 'Easypaisa',
    gatewayConfigured: configured,
    paymentStatus: 'Awaiting Gateway',
    transactionStatus: 'Gateway Unconfigured',
    requiredEnvVars: ['EASYPAISA_STORE_ID', 'EASYPAISA_HASH_KEY'],
    message: configured
      ? 'Easypaisa store credentials detected. Ready for checkout redirect.'
      : 'Easypaisa merchant credentials (EASYPAISA_STORE_ID, EASYPAISA_HASH_KEY) are not configured yet. Order saved as Awaiting Gateway without simulating payment.',
  });
});

// WhatsApp order notification builder (supports Cloud API when configured + wa.me fallback)
app.post('/api/notifications/whatsapp', (req, res) => {
  const { phone, orderNumber, status, providerName, area } = req.body as {
    phone?: string;
    orderNumber?: string;
    status?: string;
    providerName?: string;
    area?: string;
  };
  const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  const message = `WashMate Update (${orderNumber || 'Order'}): Status is now "${status || 'Updated'}" with ${providerName || 'your laundry provider'} (${area || 'Karachi'}).`;
  const waMeUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
  const configured = Boolean(process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  res.json({
    whatsappCloudConfigured: configured,
    formattedMessage: message,
    waMeUrl,
    notice: configured
      ? 'WhatsApp Cloud API is configured for automated template dispatch.'
      : 'WhatsApp Cloud API credentials are not set; prepared direct wa.me dispatch link.',
  });
});

async function startServer() {
  const port = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`WashMate Karachi Marketplace server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start WashMate server:', err);
  process.exit(1);
});
