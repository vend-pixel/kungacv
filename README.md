# KungaCV

KungaCV is a modern resume builder built as a multi-package application with a NestJS backend, a Next.js resume-builder client, and a Next.js admin dashboard.

- `backend/` — NestJS API (MongoDB, Mongoose, Passport/JWT).
- `frontend/kungacv_client/` — Resume builder (Next.js 13 App Router). Package name: `kungacv_client`.
- `frontend/kungacv_admin/` — Admin dashboard (Next.js 13 Pages Router, React Admin). Package name: `kungacv_admin`.

See `AGENTS.md` for commands, architecture, and conventions.
