import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useWashMate } from '../context/WashMateContext';

export const CartSwitchModal: React.FC = () => {
  const { pendingCartSwitch, cart, dismissCartSwitch, confirmCartSwitch } = useWashMate();

  if (!pendingCartSwitch) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-switch-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 id="cart-switch-title" className="text-base font-bold text-slate-900">
                Start a separate provider cart?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Single-provider order rule</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissCartSwitch}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
          Your shopping cart currently holds items from{' '}
          <span className="font-semibold text-slate-900">{cart.providerName}</span>. Each WashMate order
          is fulfilled by one laundry provider so pickup and garment tracking stay accurate.
        </p>

        <p className="mt-2 text-sm text-slate-600">
          Replace your current cart with{' '}
          <span className="font-semibold text-blue-900">{pendingCartSwitch.provider.businessName}</span>?
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={dismissCartSwitch}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
          >
            Keep Current Cart
          </button>
          <button
            type="button"
            onClick={confirmCartSwitch}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors whitespace-nowrap"
          >
            Start New Cart
          </button>
        </div>
      </div>
    </div>
  );
};
