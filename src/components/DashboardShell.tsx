import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useWashMate } from '../context/WashMateContext';

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardShellProps {
  portalLabel: string;
  breadcrumb: string;
  navItems: DashboardNavItem[];
  primaryAction?: { label: string; to: string };
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  portalLabel,
  breadcrumb,
  navItems,
  primaryAction,
  children,
}) => {
  const { currentUser, logout } = useWashMate();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="pb-4 mb-4 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-500">{portalLabel}</p>
                <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                  {currentUser?.displayName || 'Guest'}
                </p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
              </div>

              <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                        isActive
                          ? 'bg-blue-900 text-white'
                          : 'text-slate-600 hover:bg-sky-50 hover:text-blue-950'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="hidden lg:block pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Viewport */}
          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500">{portalLabel} / {breadcrumb}</p>
                <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{breadcrumb}</h1>
              </div>
              {primaryAction ? (
                <Link
                  to={primaryAction.to}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  {primaryAction.label}
                </Link>
              ) : null}
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
