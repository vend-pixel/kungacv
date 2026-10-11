# PayChangu Research — CV Builder SaaS

*Compiled Sep 2026 via live web search of PayChangu's public docs/Wikipedia. Some detail (exact fee percentages beyond the one figure found, full settlement timelines) was not directly confirmed in this pass — flagged below. Verify against developer.paychangu.com and your live merchant dashboard before finalizing pricing, since fee schedules can change.*

## 1. PayChangu Overview

- Malawian fintech, founded **2021** by Morgan Tembo (CEO) and Nohaata Seven (CTO), headquartered in Lilongwe.
- In **2024**, granted a Payment Service Provider (PSP) license by the **Reserve Bank of Malawi** — a real regulatory credibility signal.
- In **2025**, partnered with **Centenary Bank Malawi** to become the first Malawian payment provider offering an **instant bank transfer API** for local businesses, alongside mobile money and cards.
- Supported payment methods confirmed: **Airtel Money, TNM Mpamba, cards, and bank transfer (via the Centenary Bank partnership)**. Also offers bill-payment endpoints (airtime, utilities, MRA payments) as a separate product line — not directly relevant to CV Builder's use case, but shows platform maturity.
- **Fee structure**: one data point found (in a third-party developer forum question, not an official fee page) references a standard **3% per-transaction** rate as a baseline assumption for escrow-style transactions — treat this as an unconfirmed estimate, not an official number. **Flag: get the current official fee schedule directly from your PayChangu merchant dashboard/sales contact before pricing your product**, since forum-sourced numbers are not authoritative.
- **Settlement timeline and KYC requirements**: not found in this pass in enough detail to state confidently — **flag as a gap to close directly with PayChangu during merchant onboarding**, since this affects your own cash-flow planning.

## 2. API Integration

- PayChangu's API is a standard **RESTful, JSON-based API** (`https://api.paychangu.com/...`), authenticated via a **Bearer secret key** in the `Authorization` header, with a `content-type: application/json` header required on requests.
- Confirmed endpoint patterns include payment/charge creation and verification, bill payment/validation endpoints, and a **webhook system** for asynchronous payment-status updates.
- **Webhooks**: set up via the merchant dashboard (Settings → API & Webhooks), where you register a webhook URL and select event types. Each webhook request carries a **`Signature` header** that must be validated server-side to confirm the request genuinely came from PayChangu — this is a must-implement step, not optional, since it's your only defense against spoofed "payment succeeded" callbacks.
- Example webhook payload structure (confirmed from docs) includes `event_type`, `charge_id`, `reference`, `currency`, `amount`, `status`, `mode` (`test`/`live`), and an `authorization` object detailing the channel used (e.g., `"channel": "Mobile Bank Transfer"` with bank/payer details, or mobile-money-specific fields when that channel is used).
- A community-maintained **Flutter SDK** (`paychangu_flutter`) exists, confirming the API supports a WebView-based checkout flow with transaction verification helpers (`verifyTransaction`, `validatePayment`) — useful as a reference implementation pattern even though this project is Next.js, not Flutter: always verify the transaction server-side (amount, currency, reference match) before granting value, exactly as that SDK's own example code does.
- **Sandbox/test mode**: confirmed to exist (`"mode": "test"` appears in example payloads), meaning you can develop and test the full flow before going live — but a step-by-step sandbox setup guide was not found in this pass; check the developer portal's "Welcome"/getting-started page directly.

## 3. Payment Flows

