import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Filter, Heart, MapPin, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { ALL_SERVICES, KARACHI_AREA_META, KARACHI_AREAS } from '../data/karachiDemoData';
import { useWashMate } from '../context/WashMateContext';
import { SafeImage } from '../components/SafeImage';
import { ExpressIndicator, VerificationLabel } from '../components/StatusBadge';
import type { LaundryProvider, ServiceType } from '../types/washmate';

type SortOption = 'lowest_price' | 'highest_rating' | 'most_popular' | 'fastest_delivery';

export const FindLaundryPage: React.FC = () => {
  const { providers, selectedArea, setSelectedArea, currentUser, toggleFavoriteProvider, serverConfig } =
    useWashMate();
  const [searchParams] = useSearchParams();

  const initialArea = searchParams.get('area') || selectedArea || 'All Karachi';
  const initialService = searchParams.get('service') || '';

  const [areaFilter, setAreaFilter] = useState(initialArea);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>(
    initialService && ALL_SERVICES.includes(initialService as ServiceType)
      ? [initialService as ServiceType]
      : []
  );
  const [pickupOnly, setPickupOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [expressOnly, setExpressOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('highest_rating');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleServiceFilter = (svc: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const filteredProviders = useMemo(() => {
    const approved = providers.filter((p) => p.verificationStatus === 'Approved');

    const matches = approved.filter((p) => {
      if (areaFilter !== 'All Karachi') {
        const servesArea =
          p.primaryArea.toLowerCase() === areaFilter.toLowerCase() ||
          p.serviceAreas.some((a) => a.toLowerCase() === areaFilter.toLowerCase());
        if (!servesArea) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hit =
          p.businessName.toLowerCase().includes(q) ||
          p.primaryArea.toLowerCase().includes(q) ||
          p.serviceAreas.some((a) => a.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q);
        if (!hit) return false;
      }

      if (p.startingPricePkr > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (pickupOnly && !p.pickupAvailable) return false;
      if (deliveryOnly && !p.deliveryAvailable) return false;
      if (expressOnly && !p.expressAvailable) return false;

      if (selectedServices.length > 0) {
        const hasAll = selectedServices.every((svc) => p.availableServices.includes(svc));
        if (!hasAll) return false;
      }

      return true;
    });

    return [...matches].sort((a, b) => {
      if (sortBy === 'lowest_price') return a.startingPricePkr - b.startingPricePkr;
      if (sortBy === 'highest_rating') return b.rating - a.rating;
      if (sortBy === 'most_popular') return b.completedOrdersCount - a.completedOrdersCount;
      return a.turnaroundHours - b.turnaroundHours;
    });
  }, [providers, areaFilter, searchQuery, maxPrice, minRating, pickupOnly, deliveryOnly, expressOnly, selectedServices, sortBy]);

  const comparedProviders: LaundryProvider[] = useMemo(
    () => providers.filter((p) => compareIds.includes(p.id)),
    [providers, compareIds]
  );

  const areaMeta = areaFilter !== 'All Karachi' ? KARACHI_AREA_META[areaFilter] : null;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Karachi Area Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-sky-700">Karachi Laundry Marketplace</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
                Find Laundry Providers Near You
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Only providers serving your selected Karachi area are shown. Sample demo shops are explicitly marked.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search business or area..."
                  className="pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort laundry providers"
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="highest_rating">Sort: Highest Rating</option>
                <option value="lowest_price">Sort: Lowest Price</option>
                <option value="most_popular">Sort: Most Popular</option>
                <option value="fastest_delivery">Sort: Fastest Delivery</option>
              </select>
            </div>
          </div>

          {/* Karachi Neighborhood Quick Selector */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-sky-700" />
                Karachi Neighborhood Coverage
              </span>
              <span className="text-xs text-slate-500">
                {serverConfig.googleMapsConfigured
                  ? 'Google Maps active'
                  : 'Area-selection mode active (no Maps API key required)'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {['All Karachi', ...KARACHI_AREAS].map((area) => {
                const active = areaFilter === area;
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      setAreaFilter(area);
                      setSelectedArea(area);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-blue-900'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>

            {areaMeta ? (
              <p className="mt-3 text-xs text-slate-600">
                Showing providers delivering in <strong>{areaFilter}</strong> ({areaMeta.zone} Karachi · Hubs:{' '}
                {areaMeta.hubs.join(', ')})
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  <SlidersHorizontal className="h-4 w-4 text-blue-900" />
                  Filters
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAreaFilter('All Karachi');
                    setMaxPrice(150);
                    setMinRating(0);
                    setSelectedServices([]);
                    setPickupOnly(false);
                    setDeliveryOnly(false);
                    setExpressOnly(false);
                    setSearchQuery('');
                  }}
                  className="text-xs font-medium text-sky-700 hover:underline"
                >
                  Reset All
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Max Starting Price: <span className="font-mono-num text-blue-900">Rs. {maxPrice}</span>
                </label>
                <input
                  type="range"
                  min={30}
                  max={150}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Minimum Customer Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                >
                  <option value={0}>Any rating</option>
                  <option value={4}>4.0+ stars</option>
                  <option value={4.5}>4.5+ stars</option>
                  <option value={4.8}>4.8+ stars</option>
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2.5">Required Services</p>
                <div className="space-y-2">
                  {ALL_SERVICES.map((svc) => (
                    <label key={svc} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(svc)}
                        onChange={() => toggleServiceFilter(svc)}
                        className="rounded border-slate-300 text-blue-900 focus:ring-sky-500"
                      />
                      <span>{svc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <p className="text-xs font-semibold text-slate-700">Logistics & Speed</p>
                <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pickupOnly}
                    onChange={(e) => setPickupOnly(e.target.checked)}
                    className="rounded border-slate-300 text-blue-900"
                  />
                  <span>Pickup Available</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryOnly}
                    onChange={(e) => setDeliveryOnly(e.target.checked)}
                    className="rounded border-slate-300 text-blue-900"
                  />
                  <span>Delivery Available</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expressOnly}
                    onChange={(e) => setExpressOnly(e.target.checked)}
                    className="rounded border-slate-300 text-blue-900"
                  />
                  <span>Express Same/Next-Day</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Provider Results */}
          <div className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 tabular-nums">
                Showing <strong className="text-slate-900">{filteredProviders.length}</strong> laundry providers
              </p>
              {compareIds.length >= 2 ? (
                <button
                  type="button"
                  onClick={() => setShowCompareModal(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors"
                >
                  Compare Selected ({compareIds.length})
                </button>
              ) : (
                <span className="text-xs text-slate-500">Select 2–3 providers to compare rates</span>
              )}
            </div>

            {filteredProviders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <Filter className="h-8 w-8 text-slate-400 mx-auto" />
                <h3 className="mt-3 text-base font-bold text-slate-900">
                  No providers match these filters
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Try expanding your Karachi area selection or increasing the maximum starting price.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredProviders.map((prov) => {
                  const isFav = currentUser?.favoriteProviderIds.includes(prov.id);
                  const isCompared = compareIds.includes(prov.id);

                  return (
                    <div
                      key={prov.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[16/10] w-full bg-slate-100 relative overflow-hidden">
                        <SafeImage
                          src={prov.coverImageUrl}
                          alt={prov.businessName}
                          className="w-full h-full object-cover"
                          fallbackLabel={prov.businessName}
                        />
                        {currentUser ? (
                          <button
                            type="button"
                            onClick={() => toggleFavoriteProvider(prov.id)}
                            aria-label="Toggle favorite provider"
                            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-rose-600 transition-colors"
                          >
                            <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
                          </button>
                        ) : null}
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <VerificationLabel status={prov.verificationStatus} isDemo={prov.isDemo} />
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800 tabular-nums">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {prov.rating.toFixed(1)} ({prov.reviewCount} reviews)
                          </span>
                        </div>

                        <h2 className="mt-2 text-lg font-bold text-slate-900">{prov.businessName}</h2>
                        <p className="mt-1 text-xs text-slate-500">
                          {prov.primaryArea} · Serves {prov.serviceAreas.length} Karachi areas
                        </p>

                        <p className="mt-2.5 text-sm text-slate-600 line-clamp-2">{prov.description}</p>

                        <div className="mt-3 text-xs text-slate-600 space-y-1">
                          <p>
                            <strong className="text-slate-800">Services:</strong> {prov.availableServices.join(' · ')}
                          </p>
                          <p className="tabular-nums">
                            <strong className="text-slate-800">Turnaround:</strong> {prov.turnaroundHours}h ·{' '}
                            {prov.pickupAvailable ? `Pickup Rs. ${prov.pickupFeePkr}` : 'Drop-off only'} ·{' '}
                            {prov.deliveryAvailable ? `Delivery Rs. ${prov.deliveryFeePkr}` : 'No delivery'}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-base font-bold text-blue-950 tabular-nums">
                            Starts Rs. {prov.startingPricePkr}
                            <span className="text-xs font-normal text-slate-500"> / garment</span>
                          </p>
                          {prov.expressAvailable ? <ExpressIndicator /> : null}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 mt-auto">
                          <Link
                            to={`/provider/${prov.id}`}
                            className="flex-1 text-center px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/provider/${prov.id}`}
                            className="flex-1 text-center px-3 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors"
                          >
                            Select Provider
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleCompare(prov.id)}
                            className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                              isCompared
                                ? 'border-sky-600 bg-sky-50 text-sky-900'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {isCompared ? 'Added' : 'Compare'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Provider Comparison Modal */}
      {showCompareModal && comparedProviders.length >= 2 ? (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full p-6 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Compare Karachi Laundry Providers</h3>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-4 text-xs text-slate-500">Attribute</th>
                    {comparedProviders.map((p) => (
                      <th key={p.id} className="py-2 px-3 font-bold text-slate-900">
                        {p.businessName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-500">Primary Area</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="py-2.5 px-3">{p.primaryArea}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-500">Starting Price</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="py-2.5 px-3 font-semibold text-blue-900">Rs. {p.startingPricePkr}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-500">Pickup + Delivery Fee</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="py-2.5 px-3">Rs. {p.pickupFeePkr + p.deliveryFeePkr}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-500">Minimum Order</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="py-2.5 px-3">Rs. {p.minOrderPkr}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-500">Turnaround</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="py-2.5 px-3">{p.turnaroundHours} hours</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-500">Express Option</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="py-2.5 px-3">
                        {p.expressAvailable ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <Check className="h-3.5 w-3.5" /> +Rs. {p.expressSurchargePkr}
                          </span>
                        ) : (
                          'Not offered'
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-slate-500">Rating</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="py-2.5 px-3">{p.rating.toFixed(1)} ({p.reviewCount})</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
