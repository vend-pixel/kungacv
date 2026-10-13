# Agent Guide for kungacv (KungaCV)

KungaCV is a resume builder shipped as three independently deployed packages (no root `package.json`, no workspaces). Install deps and run scripts inside each package directory.

- `backend/` — NestJS API. Package name `kungacv-backend`. Deployed as Render service `kungacv-api`.
- `frontend/kungacv_client/` — resume builder, Next.js App Router + Redux Toolkit + Tailwind. Package name `kungacv_client`.
- `frontend/kungacv_admin/` — admin dashboard, Next.js Pages Router + React Admin + MUI. Package name `kungacv_admin`.

---

## Source-of-truth files

- CI gates and exact command order: `.github/workflows/ci.yml`
- Local multi-package orchestrator: `start.sh`
- Deploy topology + env wiring: `render.yaml`
- Backend env validation (what actually blocks boot): `backend/config/app.config.ts`
- Branch model + PR checklist: `docs/DEVELOPMENT.md`; dep security plan: `SECURITY.md`

---

## Commands

`./start.sh` runs all three packages: `install | build | test | lint | run (alias dev) | all | status | logs [svc] | stop [svc] | clean`. It pins ports itself (backend 3000, client 3001, **admin 3002**) and writes pid/logs under `.run/` and `.logs/`.

CI (`.github/workflows/ci.yml`) is the gate; run it locally before opening a PR:

```bash
cd backend
npm run lint:check && npm run typecheck && npm test -- --runInBand --coverage && npm run build

cd frontend/kungacv_client && npm run lint && npm run build
cd frontend/kungacv_admin  && npm run lint && npm run build
```

Package notes:

- Backend: `start:dev` (watch), `start:prod` (`node dist/src/main`), `test:e2e`, `load:test` (needs `ts-node`). CI is Node 20; `package.json` requires `>=19`.
- Client: `dev` is pinned to port 3001 (`next dev -p 3001`); admin has no port pinned, so plain `npm run dev` collides with the backend on 3000 — use `./start.sh run` or pass `-p`.
- Client has an extra `npm run smoke` → `scripts/production-smoke.mjs`.
- ESLint is skipped during Next builds for both clients (`ignoreDuringBuilds`), so `npm run lint` is the only lint gate for them.

---

## Backend

### Boot sequence (`backend/src/main.ts`)

`bodyParser: false` then a custom `json({ limit: '256kb', verify })` that stashes **`req.rawBody`**. The PayChangu webhook verifies an HMAC-SHA256 `Signature` header against that raw body — do not replace the custom parser with a default one or webhook verification breaks.

Also set up at boot: `trust proxy = 1`; an `X-Request-Id` middleware (echoes a validated inbound id or generates a UUID); `helmet` with CSP disabled; a global `HttpExceptionFilter`.

### CORS is an allowlist, not `cors: true`

Allowed origins = `CLIENT_URL` + comma-separated `CORS_ORIGINS`. In non-production only, `http://localhost:3000/3001/3002` are appended. Allowed headers include `Authorization`, `Signature`, `X-Admin-Signup-Token`; exposed headers include `X-Request-Id`, `X-RateLimit-Reset`, `Retry-After`.

### Validation is strict

Global `ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })`. Unknown body fields are rejected with a 400, not stripped — adding a DTO field is required for any new input to be accepted.

### Auth

There is **no Passport strategy implementation**. `PassportModule.register({ defaultStrategy: 'jwt' })` is imported in several modules, but no `JwtStrategy`/`PassportStrategy` file exists; all verification happens in the custom `AuthGuard` (`backend/src/shared/guards/auth.guard.ts`), which reads the secret from `configService.get('jsonwebtoken.jwt_secret')` (i.e. `JWT_SECRET`). Tokens are signed by `JwtModule.registerAsync` with `expiresIn: '30d'`. Roles are `admin` | `user`; admin controllers check `req.user.role !== 'admin'` inline.

`/admin/signup` is gated by an `X-Admin-Signup-Token` header that must match the `ADMIN_SIGNUP_TOKEN` env var; with the var unset it returns "admin signup is disabled".

### Rate limiting

`@RateLimit({ name, limit, windowMs })` (`shared/guards/rate-limit.decorator.ts`) applied to `auth-signup` 5/min, `auth-login` 10/min, `admin-signup` 5/min, `admin-login` 10/min, `payment-initiate` 10/min, `payment-webhook` 120/min. New sensitive endpoints should carry it.

### Env validation (`backend/config/app.config.ts`)

`validateEnvironment` refuses to boot if any of `MONGO_URI` (or `MONGODB_URI`), `MONGO_DB_NAME`, `JWT_SECRET` is missing. In `NODE_ENV=production` it also rejects a JWT secret that equals `PLACEHOLDER_JWT_SECRET` (`your_secret_key_change_me`) or is shorter than 32 chars.

`@nestjs/config` uses its default `envFilePath` — **only `.env` is loaded**. The repo also contains `backend/.env.local`, which the backend never reads; do not put backend config there. Copy `.env.example` to `.env` to get started.

