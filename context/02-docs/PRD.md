# PRD — CV Builder SaaS

## Summary
A mobile-first web app that lets fresh graduates and job seekers in Malawi build a professional, ATS-safe CV in about 10 minutes, and export it as a polished PDF. Free to build and preview; payment (via PayChangu, one-time/time-boxed unlock — see TECH-SPEC) unlocks a clean, watermark-free export.

## Goals (MVP)
- 100 signups in month 1
- 10% free→paid conversion
- CV completion rate > 60%

## Non-Goals (MVP)
- Full job-board/job-matching functionality (that's Fuzu/Jobberman/BrighterMonday's territory — see research-competitors.md)
- AI-generated CV content (planned V2, not MVP — see Roadmap)
- Recurring subscriptions (PayChangu doesn't natively support this well; a one-time/time-boxed pass fits better — see research-paychangu.md)
- Full bilingual (Chichewa) UI (English confirmed as the professional CV-writing language even for Chichewa-home-language users — see research-user-personas.md; revisit if user feedback says otherwise)

## Target Users
Personas (full detail in research-user-personas.md):
1. **Chisomo** — recent bachelor's grad, no experience, applying for internships
2. **Thoko** — diploma holder, entry-level jobs
3. **Blessings** — career changer from informal work
4. **Grace** — woman re-entering the workforce after a gap
5. **Patricia** — NGO/government job applicant (needs a different CV format)

## Core User Stories (MVP)

| As a... | I want to... | So that... | Acceptance criteria |
|---|---|---|---|
| First-time user | Sign up with Google in one tap | I don't have to remember another password | Google Sign-In completes in <2 taps; user lands on CV builder |
| Any user | Fill in my CV in guided sections on my phone | I can complete it on the device I actually have | All sections usable on a small screen; progress autosaves; works through a dropped connection (Firestore offline persistence) |
| Any user | See a live preview that matches what I'll download | I trust the output before paying | Preview renders with the same template components used for PDF export |
| Chisomo/Thoko/Blessings/Grace | Use a simple, ATS-safe one-page template | My CV isn't rejected by parsing software or looks amateur | Default template is single-column, no images-as-text, standard section headers |
| Patricia | Use an NGO/government-style template (full referee details, longer format) | I don't have to manually reformat for every NGO application | A second template family is available and selectable |
| Any user | Export a clean PDF once I'm happy | I can actually submit it to an employer | Free tier: preview + limited/watermarked export; Paid: clean, watermark-free PDF |
| Any user | Pay with Airtel Money, TNM Mpamba, or bank transfer | I can actually complete a purchase with what I have | PayChangu checkout live for all three channels, server-verified before unlocking Pro |
| Returning user | Come back and edit or duplicate my CV for a new application | I don't start from scratch every time | CVs persist per user; multiple CVs per user supported |

## Open Questions / Flagged Gaps (see research files for detail)
- **Willingness-to-pay data** for Malawian digital subscriptions — not found in research; validate exact MWK price point against real signups (research-market.md, research-seo-gtm.md).
- **Internet/smartphone penetration figures** — not confirmed; informs how aggressively to optimize for low-bandwidth/feature-phone users (research-market.md).
- **Chichewa support** — deliberately deferred, not ruled out; revisit if support/feedback signals demand.
- **PayChangu fee schedule and settlement timeline** — one unconfirmed 3% data point found; get the authoritative number from PayChangu directly before finalizing pricing (research-paychangu.md).

## Success Metrics
Tracked from week 1 (see research-seo-gtm.md §7): signups, CV completion rate, free→paid conversion, and (from month 3) retention/return-usage and channel attribution.
