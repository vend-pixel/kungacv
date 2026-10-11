# UI-UX-SPEC — CV Builder SaaS

Design rationale throughout: research-user-personas.md §4-5, research-competitors.md §5.

## Design Principles
1. **Mobile-first, not responsive-as-afterthought** — most users' primary/only device is an Android phone, often lower-spec, on constrained data. Every screen designed for a small viewport first.
2. **Low-data footprint** — minimal image-heavy UI, lazy-loaded template thumbnails, no large JS bundles blocking first paint.
3. **Payment gate after the confidence-building moment** — never block preview or drafting; only gate the clean/watermark-free export.
4. **Forgiving of interruption** — autosave + Firestore offline persistence so a dropped connection mid-edit doesn't lose work.

## Screens (MVP)

### 1. Sign-In
- Single "Continue with Google" button — no separate email/password flow for MVP (reduces friction and support burden).

### 2. My CVs (dashboard)
- List of the user's CVs (title, last updated, template family).
- Primary CTA: "Create new CV" → template family choice (Standard / NGO-Government).
- Secondary actions per CV: Edit, Duplicate, Delete.

### 3. CV Editor
- Section-based, one section visible/focused at a time on mobile (Personal Info → Summary → Experience → Education → Skills → References), with a progress indicator.
- Each section: short guidance text/placeholder examples (addresses the "unsure what employers expect" pain point from Chisomo/Thoko personas), not just blank fields.
- Live preview accessible via a toggle/tab on mobile (full split-view on desktop) — must render from the same template component used for export.
- Autosave indicator (small, unobtrusive — "Saved" / "Saving offline, will sync" state).

### 4. Template Selection
- Two families for MVP:
  - **Standard** — single-column, ATS-safe one-pager, no photo by default (photo/reference conventions still an open research question — see PRD Open Questions).
  - **NGO/Government** — longer format, full referee details section, matches Patricia persona's needs.
- No large decorative template gallery at MVP — a small, clearly-differentiated set beats a sprawling library that risks ATS-parsing problems (research-competitors.md §5).

### 5. Export/Paywall
- "Export PDF" CTA always visible once a CV has minimum required content.
- Free: generates a watermarked or otherwise limited PDF, so the user can still see and use *something* — never a hard wall before any output at all.
- Paid: PayChangu checkout (Airtel Money / TNM Mpamba / card / bank transfer) → on confirmed payment, re-export produces a clean PDF.
- Checkout copy must include: exact MWK price, what's being unlocked (e.g., "30-day Pro access" or per-CV unlock — see TECH-SPEC), and a link to the refund policy (research-legal-compliance.md §8).

### 6. Payment Result
- Immediate feedback screen after PayChangu redirect, polling `/api/payments/:reference/status` while the webhook confirms in the background — avoid leaving the user staring at an ambiguous state.

## Content/Copy Guidance
- Never imply a guaranteed job outcome (legal/consumer-protection constraint — research-legal-compliance.md §3).
- Field labels and guidance text should reflect Malawian conventions where known (e.g., MSCE-level education entries) — flagged as an area to refine with real user feedback given the open research gap on exact local CV conventions (research-market.md §2).
- English-first copy (see PRD Non-Goals on Chichewa).

## Accessibility & Performance Targets
- Usable on a small Android screen with a slow connection as the baseline test environment, not a nice-to-have edge case.
- Text must remain selectable/real (not rendered as images) both in-app and in the exported PDF, supporting ATS-parseability (research-pdf-rendering.md §4).
