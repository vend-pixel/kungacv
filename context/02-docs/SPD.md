# SPD — System/Product Design

## High-Level Architecture
```
[Next.js 14 app on Vercel]
   |-- Client: Firebase Auth (Google), Firestore client SDK (offline persistence on)
   |-- Server (API routes): session verification, CV CRUD (Admin SDK), PayChangu API calls
   v
[Firestore]  users/{uid} -> cvs/{cvId}  (structured CV JSON)
   v (on "Export PDF")
[Cloud Run: PDF render service — Chromium via Playwright, same React templates as live preview]
   v
[PDF returned to user]

[Cloud Functions]
   - onCreate(user) -> initialize default CV doc
   - PayChangu webhook receiver -> verify signature -> Admin SDK sets user.isPro (server-only)
```
(Full rationale: research-firebase-architecture.md, research-pdf-rendering.md)

## Core Components
1. **Auth** — Firebase Google Sign-In, server-side session cookie verified via Admin SDK (not raw ID tokens passed around).
2. **CV Editor** — guided, section-based form (Personal Info, Summary, Experience, Education, Skills, References), autosaving to Firestore, mobile-first layout.
3. **Live Preview** — renders the same React template components used server-side for PDF export, so preview and export never drift.
4. **Template Library** — MVP ships two template families: (a) standard ATS-safe one-pager, (b) NGO/government-style with full referee details (see PRD, personas).
5. **PDF Export Service** — Cloud Run + headless Chromium, invoked only on explicit "Export" action (not on every save) to control cost/latency.
6. **Payments** — PayChangu integration: one-time/time-boxed Pro unlock, server-verified via webhook + reference lookup before granting Pro status.
7. **Admin/Support surface** — minimal for MVP: ability to look up a user's payment record in the `payments` Firestore collection for support/reconciliation.

## Key Flows
- **Build flow**: Sign in → land on CV editor → fill sections (autosave + offline-tolerant) → live preview updates → "Export" CTA.
- **Payment flow**: Export CTA (if not Pro) → PayChangu checkout (Airtel Money / TNM Mpamba / card / bank transfer) → webhook confirms → user redirected back, now Pro → clean PDF export enabled.
- **Return flow**: Sign in → see list of saved CVs → edit or duplicate for a new application.

## Design Principles Driving This Architecture
- **Mobile-first, low-bandwidth tolerant** (Firestore offline persistence, lightweight bundle) — driven by the target market's connectivity profile (research-market.md, research-firebase-architecture.md §6).
- **Preview = export, always** — the single biggest trust-building lever per persona research; achieved by sharing React template components between preview and Cloud Run PDF rendering.
- **Payment gate after the confidence-building moment** (a completed draft), not before — matches the emotional journey mapped in research-user-personas.md §4.
- **No client-writable trust fields** (isPro, plan) — always server-set via Admin SDK after payment verification (research-firebase-architecture.md §2).

## Out of Scope for MVP
Job matching/board features, AI content generation, recurring billing, multi-language UI (see PRD Non-Goals).
