# ROADMAP — CV Builder SaaS

## Phase 0 — MVP (Weeks 1-4, solo dev)
- Google Sign-In, CV editor (Standard + NGO-Government templates), live preview = export fidelity.
- Cloud Run PDF export pipeline (Playwright/Chromium).
- PayChangu one-time/time-boxed Pro unlock (Airtel Money, TNM Mpamba, card, bank transfer).
- Firestore offline persistence, autosave.
- Baseline Privacy Policy, Terms of Service, Refund Policy published (lawyer-light initial versions — see SECURITY.md, research-legal-compliance.md §10).
- Launch via WhatsApp/Facebook groups + 1-2 university partnerships (see GTM-PLAN).

## Phase 1 — Post-Launch Hardening (Month 2-3, gated on MVP metrics)
- Fix onboarding friction found from first 10-20 real users.
- Confirm actual PayChangu fee schedule/settlement timeline; adjust pricing if needed.
- Validate MWK price point against real conversion data; consider founding-user price adjustment.
- Close flagged research gaps as real usage data becomes available: local internet/device-usage patterns, CV format conventions (photo/references), Data Protection Act specifics.
- Firestore scheduled backups/export once real user data exists worth protecting.

## Phase 2 — V2 Features (Month 3+, gated on traction)
- AI-assisted CV wording/review (OpenAI/Gemini) — positioned as "helps you say it right," not the core differentiator, since regional competitors (Fuzu, Konectin) already offer this (research-competitors.md §3). Requires a disclosure/consent step (research-legal-compliance.md §6).
- Shareable public CV link (à la Hello.cv pattern, research-competitors.md §2) — real differentiation, not MVP-critical.
- CV versioning/history.
- NGO partnership program formalized (beyond ad hoc outreach).

## Phase 3 — Regional Expansion (later, gated on Malawi traction)
- Evaluate expansion market (Kenya, Nigeria, South Africa, Zambia) — each requires its own compliance pass (POPIA, NDPR, Kenya DPA — research-legal-compliance.md §9) and its own payment-gateway research (PayChangu is Malawi-specific).
- International payments (Stripe/PayPal) only if/when a diaspora segment proves material (research-paychangu.md §8).
- Multi-language content, if demand signals justify it (Chichewa or others, depending on expansion market).

## Explicitly Deferred, Not Ruled Out
- Recurring subscriptions (revisit only if a clear revenue case emerges — one-time passes fit the platform and segment better for now).
- Full bilingual UI.
- Large decorative template library (a small, ATS-safe set is the deliberate choice — see research-competitors.md §5).
