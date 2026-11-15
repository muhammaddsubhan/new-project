import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import { useWashMate } from '../context/WashMateContext';
import type { StudentPlanDefinition } from '../types/washmate';

export const StudentPlansPage: React.FC = () => {
  const { platformSettings, currentUser, subscriptions, subscribeToPlan, isDemoSession } = useWashMate();
  const [notice, setNotice] = useState<string>('');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const navigate = useNavigate();

  const activeSub = subscriptions.find((s) => s.status === 'Active' || s.status === 'Pending Payment');

  const handleEnroll = async (plan: StudentPlanDefinition) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setLoadingPlanId(plan.id);
    setNotice('');
    try {
      const sub = await subscribeToPlan(plan);
      setNotice(
        isDemoSession
          ? `Demo subscription activated for ${sub.planName} (${sub.monthlyLimit} garments/month). Live recurring billing activates once a payment gateway is connected.`
          : `Subscription request recorded (${sub.status}) for ${sub.planName}. Complete payment setup or pay on first pickup to activate.`
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to enroll right now.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="bg-slate-50 py-14 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-sky-700">Student Subscription Packages</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
            Student Laundry Plans for Karachi Campuses
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Built for hostel residents and day scholars at NED, KU, IBA, FAST, and Dow. Sample rates below are configurable by the WashMate Admin.
          </p>
        </div>

        {notice ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 flex items-start justify-between gap-4">
            <span>{notice}</span>
            {currentUser ? (
              <Link to="/customer/subscription" className="font-semibold underline whitespace-nowrap">
                Manage Subscription
              </Link>
            ) : null}
          </div>
        ) : null}

        {activeSub ? (
          <div className="mt-6 rounded-2xl border border-sky-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-sky-700">Your Current Plan ({activeSub.status})</p>
              <p className="text-lg font-bold text-slate-900">{activeSub.planName}</p>
              <p className="text-xs text-slate-600 tabular-nums mt-0.5">
                Usage: {activeSub.clothesUsed} / {activeSub.monthlyLimit} garments · Valid {activeSub.startDate} to {activeSub.endDate}
              </p>
            </div>
            <Link
              to="/customer/subscription"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-xl whitespace-nowrap"
            >
              View Usage Details
            </Link>
          </div>
        ) : null}

        {/* Plan Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {platformSettings.studentPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl bg-white p-6 border flex flex-col justify-between ${
                plan.id === 'standard' ? 'border-blue-900 shadow-sm' : 'border-slate-200'
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-sky-700">{plan.targetAudience}</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{plan.name}</h2>

                <p className="mt-4 font-display text-3xl font-extrabold text-blue-950 tabular-nums">
                  Rs. {plan.pricePkr.toLocaleString()}
                  <span className="text-sm font-normal text-slate-500"> / {plan.validityDays} days</span>
                </p>

                <div className="mt-4 py-3 border-y border-slate-100 text-xs text-slate-700 space-y-1 tabular-nums">
                  <p>
                    <strong>Monthly limit:</strong> {plan.monthlyLimit} clothes / month
                  </p>
                  <p>
                    <strong>Additional items:</strong> Rs. {plan.extraChargePerItemPkr} per extra garment
                  </p>
                  <p>
                    <strong>Logistics:</strong> {plan.pickupAndDeliveryNote}
                  </p>
                </div>

                <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                  {plan.includedServices.map((svc) => (
                    <li key={svc} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={loadingPlanId === plan.id}
                onClick={() => handleEnroll(plan)}
                className={`mt-6 w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  plan.id === 'standard'
                    ? 'bg-blue-900 text-white hover:bg-blue-800'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {loadingPlanId === plan.id ? 'Recording...' : currentUser ? 'Select Student Plan' : 'Sign In to Subscribe'}
              </button>
            </div>
          ))}
        </div>

        {/* Terms & Billing Transparency */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-slate-600">
              <h3 className="font-bold text-slate-900">Subscription Validity, Renewal & Payment Notice</h3>
              <p>
                <strong>Validity & Renewal:</strong> Plans run for 30 calendar days from activation. Unused clothing credits do not roll over to the next month. You can cancel anytime from your Customer Subscription dashboard before the next cycle.
              </p>
              <p>
                <strong>Payment Integration Status:</strong> Subscription records and garment usage tracking persist in Cloud Firestore (or local storage in Demo Mode). Automated recurring card/wallet billing is not active until JazzCash or Easypaisa recurring merchant credentials are configured.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
