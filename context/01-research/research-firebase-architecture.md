# Firebase Architecture Research — CV Builder SaaS

*Engineering judgment call based on stable Firebase platform patterns rather than a live-search topic. Re-verify exact free-tier numbers against current Firebase pricing docs before finalizing cost projections — quota numbers do change over time.*

## 1. Firestore Data Modeling

- Structure: `users/{userId}` (profile, pro flag, plan info) → `users/{userId}/cvs/{cvId}` (one doc per CV) → CV content stored as a structured JSON object within the `cvs` doc itself (sections, entries) rather than further subcollections, since a single CV's content is well under Firestore's 1MB document limit and doesn't need independent per-section querying.
- **Subcollections vs. root collections**: use a subcollection (`users/{userId}/cvs`) rather than a root `cvs` collection with a `userId` field — this makes ownership-based security rules simpler (`request.auth.uid == userId` on the parent path) and avoids needing a composite index just to list "my CVs."
- **Denormalization**: store the user's display name/email on the CV doc if you ever need to reference it without a join (e.g., for a shareable public link), since Firestore has no native joins.
- **Document size limits**: a CV as structured JSON (work history, education, skills, summary) will realistically stay in the tens of KB, far under the 1MB cap — this is not a practical constraint at this data shape, but avoid embedding base64 images (e.g., a profile photo) directly in the document; use Firebase Storage and store a URL reference instead.
- **JSON blob vs. structured fields**: store CV content as one structured JSON object (not flattened into many top-level fields) — this matches how the app reads/writes it (whole-document read on edit, whole-document write on save) and avoids needing per-field Firestore indexes for data that's never queried field-by-field.
- **Versioning/history**: not necessary for MVP given the 4-week solo-dev timeline; if added later, store snapshots in a `users/{userId}/cvs/{cvId}/versions` subcollection written on each export rather than on every keystroke, to control write volume and cost.

## 2. Security Rules

