# CV Builder SaaS — Project Context

## One-liner
A web-based CV builder for fresh graduates and job seekers in Malawi/Africa who lack the skills or tools to create professional CVs.

## Target Market
- Primary: Fresh graduates (18-25) in Malawi
- Secondary: Early-career job seekers, career changers
- Tertiary: African job seekers broadly (expansion)

## Core Value Prop
"Build a professional CV in 10 minutes — no design skills needed."

## Tech Stack
- Frontend: Next.js 14 (App Router)
- Auth: Firebase Google Auth
- Database: Firestore
- Hosting: Vercel (frontend) + Firebase Cloud Functions (backend)
- PDF: Server-side via Puppeteer/Playwright in Cloud Functions (see TECH-SPEC for the Cloud Run recommendation)
- Payments: PayChangu (MWK + cards + mobile money)
- AI (V2): OpenAI / Gemini

## Timeline
MVP in ~4 weeks, solo dev

## Constraints
- Free tools only for MVP (Firebase Spark tier, Vercel free)
- Solo developer
- Malawi-first pricing
- Mobile-first (most users on phones)

## Success Metrics (MVP)
- 100 signups in month 1
- 10% free→paid conversion
- CV completion rate > 60%

## Research Index
- [Market](./01-research/research-market.md)
- [Competitors](./01-research/research-competitors.md)
- [User Personas](./01-research/research-user-personas.md)
- [PDF Rendering](./01-research/research-pdf-rendering.md)
- [Firebase Architecture](./01-research/research-firebase-architecture.md)
- [PayChangu](./01-research/research-paychangu.md)
- [Legal & Compliance](./01-research/research-legal-compliance.md)
- [SEO & GTM](./01-research/research-seo-gtm.md)
- [Business Model & Profitability](./01-research/research-business-model.md)

## Docs Index
- [PRD](./02-docs/PRD.md)
- [SPD](./02-docs/SPD.md)
- [Tech Spec](./02-docs/TECH-SPEC.md)
- [Data Model](./02-docs/DATA-MODEL.md)
- [API Spec](./02-docs/API-SPEC.md)
- [UI/UX Spec](./02-docs/UI-UX-SPEC.md)
- [Security](./02-docs/SECURITY.md)
- [GTM Plan](./02-docs/GTM-PLAN.md)
- [Roadmap](./02-docs/ROADMAP.md)
- [Test Plan](./02-docs/TEST-PLAN.md)

## Status
Research pass complete (Sep 2026) using live web search — grounded on the market, competitor, and PayChangu topics; the PDF-rendering, Firebase-architecture, persona, and GTM docs are engineering/strategy judgment calls rather than lookups, and are flagged as such inline. Formal docs in 02-docs/ are synthesized from this research. Treat anything marked "estimate" as a planning assumption to revisit once real user data exists — not a cited fact.
