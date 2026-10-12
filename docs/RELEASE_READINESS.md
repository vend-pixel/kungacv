# KungaCV Release Readiness Evidence

**Validation date:** 2026-10-12
**Checked-out commit:** `54c7567` (`origin/main`)
**Local branch:** `feature/market-readiness-phase0` (created locally because the named remote branch was not present)

## Scope and repository state

The handoff identified commit `587612e` and branch `feature/market-readiness-phase0` as the expected starting point. In this sandbox checkout, neither is available on the remote:

- `git cat-file -t 587612e` reports that the object does not exist.
- `origin` has `main`, `develop`, two operational branches, and one Dependabot branch; it does not have `feature/market-readiness-phase0`.
- The current `main` tip is `54c7567` (`Bump the admin-patch-and-minor group (#40)`).
- The product-readiness documents and smoke script described by the handoff are not present in this checkout.

No existing product changes were reset, rebased, or overwritten. No remote branches, pull requests, protection settings, or account settings were changed.

## Phase 4 — CI/dependency policy verification

Verified locally on `54c7567`:

- `.github/dependabot.yml` ignores all npm semver-major updates, groups minor/patch updates per application, and limits each npm queue to three open PRs.
- `.github/workflows/ci.yml` defines strict `Backend quality`, `Client quality`, and `Admin quality` jobs.
- The dependency security audit is the only explicitly advisory job.
- All package scripts invoked by the CI workflow exist.
- `npm install --package-lock-only --dry-run` completed for all three applications, indicating lockfiles are synchronized with their manifests.

GitHub branch-protection endpoints for both `main` and `develop` returned HTTP 403 (`Resource not accessible by integration`). Therefore, required checks, approval requirements, linear-history enforcement, and conversation-resolution settings could not be independently verified during this takeover.

## Phase 5 — Full-stack regression evidence

All strict local quality gates passed after rebuilding the native `argon2` binding that is omitted by the handoff-recommended `npm ci --ignore-scripts` install:

- **Backend:** lint passed; typecheck passed; **6 test suites and 52 tests passed**; build passed.
- **Client:** lint passed; production build passed.
- **Admin:** lint passed; production build passed.

A production client server was started from the fresh build on port 3015. Equivalent HTTP smoke checks passed:

- `GET /` → HTTP 200.
- `GET /resume/create` → HTTP 200.
- Landing HTML contained KungaCV, resume, and template markers.
- Direct public SVG assets returned HTTP 200 with `image/svg+xml` content type.

The described `npm run smoke` command could not be run because `frontend/kungacv_client/package.json` in the current checkout has no `smoke` script and no `scripts/production-smoke.mjs` file.

Known warnings observed:

- npm reports existing dependency advisories during installation; these are not silently fixed or upgraded.
- Backend and admin lint report the existing TypeScript-version compatibility warning from `@typescript-eslint`.
- The client build emits existing customization-store console noise during static generation.
- npm reports deprecated transitive packages.

## Phase 6 — Repository/remote closeout

- Local working tree is clean after the documentation commit listed below.
- No open pull requests were reported by GitHub CLI.
- No remote settings were modified.
- Remote branch protection remains unverified because of the GitHub API permission response above.
- Remote CI has recent mixed results from concurrent Dependabot activity, but GitHub reported no run specifically associated with the current `54c7567` commit when queried.

## Remaining blockers

1. Recover or provide the intended `feature/market-readiness-phase0` branch or commit `587612e` before claiming the product-readiness Phases 0–3 and their associated smoke test are present.
2. Grant a GitHub token/app permission that can read branch protection for `main` and `develop`, then re-run the protection verification.
3. If the smoke test is expected on current `main`, restore or add it as a separate focused implementation task rather than weakening existing CI.
