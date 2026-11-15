import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Repeat,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { ORDER_STATUS_SEQUENCE } from '../data/karachiDemoData';
import { useWashMate } from '../context/WashMateContext';
import { DashboardShell } from '../components/DashboardShell';
import { CUSTOMER_NAV_ITEMS } from './CustomerDashboardPage';
import { OrderStatusLabel } from '../components/StatusBadge';
import type { LaundryComplaint } from '../types/washmate';

export const CustomerOrdersPage: React.FC = () => {
  const { currentUser, orders, repeatOrder } = useWashMate();
  const navigate = useNavigate();

  const myOrders = orders.filter((o) => o.customerId === currentUser?.uid);

  const handleRepeat = async (order: typeof myOrders[number]) => {
    await repeatOrder(order);
    navigate('/customer/cart');
  };

  return (
    <DashboardShell
      portalLabel="Customer Portal"
      breadcrumb="My Orders"
      navItems={CUSTOMER_NAV_ITEMS}
      primaryAction={{ label: 'Book New Order', to: '/find-laundry' }}
    >
      {myOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-600">You have no orders yet.</p>
          <Link
            to="/find-laundry"
            className="mt-4 inline-block px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-xl"
          >
            Browse Laundry Providers
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/customer/orders/${ord.id}`}
                    className="font-mono-num text-base font-bold text-blue-900 hover:underline"
                  >
                    {ord.orderNumber}
                  </Link>
                  <OrderStatusLabel status={ord.status} />
                  {ord.isExpress ? (
                    <span className="text-xs font-semibold text-sky-700">Express</span>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1">{ord.providerName}</p>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {ord.area} · Pickup: {ord.pickupDate} ({ord.pickupTimeSlot}) · Payment: {ord.paymentMethod} ({ord.paymentStatus})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono-num text-base font-extrabold text-slate-900">
                  Rs. {ord.grandTotalPkr.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleRepeat(ord)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  <Repeat className="h-3.5 w-3.5" />
                  Repeat Order
                </button>
                <Link
                  to={`/customer/orders/${ord.id}`}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
                >
                  Track Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
};

export const CustomerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state as { paymentNotice?: string; justCreated?: boolean } | null) || null;

  const { orders, cancelCustomerOrder, submitReview, submitComplaint, repeatOrder } = useWashMate();
  const navigate = useNavigate();

  const order = orders.find((o) => o.id === id);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [showComplaint, setShowComplaint] = useState(false);
  const [compType, setCompType] = useState<LaundryComplaint['type']>('Missing Item');
  const [compCount, setCompCount] = useState(1);
  const [compDesc, setCompDesc] = useState('');
  const [compSuccess, setCompSuccess] = useState('');

  const [waPreview, setWaPreview] = useState<{ formattedMessage: string; waMeUrl: string } | null>(null);
  const [actionError, setActionError] = useState('');

  if (!order) {
    return (
      <DashboardShell portalLabel="Customer Portal" breadcrumb="Order Tracking" navItems={CUSTOMER_NAV_ITEMS}>
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-600">Order not found.</p>
          <Link to="/customer/orders" className="mt-4 inline-block text-sm font-semibold text-blue-900 underline">
            Back to Orders
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const currentIdx = ORDER_STATUS_SEQUENCE.indexOf(order.status);

  const handleWhatsAppPreview = async () => {
    const resp = await fetch('/api/notifications/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: order.customerPhone,
        orderNumber: order.orderNumber,
        status: order.status,
        providerName: order.providerName,
        area: order.area,
      }),
    });
    const data = await resp.json();
    setWaPreview(data);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await submitReview({ order, rating, comment });
      setReviewSubmitted(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to submit review.');
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await submitComplaint({
        order,
        type: compType,
        description: compDesc,
        affectedItemsCount: compCount,
      });
      setCompSuccess('Laundry Protection claim submitted for Admin & Provider review.');
      setShowComplaint(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to file claim.');
    }
  };

  return (
    <DashboardShell
      portalLabel="Customer Portal"
      breadcrumb={`Order ${order.orderNumber}`}
      navItems={CUSTOMER_NAV_ITEMS}
    >
      <div className="space-y-6">
        {state?.justCreated ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Order {order.orderNumber} Confirmed</p>
              {state.paymentNotice ? <p className="text-xs mt-1">{state.paymentNotice}</p> : null}
            </div>
          </div>
        ) : null}

        {actionError ? (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            {actionError}
          </div>
        ) : null}

        {compSuccess ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
            {compSuccess}
          </div>
        ) : null}

        {/* Header Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-mono-num text-xl font-extrabold text-slate-900">{order.orderNumber}</h2>
              <OrderStatusLabel status={order.status} />
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {order.providerName} · {order.area}
              {order.hostelOrBuilding ? ` · ${order.hostelOrBuilding}` : ''}
              {order.roomNumber ? ` (${order.roomNumber})` : ''}
            </p>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              Collected Count Verified: <strong>{order.collectedItemCount}</strong> garments · Payment: {order.paymentMethod} ({order.paymentStatus})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleWhatsAppPreview}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp Update
            </button>
            <button
              type="button"
              onClick={async () => {
                await repeatOrder(order);
                navigate('/customer/cart');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-900 bg-sky-50 hover:bg-sky-100 rounded-xl"
            >
              <Repeat className="h-3.5 w-3.5" />
              Repeat Order
            </button>
            {order.status === 'Order Placed' ? (
              <button
                type="button"
                onClick={() => cancelCustomerOrder(order.id)}
                className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl"
              >
                Cancel Order
              </button>
            ) : null}
          </div>
        </div>

        {waPreview ? (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold">WhatsApp Status Dispatch Ready</p>
              <p className="mt-0.5">{waPreview.formattedMessage}</p>
            </div>
            <a
              href={waPreview.waMeUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 font-semibold bg-emerald-700 text-white rounded-xl whitespace-nowrap self-start"
            >
              Open in WhatsApp
            </a>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 11-Stage Progress Timeline */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-5">Live Order Tracking Timeline</h3>

            {order.status === 'Cancelled' ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800">
                This order was cancelled. Check the history log below for details.
              </div>
            ) : (
              <ol className="space-y-3">
                {ORDER_STATUS_SEQUENCE.map((step, idx) => {
                  const historyEvent = order.statusHistory.find((h) => h.status === step);
                  const reached = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <li
                      key={step}
                      className={`flex items-start justify-between gap-4 p-3 rounded-xl border ${
                        isCurrent
                          ? 'border-blue-900 bg-sky-50/70'
                          : reached
                            ? 'border-emerald-200 bg-emerald-50/40'
                            : 'border-slate-100 bg-slate-50/50 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 h-5 w-5 rounded-full text-[11px] font-mono-num font-bold flex items-center justify-center shrink-0 ${
                            reached ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{step}</p>
                          {historyEvent?.note ? (
                            <p className="text-xs text-slate-600 mt-0.5">{historyEvent.note}</p>
                          ) : null}
                        </div>
                      </div>
                      <span className="font-mono-num text-[11px] text-slate-500 whitespace-nowrap">
                        {historyEvent ? historyEvent.timestamp.slice(0, 16).replace('T', ' ') : 'Pending'}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Items, Protection & Review */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Garment Breakdown & Totals
              </h3>
              <div className="mt-3 space-y-2 text-xs text-slate-700">
                {order.items.map((item) => (
                  <div key={`${item.clothingItemId}-${item.serviceType}`} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.itemName} ({item.serviceType})
                    </span>
                    <span className="font-mono-num font-semibold text-slate-900">
                      Rs. {item.unitPricePkr * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              {order.specialInstructions ? (
                <p className="mt-4 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700">
                  <strong>Instructions:</strong> {order.specialInstructions}
                </p>
              ) : null}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs tabular-nums">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono-num">Rs. {order.subtotalPkr}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pickup + Delivery + Express</span>
                  <span className="font-mono-num">
                    Rs. {order.pickupFeePkr + order.deliveryFeePkr + order.expressFeePkr}
                  </span>
                </div>
                {order.discountPkr > 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon ({order.couponCode})</span>
                    <span className="font-mono-num">- Rs. {order.discountPkr}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-extrabold text-blue-950 pt-2 border-t border-slate-100">
                  <span>Grand Total</span>
                  <span className="font-mono-num">Rs. {order.grandTotalPkr.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Laundry Protection Claim */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 inline-flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-700" />
                  Laundry Protection
                </h3>
                <button
                  type="button"
                  onClick={() => setShowComplaint((s) => !s)}
                  className="text-xs font-semibold text-sky-700 hover:underline"
                >
                  {showComplaint ? 'Close' : 'Report Missing / Damaged Item'}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Collection count logged by provider: <strong>{order.collectedItemCount}</strong> items.
              </p>

              {showComplaint ? (
                <form onSubmit={handleComplaintSubmit} className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={compType}
                      onChange={(e) => setCompType(e.target.value as LaundryComplaint['type'])}
                      className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="Missing Item">Missing Item</option>
                      <option value="Damaged Garment">Damaged Garment</option>
                      <option value="Late Delivery">Late Delivery</option>
                      <option value="Billing">Billing</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      value={compCount}
                      onChange={(e) => setCompCount(Number(e.target.value))}
                      placeholder="Affected items"
                      className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono-num"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    placeholder="Describe the missing or damaged garment..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl"
                  >
                    Submit Protection Claim
                  </button>
                </form>
              ) : null}
            </div>

            {/* Verified Review (Delivered Orders Only) */}
            {order.status === 'Delivered' && !order.hasReviewed && !reviewSubmitted ? (
              <form onSubmit={handleReviewSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 inline-flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Rate {order.providerName}
                </h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        rating === num ? 'bg-blue-900 text-white border-blue-900' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {num}★
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share how the wash quality, ironing, and delivery timing were..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
                >
                  Submit Verified Review
                </button>
              </form>
            ) : order.status !== 'Delivered' ? (
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-slate-500 shrink-0" />
                Reviews unlock once this order reaches Delivered status.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};
