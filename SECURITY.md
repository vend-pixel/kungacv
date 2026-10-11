# Security Baseline

## Current automated controls

- GitHub secret scanning and push protection are enabled for the repository.
- CI runs `npm audit` for the backend, public client, and admin packages.
- The audit job is advisory while the legacy dependency graph is being upgraded; it remains visible in every pull request and cannot be used to silently claim a clean security baseline.
- Authentication uses JWTs, request validation uses NestJS `ValidationPipe`, the API uses Helmet, and PayChangu webhooks validate the raw-body HMAC signature.
- Production secrets are stored in Render environment variables, not GitHub Actions or source files.

## Baseline findings

The current legacy package set contains known advisories. The direct high-impact upgrade paths are:

| Package | Current line | Safe immediate action | Follow-up |
|---|---|---|---|
| `next` | 13.5.x | Client and admin upgraded from 13.4.3 to 13.5.11 | Plan a tested Next 16/React 19 migration for the current critical advisories |
| `react-admin` | 4.x | No automatic major upgrade in deployment foundation | Upgrade to 5.x in a dedicated admin migration with UI regression coverage |
| `lodash` | transitive/direct | No non-breaking npm fix is available in the current graph | Remove or replace vulnerable paths and validate every consumer |
| Nest/Jest toolchain | legacy 9.x/29.x | Build and tests are green | Upgrade framework/tooling in small compatibility-reviewed batches |

Audit counts vary as npm advisory data changes. Re-run the package-local command before each release:

```bash
(cd backend && npm audit --audit-level=high)
(cd frontend/kungacv_client && npm audit --audit-level=high)
(cd frontend/kungacv_admin && npm audit --audit-level=high)
```

## Production compensating controls

Until the major upgrade work is complete, keep the API behind HTTPS, use separate staging and production secrets, keep CORS restricted to the deployed clients, avoid exposing admin routes publicly without authentication, and monitor Render logs after every release. Do not use `npm audit fix --force` because it can silently introduce framework-major breaking changes into the resume editor or admin dashboard.

## Reporting and response

Suspected credential exposure requires immediate rotation in Render and PayChangu, followed by a review of Render and GitHub audit logs. Security-sensitive fixes should be raised as private issues or directly to the repository owner; do not include tokens, user CV content, or payment payloads in public issues.
