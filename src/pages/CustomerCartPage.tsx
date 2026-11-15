import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { useWashMate, type QuoteSummary } from '../context/WashMateContext';
import { DashboardShell } from '../components/DashboardShell';
import { CUSTOMER_NAV_ITEMS } from './CustomerDashboardPage';

export const CustomerCartPage: React.FC = () => {
  const {
    cart,
    providers,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    setCartExpress,
    applyCartCoupon,
    fetchServerQuote,
  } = useWashMate();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState(cart.couponCode || '');
  const [couponFeedback, setCouponFeedback] = useState('');
  const [quote, setQuote] = useState<QuoteSummary | null>(null);
  const [quoteError, setQuoteError] = useState('');

  const provider = providers.find((p) => p.id === cart.providerId);

  useEffect(() => {
    let active = true;
    if (cart.items.length === 0) {
      setQuote(null);
      return;
    }
    fetchServerQuote(false)
      .then((q) => {
        if (active) {
          setQuote(q);
          setQuoteError('');
        }
      })
      .catch((err) => {
        if (active) setQuoteError(err instanceof Error ? err.message : 'Unable to calculate quote.');
      });
    return () => {
      active = false;
    };
  }, [cart, fetchServerQuote]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await applyCartCoupon(couponInput);
    setCouponFeedback(res.message);
  };

  return (
    <DashboardShell
      portalLabel="Customer Portal"
      breadcrumb="Shopping Cart"
      navItems={CUSTOMER_NAV_ITEMS}
      primaryAction={{ label: 'Browse Providers', to: '/find-laundry' }}
    >
      {cart.items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <ShoppingBag className="h-10 w-10 text-slate-400 mx-auto" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">Your Laundry Cart is Empty</h2>
          <p className="mt-1 text-sm text-slate-600">
            Select a Karachi laundry provider and add your clothing items to calculate pricing.
          </p>
          <Link
            to="/find-laundry"
            className="mt-5 inline-block px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
          >
            Find Laundry Near You
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">Selected Provider (Single-Provider Order)</p>
                  <Link
                    to={`/provider/${cart.providerId}`}
                    className="text-base font-bold text-blue-900 hover:underline"
                  >
                    {cart.providerName}
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-medium text-rose-700 hover:underline"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {cart.items.map((item) => (
                  <div
                    key={`${item.clothingItemId}-${item.serviceType}`}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.itemName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.serviceType} ·{' '}
                        <span className="font-mono-num">Rs. {item.unitPricePkr}</span> each
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItemQuantity(item.clothingItemId, item.serviceType, item.quantity - 1)
                          }
                          className="p-2 text-slate-600 hover:text-slate-900"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-xs font-mono-num font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItemQuantity(item.clothingItemId, item.serviceType, item.quantity + 1)
                          }
                          className="p-2 text-slate-600 hover:text-slate-900"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="w-24 text-right font-mono-num text-sm font-bold text-slate-900">
                        Rs. {(item.unitPricePkr * item.quantity).toLocaleString()}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeCartItem(item.clothingItemId, item.serviceType)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Express & Coupon Options */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              {provider?.expressAvailable ? (
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Express Same/Next-Day Laundry (+Rs. {provider.expressSurchargePkr})
                    </p>
                    <p className="text-xs text-slate-500">
                      Priority washing and rider delivery ahead of standard {provider.turnaroundHours}h queue.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cart.isExpress}
                    onChange={(e) => setCartExpress(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-blue-900"
                  />
                </label>
              ) : null}

              <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Discount Coupon (Try: WELCOME50, KARACHI15, STUDENT100)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
                  >
                    Apply
                  </button>
                </div>
                {couponFeedback ? (
                  <p className="mt-2 text-xs font-medium text-sky-800">{couponFeedback}</p>
                ) : null}
              </form>
            </div>
          </div>

          {/* Summary Card */}
          <aside className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Server-Verified Summary
              </h3>

              {quoteError ? (
                <p className="mt-4 text-xs text-rose-700">{quoteError}</p>
              ) : quote ? (
                <div className="mt-4 space-y-2.5 text-sm tabular-nums">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal ({quote.totalItemCount} pcs)</span>
                    <span className="font-mono-num text-slate-900">Rs. {quote.subtotalPkr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pickup Fee</span>
                    <span className="font-mono-num text-slate-900">Rs. {quote.pickupFeePkr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="font-mono-num text-slate-900">Rs. {quote.deliveryFeePkr.toLocaleString()}</span>
                  </div>
                  {quote.expressFeePkr > 0 ? (
                    <div className="flex justify-between text-sky-800">
                      <span>Express Service</span>
                      <span className="font-mono-num">Rs. {quote.expressFeePkr.toLocaleString()}</span>
                    </div>
                  ) : null}
                  {quote.discountPkr > 0 ? (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Coupon ({quote.appliedCouponCode})</span>
                      <span className="font-mono-num">- Rs. {quote.discountPkr.toLocaleString()}</span>
                    </div>
                  ) : null}

                  <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-blue-950">
                    <span>Grand Total</span>
                    <span className="font-mono-num">Rs. {quote.grandTotalPkr.toLocaleString()}</span>
                  </div>

                  {!quote.meetsMinimumOrder && provider ? (
                    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                      Minimum order for {provider.businessName} is Rs. {provider.minOrderPkr}. Please add{' '}
                      Rs. {provider.minOrderPkr - quote.subtotalPkr} more.
                    </div>
                  ) : null}

                  <button
                    type="button"
                    disabled={!quote.meetsMinimumOrder}
                    onClick={() => navigate('/customer/checkout')}
                    className={`mt-4 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                      quote.meetsMinimumOrder
                        ? 'bg-blue-900 text-white hover:bg-blue-800'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-500">Calculating totals...</p>
              )}
            </div>
          </aside>
        </div>
      )}
    </DashboardShell>
  );
};
