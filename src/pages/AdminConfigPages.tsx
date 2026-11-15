import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useWashMate } from '../context/WashMateContext';
import { DashboardShell } from '../components/DashboardShell';
import { ADMIN_NAV_ITEMS } from './AdminOperationsPages';

export const AdminCommissionsPage: React.FC = () => {
  const { platformSettings, adminUpdateSettings, transactions } = useWashMate();
  const [commissionPct, setCommissionPct] = useState(platformSettings.commissionPercent);
  const [saved, setSaved] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminUpdateSettings({ commissionPercent: Math.min(50, Math.max(0, Math.round(commissionPct))) });
    setSaved('Commission percentage updated.');
    setTimeout(() => setSaved(''), 2500);
  };

  return (
    <DashboardShell
      portalLabel="Admin Console"
      breadcrumb="Commission & Revenue Ledger"
      navItems={ADMIN_NAV_ITEMS}
    >
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 max-w-xl space-y-4">
        <h2 className="text-base font-bold text-slate-900">Marketplace Commission Rate</h2>
        <p className="text-xs text-slate-600">
          Applied to item subtotals during server-side quote calculation for new orders.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={50}
            value={commissionPct}
            onChange={(e) => setCommissionPct(Number(e.target.value))}
            className="w-28 px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
          />
          <span className="text-sm font-semibold text-slate-700">%</span>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
          >
            Update Commission
          </button>
          {saved ? <span className="text-xs font-semibold text-emerald-700">{saved}</span> : null}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Order Amount</th>
                <th className="py-3 px-4 text-right">WashMate Fee</th>
                <th className="py-3 px-4 text-right">Provider Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono-num">{tx.orderId}</td>
                  <td className="py-3 px-4">{tx.paymentMethod}</td>
                  <td className="py-3 px-4">{tx.status}</td>
                  <td className="py-3 px-4 text-right font-mono-num">Rs. {tx.amountPkr}</td>
                  <td className="py-3 px-4 text-right font-mono-num font-bold text-emerald-700">
                    Rs. {tx.commissionPkr}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num">Rs. {tx.providerNetPkr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
};

