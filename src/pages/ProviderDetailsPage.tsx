import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Heart,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { ALL_SERVICES } from '../data/karachiDemoData';
import { useWashMate } from '../context/WashMateContext';
import { SafeImage } from '../components/SafeImage';
import { ExpressIndicator, VerificationLabel } from '../components/StatusBadge';
import type { ClothingItemPrice, ServiceType } from '../types/washmate';

export const ProviderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    providers,
    clothingItems,
    reviews,
    cart,
    addToCart,
    currentUser,
    toggleFavoriteProvider,
  } = useWashMate();

  const provider = providers.find((p) => p.id === id);

  const [selectedService, setSelectedService] = useState<ServiceType>(
    provider?.availableServices[0] || 'Washing'
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const providerItems = useMemo(
    () => clothingItems.filter((item) => item.providerId === id && item.available),
    [clothingItems, id]
  );

  const providerReviews = useMemo(
    () => reviews.filter((r) => r.providerId === id),
    [reviews, id]
  );

  if (!provider) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Laundry Provider Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">
          This provider listing may have been removed or is not yet approved.
        </p>
        <Link
          to="/find-laundry"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Find Laundry
        </Link>
      </div>
    );
  }

  const activeService: ServiceType = provider.availableServices.includes(selectedService)
    ? selectedService
    : provider.availableServices[0];

  const categories = ['All', ...Array.from(new Set(providerItems.map((i) => i.category)))];
  const visibleItems = providerItems.filter((item) => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    return typeof item.pricesByService[activeService] === 'number';
  });

  const getQty = (itemId: string) => quantities[itemId] || 1;

  const setQty = (itemId: string, next: number) => {
    setQuantities((prev) => ({ ...prev, [itemId]: Math.max(1, Math.min(50, next)) }));
  };

  const handleAdd = async (item: ClothingItemPrice) => {
    try {
      const result = await addToCart(provider, item, activeService, getQty(item.id));
      if (result === 'added') {
        setFeedbackMsg(`Added ${getQty(item.id)} × ${item.itemName} (${activeService}) to cart.`);
        setTimeout(() => setFeedbackMsg(''), 3500);
      }
    } catch (err) {
      setFeedbackMsg(err instanceof Error ? err.message : 'Unable to add item.');
    }
  };

  const cartItemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.items.reduce((sum, i) => sum + i.unitPricePkr * i.quantity, 0);
  const isFav = currentUser?.favoriteProviderIds.includes(provider.id);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] pb-16">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/find-laundry"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 mb-5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Karachi Providers
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5">
              <div className="h-full min-h-[240px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <SafeImage
                  src={provider.coverImageUrl}
                  alt={provider.businessName}
                  className="w-full h-full object-cover"
                  fallbackLabel={provider.businessName}
                />
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <VerificationLabel status={provider.verificationStatus} isDemo={provider.isDemo} />
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-900 tabular-nums">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
                    </span>
                    {currentUser ? (
                      <button
                        type="button"
                        onClick={() => toggleFavoriteProvider(provider.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 hover:bg-slate-50"
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
                        {isFav ? 'Saved' : 'Save'}
                      </button>
                    ) : null}
                  </div>
                </div>

                <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
                  {provider.businessName}
                </h1>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{provider.description}</p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                    <span>{provider.address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                    <span className="tabular-nums">{provider.phone} · {provider.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                    <span>{provider.operatingHours} · Est. {provider.turnaroundHours}h completion</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                    <span className="tabular-nums">
                      Min order Rs. {provider.minOrderPkr} · Pickup Rs. {provider.pickupFeePkr} · Delivery Rs.{' '}
                      {provider.deliveryFeePkr}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-900">Karachi Service Areas:</strong>{' '}
                  {provider.serviceAreas.join(' · ')}
                </p>
                {provider.expressAvailable ? <ExpressIndicator /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Selection & Clothing Price List */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Select Available Service */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-slate-900">
                1. Choose Laundry Service
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Only services actively offered by {provider.businessName} are selectable.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {ALL_SERVICES.map((svc) => {
                  const offered = provider.availableServices.includes(svc);
                  const isActive = activeService === svc;
                  return (
                    <button
                      key={svc}
                      type="button"
                      disabled={!offered}
                      onClick={() => setSelectedService(svc)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap ${
                        !offered
                          ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed line-through'
                          : isActive
                            ? 'border-blue-900 bg-blue-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400'
                      }`}
                    >
                      {svc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Clothing Items & Quantities */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    2. Per-Item Prices for {activeService}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prices are shown in PKR before adding to your cart.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                        categoryFilter === cat
                          ? 'bg-sky-100 text-blue-950 font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {feedbackMsg ? (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                  <span>{feedbackMsg}</span>
                  <Link to="/customer/cart" className="underline">
                    View Cart
                  </Link>
                </div>
              ) : null}

              <div className="divide-y divide-slate-100">
                {visibleItems.map((item) => {
                  const unitPrice = item.pricesByService[activeService] || 0;
                  const qty = getQty(item.id);

                  return (
                    <div
                      key={item.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.itemName}</p>
                        <p className="text-xs text-slate-500">
                          {item.category} · <span className="font-mono-num font-semibold text-blue-900">Rs. {unitPrice}</span> / item
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50">
                          <button
                            type="button"
                            onClick={() => setQty(item.id, qty - 1)}
                            className="p-2 text-slate-600 hover:text-slate-900"
                            aria-label={`Decrease ${item.itemName} quantity`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-xs font-mono-num font-bold text-slate-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.id, qty + 1)}
                            className="p-2 text-slate-600 hover:text-slate-900"
                            aria-label={`Increase ${item.itemName} quantity`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAdd(item)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors whitespace-nowrap tabular-nums"
                        >
                          Add · Rs. {(unitPrice * qty).toLocaleString()}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                Customer Reviews ({providerReviews.length})
              </h2>
              {providerReviews.length === 0 ? (
                <p className="text-sm text-slate-500">No reviews submitted for this provider yet.</p>
              ) : (
                <div className="space-y-4">
                  {providerReviews.map((rev) => (
                    <div key={rev.id} className="pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-900">{rev.customerName}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 tabular-nums">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {rev.rating}.0
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-700">{rev.comment}</p>
                      {rev.providerReply ? (
                        <p className="mt-2 text-xs text-blue-950 bg-sky-50 rounded-xl px-3 py-2">
                          <strong>Provider reply:</strong> {rev.providerReply}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Cart Summary Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 inline-flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-blue-900" />
                  Your Laundry Cart
                </h3>
                <span className="text-xs font-mono-num text-slate-500">{cartItemCount} items</span>
              </div>

              {cart.items.length === 0 ? (
                <p className="py-6 text-sm text-slate-500 text-center">
                  Select clothing items on the left to build your order.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-semibold text-blue-900">{cart.providerName}</p>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {cart.items.map((ci) => (
                      <div
                        key={`${ci.clothingItemId}-${ci.serviceType}`}
                        className="flex items-center justify-between text-xs text-slate-700"
                      >
                        <span>
                          {ci.quantity} × {ci.itemName}{' '}
                          <span className="text-slate-400">({ci.serviceType})</span>
                        </span>
                        <span className="font-mono-num font-semibold text-slate-900">
                          Rs. {ci.unitPricePkr * ci.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-900 tabular-nums">
                    <span>Items Subtotal</span>
                    <span>Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  {cart.providerId === provider.id && cartSubtotal < provider.minOrderPkr ? (
                    <p className="text-xs text-amber-700">
                      Add Rs. {provider.minOrderPkr - cartSubtotal} more to meet the minimum order of Rs.{' '}
                      {provider.minOrderPkr}.
                    </p>
                  ) : null}
                  <Link
                    to="/customer/cart"
                    className="mt-3 block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors"
                  >
                    Review Cart & Checkout
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
