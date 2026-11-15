# WashMate — Karachi's Online Laundry Marketplace

> **Tagline:** Your Laundry, Our Responsibility.

WashMate is a full-stack, two-sided laundry marketplace built for Karachi, Pakistan, connecting customers, university hostel residents, and households with independent neighborhood laundry providers.

## Tech Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, React Router, Lucide Icons
- **Backend API:** Node.js + Express (`server.ts`) for authoritative PKR order quote recalculation, duplicate-order protection, payment gateway intent routing, and WhatsApp dispatch formatting
- **Database & Auth:** Firebase Authentication + Cloud Firestore + Firebase Storage (`firebase-applet-config.json` & `firestore.rules`)

## Architecture & Security
- **Server-Side Quote Validation (`/api/orders/quote`):** All item subtotals, pickup/delivery/express fees, coupon discounts, commission %, and grand totals are recalculated as integer PKR values on the server before order creation.
- **Single-Provider Cart Rule:** Carts enforce one laundry provider per order and prompt cleanly before switching providers.
- **Firestore Security Rules (`firestore.rules`):** Enforces ownership, PII isolation on `users` and `addresses`, immutable provider verification status (admin-only approval), terminal order locking (`Delivered`, `Cancelled`), and verified delivered-order gating for reviews.

## Demo Accounts vs. Live Firebase Accounts
1. **Demo Workspace (Browser Local Persistence):** Available on `/login` with 1-click launchers for:
   - **Customer Demo:** `ali.raza.demo@washmate.pk` (NED Boys Hostel, active order `WM-2026-1042`)
   - **Provider Demo:** `tariq.partner.demo@washmate.pk` (Maskan Steam & Wash Atelier, Gulshan-e-Iqbal)
   - **Admin Demo:** Platform approvals, commissions, coupons, student plan pricing, and dispute resolution
   - Demo businesses are labeled `Demo Verified` in the UI to distinguish them from live verified shops.
2. **Live Firebase Accounts:**
   - **Google Sign-In** is enabled out-of-the-box via Firebase Auth.
   - To also enable **Email/Password** registration, open Firebase Console → **Authentication → Sign-in method → Email/Password → Enable**.
   - **Admin Security:** Live admin access is enforced in `firestore.rules` via `/admins/{uid}` or verified admin email (`shaziabegum2995@gmail.com` with `email_verified == true`). Never grant admin privileges via frontend-only flags.

## Optional Payment & Integration Keys (`.env`)
- `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_SALT`
- `EASYPAISA_STORE_ID`, `EASYPAISA_HASH_KEY`
- `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
- `VITE_GOOGLE_MAPS_API_KEY` (if omitted, WashMate uses the built-in Karachi neighborhood area selector)

## Local Development & Deployment
```bash
npm install
npm run dev        # Runs Express + Vite on http://localhost:3000
npm run build      # Builds production frontend into /dist
NODE_ENV=production npm start
```
### Deploy to Firebase Hosting or Vercel
- **Firebase Hosting:** Run `npm run build`, configure `firebase.json` rewrites to `index.html` (or Cloud Run for `server.ts`), and deploy `firestore.rules` with `firebase deploy --only firestore:rules,hosting`.
- **Vercel:** Connect the repository with build command `npm run build` and expose `server.ts` API endpoints as serverless routes or Node runtime.