export const AdminCouponsPage: React.FC = () => {
  const { coupons, adminUpsertCoupon, adminDeleteCoupon } = useWashMate();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState(100);
  const [minOrderPkr, setMinOrderPkr] = useState(400);
  const [maxDiscountPkr, setMaxDiscountPkr] = useState(250);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await adminUpsertCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderPkr,
      maxDiscountPkr,
      active: true,
      expiryDate,
      usageCount: 0,
    });
    setCode('');
  };

  return (
    <DashboardShell
      portalLabel="Admin Console"
      breadcrumb="Discount Coupons"
      navItems={ADMIN_NAV_ITEMS}
    >
      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Create Discount Coupon</h2>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE20"
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono-num uppercase"
          />
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percent')}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
          >
            <option value="fixed">Fixed PKR</option>
            <option value="percent">Percent %</option>
          </select>
          <input
            type="number"
            min={1}
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            placeholder="Value"
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono-num"
          />
          <input
            type="number"
            min={0}
            value={minOrderPkr}
            onChange={(e) => setMinOrderPkr(Number(e.target.value))}
            placeholder="Min Order Rs."
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono-num"
          />
          <input
            type="number"
            min={0}
            value={maxDiscountPkr}
            onChange={(e) => setMaxDiscountPkr(Number(e.target.value))}
            placeholder="Max Cap Rs."
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono-num"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
          >
            <Plus className="h-3.5 w-3.5" />
            Save Coupon
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {coupons.map((c) => (
          <div key={c.code} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-mono-num text-sm font-bold text-slate-900">{c.code}</p>
              <p className="text-xs text-slate-600 tabular-nums">
                {c.discountType === 'percent' ? `${c.discountValue}% off` : `Rs. ${c.discountValue} off`} · Min order Rs.{' '}
                {c.minOrderPkr} · Max cap Rs. {c.maxDiscountPkr} · Expires {c.expiryDate}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adminUpsertCoupon({ ...c, active: !c.active })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${
                  c.active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {c.active ? 'Active' : 'Paused'}
              </button>
              <button
                type="button"
                onClick={() => adminDeleteCoupon(c.code)}
                className="p-1.5 text-slate-400 hover:text-rose-600"
                aria-label="Delete coupon"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
};

export const AdminSettingsPage: React.FC = () => {
  const { platformSettings, adminUpdateSettings, resetDemoData, serverConfig } = useWashMate();
  const [plans, setPlans] = useState(platformSettings.studentPlans);
  const [referralRewardPkr, setReferralRewardPkr] = useState(platformSettings.referralRewardPkr);
  const [waEnabled, setWaEnabled] = useState(platformSettings.whatsappNotificationsEnabled);
  const [saved, setSaved] = useState('');

  const updatePlanField = (idx: number, field: 'pricePkr' | 'monthlyLimit' | 'extraChargePerItemPkr', value: number) => {
    setPlans((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: Math.max(0, Math.round(value)) } : p))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminUpdateSettings({
      studentPlans: plans,
      referralRewardPkr,
      whatsappNotificationsEnabled: waEnabled,
    });
    setSaved('Platform settings & student plan prices saved.');
    setTimeout(() => setSaved(''), 3000);
  };

  return (
    <DashboardShell
      portalLabel="Admin Console"
      breadcrumb="Platform Settings & Integrations"
      navItems={ADMIN_NAV_ITEMS}
    >
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Configurable Student Subscription Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, idx) => (
              <div key={plan.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={plan.pricePkr}
                    onChange={(e) => updatePlanField(idx, 'pricePkr', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Monthly Clothes Limit</label>
                  <input
                    type="number"
                    value={plan.monthlyLimit}
                    onChange={(e) => updatePlanField(idx, 'monthlyLimit', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Extra Item Charge (PKR)</label>
                  <input
                    type="number"
                    value={plan.extraChargePerItemPkr}
                    onChange={(e) => updatePlanField(idx, 'extraChargePerItemPkr', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono-num"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-2xl">
          <h2 className="text-base font-bold text-slate-900">Rewards & Notifications</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Referral Reward Credit (PKR)
            </label>
            <input
              type="number"
              min={0}
              value={referralRewardPkr}
              onChange={(e) => setReferralRewardPkr(Number(e.target.value))}
              className="w-36 px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={waEnabled}
              onChange={(e) => setWaEnabled(e.target.checked)}
            />
            Enable WhatsApp order confirmation & delivery update dispatches
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
            >
              Save Platform Settings
            </button>
            {saved ? <span className="text-xs font-semibold text-emerald-700">{saved}</span> : null}
          </div>
        </div>
      </form>

      {/* External Credential Status & Demo Reset */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">External Gateway & API Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { name: 'Google Maps Embed', ready: serverConfig.googleMapsConfigured, env: 'VITE_GOOGLE_MAPS_API_KEY' },
            { name: 'JazzCash Merchant', ready: serverConfig.jazzCashConfigured, env: 'JAZZCASH_MERCHANT_ID' },
            { name: 'Easypaisa Store', ready: serverConfig.easypaisaConfigured, env: 'EASYPAISA_STORE_ID' },
            { name: 'WhatsApp Cloud API', ready: serverConfig.whatsappCloudConfigured, env: 'WHATSAPP_CLOUD_TOKEN' },
          ].map((cfg) => (
            <div key={cfg.name} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <p className="font-bold text-slate-900">{cfg.name}</p>
              <p className={`mt-1 font-semibold ${cfg.ready ? 'text-emerald-700' : 'text-amber-700'}`}>
                {cfg.ready ? 'Configured' : 'Fallback Mode (Env not set)'}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-500">{cfg.env}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Reset local browser Demo Workspace back to initial Karachi sample records.
          </p>
          <button
            type="button"
            onClick={resetDemoData}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Reset Demo Data
          </button>
        </div>
      </div>
    </DashboardShell>
  );
};
