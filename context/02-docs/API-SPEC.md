# API-SPEC — CV Builder SaaS

All endpoints are Next.js API routes unless noted. All require a verified server-side session (Admin SDK-checked cookie) except the PayChangu webhook, which is verified by signature instead.

## Auth
- Handled client-side via Firebase Auth (Google Sign-In); server exchanges the resulting ID token for a session cookie.
- `POST /api/auth/session` — body: `{ idToken }` → sets an HTTP-only session cookie after Admin SDK verification.
- `POST /api/auth/logout` — clears the session cookie.

## CVs
- `GET /api/cvs` — list the current user's CVs (id, title, templateFamily, updatedAt).
- `POST /api/cvs` — create a new CV (`{ templateFamily, title }`) → returns new `cvId`.
- `GET /api/cvs/:cvId` — fetch full CV content (must belong to the session user).
- `PUT /api/cvs/:cvId` — update CV content (autosave target; whole-document write of `content`).
- `DELETE /api/cvs/:cvId` — delete a CV.
- `POST /api/cvs/:cvId/duplicate` — duplicate an existing CV as a new one (supports the "reuse for a new application" user story in PRD).

## Export
- `POST /api/cvs/:cvId/export` —
  - Server loads CV content, server-renders the matching React template to an HTML string, calls the Cloud Run render service, streams back the PDF.
  - If user is not Pro: returns a watermarked/limited PDF (free tier).
  - If user is Pro (and `proExpiresAt` is in the future): returns a clean PDF.

## Payments
- `POST /api/payments/initiate` — body: `{ plan }` → creates a `payments/{reference}` doc (`status: pending`), calls PayChangu to initiate a charge, returns the checkout URL/reference to the client.
- `POST /api/payments/webhook` — **PayChangu → server**, not client-facing. Validates the `Signature` header, looks up `reference` in `payments`, updates status, and on `success` sets `isPro`/`proExpiresAt`/`plan` on the user doc via Admin SDK.
- `GET /api/payments/:reference/status` — client polls this (as a fallback to the webhook) to check whether a payment has completed, for immediate UI feedback after checkout redirect.

## Cloud Run (internal, not client-facing)
- `POST /render` on the PDF render service — body: `{ html: string }` → returns `application/pdf` bytes. Called only from trusted server code (the `/api/cvs/:cvId/export` route), never directly by the client.

## Cloud Functions (event-driven, not REST)
- `onCreate(user)` — Firestore/Auth trigger: initializes a default empty CV doc for a new user.

## Error Handling Conventions
- All endpoints return `{ error: string }` with an appropriate HTTP status on failure.
- Payment-related endpoints never trust client-supplied success/failure state — only server-side verification (webhook + `/status` check against PayChangu) can set `isPro`.
