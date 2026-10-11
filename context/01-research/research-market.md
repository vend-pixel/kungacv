# Market Research — CV Builder SaaS (Malawi)

*Compiled Sep 2026 via live web search. Figures are cited where sourced; estimates are flagged.*

## 1. Market Size

- **Youth unemployment**: Estimates vary sharply by methodology. The World Bank/ILO modeled rate (ages 15-24) sits near 7% for 2024-2025 — but this narrow ILO definition undercounts informal/underemployment. Malawian press citing ILO puts youth unemployment closer to **23%**, versus a national rate around 21%, and AfDB projected roughly **50% of youth unemployed by 2025** on current trend. Afrobarometer's 2025 dispatch is the most useful qualitative source: Malawi ranks 168th of 183 countries on the Global Youth Development Index, **38% of young women and 23% of young men are NEET** (not in employment, education, or training), and **more than 8 in 10 employed 15-24 year-olds work in low-quality/informal jobs**, with over 1 in 4 underemployed. **Takeaway: don't rely on a single "unemployment rate" — the honest picture is high informality and underemployment, not just joblessness. Flag this spread in the PRD rather than quoting one number.**
- **Emigration pressure**: About half of Malawian youth (51%) say they've considered emigrating, mostly for better job opportunities (Afrobarometer 2025) — signals strong latent demand for anything that improves job-search odds, including abroad.
- **Graduates per year / internet penetration / smartphone ownership**: Not reliably pinned down in this pass — data is scarce and scattered across DHS/ITU reports that need direct fetching. **Flag as scarce — recommend a follow-up query directly against ITU/Malawi Communications Regulatory Authority (MACRA) data before finalizing GTM budget assumptions.** Directionally: Malawi has one of the lowest internet penetration rates in the region (widely cited in the 20-30% range in recent years), and feature phones remain common outside the capital — this matters a lot for your mobile-first, low-bandwidth design decisions (see UI-UX-SPEC and TECH-SPEC).

## 2. Market Behavior

- No Malawi-specific study was found on *how* job seekers currently build CVs. Reasoned from adjacent African markets (Nigeria/Uganda coverage below) plus general knowledge of the segment: Word/Canva templates shared peer-to-peer, cyber café-based printing/formatting services, and university career offices (uneven quality/availability) are the dominant "solutions" today — essentially no dedicated *local* tool exists.
- Regional platforms (Jobberman Nigeria, BrighterMonday Uganda, Fuzu — pan-African) all now bundle CV building into their broader job-board product rather than selling it standalone, suggesting the "just a CV builder" wedge is more open in smaller markets like Malawi than in Nigeria/Kenya where it's already a job-board feature.
- **Flag: ATS usage among Malawian recruiters, preferred CV length/photo conventions — not found in this pass.** Recommend either a small primary survey (WhatsApp groups, university career centers) or a targeted follow-up search before finalizing template defaults in UI-UX-SPEC.

## 3. Willingness to Pay

- **Not found in this pass** for Malawi-specific digital subscription pricing (data bundle costs, Netflix/Spotify uptake). This is a gap — recommend a direct follow-up search on MACRA/GSMA mobile money and data pricing reports.
- What's confirmed: **PayChangu (Malawi's leading fintech payment gateway) natively supports Airtel Money, TNM Mpamba, cards, and — since a 2025 partnership with Centenary Bank — instant bank transfers.** This directly shapes what "affordable" and "friction-free" checkout looks like: mobile money is the payment method to optimize for, not cards.

## 4. Competitive Landscape (Local)

- No CV builder specifically targeting Malawi was found. The nearest comparables operate in neighboring/regional markets:
  - **Jobberman (Nigeria)** — recently added CV-parsing/auto-profile-build on upload.
  - **BrighterMonday (Uganda/East Africa)** — CV + cover letter builder bundled into its job board, industry-specific templates.
  - **Fuzu (pan-African, HQ Finland)** — CV creator plus AI-driven career coaching, courses, and job matching; free CV on onboarding completion.
  - **Konectin, MY CV Creator (Nigeria)** — smaller regional players layering AI review/coaching onto CV templates.
  - **Hello.cv** — turns a CV into a shareable personal website/link — a positioning angle (shareable profile) worth watching even though it's not Africa-specific.
- **None of these are Malawi-first, MWK-priced, or optimized for Malawi's payment rails.** That gap is your wedge.

## 5. Timing & Trends

- Government/AfDB attention on youth unemployment is active and funded: the **K10 billion "Jobs for Youth" (J4Y) project**, backed by the African Development Bank, aims to create ~17,000 jobs, and explicitly names ICT as a target sector — a possible partnership/PR angle for GTM.
- Regional competitors are converging on **AI-assisted CV review and content suggestions** as a differentiator (Fuzu, Konectin, MY CV Creator) — if you ship V2 AI features, you're matching a trend, not inventing one; the real differentiation stays in localization, pricing, and payment rails, not the AI layer itself.

## Key Takeaways for Product Strategy

1. Lead positioning with **informality and underemployment**, not a single unemployment stat — Malawian job seekers are mostly under-served rather than simply "unemployed," and many are trying to move from informal to formal work.
2. **No direct local competitor exists** — your competition is generic global tools (Canva, Word, Zety) and regional job-board bundles (Jobberman/BrighterMonday/Fuzu), none of which are MWK-priced or mobile-money-native.
3. **Mobile money (Airtel Money, TNM Mpamba) is the payment method to build around**, not cards — PayChangu already supports this natively, including now instant bank transfer.
4. Treat **internet/smartphone penetration and CV-format conventions as open research questions** — don't guess at these for the DATA-MODEL or UI-UX-SPEC; run a small local survey or a targeted follow-up search before locking template defaults (photo? references? one-page?).
5. The **AfDB-funded Jobs for Youth program** and general government "youth" framing in Malawi 2063 are a live partnership/press angle — worth a GTM outreach line.
6. Given the shareable-profile trend (Hello.cv) and AI-review trend (Fuzu, Konectin), consider a roadmap note (not MVP) for a public CV-link feature and an AI review pass as V2 differentiators rather than launch requirements.
7. **Explicitly flagged gaps to close before finalizing pricing**: willingness-to-pay data for Malawian digital subscriptions, graduate-per-year figures, and current internet/smartphone penetration.
