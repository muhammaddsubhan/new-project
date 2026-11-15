import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, MapPin, Plus, Trash2 } from 'lucide-react';
import { KARACHI_AREAS } from '../data/karachiDemoData';
import { useWashMate } from '../context/WashMateContext';
import { DashboardShell } from '../components/DashboardShell';
import { CUSTOMER_NAV_ITEMS } from './CustomerDashboardPage';

export const CustomerSubscriptionPage: React.FC = () => {
  const { subscriptions, cancelSubscription, platformSettings } = useWashMate();
  const activeSub = subscriptions.find((s) => s.status !== 'Cancelled');

  return (
    <DashboardShell
      portalLabel="Customer Portal"
      breadcrumb="Student Subscription"
      navItems={CUSTOMER_NAV_ITEMS}
      primaryAction={{ label: 'Compare All Plans', to: '/student-plans' }}
    >
      {activeSub ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-sky-700">{activeSub.status}</p>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{activeSub.planName}</h2>
              <p className="text-xs text-slate-500 mt-1 tabular-nums">
                Cycle: {activeSub.startDate} to {activeSub.endDate} · Rs. {activeSub.pricePkr.toLocaleString()} / month
              </p>
            </div>
            <button
              type="button"
              onClick={() => cancelSubscription(activeSub.id)}
              className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl self-start"
            >
              Cancel Subscription
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2 tabular-nums">
              <span>Monthly Clothing Allowance Used</span>
              <span>
                {activeSub.clothesUsed} / {activeSub.monthlyLimit} garments
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-900 rounded-full"
                style={{ width: `${Math.min(100, Math.round((activeSub.clothesUsed / activeSub.monthlyLimit) * 100))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Additional garments beyond {activeSub.monthlyLimit}/month are billed at Rs.{' '}
              {activeSub.extraChargePerItemPkr} per item.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900">No Active Student Subscription</h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose from Basic (Rs. {platformSettings.studentPlans[0]?.pricePkr}), Standard (Rs.{' '}
            {platformSettings.studentPlans[1]?.pricePkr}), or Premium (Rs.{' '}
            {platformSettings.studentPlans[2]?.pricePkr}).
          </p>
          <Link
            to="/student-plans"
            className="mt-4 inline-block px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 rounded-xl"
          >
            Choose a Student Plan
          </Link>
        </div>
      )}
    </DashboardShell>
  );
};

export const CustomerProfilePage: React.FC = () => {
  const { currentUser, addresses, saveAddress, deleteAddress, updateUserProfile, platformSettings } =
    useWashMate();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [savedNotice, setSavedNotice] = useState('');

  const [label, setLabel] = useState('');
  const [area, setArea] = useState<string>(KARACHI_AREAS[0]);
  const [fullAddress, setFullAddress] = useState('');
  const [hostelOrBuilding, setHostelOrBuilding] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ displayName, phone });
    setSavedNotice('Profile saved.');
    setTimeout(() => setSavedNotice(''), 2500);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAddress({
      label,
      area,
      fullAddress,
      hostelOrBuilding,
      roomNumber,
      isDefault: addresses.length === 0,
    });
    setLabel('');
    setFullAddress('');
    setHostelOrBuilding('');
    setRoomNumber('');
  };

  return (
    <DashboardShell
      portalLabel="Customer Portal"
      breadcrumb="Profile, Addresses & Referrals"
      navItems={CUSTOMER_NAV_ITEMS}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleProfileSave} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Account Settings</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
              >
                Save Profile
              </button>
              {savedNotice ? <span className="text-xs font-semibold text-emerald-700">{savedNotice}</span> : null}
            </div>
          </form>

          {/* Referral System */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6">
            <h2 className="text-base font-bold text-blue-950">Referral Program</h2>
            <p className="mt-1 text-xs text-slate-700">
              Share your code with hostel mates in Karachi. Rewards are Rs. {platformSettings.referralRewardPkr} per verified referral.
            </p>
            <div className="mt-4 flex items-center justify-between bg-white border border-sky-200 rounded-xl px-4 py-2.5">
              <span className="font-mono-num text-sm font-bold text-blue-900">{currentUser?.referralCode}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(currentUser?.referralCode || '');
                  setCopiedRef(true);
                  setTimeout(() => setCopiedRef(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedRef ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>

        {/* Saved Karachi Addresses */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-900" />
              Saved Karachi Addresses
            </h2>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-3.5 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">
                      {addr.label} · {addr.area}
                    </p>
                    <p className="text-slate-600 mt-0.5">{addr.fullAddress}</p>
                    {addr.hostelOrBuilding ? (
                      <p className="text-slate-500 mt-0.5">
                        {addr.hostelOrBuilding} {addr.roomNumber ? `(${addr.roomNumber})` : ''}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteAddress(addr.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddAddress} className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 inline-flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add New Address
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Label (e.g. Hostel / Home)"
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  {KARACHI_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                required
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Full street address in Karachi"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={hostelOrBuilding}
                  onChange={(e) => setHostelOrBuilding(e.target.value)}
                  placeholder="Hostel / Building (optional)"
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Room # (optional)"
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};
