# Backend Production-Readiness Foundation Implementation Plan

> **For agentic workers:** Implement task-by-task with a test after each slice.

**Goal:** Make the KungaCV API safer to deploy by validating critical configuration, exposing truthful health semantics, enforcing strict request validation, and preventing unbounded PayChangu calls.

**Architecture:** Keep the existing NestJS module structure. Put environment normalization/validation in `backend/config/app.config.ts`, use the existing Mongoose connection for readiness checks, and keep gateway timeout behavior encapsulated in `PayChanguService`.

**Tech Stack:** NestJS 9, TypeScript, ConfigModule, Mongoose, Jest, Helmet, native `AbortController`.

**Spec:** `docs/BACKEND_FINALIZATION_TASK_PROMPT.md` (configuration/bootstrap and observability sections).

## Global Constraints

- Never commit environment files or credentials.
- Preserve the existing `/health` endpoint while adding explicit liveness/readiness endpoints.
- Do not trust client-provided payment amounts; this slice does not alter pricing logic.
- Keep the payment webhook raw-body verification path intact.

## Review Focus

- Production startup with a missing or weak JWT secret must fail before serving traffic.
- Mongo credentials must be passed to Mongoose when configured, without embedding secrets in logs.
- Readiness must report Mongo disconnected while liveness remains successful.
- Unknown request properties must be rejected rather than silently discarded.
- A gateway request must abort within a bounded timeout.

---

### Task 1: Configuration validation and Mongo connection options

**Files:** `backend/config/app.config.ts`, `backend/src/app.module.ts`, tests beside config if needed.

- [ ] Add a pure `validateEnvironment` function that rejects missing `MONGO_URI`, `MONGO_DB_NAME`, or `JWT_SECRET` and rejects the known placeholder JWT secret in production.
- [ ] Wire `ConfigModule.forRoot` to run that validator.
- [ ] Build the Mongo connection URI from configured values and pass `authSource`, `user`, and `pass` only when credentials are present.
- [ ] Verify with backend typecheck/build and focused configuration tests.
- [ ] Commit as `feat: validate backend production configuration`.

### Task 2: Liveness/readiness health endpoints

**Files:** `backend/src/health.controller.ts`, `backend/src/health.controller.spec.ts`, `backend/src/app.module.ts` only if dependency wiring requires it.

- [ ] Add `GET /health/live` with process-level success.
- [ ] Add `GET /health/ready` that reports success only when the Mongoose connection is connected, without exposing connection details.
- [ ] Preserve `GET /health` as a compatibility alias for liveness.
- [ ] Test connected and disconnected readiness states.
- [ ] Commit as `feat: expose truthful backend health checks`.

### Task 3: Request validation and bounded gateway calls

**Files:** `backend/src/main.ts`, `backend/src/modules/payment/services/paychangu.service.ts`, focused tests, `.env.example`, `backend/README.md`.

- [ ] Enable transformation and reject non-whitelisted request properties.
- [ ] Remove development-only CORS origins when `NODE_ENV=production`; retain local defaults outside production.
- [ ] Bound JSON payload size while preserving raw-body capture for webhooks.
- [ ] Add a configurable 10-second abort timeout around PayChangu initiate/verify requests and keep error responses sanitized.
- [ ] Add regression tests and update runbook configuration notes.
- [ ] Run lint, typecheck, unit tests, and build; commit as `feat: harden request and gateway boundaries`.
