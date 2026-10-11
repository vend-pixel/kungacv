# TECH-SPEC — CV Builder SaaS

## Stack
- **Frontend**: Next.js 14 (App Router), deployed on Vercel (free/Hobby tier for MVP).
- **Auth**: Firebase Auth (Google Sign-In) — client SDK for sign-in, server-side session cookie (Admin SDK-verified) for API route auth. See research-firebase-architecture.md §3.
- **Database**: Firestore, structure `users/{uid}/cvs/{cvId}` (see DATA-MODEL.md).
- **PDF Export**: **Deviation from the original brief** — render via headless Chromium (Playwright) on **Cloud Run**, not Cloud Functions. Rationale: Chromium's memory footprint (512MB-1GB+) and cold-start time fit poorly against Cloud Functions' default limits, and this is exactly the tail latency that hurts most for users on constrained Malawian mobile data. Cloud Run lets us size the container and optionally keep a warm min-instance. Full comparison in research-pdf-rendering.md §1-2.
- **Payments**: PayChangu REST API (Bearer secret key auth), server-side only. Webhook receiver validates the `Signature` header before trusting any payment update. See research-paychangu.md §2-5.
- **Hosting/Region**: Cloud Functions/Cloud Run deployed to a Europe-proximate region (e.g., `europe-west1`) rather than a default US region, to cut latency for Malawian users (research-firebase-architecture.md §4).
- **Plan requirement**: Firebase **Blaze** (pay-as-you-go) is required from day one — Spark (free) cannot make outbound calls to PayChangu or run Cloud Run. Blaze still has a no-cost tier underneath, so this is not automatically a cost increase at MVP scale.

## PDF Rendering Detail
- Templates are React components rendered once to HTML, shared identically between the live browser preview and the server-side render — this is what guarantees fidelity, not any specific library choice (research-pdf-rendering.md §3).
- Print CSS (`@page`, `@media print`, `break-inside: avoid` on entries) controls page breaks.
- Fonts self-hosted/embedded, not relying on system fonts in the Cloud Run container.
- PDF is text-based (not rasterized) for ATS-parseability; metadata (title, author) set on export.

## Payment Integration Detail
- One-time/time-boxed "Pro" pass (e.g., 30-day access) — not a recurring subscription, since PayChangu has no native subscription primitive and the usage pattern (one polished export per job search) fits a one-time unlock better anyway (research-paychangu.md §4).
- Flow: server initiates charge with a unique `reference` → user completes checkout on PayChangu's hosted/WebView UI → webhook + explicit server-side verify call (never trust client redirect alone) → Admin SDK sets `isPro`/`proExpiresAt` on the user doc.
- `payments/{reference}` Firestore collection as an independent audit trail.

## Security Baseline
- No client-writable `isPro`/`plan` fields — enforced both in Firestore rules and by only ever setting these fields from trusted server code.
- Firebase App Check to reduce non-genuine traffic hitting Firestore/Functions.
- Session cookie verified server-side on every API route call — never trust a client-supplied `userId`.
- See SECURITY.md for the full threat model.

## Offline & Performance
- Firestore offline persistence enabled from day one — lets users keep editing through a dropped connection, syncing on reconnect (directly relevant to Malawi's connectivity profile).
- Read a CV doc once per edit session, not per keystroke; rely on Firestore's client-side cache for repeat reads.
- Keep template thumbnails/assets small and lazy-loaded.

## Known Risks / Flagged Unknowns
- Exact current Firebase/Cloud Run free-tier limits and pricing — re-verify against live docs before finalizing cost projections (research-firebase-architecture.md §5).
- PayChangu's exact fee schedule and settlement timeline — only an unconfirmed ~3% figure found; confirm directly with PayChangu (research-paychangu.md §1).
- Internet/smartphone penetration data for Malawi — not confirmed; affects how aggressively to optimize bundle size (research-market.md).

## Week-1 Proof of Concept (PDF pipeline)
1. Minimal Cloud Run service: headless Chromium (Playwright), HTML in → PDF out.
2. Render one real CV template, confirm pixel fidelity against live preview.
3. Measure cold-start latency at 0 vs. 1 min-instances; decide if a warm instance is worth it at MVP scale.
4. Wire a thin Next.js API route caller so the rest of the app never talks to Chromium directly.
