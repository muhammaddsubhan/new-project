import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  LayoutDashboard,
  MessageSquare,
  Package,
  Sliders,
  Star,
  Store,
  Tag,
} from 'lucide-react';
import { ORDER_STATUS_SEQUENCE } from '../data/karachiDemoData';
import { useWashMate } from '../context/WashMateContext';
import { DashboardShell, type DashboardNavItem } from '../components/DashboardShell';
import { OrderStatusLabel, VerificationLabel } from '../components/StatusBadge';
import type { OrderStatus } from '../types/washmate';

export const PROVIDER_NAV_ITEMS: DashboardNavItem[] = [
  { to: '/provider/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/provider/orders', label: 'Orders Queue', icon: <Package className="h-4 w-4" /> },
  { to: '/provider/services', label: 'Services', icon: <Sliders className="h-4 w-4" /> },
  { to: '/provider/pricing', label: 'Clothing Prices', icon: <Tag className="h-4 w-4" /> },
  { to: '/provider/profile', label: 'Business Profile', icon: <Store className="h-4 w-4" /> },
  { to: '/provider/earnings', label: 'Earnings', icon: <DollarSign className="h-4 w-4" /> },
  { to: '/provider/reviews', label: 'Reviews', icon: <MessageSquare className="h-4 w-4" /> },
];

export function useMyProvider() {
  const { currentUser, providers } = useWashMate();
  return providers.find((p) => p.ownerId === currentUser?.uid) || null;
}

