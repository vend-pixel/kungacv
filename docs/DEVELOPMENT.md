# Development and Release Workflow

## Branch model

- `main` is production and must remain deployable.
- `develop` is the shared integration branch and deploys to staging.
- `feature/<short-name>`, `fix/<short-name>`, and `chore/<short-name>` are short-lived branches created from `develop`.
- A release is a pull request from `develop` to `main`. Do not develop directly on either protected branch.

## Pull requests

Every pull request into `develop` or `main` runs the GitHub Actions workflow in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). The required gates are:

1. Backend lint without auto-fixing, TypeScript type checking, unit tests with coverage, and production build.
2. Client lint and production build.
3. Admin lint and production build.
4. An advisory dependency audit that remains visible while the documented legacy upgrades are completed.

The security audit is intentionally visible as a separate advisory job while the existing dependency baseline is remediated. See [`SECURITY.md`](../SECURITY.md) for the upgrade plan; do not use `npm audit fix --force` across framework majors.

## Standard change flow

```text
feature/* → PR → develop → staging verification → release PR → main → production
```

A pull request should include the user-visible behavior, validation commands, deployment impact, environment-variable changes, and rollback considerations. Use the repository pull-request template.

## Local quality commands

```bash
# Backend
cd backend
npm ci
npm run lint:check
npm run typecheck
npm test -- --runInBand
npm run build

# Client
cd frontend/kungacv_client
npm ci
npm run lint
npm run build

# Admin
cd frontend/kungacv_admin
npm ci
npm run lint
npm run build
```

## Test strategy

- Unit tests cover services, guards, DTOs, controllers, payment-signature validation, and health behavior.
- Build checks are required because the three packages are independently deployed.
- Render staging is the integration environment for browser/API smoke tests and payment-provider test credentials.
- Production changes should be promoted from a tested `develop` commit rather than rebuilt from an unrelated branch.

## Versioning and incident response

Use release tags such as `v0.1.0` after a successful production promotion. For an incident, first inspect Render events and logs, then roll back the affected service to its last successful deploy. If the issue is data-related, stop further writes where possible and preserve the relevant logs before changing credentials or database state.
