# P0–P2 UX Backlog Implementation Plan

**Goal:** Complete the documented KungaCV P0–P2 UX backlog with safe, local-first flows that reduce uncertainty from import through export and connect resumes to application materials.

**Architecture:** Keep import parsing and review state local-first, use existing Redux resume actions for accepted content, and keep saved cover letters/job tracker data in browser storage until server APIs exist. Add shared validation helpers for auth/export rather than duplicating logic inside pages.

**Tech Stack:** Next.js 13 App Router, React 18, Redux Toolkit, browser File APIs, localStorage, existing Tailwind/CSS system.

**Spec:** `docs/WORKSPACE-UX-AUDIT.md`

## Global Constraints

- Preserve the existing local-first resume workflow and current server autosave behavior.
- Do not silently replace user content; import must always be reviewable and cancellable.
- Keep the existing KungaCV visual language and accessible focus states.
- Do not add backend schema changes when browser storage can support the feature safely.

## Review Focus

- Unsupported, empty, or oversized imports show an inline error and never mutate resume state.
- Accepted import content can be edited in review, cancelled, or applied once.
- Auth failures identify the relevant field or form and submit buttons cannot double-submit.
- Export readiness warns about missing essentials without blocking download.
- Duplicating documents creates independent browser drafts with job-specific names.

## Slices

1. Import review: validate files, extract text where possible, review/edit extracted content, apply or cancel.
2. Authentication: inline errors, loading states, password guidance, and return path preservation.
3. Export readiness: shared checklist surfaced before print without making export impossible.
4. Application loop: saved/duplicated cover letters, job-specific naming, lightweight local tracker, section guidance, recent-document metadata.

## Verification

- `npm run lint`
- `npm run build`
- Route smoke checks for `/resume`, `/resume/create`, `/cover-letter`, `/login`, `/signup`, and `/pricing`.
