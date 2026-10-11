# TEST-PLAN — CV Builder SaaS

## Priorities for a Solo Dev, 4-Week Timeline
Focus testing effort on the highest-risk, highest-consequence paths first: payment correctness and PDF fidelity. Everything else can tolerate a lighter manual-QA pass at MVP scale.

## 1. PDF Export Fidelity (highest priority — the core trust mechanic)
- Manual visual diff: for each template family, compare the live preview against the exported PDF pixel-by-pixel (or close) after every template change.
- Test page-break behavior with CVs of varying content length (very short — Chisomo persona with no experience; long — Grace persona with an extensive work history).
- Test font rendering in the Cloud Run container matches local dev (self-hosted fonts, not system fonts — research-pdf-rendering.md §3).
- Test that exported PDF text is selectable (not rasterized) — quick manual check: try to select/copy text from the exported PDF.

## 2. Payment Flow (highest priority — real money, real trust)
- Sandbox/test-mode end-to-end run for each channel PayChangu supports (Airtel Money, TNM Mpamba, card, bank transfer) before any live key is used (research-paychangu.md §9 checklist).
- Explicitly test the failure path: cancel/timeout a checkout and confirm the user is *not* granted Pro.
- Explicitly test webhook signature validation: send a request with a missing/invalid signature and confirm it's rejected.
- Explicitly test idempotency: attempt to reuse a `reference` and confirm no duplicate Pro grant.
- Confirm `isPro`/`plan`/`proExpiresAt` cannot be set via any client-facing path (attempt a direct Firestore write from an authenticated-but-unpaid test account and confirm the security rule blocks it).

## 3. Auth & Session
- Sign-in/sign-out flow end to end.
- Confirm an API route rejects a request with no valid session cookie.
- Confirm a user cannot read/write another user's `cvs` subcollection (attempt with a second test account).

## 4. Offline/Connectivity Resilience
- Start editing a CV, disable network mid-edit, continue editing, re-enable network, confirm changes sync via Firestore offline persistence without data loss.
- Test on a throttled/slow connection profile (simulating the target market's typical conditions) to catch UX issues that only appear under real-world latency.

## 5. Mobile UX
- Full CV creation flow on an actual low/mid-spec Android device (not just browser dev-tools device emulation) — matches the persona research's confirmed device profile.
- Confirm the editor is fully usable one section at a time on a small screen.

## 6. Template Correctness
- Standard template: confirm ATS-safe structure (no multi-column layout, no text-in-images, standard section headers) — spot-check with a free online ATS-resume-checker tool if available.
- NGO/Government template: confirm the full referee-details section renders and exports correctly (Patricia persona's specific need).

## 7. Content/Legal Compliance Checks
- Confirm no outcome-guarantee language ("guaranteed job," etc.) anywhere in shipped copy (research-legal-compliance.md §3).
- Confirm Privacy Policy, Terms of Service, and Refund Policy are linked and accessible before checkout.

## Pre-Launch Checklist (gate before going live with real payments)
- [ ] All Section 2 (Payment Flow) tests pass in sandbox mode
- [ ] Security rules verified to block client writes to `isPro`/`plan`/`proExpiresAt` and cross-user data access
- [ ] PDF export fidelity confirmed across both template families and short/long content cases
- [ ] Offline-edit-then-sync confirmed with no data loss
- [ ] Legal pages (Privacy, Terms, Refund) published and linked
- [ ] One real, small-value live payment completed successfully end to end before public launch
