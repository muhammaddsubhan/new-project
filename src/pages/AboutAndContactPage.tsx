import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { KARACHI_AREAS } from '../data/karachiDemoData';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-white py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-sky-700">About WashMate</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
            Your Laundry, Our Responsibility.
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            WashMate was created for Karachi's university students, hostel residents, busy working professionals, and households who deserve clean, crisply pressed clothes without spending weekends chasing local dhobis or unverified shops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900">Two-Sided Karachi Marketplace</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Independent neighborhood laundries keep full control of their pricing, turnaround times, and service areas while gaining digital order management.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900">Upfront Integer PKR Pricing</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Every T-shirt, kurta, suit, and bedsheet lists an exact price per service before checkout, backed by server-side quote validation.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900">Verified & Protected</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Admin verification ensures new businesses are reviewed before accepting customer orders, with garment count tracking at pickup.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-900">Active Karachi Coverage Zones</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm text-slate-700">
            {KARACHI_AREAS.map((area) => (
              <div key={area} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-700 shrink-0" />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Customer Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 py-14 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-sky-700">Get in Touch</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">Contact WashMate Karachi</h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Questions about student hostel plans, laundry partner onboarding, or deployment configuration? Reach our Karachi operations desk.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-900 shrink-0 mt-1" />
                <span>Suite 304, Shahrah-e-Faisal Business Avenue, PECHS, Karachi</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-900 shrink-0" />
                <span className="tabular-nums">+92 21 3456 7890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-900 shrink-0" />
                <span>support@washmate.pk</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            {submitted ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h2 className="mt-3 text-lg font-bold text-slate-900">Inquiry Received</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Thank you, {name}. Our Karachi team will respond to {email} shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-blue-900 bg-sky-50 rounded-xl"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Send a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"
                  >
                    <option>Customer Support</option>
                    <option>Hostel Group Plan</option>
                    <option>Laundry Partner Verification</option>
                    <option>Order Dispute / Protection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
