import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import { ALL_SERVICES, KARACHI_AREAS } from '../data/karachiDemoData';
import { useWashMate } from '../context/WashMateContext';
import { SafeImage } from '../components/SafeImage';
import { VerificationLabel } from '../components/StatusBadge';
import type { ServiceType } from '../types/washmate';

const SERVICE_SUMMARIES: Record<ServiceType, string> = {
  Washing: 'Temperature-matched drum wash with color-safe detergent.',
  Drying: 'Gentle tumble drying ready for crisp home folding.',
  Ironing: 'Steam pressing on hangers or neatly folded stacks.',
  'Dry Cleaning': 'Solvent care for formal suits, sherwanis, and silk.',
  'Wash + Dry': 'Clean wash and full moisture-controlled drying.',
  'Wash + Dry + Fold': 'Everyday student and family laundry folded by item.',
  'Wash + Dry + Iron': 'Complete wash, dry, and crisp steam-iron finish.',
};

const FAQS = [
  {
    q: 'How does WashMate verify laundry providers in Karachi?',
    a: 'Every independent laundry business submits its physical shop address, service areas, pricing sheet, and contact details for Admin review before going live. Sample demo providers are clearly marked so you can distinguish test listings from live businesses.',
  },
  {
    q: 'Can I book a pickup from a university hostel or apartment room?',
    a: 'Yes. At checkout you can enter your Karachi area, hostel or apartment building name, and optional room number so riders coordinate smoothly at your hostel gate or doorstep.',
  },
  {
    q: 'Why can I only order from one laundry provider per checkout?',
    a: 'Each order goes directly to a single laundry studio for pickup, garment counting, washing, and return delivery. If you want items handled by a second provider, WashMate lets you place a separate order.',
  },
  {
    q: 'Which payment methods are supported?',
    a: 'Cash on Delivery (COD) works immediately across Karachi. JazzCash and Easypaisa integration structures are built in and activate once merchant gateway credentials are configured.',
  },
  {
    q: 'What if an item is missing or damaged?',
    a: 'Providers log collected garment counts at pickup. Customers can file a Laundry Protection claim directly from their order tracking page for admin and provider resolution.',
  },
];

