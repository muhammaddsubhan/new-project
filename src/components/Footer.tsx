import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="font-display text-xl font-extrabold tracking-tight text-white">
              WashMate
            </Link>
            <p className="mt-2 text-sm font-medium text-sky-300">Your Laundry, Our Responsibility.</p>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Karachi's two-sided laundry marketplace connecting students, families, and professionals with verified neighborhood garment care studios.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Marketplace</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/find-laundry" className="hover:text-white transition-colors">
                  Find Laundry Near You
                </Link>
              </li>
              <li>
                <Link to="/student-plans" className="hover:text-white transition-colors">
                  Student Laundry Plans
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How WashMate Works
                </Link>
              </li>
              <li>
                <Link to="/register?role=provider" className="hover:text-white transition-colors">
                  Partner With WashMate
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Karachi Coverage</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Gulshan-e-Iqbal & Gulistan-e-Jauhar</li>
              <li>North Nazimabad & Federal B Area</li>
              <li>DHA, Clifton & Saddar</li>
              <li>PECHS, Bahadurabad & Shahrah-e-Faisal</li>
              <li>Korangi & Malir</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Karachi Support</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Suite 304, Shahrah-e-Faisal Business Avenue, PECHS, Karachi</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="tabular-nums">+92 21 3456 7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                <span>support@washmate.pk</span>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <Link to="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact & Setup
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WashMate Karachi. All rights reserved.</p>
          <p>Sample demo businesses are explicitly labeled until live businesses complete verification.</p>
        </div>
      </div>
    </footer>
  );
};
