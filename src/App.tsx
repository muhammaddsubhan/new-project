import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { WashMateProvider, useWashMate } from './context/WashMateContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartSwitchModal } from './components/CartSwitchModal';
import { HomePage } from './pages/HomePage';
import { FindLaundryPage } from './pages/FindLaundryPage';
import { ProviderDetailsPage } from './pages/ProviderDetailsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { StudentPlansPage } from './pages/StudentPlansPage';
import { AboutPage, ContactPage } from './pages/AboutAndContactPage';
import { AuthPage } from './pages/AuthPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { CustomerCartPage } from './pages/CustomerCartPage';
import { CustomerCheckoutPage } from './pages/CustomerCheckoutPage';
import { CustomerOrderDetailPage, CustomerOrdersPage } from './pages/CustomerOrdersPages';
import { CustomerProfilePage, CustomerSubscriptionPage } from './pages/CustomerProfilePages';
import {
  ProviderDashboardPage,
  ProviderEarningsPage,
  ProviderOrdersPage,
  ProviderReviewsPage,
} from './pages/ProviderDashboardPages';
import {
  ProviderPricingPage,
  ProviderProfilePage,
  ProviderServicesPage,
} from './pages/ProviderCatalogPages';
import {
  AdminCustomersPage,
  AdminDashboardPage,
  AdminOrdersPage,
  AdminProvidersPage,
} from './pages/AdminOperationsPages';
import {
  AdminCommissionsPage,
  AdminCouponsPage,
  AdminSettingsPage,
} from './pages/AdminConfigPages';
import type { UserRole } from './types/washmate';

const RequireRole: React.FC<{ allowed: UserRole[]; children: React.ReactNode }> = ({
  allowed,
  children,
}) => {
  const { authReady, currentUser } = useWashMate();

  if (!authReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Loading WashMate session...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.suspended) {
    return (
      <div className="mx-auto max-w-lg my-16 bg-white border border-rose-200 rounded-2xl p-8 text-center">
        <h2 className="text-lg font-bold text-rose-800">Account Suspended</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your account has been suspended by WashMate Administration. Contact support@washmate.pk for assistance.
        </p>
      </div>
    );
  }

  if (!allowed.includes(currentUser.role)) {
    const fallback =
      currentUser.role === 'admin'
        ? '/admin/dashboard'
        : currentUser.role === 'provider'
          ? '/provider/dashboard'
          : '/customer/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <WashMateProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-white text-slate-900">
          <Navbar />
          <CartSwitchModal />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/find-laundry" element={<FindLaundryPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/student-plans" element={<StudentPlansPage />} />
              <Route path="/pricing" element={<StudentPlansPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />

              {/* Provider Portal Routes (static routes ranked ahead of /provider/:id) */}
              <Route
                path="/provider/dashboard"
                element={
                  <RequireRole allowed={['provider', 'admin']}>
                    <ProviderDashboardPage />
                  </RequireRole>
                }
              />
              <Route
                path="/provider/orders"
                element={
                  <RequireRole allowed={['provider', 'admin']}>
                    <ProviderOrdersPage />
                  </RequireRole>
                }
              />
              <Route
                path="/provider/services"
                element={
                  <RequireRole allowed={['provider', 'admin']}>
                    <ProviderServicesPage />
                  </RequireRole>
                }
              />
              <Route
                path="/provider/pricing"
                element={
                  <RequireRole allowed={['provider', 'admin']}>
                    <ProviderPricingPage />
                  </RequireRole>
                }
              />
              <Route
                path="/provider/profile"
                element={
                  <RequireRole allowed={['provider', 'admin']}>
                    <ProviderProfilePage />
                  </RequireRole>
                }
              />
              <Route
                path="/provider/earnings"
                element={
                  <RequireRole allowed={['provider', 'admin']}>
                    <ProviderEarningsPage />
                  </RequireRole>
                }
              />
              <Route
                path="/provider/reviews"
                element={
                  <RequireRole allowed={['provider', 'admin']}>
                    <ProviderReviewsPage />
                  </RequireRole>
                }
              />
              <Route path="/provider/:id" element={<ProviderDetailsPage />} />

              {/* Customer Portal Routes */}
              <Route path="/customer/cart" element={<CustomerCartPage />} />
              <Route path="/customer/checkout" element={<CustomerCheckoutPage />} />
              <Route
                path="/customer/dashboard"
                element={
                  <RequireRole allowed={['customer', 'admin']}>
                    <CustomerDashboardPage />
                  </RequireRole>
                }
              />
              <Route
                path="/customer/orders"
                element={
                  <RequireRole allowed={['customer', 'admin']}>
                    <CustomerOrdersPage />
                  </RequireRole>
                }
              />
              <Route
                path="/customer/orders/:id"
                element={
                  <RequireRole allowed={['customer', 'admin']}>
                    <CustomerOrderDetailPage />
                  </RequireRole>
                }
              />
              <Route
                path="/customer/subscription"
                element={
                  <RequireRole allowed={['customer', 'admin']}>
                    <CustomerSubscriptionPage />
                  </RequireRole>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <RequireRole allowed={['customer', 'admin']}>
                    <CustomerProfilePage />
                  </RequireRole>
                }
              />

              {/* Admin Console Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <RequireRole allowed={['admin']}>
                    <AdminDashboardPage />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/providers"
                element={
                  <RequireRole allowed={['admin']}>
                    <AdminProvidersPage />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <RequireRole allowed={['admin']}>
                    <AdminCustomersPage />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <RequireRole allowed={['admin']}>
                    <AdminOrdersPage />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/commissions"
                element={
                  <RequireRole allowed={['admin']}>
                    <AdminCommissionsPage />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/coupons"
                element={
                  <RequireRole allowed={['admin']}>
                    <AdminCouponsPage />
                  </RequireRole>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <RequireRole allowed={['admin']}>
                    <AdminSettingsPage />
                  </RequireRole>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </WashMateProvider>
  );
}