export const HomePage: React.FC = () => {
  const { providers, reviews, platformSettings, selectedArea, setSelectedArea } = useWashMate();
  const [searchArea, setSearchArea] = useState(selectedArea === 'All Karachi' ? '' : selectedArea);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const navigate = useNavigate();

  const approvedProviders = providers.filter((p) => p.verificationStatus === 'Approved').slice(0, 4);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const target = searchArea.trim() || 'All Karachi';
    setSelectedArea(target);
    navigate(`/find-laundry?area=${encodeURIComponent(target)}`);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-sky-50/70 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="text-sm font-semibold text-sky-800">
                Karachi Laundry Marketplace · Gulshan · Clifton · DHA · North Nazimabad
              </p>

              <h1
                className="mt-3 font-['Plus_Jakarta_Sans'] font-extrabold tracking-tight text-blue-950 text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.6rem)', lineHeight: 1.08 }}
              >
                Your Laundry, Just a Click Away.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Too busy with university, work, or daily life? Find trusted laundry services near you in Karachi. Book a pickup, choose your services, and get fresh clothes delivered to your doorstep.
              </p>

              <form onSubmit={handleHeroSearch} className="mt-8 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm max-w-xl">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <MapPin className="h-4 w-4 text-sky-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      list="karachi-area-options"
                      value={searchArea}
                      onChange={(e) => setSearchArea(e.target.value)}
                      placeholder="Select Karachi area (e.g. Gulshan-e-Iqbal, DHA)"
                      className="w-full pl-10 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <datalist id="karachi-area-options">
                      {KARACHI_AREAS.map((area) => (
                        <option key={area} value={area} />
                      ))}
                    </datalist>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <Search className="h-4 w-4" />
                    Find Laundry
                  </button>
                </div>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <a
                  href="#popular-services"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 hover:text-sky-700 transition-colors"
                >
                  Explore Services
                  <ArrowRight className="h-4 w-4" />
                </a>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <Link
                  to="/student-plans"
                  className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
                >
                  Student Hostel Plans from Rs. 999/mo
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full min-h-[280px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <SafeImage
                  src="/src/assets/images/hero_karachi_laundry_1794720457197.jpg"
                  alt="Freshly folded white shirts and woven laundry baskets in a modern Karachi garment care atelier"
                  className="w-full h-full object-cover"
                  fallbackLabel="WashMate Karachi Garment Care"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Laundry Services */}
      <section id="popular-services" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-sky-700">Service Categories</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
              Popular Laundry Services
            </h2>
          </div>
          <Link
            to="/find-laundry"
            className="text-sm font-semibold text-blue-900 hover:text-sky-700 inline-flex items-center gap-1"
          >
            Compare providers by service
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ALL_SERVICES.map((service, idx) => (
            <Link
              key={service}
              to={`/find-laundry?service=${encodeURIComponent(service)}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-sky-400 hover:shadow-sm transition-all"
            >
              <p className="text-xs font-mono-num text-slate-400">0{idx + 1}.</p>
              <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                {service}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                {SERVICE_SUMMARIES[service]}
              </p>
            </Link>
          ))}
          <Link
            to="/student-plans"
            className="rounded-2xl border border-blue-900 bg-blue-950 p-5 text-white hover:bg-blue-900 transition-colors flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-medium text-sky-300">Monthly Bundles</p>
              <h3 className="mt-2 text-base font-bold">Student Hostel Subscriptions</h3>
              <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                Save on monthly wash-and-fold quotas for 20, 40, or 60 garments.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300">
              View Plans <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Laundry Providers */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold text-sky-700">Karachi Neighborhood Partners</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
                Featured Laundry Providers
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Sample demo businesses are labeled clearly alongside live verified Karachi providers.
              </p>
            </div>
            <Link
              to="/find-laundry"
              className="px-4 py-2.5 text-sm font-semibold text-blue-900 bg-white border border-slate-200 hover:border-blue-900 rounded-xl transition-colors whitespace-nowrap self-start"
            >
              Browse All Providers
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approvedProviders.map((prov) => (
              <div
                key={prov.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <SafeImage
                    src={prov.coverImageUrl}
                    alt={prov.businessName}
                    className="w-full h-full object-cover"
                    fallbackLabel={prov.businessName}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <VerificationLabel status={prov.verificationStatus} isDemo={prov.isDemo} />
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800 tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {prov.rating.toFixed(1)} ({prov.reviewCount})
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-base font-bold text-slate-900">{prov.businessName}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {prov.primaryArea} · {prov.turnaroundHours}h turnaround
                  </p>

                  <p className="mt-3 text-sm font-semibold text-blue-950 tabular-nums">
                    From Rs. {prov.startingPricePkr} <span className="font-normal text-slate-500">/ item</span>
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 mt-auto">
                    <Link
                      to={`/provider/${prov.id}`}
                      className="flex-1 text-center px-3 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors whitespace-nowrap"
                    >
                      Select Provider
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How WashMate Works & Why Choose WashMate */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold text-sky-700">Simple Workflow</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
              How WashMate Works
            </h2>

            <div className="mt-8 space-y-6">
              {[
                {
                  step: '01. Choose Your Karachi Area & Provider',
                  desc: 'Filter laundry businesses serving Gulshan, Jauhar, North Nazimabad, DHA, Clifton, or Saddar and compare exact per-garment PKR prices.',
                },
                {
                  step: '02. Select Garments & Laundry Service',
                  desc: 'Pick T-shirts, kurtas, jeans, suits, or bedsheets and choose Washing, Ironing, Dry Cleaning, or Wash + Dry + Fold.',
                },
                {
                  step: '03. Book Hostel or Doorstep Pickup',
                  desc: 'Schedule a 2-hour pickup window, add special fabric instructions, and pay via Cash on Delivery or supported digital wallets.',
                },
                {
                  step: '04. Live 11-Stage Order Tracking',
                  desc: 'Track item collection count, washing, drying, ironing, and rider delivery with Laundry Protection coverage.',
                },
              ].map((item) => (
                <div key={item.step} className="pb-6 border-b border-slate-100 last:border-0">
                  <h3 className="text-base font-bold text-slate-900">{item.step}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-sky-50/70 border border-sky-100 rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-sky-800">Why Choose WashMate</p>
              <h3 className="mt-1 text-xl font-bold text-blue-950">
                Built for Karachi Students, Hostels & Families
              </h3>

              <ul className="mt-6 space-y-4 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Laundry Protection:</strong> Providers record exact garment counts at collection to prevent lost items.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Hostel Room & Gate Pickup:</strong> Dedicated fields for hostel names and room numbers.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Transparent Per-Item PKR Rates:</strong> See exact washing, drying, and ironing rates before booking.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-sky-200/80">
              <Link
                to="/find-laundry"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors"
              >
                Book a Pickup Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Student-Friendly Laundry Packages */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-sky-700">Monthly Campus Subscriptions</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
              Student-Friendly Laundry Packages
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Predictable monthly garment allowances tailored for university hostels across Karachi.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformSettings.studentPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border bg-white flex flex-col justify-between ${
                  plan.id === 'standard' ? 'border-blue-900 shadow-sm' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{plan.monthlyLimit} clothes / month</span>
                    {plan.id === 'standard' ? (
                      <span className="font-semibold text-blue-900">Most Popular</span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-xs text-slate-600">{plan.targetAudience}</p>

                  <p className="mt-5 font-display text-3xl font-extrabold text-blue-950 tabular-nums">
                    Rs. {plan.pricePkr.toLocaleString()}
                    <span className="text-sm font-normal text-slate-500"> / month</span>
                  </p>

                  <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                    {plan.includedServices.map((svc) => (
                      <li key={svc} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{svc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/student-plans"
                  className={`mt-6 w-full text-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    plan.id === 'standard'
                      ? 'bg-blue-900 text-white hover:bg-blue-800'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Inspect Plan Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-sky-700">Verified Karachi Orders</p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
            What Karachi Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((rev) => (
            <div key={rev.id} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {rev.rating}.0 / 5.0
                </span>
                <span>{rev.createdAt.slice(0, 10)}</span>
              </div>
              <p className="mt-4 text-sm text-slate-700 leading-relaxed">"{rev.comment}"</p>
              <p className="mt-4 text-sm font-bold text-slate-900">{rev.customerName}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Become a Laundry Partner */}
      <section className="bg-blue-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold text-sky-300">For Karachi Laundry Owners</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-balance">
                Grow Your Laundry Business Across Karachi With WashMate
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Set your own per-item washing, ironing, and dry-cleaning prices, choose the Karachi neighborhoods your riders cover, and manage incoming orders from a dedicated Partner Dashboard.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/register?role=provider"
                  className="px-5 py-3 text-sm font-semibold text-blue-950 bg-white hover:bg-sky-50 rounded-xl transition-colors"
                >
                  Register Your Laundry Shop
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-3 text-sm font-semibold text-white border border-white/25 hover:bg-white/10 rounded-xl transition-colors"
                >
                  Try Partner Demo Dashboard
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/15">
                <SafeImage
                  src="/src/assets/images/section_partner_owner_1794720459456.jpg"
                  alt="Karachi laundry shop owner inspecting freshly pressed cotton shirts"
                  className="w-full h-full object-cover"
                  fallbackLabel="WashMate Partner Owner"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {FAQS.map((item, idx) => (
            <div key={item.q} className="py-4">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 text-left py-1"
              >
                <span className="text-sm sm:text-base font-semibold text-slate-900">{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 shrink-0 transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx ? (
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{item.a}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
