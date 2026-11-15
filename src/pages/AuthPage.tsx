import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ShieldCheck, Store, User } from 'lucide-react';
import { ALL_SERVICES, KARACHI_AREAS } from '../data/karachiDemoData';
import { useWashMate } from '../context/WashMateContext';
import type { ServiceType } from '../types/washmate';

export const AuthPage: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'provider' ? 'provider' : 'customer';

  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    registerLaundryBusiness,
    switchDemoRole,
  } = useWashMate();
  const navigate = useNavigate();

  const [role, setRole] = useState<'customer' | 'provider'>(initialRole);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Partner-specific onboarding fields
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [primaryArea, setPrimaryArea] = useState<string>(KARACHI_AREAS[0]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([KARACHI_AREAS[0]]);
  const [operatingHours, setOperatingHours] = useState('09:00 AM – 10:00 PM (Mon–Sun)');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [expressAvailable, setExpressAvailable] = useState(true);
  const [expressSurchargePkr, setExpressSurchargePkr] = useState(150);
  const [pickupFeePkr, setPickupFeePkr] = useState(50);
  const [deliveryFeePkr, setDeliveryFeePkr] = useState(50);
  const [minOrderPkr, setMinOrderPkr] = useState(250);
  const [turnaroundHours, setTurnaroundHours] = useState(24);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([
    'Washing',
    'Drying',
    'Ironing',
    'Wash + Dry + Fold',
  ]);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const redirectByRole = (userRole: string) => {
    if (userRole === 'admin') navigate('/admin/dashboard');
    else if (userRole === 'provider') navigate('/provider/dashboard');
    else navigate('/customer/dashboard');
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setBusy(true);
    try {
      const profile = await loginWithGoogle(role);
      redirectByRole(profile.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        navigate('/customer/dashboard');
      } else {
        const profile = await registerWithEmail({
          displayName,
          email,
          password,
          phone,
          role,
          referralCodeInput,
        });
        if (role === 'provider') {
          await registerLaundryBusiness({
            businessName: businessName || `${displayName}'s Laundry`,
            description:
              description ||
              'Independent neighborhood laundry studio offering doorstep pickup and delivery in Karachi.',
            phone,
            email,
            address,
            primaryArea,
            serviceAreas,
            operatingHours,
            pickupAvailable,
            deliveryAvailable,
            expressAvailable,
            expressSurchargePkr,
            pickupFeePkr,
            deliveryFeePkr,
            minOrderPkr,
            turnaroundHours,
            availableServices: selectedServices,
          });
        }
        redirectByRole(profile.role);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('operation-not-allowed')) {
        setError(
          'Email/Password sign-in is not yet enabled in your Firebase Console (Authentication → Sign-in method → Email/Password). Use "Continue with Google" or launch one of the Demo Workspace accounts below.'
        );
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleArea = (area: string) => {
    setServiceAreas((prev) =>
      prev.includes(area) ? (prev.length > 1 ? prev.filter((a) => a !== area) : prev) : [...prev, area]
    );
  };

  const toggleSvc = (svc: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? (prev.length > 1 ? prev.filter((s) => s !== svc) : prev) : [...prev, svc]
    );
  };

  const handleDemoLaunch = (demoRole: 'customer' | 'provider' | 'admin') => {
    switchDemoRole(demoRole);
    redirectByRole(demoRole);
  };

  return (
    <div className="bg-slate-50 py-12 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Auth Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {mode === 'login' ? 'Sign In to WashMate' : 'Create Your WashMate Account'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'login'
                    ? 'Access your Karachi laundry orders, partner dashboard, or admin console.'
                    : 'Register as a Customer or register your Karachi Laundry Business.'}
                </p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <Link
                  to="/login"
                  className={`px-3 py-1.5 rounded-lg ${mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-3 py-1.5 rounded-lg ${mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {mode === 'register' ? (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-colors ${
                    role === 'customer'
                      ? 'border-blue-900 bg-sky-50 text-blue-950'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Customer Account
                </button>
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-colors ${
                    role === 'provider'
                      ? 'border-blue-900 bg-sky-50 text-blue-950'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  Laundry Partner
                </button>
              </div>
            ) : null}

            {/* Google Sign In (Configured out-of-the-box by Firebase Provisioning) */}
            <div className="mt-5">
              <button
                type="button"
                disabled={busy}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <span className="h-5 w-5 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                  G
                </span>
                Continue with Google ({mode === 'register' && role === 'provider' ? 'Partner' : 'Firebase Auth'})
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-500">or use email & password</span>
              </div>
            </div>

            {error ? (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Ayesha Khan"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {mode === 'register' && role === 'customer' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    placeholder="e.g. ALI-KHI150"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                  />
                </div>
              ) : null}

              {mode === 'register' && role === 'provider' ? (
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <h2 className="text-sm font-bold text-blue-950">Laundry Business Profile</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Johar Clean & Press"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Area</label>
                      <select
                        value={primaryArea}
                        onChange={(e) => {
                          setPrimaryArea(e.target.value);
                          if (!serviceAreas.includes(e.target.value)) {
                            setServiceAreas((prev) => [...prev, e.target.value]);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"
                      >
                        {KARACHI_AREAS.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Shop #, Block, Main Road, Karachi"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Business Description</label>
                    <textarea
                      rows={2}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your equipment, fabric care, and turnaround..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Karachi Service Areas Covered
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {KARACHI_AREAS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleArea(a)}
                          className={`px-2.5 py-1 text-xs rounded-lg border ${
                            serviceAreas.includes(a)
                              ? 'bg-blue-900 text-white border-blue-900'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Services Offered
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_SERVICES.map((svc) => (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => toggleSvc(svc)}
                          className={`px-2.5 py-1 text-xs rounded-lg border ${
                            selectedServices.includes(svc)
                              ? 'bg-sky-700 text-white border-sky-700'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {svc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Fee (Rs.)</label>
                      <input
                        type="number"
                        min={0}
                        value={pickupFeePkr}
                        onChange={(e) => setPickupFeePkr(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Fee (Rs.)</label>
                      <input
                        type="number"
                        min={0}
                        value={deliveryFeePkr}
                        onChange={(e) => setDeliveryFeePkr(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order (Rs.)</label>
                      <input
                        type="number"
                        min={0}
                        value={minOrderPkr}
                        onChange={(e) => setMinOrderPkr(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Turnaround (hrs)</label>
                      <input
                        type="number"
                        min={6}
                        value={turnaroundHours}
                        onChange={(e) => setTurnaroundHours(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-700">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pickupAvailable}
                        onChange={(e) => setPickupAvailable(e.target.checked)}
                      />
                      Pickup Available
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={deliveryAvailable}
                        onChange={(e) => setDeliveryAvailable(e.target.checked)}
                      />
                      Delivery Available
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={expressAvailable}
                        onChange={(e) => setExpressAvailable(e.target.checked)}
                      />
                      Express (+Rs. {expressSurchargePkr})
                    </label>
                    {expressAvailable ? (
                      <input
                        type="number"
                        min={0}
                        value={expressSurchargePkr}
                        onChange={(e) => setExpressSurchargePkr(Number(e.target.value))}
                        className="w-24 px-2 py-1 border border-slate-200 rounded-lg font-mono-num"
                        aria-label="Express surcharge PKR"
                      />
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="w-full px-5 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors"
              >
                {busy
                  ? 'Processing...'
                  : mode === 'login'
                    ? 'Sign In'
                    : role === 'provider'
                      ? 'Submit Laundry Business for Verification'
                      : 'Create Customer Account'}
              </button>
            </form>
          </div>

          {/* Demo Workspace Quick Access */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-blue-900">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-base font-bold text-slate-900">Interactive Demo Accounts</h2>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Explore all three WashMate roles immediately with realistic Karachi demo data and local browser persistence. Demo sessions are clearly labeled and separate from live Firebase accounts.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => handleDemoLaunch('customer')}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-900 hover:bg-sky-50/60 transition-colors"
                >
                  <p className="text-sm font-bold text-slate-900">Launch Customer Demo</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Ali Raza Siddiqui · NED Boys Hostel · Active order WM-2026-1042 & Standard Student Plan
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLaunch('provider')}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-900 hover:bg-sky-50/60 transition-colors"
                >
                  <p className="text-sm font-bold text-slate-900">Launch Laundry Business Demo</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tariq Mahmood · Maskan Steam & Wash Atelier (Gulshan-e-Iqbal) · Manage orders & PKR pricing
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLaunch('admin')}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-900 hover:bg-sky-50/60 transition-colors"
                >
                  <p className="text-sm font-bold text-slate-900">Launch Admin Console Demo</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Approve pending businesses, configure commissions, coupons, student plans & disputes
                  </p>
                </button>
              </div>
            </div>

            <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-5 text-xs text-blue-950 space-y-2">
              <p className="font-bold">Live Firebase Admin Access</p>
              <p className="leading-relaxed text-slate-700">
                Sign in with Google using the authorized admin email (<strong>shaziabegum2995@gmail.com</strong>) to unlock live Firestore Admin Console privileges enforced by <code className="font-mono">firestore.rules</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