Other config keys: `paychangu.*` (`PAYCHANGU_SECRET_KEY`, `PAYCHANGU_WEBHOOK_SECRET` — falls back to the secret key, `PAYCHANGU_PRO_PRICE_MWK`, `PAYCHANGU_PRO_PASS_DAYS`), `cloudinary.*`, `client_url`, `cors_extra_origins`, `admin_signup_token`. PayChangu keys are only needed for checkout; the app boots without them.

### Routes

| Prefix | Notes |
|--------|-------|
| `/health`, `/health/live`, `/health/ready` | `ready` returns 503 unless Mongo `readyState === connected` |
| `/auth/*` | signup, login, profile, update, delete |
| `/admin/*` | login, signup (token-gated), create-user, get-users, update-user, delete-user |
| `/resumes/*` | CRUD + `/:resumeUid/duplicate`, JWT required |
| `/templates` | public: list, `slug/:slug`, `:uid` |
| `/admin/templates` | CRUD + `:uid/preview` (multipart image → Cloudinary), publish, disable, restore |
| `/subscription` | create/patch/delete JWT-gated; GET open |
| `/admin/pricing` | CRUD + activate/disable |
| `/purchases/*` | JWT-gated CRUD |
| `/payments` | `/plans` open; `/initiate` and `/:tx_ref/status` JWT-gated; `/webhook` signature-verified |
| `/admin/payments` | list + `:txRef` |
| `/user` | schema/service only; no public controller |

Response envelopes are inconsistent by design: `{ resumes }`, `{ templates }`, `{ users }`, `{ purchases }`, `{ subscriptions }`. Clients unwrap per endpoint (`utils/api.js` uses `.then(d => d.resume)` etc.).

`@nestjs/swagger` is a dependency and `@ApiProperty` decorators exist in `shared/dto/user.dto.ts`, but `SwaggerModule` is never mounted in `main.ts` — there is no `/api` docs endpoint.

### Data layer

Mongoose. Schemas: `User`, `Purchase`, `Subscription`, `Resume` (CV content as Mixed JSON), `Template`, `Payment`. `UserService.createUser` assigns a `uid` via `nanoid()`. Soft-delete convention: `active`, `deleted_at`, `deleted_by`. `database-indexes.spec.ts` asserts the index set — changing a schema index can fail tests.

Controllers parse query strings and delegate to `service.getParsedQuery(query)`; reusable aggregation helpers are in `shared/helpers/aggregations.ts`.

---

## Client (`kungacv_client`)

### API base

`utils/api.js` exports `API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kungacv-backend.onrender.com"` plus `apiFetch` and resume CRUD helpers. `app/login`, `app/signup`, and the admin `dataProvider` all import from there — there are no scattered hardcoded URLs.

⚠️ The fallback host `kungacv-backend.onrender.com` currently returns 404 (dead); `render.yaml` sets `NEXT_PUBLIC_API_URL=https://kungacv-api.onrender.com`. Set the env var explicitly for any local or deployed work.

Pricing display falls back to `NEXT_PUBLIC_PRO_PRICE_MWK` / `NEXT_PUBLIC_PRO_PASS_DAYS` (defaults 5000 / 30) but prefers the live `/payments/plans` response.

### Analytics

`utils/analytics.js` reads `NEXT_PUBLIC_GTM_ID`; `components/Analytics.jsx` renders nothing and `trackEvent` is a no-op when it is unset. Keep that behavior when touching either file.

### Redux

`redux/store.js` persists under `state.persistedReducer.{auth,resume}` (localStorage). Use `useAppSelector`/`useAppDispatch` from `redux/hooks.js`.

Resume state lives in `redux/resume/features.js` + `redux/resume/helper.js`:

- `personalInfo`: fullName, jobTitle, email, phone, address, links, image.
- Sections: `professionalExperience`, `education`, `courses`, `skills`, `languages`, `projects`, `certificates`, `interests` (+ `references`).
- `customization`: spacing, layout, colors, font, heading, header, name, job, photo, footer, date, and per-section display settings.

**Edit/rollback pattern** — nearly every editor component sets `editObj` for the in-progress record; Save dispatches `resetEditObj`/`resetPrevObj`; Cancel removes the new record or reverts to `prevObj`. Restructuring the reducer without preserving this breaks cancel/undo across the editor.

**`NULL_VALUE` sentinel** (`utils/Constants.js`) means "explicitly empty". `_getValue(obj1, obj2, key)` lives in `utils/helpers.js` and returns `obj1[key] === NULL_VALUE ? null : obj1[key] || obj2[key] || null` — so an empty string alone will *not* clear a field. It also short-circuits for `TEMPLATE_BOOLEAN_KEYS` and integer values, so booleans/numbers bypass the fallback chain. Use `NULL_VALUE` when clearing.

### Routes

`/`, `/resume`, `/resume/create` (the editor), `/login`, `/signup`, `/pricing`, `/payment/result`, `/privacy-policy`, `/refund-policy`, `/terms-of-service`, `/dev-templates` (returns `notFound()` when `NODE_ENV === 'production'`).

