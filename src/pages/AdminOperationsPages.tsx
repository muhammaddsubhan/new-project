import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  Store,
  Tag,
  Users,
  XCircle,
} from 'lucide-react';
import { ORDER_STATUS_SEQUENCE } from '../data/karachiDemoData';
import { useWashMate } from '../context/WashMateContext';
import { DashboardShell, type DashboardNavItem } from '../components/DashboardShell';
import { OrderStatusLabel, VerificationLabel } from '../components/StatusBadge';
import type { OrderStatus } from '../types/washmate';

export const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  { to: '/admin/dashboard', label: 'Analytics', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/admin/providers', label: 'Providers', icon: <Store className="h-4 w-4" /> },
  { to: '/admin/customers', label: 'Customers', icon: <Users className="h-4 w-4" /> },
  { to: '/admin/orders', label: 'Orders & Disputes', icon: <Package className="h-4 w-4" /> },
  { to: '/admin/commissions', label: 'Commissions', icon: <Percent className="h-4 w-4" /> },
  { to: '/admin/coupons', label: 'Coupons', icon: <Tag className="h-4 w-4" /> },
  { to: '/admin/settings', label: 'Platform Settings', icon: <Settings className="h-4 w-4" /> },
];

export const AdminDashboardPage: React.FC = () => {
  const { allUsers, providers, orders, complaints, platformSettings } = useWashMate();

  const customersCount = allUsers.filter((u) => u.role === 'customer').length;
  const approvedProviders = providers.filter((p) => p.verificationStatus === 'Approved');
  const pendingProviders = providers.filter((p) => p.verificationStatus === 'Pending');
  const openComplaints = complaints.filter((c) => c.status === 'Open' || c.status === 'Investigating');

  const gmvPkr = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.grandTotalPkr, 0);
  const commissionRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.commissionPkr, 0);

  const areaCounts = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => map.set(o.area, (map.get(o.area) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  return (
    <DashboardShell
      portalLabel="Admin Console"
      breadcrumb="Marketplace Analytics"
      navItems={ADMIN_NAV_ITEMS}
      primaryAction={{ label: 'Review Pending Shops', to: '/admin/providers' }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Customers</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-slate-900 tabular-nums">
            {customersCount}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Approved Shops</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-emerald-700 tabular-nums">
            {approvedProviders.length}
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5 tabular-nums">
            {pendingProviders.length} pending review
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Total Orders</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-blue-900 tabular-nums">
            {orders.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Platform GMV</p>
          <p className="mt-1.5 font-mono-num text-lg font-extrabold text-slate-900">
            Rs. {gmvPkr.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500">
            Commission ({platformSettings.commissionPercent}%)
          </p>
          <p className="mt-1.5 font-mono-num text-lg font-extrabold text-emerald-700">
            Rs. {commissionRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Orders by Karachi Area</h2>
          {areaCounts.length === 0 ? (
            <p className="text-sm text-slate-500">No orders recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {areaCounts.map(([area, count]) => (
                <div key={area} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{area}</span>
                  <span className="font-mono-num font-bold text-blue-900">{count} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-900 mb-2">Open Protection Disputes</h2>
          <p className="text-xs text-slate-500 mb-4">
            {openComplaints.length} open claims requiring administrative review.
          </p>
          {openComplaints.length === 0 ? (
            <p className="text-sm text-emerald-700">All customer protection claims are resolved.</p>
          ) : (
            <div className="space-y-2.5 text-xs">
              {openComplaints.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="font-bold text-amber-950">
                    {c.type} · Order {c.orderId}
                  </p>
                  <p className="text-amber-900 mt-0.5">{c.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
};

export const AdminProvidersPage: React.FC = () => {
  const { providers, adminSetProviderStatus } = useWashMate();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  const filtered = providers.filter((p) => filter === 'All' || p.verificationStatus === filter);

  return (
    <DashboardShell
      portalLabel="Admin Console"
      breadcrumb="Provider Verification & Directory"
      navItems={ADMIN_NAV_ITEMS}
    >
      <div className="mb-5 flex gap-2">
        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border ${
              filter === tab
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((prov) => (
          <div
            key={prov.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">{prov.businessName}</h3>
                <VerificationLabel status={prov.verificationStatus} isDemo={prov.isDemo} />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {prov.primaryArea} · {prov.address}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Contact: {prov.phone} · {prov.email} · Areas: {prov.serviceAreas.join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => adminSetProviderStatus(prov.id, 'Approved')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => adminSetProviderStatus(prov.id, 'Rejected')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
};

export const AdminCustomersPage: React.FC = () => {
  const { allUsers, orders, adminToggleUserSuspension } = useWashMate();

  return (
    <DashboardShell
      portalLabel="Admin Console"
      breadcrumb="User & Account Management"
      navItems={ADMIN_NAV_ITEMS}
    >
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Referral Code</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map((u) => {
                const count = orders.filter((o) => o.customerId === u.uid).length;
                return (
                  <tr key={u.uid} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{u.displayName}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3 px-4 text-xs capitalize font-medium">{u.role}</td>
                    <td className="py-3 px-4 font-mono-num text-xs">{u.referralCode}</td>
                    <td className="py-3 px-4 font-mono-num text-xs">{count}</td>
                    <td className="py-3 px-4 text-xs font-semibold">
                      {u.suspended ? (
                        <span className="text-rose-700">Suspended</span>
                      ) : (
                        <span className="text-emerald-700">Active</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' ? (
                        <button
                          type="button"
                          onClick={() => adminToggleUserSuspension(u.uid, !u.suspended)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
                            u.suspended
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {u.suspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Protected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
};

export const AdminOrdersPage: React.FC = () => {
  const { orders, complaints, updateOrderStatus, adminResolveComplaint } = useWashMate();
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  return (
    <DashboardShell
      portalLabel="Admin Console"
      breadcrumb="Orders & Protection Disputes"
      navItems={ADMIN_NAV_ITEMS}
    >
      <div className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">All Marketplace Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Area</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono-num font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-3 px-4">{ord.customerName}</td>
                    <td className="py-3 px-4">{ord.providerName}</td>
                    <td className="py-3 px-4">{ord.area}</td>
                    <td className="py-3 px-4 font-mono-num font-semibold">Rs. {ord.grandTotalPkr}</td>
                    <td className="py-3 px-4">
                      <OrderStatusLabel status={ord.status} />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateOrderStatus(ord.id, e.target.value as OrderStatus, 'Admin status update')
                        }
                        className="px-2 py-1 border border-slate-200 rounded-lg bg-white"
                      >
                        {[...ORDER_STATUS_SEQUENCE, 'Cancelled'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Laundry Protection Complaints */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Laundry Protection Complaints & Disputes</h2>
          {complaints.length === 0 ? (
            <p className="text-sm text-slate-500">No customer complaints filed.</p>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900">
                      {c.type} · Order {c.orderId} ({c.affectedItemsCount} items)
                    </span>
                    <span className="font-semibold text-blue-900">{c.status}</span>
                  </div>
                  <p className="text-sm text-slate-700">{c.description}</p>
                  {c.resolutionNote ? (
                    <p className="text-xs text-emerald-800 bg-emerald-50 rounded-lg p-2.5">
                      Resolution: {c.resolutionNote}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <input
                      type="text"
                      value={resolutionNotes[c.id] || ''}
                      onChange={(e) =>
                        setResolutionNotes((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      placeholder="Resolution note..."
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        adminResolveComplaint(c.id, 'Resolved', resolutionNotes[c.id] || 'Resolved by Admin')
                      }
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-xl"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
};
