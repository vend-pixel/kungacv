# KungaCV

KungaCV is a modern resume builder built as a multi-package application with a NestJS backend, a Next.js resume-builder client, and a Next.js admin dashboard.

- `backend/` — NestJS API (MongoDB, Mongoose, Passport/JWT).
- `frontend/kungacv_client/` — Resume builder (Next.js 13 App Router). Package name: `kungacv_client`.
- `frontend/kungacv_admin/` — Admin dashboard (Next.js 13 Pages Router, React Admin). Package name: `kungacv_admin`.

See `AGENTS.md` for commands, architecture, and conventions.

## Engineering and operations

- [System architecture](docs/ARCHITECTURE.md)
- [Development and release workflow](docs/DEVELOPMENT.md)
- [Render deployment runbook](docs/DEPLOYMENT.md)
- [Render Blueprint](render.yaml)

The production branch is `main`; `develop` is the staging branch. Feature and fix branches merge into `develop` through pull requests with automated backend, client, admin, dependency, and build checks.
