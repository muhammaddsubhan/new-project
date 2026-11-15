# WashMate Security Specification (Phase 0: Payload-First Security TDD)

## 1. Core Data Invariants
1. **Identity & Role Integrity**: A user document in `/users/{userId}` can only be created by the authenticated user (`request.auth.uid == userId`) with `role in ['customer', 'provider']` and `suspended == false`. Self-assignment of `'admin'` is strictly forbidden; admin authority comes exclusively from `/admins/{uid}` or the verified bootstrapped admin email (`shaziabegum2995@gmail.com` with `email_verified == true`).
2. **Provider Verification Lock**: Laundry business owners can register and edit their profile, service areas, hours, and fees, but CANNOT modify `verificationStatus`, `rating`, `reviewCount`, `completedOrdersCount`, or `ownerId`. Only an Admin can approve or reject a provider.
3. **Single-Provider Order Integrity**: An order in `/orders/{orderId}` must reference an existing approved `/providers/{providerId}`, enforce `customerId == request.auth.uid`, start in `status == 'Order Placed'`, use integer PKR monetary totals (`>= 0`), and cannot mark `paymentStatus == 'Paid'` directly from the client.
4. **Terminal Order Locking**: Once an order reaches `'Delivered'` or `'Cancelled'`, no further status transitions are permitted by customer or provider (except customer marking `hasReviewed` once, or admin override).
5. **Verified Review Gate**: A review in `/reviews/{reviewId}` can only be created by the order's `customerId` when the referenced order exists and has `status == 'Delivered'`.
6. **PII Isolation**: `/users/{userId}`, `/addresses/{addressId}`, `/carts/{userId}`, `/orders/{orderId}`, `/subscriptions/{subId}`, `/notifications/{notifId}`, `/complaints/{complaintId}`, and `/transactions/{txId}` strictly deny blanket reads and enforce `resource.data` ownership checks on `list`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Privilege Escalation on Signup**: `POST /users/u1` with `{ role: "admin", ... }` -> **PERMISSION_DENIED** (role restricted to `['customer', 'provider']`).
2. **Self-Unsuspend / Role Upgrade**: `PATCH /users/u1` with `{ role: "admin", suspended: false }` -> **PERMISSION_DENIED** (`affectedKeys().hasOnly(['displayName', 'phone', 'favoriteProviderIds', 'updatedAt'])`).
3. **Provider Self-Approval**: `PATCH /providers/p1` by owner with `{ verificationStatus: "Approved" }` -> **PERMISSION_DENIED** (`verificationStatus` immutable for owner).
4. **Ghost Field Injection**: `POST /providers/p1` with `{ ..., isFeaturedVerified: true }` -> **PERMISSION_DENIED** (`keys().hasOnly(...)` rejects shadow fields).
5. **ID Poisoning**: `PUT /orders/<2000-char-id>` -> **PERMISSION_DENIED** (`isValidId(orderId)` enforces `<= 128` chars and alphanumeric/hyphen/underscore regex).
6. **Negative Price / Float Injection**: `POST /orders/o1` with `{ subtotalPkr: -500, grandTotalPkr: 0 }` -> **PERMISSION_DENIED** (`subtotalPkr is int && subtotalPkr > 0`).
7. **Pre-Paid Spoofing**: `POST /orders/o1` with `{ paymentMethod: "JazzCash", paymentStatus: "Paid" }` -> **PERMISSION_DENIED** (client create restricts `paymentStatus` to `['Pending', 'COD Scheduled', 'Awaiting Gateway']`).
8. **Customer Order Hijack / Price Tamper**: `PATCH /orders/o1` by customer with `{ grandTotalPkr: 1 }` -> **PERMISSION_DENIED**.
9. **Post-Delivery Cancellation**: `PATCH /orders/o1` on `'Delivered'` order with `{ status: "Cancelled" }` -> **PERMISSION_DENIED** (terminal state lock).
10. **Fake Review Without Delivered Order**: `POST /reviews/r1` referencing an `'Order Placed'` order -> **PERMISSION_DENIED** (`get(/orders/$(orderId)).data.status == 'Delivered'`).
11. **PII Scraping List Query**: `LIST /users` or `LIST /orders` by non-admin without ownership constraint -> **PERMISSION_DENIED** (`allow list` requires `resource.data` match or `isAdmin()`).
12. **Unverified Email Spoof**: Request with `email == 'shaziabegum2995@gmail.com'` and `email_verified == false` -> **PERMISSION_DENIED**.
