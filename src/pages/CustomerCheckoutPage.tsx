import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { KARACHI_AREAS, SPECIAL_INSTRUCTION_PRESETS, TIME_SLOTS } from '../data/karachiDemoData';
import { useWashMate, type QuoteSummary } from '../context/WashMateContext';
import { DashboardShell } from '../components/DashboardShell';
import { CUSTOMER_NAV_ITEMS } from './CustomerDashboardPage';
import type { PaymentMethod } from '../types/washmate';

export const CustomerCheckoutPage: React.FC = () => {
  const {
    currentUser,
    cart,
    providers,
    addresses,
    fetchServerQuote,
    placeOrder,
    serverConfig,
  } = useWashMate();
  const navigate = useNavigate();

  const provider = providers.find((p) => p.id === cart.providerId);
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(today.getTime() + 48 * 60 * 60 * 1000);

  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [area, setArea] = useState(defaultAddress?.area || provider?.primaryArea || KARACHI_AREAS[0]);
  const [pickupAddress, setPickupAddress] = useState(defaultAddress?.fullAddress || '');
  const [hostelOrBuilding, setHostelOrBuilding] = useState(defaultAddress?.hostelOrBuilding || '');
  const [roomNumber, setRoomNumber] = useState(defaultAddress?.roomNumber || '');
  const [pickupDate, setPickupDate] = useState(today.toISOString().slice(0, 10));
  const [pickupTimeSlot, setPickupTimeSlot] = useState(TIME_SLOTS[1]);
  const [deliveryDate, setDeliveryDate] = useState(
    (cart.isExpress ? tomorrow : dayAfter).toISOString().slice(0, 10)
  );
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(TIME_SLOTS[3]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [quote, setQuote] = useState<QuoteSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const idempotencyKey = useMemo(
    () => `wm_${currentUser?.uid || 'guest'}_${cart.providerId}_${cart.items.length}_${Date.now()}`,
    [currentUser?.uid, cart.providerId, cart.items.length]
  );

  useEffect(() => {
    fetchServerQuote(false)
      .then(setQuote)
      .catch(() => {});
  }, [fetchServerQuote]);

  const appendInstruction = (text: string) => {
    setSpecialInstructions((prev) => {
      if (prev.includes(text)) return prev;
      return prev ? `${prev}. ${text}` : text;
    });
  };

  const applySavedAddress = (addrId: string) => {
    const found = addresses.find((a) => a.id === addrId);
    if (!found) return;
    setArea(found.area);
    setPickupAddress(found.fullAddress);
    setHostelOrBuilding(found.hostelOrBuilding || '');
    setRoomNumber(found.roomNumber || '');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      const result = await placeOrder({
        customerName,
        customerPhone,
        customerEmail,
        area,
        pickupAddress,
        hostelOrBuilding,
        roomNumber,
        pickupDate,
        pickupTimeSlot,
        deliveryDate,
        deliveryTimeSlot,
        specialInstructions,
        paymentMethod,
        idempotencyKey,
      });
      navigate(`/customer/orders/${result.order.id}`, {
        state: { paymentNotice: result.paymentNotice, justCreated: true },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0 || !provider) {
    return (
      <DashboardShell
        portalLabel="Customer Portal"
        breadcrumb="Checkout"
        navItems={CUSTOMER_NAV_ITEMS}
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-600">Your cart is empty. Add garments before checking out.</p>
          <Link
            to="/find-laundry"
            className="mt-4 inline-block px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-xl"
          >
            Find Laundry Providers
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      portalLabel="Customer Portal"
      breadcrumb="Pickup & Delivery Checkout"
      navItems={CUSTOMER_NAV_ITEMS}
    >
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {!currentUser ? (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-center justify-between gap-3">
              <span>Sign in or launch a Customer Demo session to confirm your booking.</span>
              <Link to="/login" className="font-bold underline whitespace-nowrap">
                Sign In / Demo
              </Link>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Contact Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">1. Customer Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Karachi Address & Hostel Pickup */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">2. Karachi Pickup & Hostel Details</h2>
              {addresses.length > 0 ? (
                <select
                  onChange={(e) => applySavedAddress(e.target.value)}
                  defaultValue=""
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="" disabled>
                    Fill from saved addresses...
                  </option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} ({a.area})
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Karachi Area</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"
                >
                  {provider.serviceAreas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Filtered to neighborhoods served by {provider.businessName}.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hostel or Building Name
                </label>
                <input
                  type="text"
                  value={hostelOrBuilding}
                  onChange={(e) => setHostelOrBuilding(e.target.value)}
                  placeholder="e.g. Sir Syed Hostel Block B / Al-Noor Arcade"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="House / Plot #, Street, Block, Landmark"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room / Flat # (Optional)
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 214"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Schedule & Special Instructions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">3. Pickup & Delivery Schedule</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Date</label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Time Slot</label>
                <select
                  value={pickupTimeSlot}
                  onChange={(e) => setPickupTimeSlot(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Delivery Date
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Delivery Slot
                </label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Special Garment Instructions
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {SPECIAL_INSTRUCTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => appendInstruction(preset)}
                    className="px-2.5 py-1 text-xs bg-sky-50 hover:bg-sky-100 text-blue-900 rounded-lg border border-sky-200"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any fabric notes, detergent preferences, or hostel gate instructions..."
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">4. Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  {
                    id: 'COD' as PaymentMethod,
                    title: 'Cash on Delivery',
                    desc: 'Pay rider in cash upon garment return.',
                    ready: true,
                  },
                  {
                    id: 'JazzCash' as PaymentMethod,
                    title: 'JazzCash',
                    desc: serverConfig.jazzCashConfigured
                      ? 'Gateway credentials configured'
                      : 'Integration-ready (merchant credentials required)',
                    ready: serverConfig.jazzCashConfigured,
                  },
                  {
                    id: 'Easypaisa' as PaymentMethod,
                    title: 'Easypaisa',
                    desc: serverConfig.easypaisaConfigured
                      ? 'Gateway credentials configured'
                      : 'Integration-ready (store credentials required)',
                    ready: serverConfig.easypaisaConfigured,
                  },
                ] as const
              ).map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    paymentMethod === pm.id
                      ? 'border-blue-900 bg-sky-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{pm.title}</span>
                    {paymentMethod === pm.id ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-900" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{pm.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>
            <p className="mt-3 text-xs font-semibold text-blue-900">{provider.businessName}</p>
            <div className="mt-3 space-y-2 text-xs text-slate-600 max-h-48 overflow-auto">
              {cart.items.map((item) => (
                <div key={`${item.clothingItemId}-${item.serviceType}`} className="flex justify-between">
                  <span>
                    {item.quantity} × {item.itemName} ({item.serviceType})
                  </span>
                  <span className="font-mono-num text-slate-900">
                    Rs. {item.unitPricePkr * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {quote ? (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm tabular-nums">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono-num">Rs. {quote.subtotalPkr}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pickup + Delivery</span>
                  <span className="font-mono-num">Rs. {quote.pickupFeePkr + quote.deliveryFeePkr}</span>
                </div>
                {quote.expressFeePkr > 0 ? (
                  <div className="flex justify-between text-sky-800">
                    <span>Express</span>
                    <span className="font-mono-num">Rs. {quote.expressFeePkr}</span>
                  </div>
                ) : null}
                {quote.discountPkr > 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-mono-num">- Rs. {quote.discountPkr}</span>
                  </div>
                ) : null}
                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-blue-950">
                  <span>Total Payable</span>
                  <span className="font-mono-num">Rs. {quote.grandTotalPkr.toLocaleString()}</span>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || !currentUser}
              className="mt-5 w-full px-4 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 rounded-xl transition-colors"
            >
              {submitting ? 'Confirming Booking...' : 'Confirm & Book Laundry'}
            </button>

            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              Final PKR prices verified on the WashMate server before order creation.
            </p>
          </div>
        </aside>
      </form>
    </DashboardShell>
  );
};