- **General flow** (inferred from the API's shape): your server initiates a charge (specifying amount, currency `MWK`, and a reference), the user is presented a checkout experience (hosted page or WebView) where they choose Airtel Money, TNM Mpamba, card, or bank transfer, PayChangu processes the payment with that channel, and your server is notified via webhook (and can also poll a verify endpoint) with the final status.
- **What you control vs. what PayChangu controls**: you control initiating the charge and reacting to the result; PayChangu controls the actual checkout UI/UX for entering mobile money PIN or card details — you do not (and should not, for compliance reasons) collect mobile money PINs or card numbers directly in your own UI.
- **Idempotency/duplicate-charge prevention**: use your own unique `reference` per attempted charge, and always re-verify server-side against that reference before crediting a user as Pro — never trust the client's "payment succeeded" redirect alone, since that can be replayed or spoofed; the webhook + server-side verify call is the source of truth.
- Handling failures/cancellations/timeouts: treat "no successful webhook + no successful verify" after a reasonable window as a failed attempt and let the user retry; don't grant Pro status optimistically.

## 4. Subscription Handling

- **Confirmed**: PayChangu's public API surface (as documented) is built around one-off charges and bill payments, not a native recurring-subscription primitive — consistent with the original brief's assumption.
- **Recommended pattern for a CV Builder**: given the product's actual usage shape (most users need one polished CV export, not an ongoing service), a **one-time "Pro" unlock per CV or a fixed-period pass** (e.g., 30-day Pro access) fits both the payment gateway's strengths and the user's actual need better than a recurring subscription model. This sidesteps the missing native-subscription problem entirely rather than working around it with reminder-based recurring charges.
- If recurring revenue is wanted later, the standard workaround pattern (store a payment method reference, charge again near expiry, send a reminder) is more infrastructure than a solo dev needs to build for MVP — **defer this to a later roadmap phase**, not a launch requirement.

## 5. Integration with Firebase

- Call PayChangu's API only from trusted server code — a Cloud Function or Cloud Run service using the Admin SDK — never from the client, since the secret key must never reach the browser.
- The webhook receiver is naturally implemented as an HTTP Cloud Function (or a Next.js API route) that: (1) validates the `Signature` header, (2) looks up the `reference` in a `payments` Firestore collection, (3) on confirmed success, sets `isPro`/`proExpiresAt` on the user's doc via the Admin SDK — never via a client-writable field (see Firebase security rules research).
- Suggested Firestore schema: a top-level (or per-user subcollection) `payments/{reference}` doc storing amount, currency, status, channel, and timestamps — gives you an audit trail independent of PayChangu's own dashboard, useful for support and reconciliation.

## 6. Compliance & Legal

- Business registration, KYC for merchants, and tax implications are covered in more depth in `research-legal-compliance.md`; in short, expect PayChangu to require standard merchant KYC (business or individual registration details) before enabling live payments — budget time for this in your launch checklist, not just the technical integration.
- Malawi's Data Protection Act and general good practice both call for clear checkout-page disclosures (what's being charged, in what currency, refund policy) — see SECURITY.md and the legal-compliance research for specifics.

## 7. Pricing Strategy for Malawi

- Given the unconfirmed-but-plausible ~3% transaction fee and the segment's price sensitivity (see market research — most users are unemployed or informally employed), a **low, one-time MWK price point for a time-boxed Pro pass** (rather than a subscription) is both easier to build (see §4) and easier to sell to this audience.
- **Exact MWK price point is a launch decision, not a research finding** — recommend a small least-regret starting price validated against the "first 100 users" GTM playbook rather than guessing a number here without local willingness-to-pay data (flagged as a gap in research-market.md).
- A student/fresh-grad discount or a "founding user" launch price (see GTM-PLAN) is a reasonable lever given the segment's price sensitivity.

## 8. Alternatives

- No other Malawi-specific payment gateway was directly researched in this pass; PayChangu's RBM PSP license and multi-channel (mobile money + card + bank transfer) support make it a reasonable default choice without a clear documented reason to look elsewhere for a Malawi-first launch.
- **International payments (Stripe/PayPal) for diaspora users**: worth adding only once/if the diaspora segment proves material — not a launch requirement, since PayChangu already covers the core Malawi market end to end.

## 9. Implementation Checklist

1. Register as a PayChangu merchant; complete KYC.
2. Obtain sandbox (test) API keys; build and test the full charge → webhook → verify flow end to end before touching live keys.
3. Implement server-side webhook signature verification — do not skip this.
4. Implement the reference-based idempotency pattern (§3) before enabling any real charges.
5. Confirm the actual current fee schedule and settlement timeline directly with PayChangu (not from third-party sources) before finalizing your MWK price point.
6. Switch to live keys, do a real small-value end-to-end test payment, then go live.
