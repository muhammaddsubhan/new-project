import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, Clock } from 'lucide-react';
import { ORDER_STATUS_SEQUENCE } from '../data/karachiDemoData';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-sky-700">End-to-End Laundry Logistics</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
            How WashMate Works in Karachi
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            From hostel rooms in Gulshan-e-Iqbal to apartments in DHA and Clifton, WashMate keeps every pickup, wash stage, and garment count transparent.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              title: 'Select Neighborhood & Shop',
              text: 'Choose your Karachi area so you only see laundry businesses with active pickup and delivery riders near you.',
            },
            {
              num: '02',
              title: 'Pick Per-Item Services',
              text: 'Choose Washing, Drying, Ironing, Dry Cleaning, or combined Wash + Dry + Fold packages with upfront PKR pricing.',
            },
            {
              num: '03',
              title: 'Hostel or Doorstep Pickup',
              text: 'Enter your street address, hostel name, or room number, select a 2-hour pickup slot, and add fabric care instructions.',
            },
            {
              num: '04',
              title: 'Tracked Delivery & Protection',
              text: 'Providers count items upon collection and update each wash stage live until fresh clothes return to your door.',
            },
          ].map((step) => (
            <div key={step.num} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <span className="font-mono-num text-xs font-bold text-sky-700">{step.num}.</span>
              <h2 className="mt-2 text-lg font-bold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        {/* 11-Status Order Lifecycle */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-bold text-slate-900">Live 10-Step Fulfillment Timeline</h2>
          <p className="mt-1 text-sm text-slate-600">
            Every order moves sequentially through verified milestones (plus Cancelled if halted before pickup).
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ORDER_STATUS_SEQUENCE.map((status, idx) => (
              <div key={status} className="rounded-xl border border-slate-200 p-3.5 bg-slate-50">
                <p className="font-mono-num text-xs text-slate-400">Step {idx + 1}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 p-6">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
            <h3 className="mt-3 text-base font-bold text-slate-900">Laundry Protection</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Item counts are logged at collection. Customers can raise missing or damaged garment claims directly on the order page.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <Truck className="h-6 w-6 text-blue-900" />
            <h3 className="mt-3 text-base font-bold text-slate-900">Express Same / Next-Day</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Need a formal suit or university uniform urgently? Filter for providers offering express turnaround.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <Clock className="h-6 w-6 text-sky-700" />
            <h3 className="mt-3 text-base font-bold text-slate-900">1-Click Repeat Orders</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Repeat your weekly clothing bundle from order history in seconds without re-selecting every garment.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            to="/find-laundry"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors"
          >
            Find Karachi Providers
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/student-plans"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-blue-900 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            View Student Plans
          </Link>
        </div>
      </div>
    </div>
  );
};