- Core pattern: users can only read/write their own `cvs` subcollection; the `pro`/plan flag lives on the parent `users/{userId}` doc and is **never client-writable** — it's set only by a trusted server context (a Cloud Function/Cloud Run service using the Admin SDK, which bypasses security rules) after verified payment.
- Example rules file (illustrative, not exhaustive):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      // plan/pro fields are server-managed; client cannot self-upgrade
      allow update: if request.auth != null && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys()
                         .hasAny(['plan', 'isPro']);
      allow create: if request.auth != null && request.auth.uid == userId;

      match /cvs/{cvId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```
- **Admin-only operations** (marking a user Pro after payment verification, handling PayChangu webhooks) run exclusively in server code using the Admin SDK, which is not subject to these rules at all — the rules above only govern direct client access.
- **Rate-limiting write spam**: Firestore security rules can't natively rate-limit, so the practical mitigation at MVP scale is Firebase App Check (blocks non-genuine app traffic) plus reasonable client-side debouncing on autosave; a dedicated rate-limiter is not needed at MVP volume.

## 3. Authentication

- Google Sign-In in Next.js 14 App Router: use the Firebase Auth client SDK for the sign-in flow, then mint a server-side session (e.g., exchange the Firebase ID token for an HTTP-only session cookie verified via the Admin SDK) rather than passing the raw ID token around — this is the standard, more secure pattern for App Router server components/API routes needing to know "who is this request from."
- Token refresh is handled by the Firebase client SDK automatically for the client-side session; the server-side session cookie needs its own expiry/refresh handling (a common pattern: a short-lived session cookie refreshed via a background call while the tab is open).
- Protect API routes (e.g., the PDF export endpoint) by verifying the session server-side on every request — never trust a client-supplied `userId`.

## 4. Cloud Functions Patterns

- Use **Next.js API routes** (running on Vercel) for anything synchronous and fast (CRUD on CV data via the Admin SDK). Use **Cloud Functions** for Firestore-triggered background work (e.g., a `onCreate` trigger that initializes a new user's default CV). Use **Cloud Run** specifically for the PDF export path, per the PDF-rendering research — its heavier compute/memory needs don't fit Functions' model well.
- **Region selection**: choosing a Functions/Cloud Run region physically closer to Africa (e.g., `europe-west1`) rather than a default US region will meaningfully cut round-trip latency for Malawian users — worth the small extra setup step.
- **Cold starts on slow connections**: this compounds badly for users already on constrained data — favor keeping the hot path (viewing/editing a CV) entirely on fast Next.js API routes / direct Firestore client reads, and reserve any cold-start-prone service (Cloud Run PDF rendering) for the deliberate "export" action where a few seconds of wait is expected and acceptable.

## 5. Free Tier Analysis

- Firebase Spark (free) plan covers Firestore reads/writes/storage and Auth at generous limits for an MVP with dozens to low hundreds of users, but **cannot make outbound network calls from Functions** (needed to call PayChangu's API) and **cannot use Cloud Run** — both require upgrading to the pay-as-you-go **Blaze plan**.
- Blaze itself still has a no-cost tier underneath the pay-as-you-go billing (the same free quotas as Spark, plus billed usage only beyond them) — so upgrading to Blaze is a requirement for payments/PDF-export functionality, not automatically a cost increase, at MVP scale (100-1,000 users).
- Realistic cost trajectory: near-zero at 100-1,000 users given typical CV-builder read/write/render volume per user; costs become worth actively monitoring in the thousands-of-users range, primarily driven by Cloud Run PDF-render compute time and Firestore reads if the app re-fetches CV data more than necessary. **Recommend re-checking current Firebase/Cloud Run pricing pages directly once real usage data exists**, rather than trusting a fixed number here.
- Vercel's free (Hobby) tier is generous for a solo-dev MVP's frontend hosting; its main practical limits (bandwidth, serverless function execution) are unlikely to bind before the Firebase/Cloud Run side does.

## 6. Performance

- Minimize Firestore reads by reading a CV doc once per edit session (not per keystroke) and relying on Firestore's built-in client-side caching for repeat reads within a session.
- Cache static template assets (fonts, layout CSS) via Vercel's CDN; there's little benefit to caching CV *content* since it's per-user and frequently edited.
- **Firestore offline persistence**: genuinely useful for Malawi's connectivity profile — enabling it lets a user keep editing a CV through a dropped connection, with changes syncing once connectivity returns. Worth enabling from day one given the target market's constraints.
- Keep template preview images/assets small and lazy-loaded; avoid shipping large template-thumbnail galleries on first load.

## 7. Backup & Disaster Recovery

- Firestore's managed export feature (to Cloud Storage) is available on the Blaze plan; storage costs for the export itself are minimal at MVP data volumes. Schedule periodic exports once there's real user data worth protecting — not essential in week one, but easy to add early.
- **Data portability**: give users a "download all my data" option (their CV(s) as JSON, plus generated PDFs) — both good practice and relevant to the data-protection obligations covered in the legal research.

## 8. Alternatives Considered

- **Supabase vs. Firebase**: Supabase's Postgres-based model would arguably fit structured CV data just as well and has a more transparent free tier, but switching now would cost real solo-dev time against a 4-week MVP timeline with no clear Malawi-specific advantage either way. **Verdict: stick with Firebase** — the original stack choice is reasonable; this isn't a case where the research uncovered a compelling reason to switch.

## 9. Recommended Architecture (text diagram)

```
[Next.js 14 app on Vercel]
   |-- Client: Firebase Auth (Google Sign-In), Firestore client SDK (CV read/write, offline persistence)
   |-- Server (API routes): session verification, CV CRUD via Admin SDK, calls to PayChangu API
   |
   v
[Firestore]  users/{uid} -> cvs/{cvId}  (structured CV JSON)
   |
   v (on "Export PDF")
[Cloud Run: PDF render service]  <-- receives server-rendered HTML from the same React templates
   |
   v
[PDF bytes returned to user]

[Cloud Functions]
   - onCreate(user) -> initialize default CV doc
   - PayChangu webhook receiver -> verify signature -> Admin SDK write to set user.isPro
```

## Gotchas

- Don't let the client ever write its own `isPro`/`plan` field — always server-verified.
- Don't run Puppeteer/Playwright inside Cloud Functions if it can be avoided — Cloud Run is the better fit for this workload (see PDF-rendering research).
- Region choice affects latency more than most solo devs expect for African users — pick a Europe/Africa-proximate region over a default US one.
- Blaze plan is required for payments and PDF export, not optional — plan for this from day one rather than discovering it mid-build.
