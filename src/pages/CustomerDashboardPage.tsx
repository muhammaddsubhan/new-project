import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  Repeat,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react';
import { useWashMate } from '../context/WashMateContext';
import { DashboardShell, type DashboardNavItem } from '../components/DashboardShell';
import { OrderStatusLabel } from '../components/StatusBadge';

export const CUSTOMER_NAV_ITEMS: DashboardNavItem[] = [
  { to: '/customer/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/customer/cart', label: 'Shopping Cart', icon: <ShoppingBag className="h-4 w-4" /> },
  { to: '/customer/orders', label: 'My Orders', icon: <Package className="h-4 w-4" /> },
  { to: '/customer/subscription', label: 'Student Plan', icon: <Sparkles className="h-4 w-4" /> },
  { to: '/customer/profile', label: 'Profile & Addresses', icon: <User className="h-4 w-4" /> },
];

export const CustomerDashboardPage: React.FC = () => {
  const {
    currentUser,
    orders,
    subscriptions,
    addresses,
    providers,
    notifications,
    markNotificationRead,
    repeatOrder,
  } = useWashMate();
  const navigate = useNavigate();

  const myOrders = orders.filter((o) => o.customerId === currentUser?.uid);
  const activeOrders = myOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const completedOrders = myOrders.filter((o) => o.status === 'Delivered');
  const activeSub = subscriptions.find((s) => s.status === 'Active' || s.status === 'Pending Payment');
  const favProviders = providers.filter((p) => currentUser?.favoriteProviderIds.includes(p.id));

  const handleRepeat = async (order: typeof myOrders[number]) => {
    await repeatOrder(order);
    navigate('/customer/cart');
  };

  return (
    <DashboardShell
      portalLabel="Customer Portal"
      breadcrumb="Dashboard Overview"
      navItems={CUSTOMER_NAV_ITEMS}
      primaryAction={{ label: 'Book Laundry', to: '/find-laundry' }}
    >
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-blue-950 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-sky-300">Welcome back to WashMate Karachi</p>
          <h2 className="mt-1 text-xl font-bold">{currentUser?.displayName}</h2>
          <p className="mt-1 text-xs text-slate-300">
            Referral Code: <span className="font-mono-num font-bold text-white">{currentUser?.referralCode}</span> · Credits:{' '}
            <span className="font-mono-num font-bold text-emerald-300">Rs. {currentUser?.referralCreditsPkr || 0}</span>
          </p>
        </div>
        <Link
          to="/find-laundry"
          className="px-5 py-2.5 text-sm font-semibold text-blue-950 bg-white hover:bg-sky-50 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Book Laundry Now
        </Link>
      </div>

      {/* KPI Row */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Total Orders</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900 tabular-nums">
            {myOrders.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Active Orders</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-blue-900 tabular-nums">
            {activeOrders.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Completed Orders</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-emerald-700 tabular-nums">
            {completedOrders.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Student Subscription</p>
          <p className="mt-2 text-sm font-bold text-slate-900 truncate">
            {activeSub ? activeSub.planName : 'No active plan'}
          </p>
          {activeSub ? (
            <p className="text-xs text-sky-700 tabular-nums mt-0.5">
              {activeSub.clothesUsed} / {activeSub.monthlyLimit} garments used
            </p>
          ) : (
            <Link to="/student-plans" className="text-xs font-semibold text-sky-700 hover:underline">
              Explore Plans
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
            <Link to="/customer/orders" className="text-xs font-semibold text-sky-700 hover:underline">
              View All
            </Link>
          </div>

          {myOrders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">You have not placed any laundry orders yet.</p>
              <Link
                to="/find-laundry"
                className="mt-3 inline-block px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-xl"
              >
                Find Nearby Laundry
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myOrders.slice(0, 4).map((ord) => (
                <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/customer/orders/${ord.id}`}
                        className="font-mono-num text-sm font-bold text-blue-900 hover:underline"
                      >
                        {ord.orderNumber}
                      </Link>
                      <OrderStatusLabel status={ord.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {ord.providerName} · {ord.area} · Pickup {ord.pickupDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono-num text-sm font-bold text-slate-900">
                      Rs. {ord.grandTotalPkr.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRepeat(ord)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      <Repeat className="h-3.5 w-3.5" />
                      Reorder
                    </button>
                    <Link
                      to={`/customer/orders/${ord.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-xl"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications, Saved Addresses & Favorites */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 inline-flex items-center gap-2">
              <Bell className="h-4 w-4 text-sky-700" />
              Order & WhatsApp Alerts
            </h3>
            <div className="mt-3 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500">No recent alerts.</p>
              ) : (
                notifications.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer ${
                      n.read ? 'border-slate-100 bg-white text-slate-500' : 'border-sky-200 bg-sky-50/70 text-slate-800'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{n.title}</p>
                    <p className="mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-900" />
                Saved Addresses
              </h3>
              <Link to="/customer/profile" className="text-xs font-semibold text-sky-700">
                Manage
              </Link>
            </div>
            <div className="mt-3 space-y-2.5 text-xs">
              {addresses.length === 0 ? (
                <p className="text-slate-500">No saved addresses yet.</p>
              ) : (
                addresses.slice(0, 2).map((addr) => (
                  <div key={addr.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-semibold text-slate-900">
                      {addr.label} · {addr.area}
                    </p>
                    <p className="text-slate-600 truncate mt-0.5">{addr.fullAddress}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 inline-flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-600" />
              Favorite Providers
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              {favProviders.length === 0 ? (
                <p className="text-slate-500">Save laundry shops while browsing to pin them here.</p>
              ) : (
                favProviders.map((fp) => (
                  <Link
                    key={fp.id}
                    to={`/provider/${fp.id}`}
                    className="block p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-100 font-semibold text-blue-900"
                  >
                    {fp.businessName} · {fp.primaryArea}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};
