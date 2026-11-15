import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useWashMate } from '../context/WashMateContext';

export const Navbar: React.FC = () => {
  const { currentUser, isDemoSession, cart, logout } = useWashMate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const dashboardHref =
    currentUser?.role === 'admin'
      ? '/admin/dashboard'
      : currentUser?.role === 'provider'
        ? '/provider/dashboard'
        : '/customer/dashboard';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors py-1 border-b-2 ${
      isActive
        ? 'text-blue-900 border-blue-900'
        : 'text-slate-600 border-transparent hover:text-blue-900 hover:border-sky-300'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          {/* Zone 1: Single-line Wordmark */}
          <Link
            to="/"
            className="font-display text-xl font-extrabold tracking-tight text-blue-950 whitespace-nowrap shrink-0"
          >
            WashMate
          </Link>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Primary Navigation">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/find-laundry" className={navLinkClass}>
              Find Laundry
            </NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>
              How It Works
            </NavLink>
            <NavLink to="/student-plans" className={navLinkClass}>
              Pricing
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About Us
            </NavLink>
            <NavLink to="/register?role=provider" className={navLinkClass}>
              Become a Partner
            </NavLink>
          </nav>

          {/* Zone 3: Action zone */}
          <div className="flex items-center gap-3 shrink-0">
            {totalItems > 0 ? (
              <Link
                to="/customer/cart"
                className="relative inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-sky-50/70 px-3 py-2 text-xs font-semibold text-blue-950 hover:bg-sky-100 transition-colors whitespace-nowrap shrink-0"
                aria-label="Open shopping cart"
              >
                <ShoppingBag className="h-4 w-4 text-sky-700" />
                <span className="tabular-nums">{totalItems}</span>
              </Link>
            ) : null}

            {currentUser ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to={dashboardHref}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  {currentUser.role === 'admin'
                    ? 'Admin Console'
                    : currentUser.role === 'provider'
                      ? 'Partner Hub'
                      : 'My Dashboard'}
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-blue-900 whitespace-nowrap shrink-0 px-2 py-1"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slim Demo Session Notice when user activates Demo Workspace */}
      {currentUser && isDemoSession ? (
        <div className="bg-sky-50 border-t border-sky-200 px-4 py-1.5 text-xs text-blue-950">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
            <span>
              Demo Workspace active as <strong className="font-semibold">{currentUser.displayName}</strong> ({currentUser.role}) — data persists locally in your browser.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-semibold text-sky-800 hover:underline whitespace-nowrap"
              >
                Switch Role / Connect Firebase
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
              >
                Exit Demo
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Mobile Navigation Drawer */}
      {mobileOpen ? (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-700">
            Home
          </Link>
          <Link
            to="/find-laundry"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            Find Laundry
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            How It Works
          </Link>
          <Link
            to="/student-plans"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            Pricing & Student Plans
          </Link>
          <Link to="/about" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-700">
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            Contact
          </Link>
          <Link
            to="/register?role=provider"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm font-semibold text-sky-700"
          >
            Become a Partner
          </Link>
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            {currentUser ? (
              <Link
                to={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-xl"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-xl"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};
