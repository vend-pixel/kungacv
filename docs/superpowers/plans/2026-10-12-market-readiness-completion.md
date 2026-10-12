# KungaCV Market-Readiness Completion Plan

> **For agentic workers:** Execute task-by-task on `feature/market-readiness-phase0`; preserve existing backend and dependency-maintenance work.

**Goal:** Complete the missing landing, editor accessibility, customization interaction, and production-confidence work described by the KungaCV handoff.

**Architecture:** Keep the existing Next.js 13 client and Redux customization model. Replace click-only controls with native buttons, preserve template selection in the URL, and add a deterministic production smoke script that validates server-rendered routes and local assets without requiring browser hydration.

**Tech Stack:** Next.js 13, React 18, Tailwind CSS 3, ESLint, Node.js ESM smoke script, npm lockfiles.

**Spec:** Handoff requirements in `/home/ubuntu/upload/pasted_content.txt`, Phases 0–6.

## Global Constraints

- Preserve current backend, CI, dependency, and merged production-hardening changes.
- Do not introduce tightly coupled major dependency upgrades.
- Use local template assets directly; do not require Next image optimization for smoke validation.
- Preserve the existing Redux customization state shape and behavior.
- Keep security audit advisory; strict quality jobs remain strict.
- Do not modify GitHub branch settings or merge/close PRs.

## Review Focus

- Selecting a gallery template must survive navigation into `/resume/create?template=<id>`.
- Every editor navigation and customization selector must be keyboard-operable with a visible selected state.
- Save status and editor landmarks must be exposed without changing autosave behavior.
- Production smoke checks must use a fresh server and fail on missing routes, copy, or local assets.
- Existing warnings and print/download behavior must remain unchanged.

---

### Task 1: Stable template gallery and deep-link selection

**Files:**
- Modify: `frontend/kungacv_client/components/LandingPage/TemplatesSection.jsx`
- Modify: `frontend/kungacv_client/app/resume/create/page.jsx`

- [ ] Replace the rotating gallery with a deterministic grid of all local templates. Each card is a link to `/resume/create?template=<1-based id>` and has descriptive image alt text.
- [ ] Read the `template` query parameter in the editor and retain it as the selected template state/prop without changing the existing default behavior.
- [ ] Keep the existing editor preview and customization model intact.
- [ ] Verify with client lint/build and raw HTTP checks for `/` and `/resume/create?template=4`.

### Task 2: Editor landmarks and keyboard semantics

**Files:**
- Modify: `frontend/kungacv_client/app/resume/create/page.jsx`
- Modify: `frontend/kungacv_client/components/ResumeComponents/MobileNav.jsx`
- Modify: `frontend/kungacv_client/styles/globals.css`

- [ ] Add a keyboard-visible skip link targeting the editor content landmark.
- [ ] Convert desktop and mobile Content/Customize controls to native buttons with labels and `aria-current` for the active section.
- [ ] Add semantic navigation/main landmarks and an accessible preview label.
- [ ] Add accessible labels to back, rename, preview, download, close, and add-content actions.
- [ ] Expose save status through `role="status"` and `aria-live="polite"`; preserve the existing status text.
- [ ] Add focus-visible and reduced-motion-safe styles without removing existing visual behavior.

### Task 3: Customization control semantics

**Files:**
- Modify: `frontend/kungacv_client/components/customization/components/Font.jsx`
- Modify: `frontend/kungacv_client/components/customization/components/Layout.jsx`
- Modify: `frontend/kungacv_client/components/customization/components/Colors.jsx`

- [ ] Convert font families, font choices, layout choices, column choices, color modes, palettes, and multicolor choices to native buttons with `aria-pressed`.
- [ ] Add explicit labels/fieldset legends where controls are grouped.
- [ ] Associate every color checkbox label with its input.
- [ ] Preserve all existing Redux update payloads and effects.

### Task 4: Production smoke evidence

**Files:**
- Modify: `frontend/kungacv_client/package.json`
- Create: `frontend/kungacv_client/scripts/production-smoke.mjs`
- Create: `docs/RELEASE_READINESS.md`

- [ ] Add `npm run smoke` using `SMOKE_URL`, with checks for landing HTTP 200, primary copy, deterministic template links/assets, editor route HTTP 200, and direct local image content type.
- [ ] Run a fresh production server smoke test after a clean production build.
- [ ] Record exact quality and smoke results, known non-blocking warnings, and any repository/protection evidence.

### Task 5: Final validation and commit

- [ ] Run `npm ci --ignore-scripts` in all three applications, rebuild backend `argon2` locally if needed, and run backend lint/typecheck/tests/build.
- [ ] Run client and admin lint/build.
- [ ] Run the fresh-server smoke test.
- [ ] Run `git diff --check`, inspect the final diff, and confirm a clean tree.
- [ ] Commit focused changes with descriptive messages; do not push or create/merge a PR unless explicitly requested.