### Styling

Tailwind with a custom theme. `tailwind.config.js` defines a `brand` scale (electric blue) and an `ink` scale, then **remaps the default `blue` scale onto `brand`** and points `indigo` 600/700 at brand — so existing `blue-*` utilities are already KungaCV-branded. New color usage should use `brand-*`/`ink-*` directly.

CSS vars in `styles/globals.css`: `--dark-color: #0a0a0b`, `--link-color: #0050e0`, `--gradient-from: #1080f0`, `--gradient-to: #0040d0`. Buttons are solid `bg-brand-600 hover:bg-brand-700` (no gradient buttons, no glassmorphism); reds stay reserved for destructive actions.

`components/Logo.jsx` takes `variant` (`light`|`dark`), `size` (`sm`|`md`|`lg`), `markOnly`. Template thumbnails are local `public/templates/*.webp`; `next.config.js` has `images: {}` (no remote domain is whitelisted).

### Path alias

`jsconfig.json` maps `"@*": ["./*"]`, so `@components/...`, `@redux/...`, `@utils/...`, `@styles/...` all work. Imports are mixed with relative paths; prefer the alias for new code.

### Adding a resume section

1. Form component in `components/ResumeComponents/`.
2. Preview component in `components/ResumeTemplate/`.
3. Reducer actions in `redux/resume/features.js`.
4. Normalizing helper in `redux/resume/helper.js`.
5. Constants (icons, ids) in `utils/Constants.js`.
6. Register in `app/resume/create/page.jsx` (456 lines — it wires `AddContent`, section components, and `templatePresets`) and in the add-content list.

---

## Admin (`kungacv_admin`)

`pages/index.tsx` dynamically imports `src/App.tsx` with `ssr: false`. Resources registered: `templates`, `users`, `pricing`, `payments`.

`src/dataProvider.js` talks to the **real backend** (`NEXT_PUBLIC_API_URL`, same fallback as the client) via a `RESOURCE_CONFIG` map — `templates` → `admin/templates`, `pricing` → `admin/pricing`, `payments` → `admin/payments`, `users` → `admin/get-users` — plus per-resource `LIST_FILTERS`. `src/AuthProvider.js` posts to `/admin/login`, requires `body.user.role === "admin"`, and stores `admin_access_token` / `admin_user` in localStorage. Extending an admin resource means editing both maps, not just adding a `<Resource>`.

⚠️ `frontend/kungacv_admin/components/Posts/` and `components/User/` are leftovers from the pre-backend scaffold and are not imported by `src/App.tsx`.

Charts: `chart.js` + `react-chartjs-2`.

---

## Conventions

Backend: imports grouped under `// THIRD PARTY IMPORTS` / `// INNER IMPORTS` (note the order varies by file); DTOs are decorated classes with `UpdateXxxDto extends PartialType(CreateXxxDto)`; soft deletes use `active`/`deleted_at`/`deleted_by`.

Client/admin: default-exported components, no TypeScript in the client (admin uses `.tsx`/`.ts` with strict mode), heavy inline Tailwind. Redux actions follow `add<Section>` / `update<Section>` / `remove<Section>` / `setEditObj` / `setPrevObj` / `resetEditObj` / `resetPrevObj`.

Formatting: backend Prettier `singleQuote: true`, `trailingComma: "all"`; client Prettier `tabWidth: 4`, `singleQuote: false`, `printWidth: 150`, `trailingComma: "es5"`.

---

## Testing

Backend only — Jest with coverage, ~22 spec files including guards, DTOs, payment signature validation, template schema, and health. Frontends have no test setup; client changes need manual verification in `/resume/create`.

---

## Gotchas

1. **Three separate installs.** No workspace tooling; every command is scoped to a package dir.
2. **Port 3000 is contested.** Backend and admin both default to 3000. `./start.sh` resolves this by pinning admin to 3002; a bare `npm run dev` in admin will not.
3. **Set `NEXT_PUBLIC_API_URL`.** Both frontends fall back to a host that currently 404s; `render.yaml` uses `kungacv-api.onrender.com`.
4. **Backend ignores `.env.local`.** Only `.env` is loaded.
5. **No Passport strategy exists** despite the `PassportModule` imports and `passport-jwt` dependency. `AuthGuard` is the only verification path.
6. **`forbidNonWhitelisted: true`.** New request fields require a DTO change or they 400.
7. **`req.rawBody` must survive** for PayChangu webhook signature checks.
8. **`editObj`/`prevObj` + `NULL_VALUE`.** See the client Redux section; breaking either silently breaks clearing fields and editor cancel.
9. **`database-indexes.spec.ts`** will fail if schema indexes drift.
10. **Client ESLint runs only via `npm run lint`**, never during `next build`.
11. **Production JWT secret is enforced at boot** — placeholder or <32 chars aborts startup with `Missing required environment variables`-style errors in Render logs.
12. **`npm audit fix --force` is off-limits** across framework majors; follow `SECURITY.md`.