export const ProviderDashboardPage: React.FC = () => {
  const { orders, platformSettings } = useWashMate();
  const myProvider = useMyProvider();

  const myOrders = useMemo(
    () => (myProvider ? orders.filter((o) => o.providerId === myProvider.id) : []),
    [orders, myProvider]
  );

  const pendingOrders = myOrders.filter((o) => o.status === 'Order Placed');
  const activeOrders = myOrders.filter(
    (o) => o.status !== 'Order Placed' && o.status !== 'Delivered' && o.status !== 'Cancelled'
  );
  const completedOrders = myOrders.filter((o) => o.status === 'Delivered');
  const totalSalesPkr = myOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.subtotalPkr, 0);
  const netEarningsPkr = Math.round(totalSalesPkr * (1 - platformSettings.commissionPercent / 100));

  const popularItems = useMemo(() => {
    const counts = new Map<string, number>();
    myOrders.forEach((o) => {
      o.items.forEach((item) => {
        counts.set(item.itemName, (counts.get(item.itemName) || 0) + item.quantity);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [myOrders]);

  if (!myProvider) {
    return (
      <DashboardShell portalLabel="Partner Portal" breadcrumb="Dashboard" navItems={PROVIDER_NAV_ITEMS}>
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <h2 className="text-lg font-bold text-slate-900">Complete Your Laundry Business Profile</h2>
          <p className="mt-2 text-sm text-slate-600">
            Register your Karachi shop address, service areas, and PKR pricing to start receiving orders.
          </p>
          <Link
            to="/provider/profile"
            className="mt-5 inline-block px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-xl"
          >
            Set Up Laundry Business
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      portalLabel="Partner Portal"
      breadcrumb="Business Overview"
      navItems={PROVIDER_NAV_ITEMS}
      primaryAction={{ label: 'Manage Orders', to: '/provider/orders' }}
    >
      {/* Status Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">{myProvider.businessName}</h2>
            <VerificationLabel status={myProvider.verificationStatus} isDemo={myProvider.isDemo} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {myProvider.primaryArea} · Serves {myProvider.serviceAreas.join(', ')}
          </p>
        </div>
        <Link
          to={`/provider/${myProvider.id}`}
          className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap"
        >
          View Public Listing
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Total Orders</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-slate-900 tabular-nums">
            {myOrders.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-amber-700 tabular-nums">
            {pendingOrders.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Active</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-blue-900 tabular-nums">
            {activeOrders.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-emerald-700 tabular-nums">
            {completedOrders.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Total Sales</p>
          <p className="mt-1.5 font-mono-num text-lg font-extrabold text-slate-900">
            Rs. {totalSalesPkr.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Est. Earnings</p>
          <p className="mt-1.5 font-mono-num text-lg font-extrabold text-emerald-700">
            Rs. {netEarningsPkr.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
            <Link to="/provider/orders" className="text-xs font-semibold text-sky-700 hover:underline">
              Open Orders Queue
            </Link>
          </div>
          {myOrders.length === 0 ? (
            <p className="text-sm text-slate-500 py-6">No customer orders received yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {myOrders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-num text-sm font-bold text-slate-900">{ord.orderNumber}</span>
                      <OrderStatusLabel status={ord.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {ord.customerName} · {ord.area} · Pickup {ord.pickupDate} ({ord.pickupTimeSlot})
                    </p>
                  </div>
                  <span className="font-mono-num text-sm font-bold text-blue-950">
                    Rs. {ord.grandTotalPkr.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Most Popular Clothing Items</h3>
          {popularItems.length === 0 ? (
            <p className="text-xs text-slate-500">Order volume will populate item analytics.</p>
          ) : (
            <div className="space-y-3">
              {popularItems.map(([name, qty]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{name}</span>
                  <span className="font-mono-num font-bold text-blue-900">{qty} pcs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
};

export const ProviderOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useWashMate();
  const myProvider = useMyProvider();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const myOrders = useMemo(
    () =>
      myProvider
        ? orders.filter(
            (o) =>
              o.providerId === myProvider.id &&
              (filterStatus === 'All' || o.status === filterStatus)
          )
        : [],
    [orders, myProvider, filterStatus]
  );

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = ORDER_STATUS_SEQUENCE.indexOf(current);
    if (idx < 0 || idx >= ORDER_STATUS_SEQUENCE.length - 1) return null;
    return ORDER_STATUS_SEQUENCE[idx + 1];
  };

  return (
    <DashboardShell
      portalLabel="Partner Portal"
      breadcrumb="Orders & Fulfillment"
      navItems={PROVIDER_NAV_ITEMS}
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {['All', 'Order Placed', 'Provider Accepted', 'Washing in Progress', 'Out for Delivery', 'Delivered'].map(
          (st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border ${
                filterStatus === st
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          )
        )}
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500">
          No orders in this status queue.
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((ord) => {
            const nextStep = getNextStatus(ord.status);
            const totalExpected = ord.items.reduce((s, i) => s + i.quantity, 0);
            const isTerminal = ord.status === 'Delivered' || ord.status === 'Cancelled';

            return (
              <div key={ord.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono-num text-base font-extrabold text-slate-900">
                        {ord.orderNumber}
                      </span>
                      <OrderStatusLabel status={ord.status} />
                      {ord.isExpress ? (
                        <span className="text-xs font-semibold text-sky-700">Express Priority</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-700 mt-1">
                      <strong>{ord.customerName}</strong> · {ord.customerPhone} · {ord.area}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ord.pickupAddress}
                      {ord.hostelOrBuilding ? ` · ${ord.hostelOrBuilding}` : ''}
                      {ord.roomNumber ? ` (${ord.roomNumber})` : ''}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="font-mono-num text-lg font-extrabold text-blue-950">
                      Rs. {ord.grandTotalPkr.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ord.paymentMethod} · {ord.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">Garments ({totalExpected} expected):</p>
                  <p>
                    {ord.items
                      .map((i) => `${i.quantity}× ${i.itemName} (${i.serviceType})`)
                      .join(' · ')}
                  </p>
                  {ord.specialInstructions ? (
                    <p className="text-amber-900 pt-1">
                      <strong>Customer Instructions:</strong> {ord.specialInstructions}
                    </p>
                  ) : null}
                </div>

                {!isTerminal ? (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                        Collected Count:
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={counts[ord.id] ?? (ord.collectedItemCount || totalExpected)}
                        onChange={(e) =>
                          setCounts((prev) => ({ ...prev, [ord.id]: Number(e.target.value) }))
                        }
                        className="w-20 px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-mono-num"
                      />
                    </div>
                    <input
                      type="text"
                      value={notes[ord.id] || ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [ord.id]: e.target.value }))}
                      placeholder="Optional rider or wash note..."
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                    />
                    <div className="flex items-center gap-2">
                      {ord.status === 'Order Placed' ? (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'Cancelled', 'Rejected by provider')}
                          className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl"
                        >
                          Reject
                        </button>
                      ) : null}
                      {nextStep ? (
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(
                              ord.id,
                              nextStep,
                              notes[ord.id],
                              counts[ord.id] ?? (ord.collectedItemCount || totalExpected)
                            )
                          }
                          className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl whitespace-nowrap"
                        >
                          {ord.status === 'Order Placed' ? 'Accept Order' : `Move to: ${nextStep}`}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
};

export const ProviderEarningsPage: React.FC = () => {
  const { transactions, platformSettings } = useWashMate();
  const myProvider = useMyProvider();

  const myTx = useMemo(
    () => (myProvider ? transactions.filter((t) => t.providerId === myProvider.id) : []),
    [transactions, myProvider]
  );

  const gross = myTx.reduce((s, t) => s + t.amountPkr, 0);
  const commission = myTx.reduce((s, t) => s + t.commissionPkr, 0);
  const net = myTx.reduce((s, t) => s + t.providerNetPkr, 0);

  return (
    <DashboardShell portalLabel="Partner Portal" breadcrumb="Earnings & Payouts" navItems={PROVIDER_NAV_ITEMS}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Gross Order Volume</p>
          <p className="mt-1 font-mono-num text-2xl font-extrabold text-slate-900">
            Rs. {gross.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">
            WashMate Commission ({platformSettings.commissionPercent}%)
          </p>
          <p className="mt-1 font-mono-num text-2xl font-extrabold text-amber-700">
            Rs. {commission.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Estimated Net Provider Earnings</p>
          <p className="mt-1 font-mono-num text-2xl font-extrabold text-emerald-700">
            Rs. {net.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Gross (PKR)</th>
                <th className="py-3 px-4 text-right">Commission</th>
                <th className="py-3 px-4 text-right">Net Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {myTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono-num text-xs text-slate-800">{tx.orderId}</td>
                  <td className="py-3 px-4 text-xs">{tx.paymentMethod}</td>
                  <td className="py-3 px-4 text-xs font-medium">{tx.status}</td>
                  <td className="py-3 px-4 text-right font-mono-num">Rs. {tx.amountPkr}</td>
                  <td className="py-3 px-4 text-right font-mono-num text-amber-700">Rs. {tx.commissionPkr}</td>
                  <td className="py-3 px-4 text-right font-mono-num font-bold text-emerald-700">
                    Rs. {tx.providerNetPkr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
};

export const ProviderReviewsPage: React.FC = () => {
  const { reviews, replyToReview } = useWashMate();
  const myProvider = useMyProvider();
  const [replies, setReplies] = useState<Record<string, string>>({});

  const myReviews = myProvider ? reviews.filter((r) => r.providerId === myProvider.id) : [];

  return (
    <DashboardShell portalLabel="Partner Portal" breadcrumb="Customer Reviews" navItems={PROVIDER_NAV_ITEMS}>
      {myReviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500">
          No customer reviews yet.
        </div>
      ) : (
        <div className="space-y-4">
          {myReviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{rev.customerName}</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {rev.rating}.0
                </span>
              </div>
              <p className="text-sm text-slate-700">{rev.comment}</p>
              {rev.providerReply ? (
                <p className="text-xs bg-sky-50 text-blue-950 rounded-xl p-3">
                  <strong>Your Reply:</strong> {rev.providerReply}
                </p>
              ) : (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={replies[rev.id] || ''}
                    onChange={(e) => setReplies((prev) => ({ ...prev, [rev.id]: e.target.value }))}
                    placeholder="Write a polite response..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => replyToReview(rev.id, replies[rev.id] || '')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-xl"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
};
