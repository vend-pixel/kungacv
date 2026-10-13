# KungaCV Admin Platform Implementation Prompt

## Objective

Implement the real production admin platform for KungaCV in small, reviewable phases. Replace the current JSONPlaceholder scaffolding with authenticated NestJS APIs and React Admin screens for:

- Resume template management
- Pricing/package management
- Payment tracking and reconciliation visibility
- Cloudinary-hosted template preview images

Do **not** implement the entire system in one change. Complete one phase, run its tests and build, commit it, and only then begin the next phase.

## Repository context

- Backend: `backend/` — NestJS, Mongoose, MongoDB
- Client: `frontend/kungacv_client/` — Next.js resume builder
- Admin: `frontend/kungacv_admin/` — React Admin / Next.js
- Existing subscription model: `backend/src/modules/subscription/`
- Existing payment model: `backend/src/modules/payment/`
- Existing admin authorization: `backend/src/modules/admin/`
- Existing static template presets: `frontend/kungacv_client/utils/templatePresets.js`
- Existing preview images: `frontend/kungacv_client/public/templates/`
- Current deployment: Render web services with MongoDB Atlas
- Existing merged work includes request validation, health/readiness checks, rate limiting, database indexes, structured errors, and Atlas URI handling.

## Non-negotiable constraints

1. Never store Cloudinary secrets, MongoDB credentials, JWT secrets, or admin credentials in Git.
2. Every admin write endpoint must require the existing JWT `AuthGuard` and verify `req.user.role === 'admin'`.
3. Use soft deletion for templates and pricing packages. Do not physically delete records by default.
4. Payment records are audit data. Do not expose arbitrary payment mutation endpoints.
5. Do not trust client-provided ownership, role, payment status, gateway response, or entitlement state.
6. Validate uploaded files by MIME type, extension, and byte size. Reject executable files and unexpected formats.
7. Cloudinary deletion must not make MongoDB metadata inconsistent. Define and test failure behavior.
8. Use pagination, filtering, sorting, and bounded limits on admin list endpoints.
9. Do not log passwords, JWTs, Cloudinary signatures, upload responses containing sensitive data, full payment payloads, or raw request bodies.
10. Keep public client behavior backward-compatible while the new admin APIs are introduced.
11. Use explicit DTOs and `class-validator`; do not accept arbitrary Mongo query objects from HTTP clients.
12. Each phase must include focused unit tests, typecheck, lint, build, and `git diff --check`.

## Product decisions to preserve

### Templates

A template is a named, versioned resume design that can be enabled or disabled. Its behavior is represented by validated template configuration JSON compatible with the current resume rendering model. Its preview image is stored in Cloudinary.

A template should support:

- `uid`
- `name`
- `slug`
- `description`
- `version`
- `config` — validated template configuration/preset data
- `previewUrl`
- `previewPublicId`
- `active`
- `sortOrder`
- `access` — `free` or `paid`
- `packageUids` — pricing packages that unlock the template
- `createdBy`
- `updatedBy`
- `deletedAt`
- `deletedBy`
- timestamps

Do not allow an arbitrary client to publish a template configuration without server-side validation. Start by validating the known configuration shape used by `templatePresets.js`; expand the schema only deliberately.

### Pricing packages

Use the existing `Subscription` concept as the canonical pricing package model unless there is a strong migration reason not to. Avoid creating two competing plan collections.

The package should support:

- `uid`
- `name`
- `slug` if useful for public URLs
- `description`
- `price`
- `currency`, default `MWK`
- `durationDays`
- `active`
- `sortOrder`
- optional entitlement metadata
- timestamps
- soft-delete fields

Preserve compatibility with existing fields where possible. If renaming `duration` to `durationDays`, introduce a migration-safe DTO mapping instead of breaking existing payment and purchase flows.

### Payments

Use the existing `Payment` model as the canonical payment ledger. Add only fields needed for reliable tracking and reconciliation, such as:

- immutable transaction reference
- user UID and email snapshot
- package UID or plan identifier
- amount and currency snapshot
- provider and provider charge ID
- status: `pending`, `success`, or `failed`
- provider callback timestamps
- failure/reconciliation metadata that does not contain secrets

Payment admin APIs should be read-only initially:

- paginated list
- filters by status, package, user, transaction reference, and date range
- detail view
- aggregate counts/totals only where safely derived from stored records

Do not add an admin endpoint that simply lets a user change a payment from `pending` to `success`. A later reconciliation workflow must verify the provider transaction through a controlled service and record an audit event.

## Phase 0 — Confirm the contract

Before editing code:

1. Inspect all existing subscription, payment, purchase, user, auth, and admin tests.
2. Document current route response shapes and identify compatibility constraints.
3. Decide whether the first template version stores only configuration JSON plus preview image, or also uploads a downloadable template bundle. Start with configuration JSON plus preview image.
4. Choose Cloudinary folder naming, for example:

   ```text
   kungacv/templates/{templateUid}/v{version}/preview
   ```

5. Define environment variables:

   ```text
   CLOUDINARY_CLOUD_NAME
   CLOUDINARY_API_KEY
   CLOUDINARY_API_SECRET
   CLOUDINARY_FOLDER
   ```

6. Define limits:

   - preview image: maximum 5 MB
   - accepted types: JPEG, PNG, WebP
   - configuration JSON: maximum 256 KB
   - list page size: default 25, maximum 100
7. Write a short implementation plan in `docs/superpowers/plans/` and get the phase reviewed before implementation.

## Phase 1 — Data schemas and indexes

Create or update schemas without adding upload behavior yet.

### Template schema

Create a dedicated module such as:

```text
backend/src/modules/template/
  template.module.ts
  controllers/template.controller.ts
  dto/template.dto.ts
  schemas/template.schema.ts
  services/template.service.ts
```

Add indexes aligned to actual queries:

- unique `uid`
- unique normalized `slug`
- `{ active: 1, sortOrder: 1 }`
- `{ access: 1, active: 1, sortOrder: 1 }`
- `{ packageUids: 1, active: 1 }`
- `{ deletedAt: 1 }` if useful for cleanup

Decide whether a slug is immutable after publication. Prefer immutable slugs or explicit redirects rather than silently breaking saved template references.

### Pricing schema

Extend the existing subscription schema carefully or introduce a compatibility layer. Add indexes for:

- active packages ordered by price or sort order
- normalized package name/slug
- soft-deleted records

### Payment schema

Add only query/reconciliation fields that are justified by current flows. Add indexes for:

- `{ status: 1, createdAt: -1 }`
- `{ plan: 1, createdAt: -1 }`
- `{ user_uid: 1, createdAt: -1 }`
- provider charge ID if it is queried

### Phase 1 tests

Add schema/index regression tests. Test that:

- required fields reject invalid documents
- unique identifiers are indexed
- enum values reject invalid status/access values
- soft-deleted records are excluded from default active queries

## Phase 2 — DTOs, services, and admin authorization

Implement service-level behavior before controllers.

### Template service

Implement:

- create draft metadata
- list active/public templates
- list all templates for admin
- get by UID/slug
- update draft metadata
- publish/activate
- disable
- soft delete
- restore if permitted
- package entitlement lookup

Enforce business rules:

- slug normalization
- no duplicate slug
- no negative sort order
- `paid` templates must reference existing active packages or be explicitly allowed as drafts
- disabling a package must not silently delete template associations
- deleting a template must not delete user resumes that reference it

### Pricing service

Implement:

- create package
- list active public packages
- admin list including inactive records
- update package metadata
- activate/deactivate
- soft delete

Prevent deletion or disabling if active purchases would become ambiguous. Prefer marking a package inactive while preserving historical purchases.

### Payment service/admin query service

Implement read-only admin queries with:

- bounded pagination
- allowlisted sort fields
- allowlisted filter fields
- date range validation
- redacted user/payment output

### Phase 2 tests

Test service rules independently of controllers, including:

- non-admin rejection
- duplicate slug/name handling
- soft delete and restore
- package/template entitlement behavior
- safe payment filtering
- pagination limits and sort allowlists

## Phase 3 — Cloudinary integration

Create an injectable Cloudinary service behind a small interface. Do not scatter Cloudinary SDK calls across controllers.

Suggested module:

```text
backend/src/modules/media/
  media.module.ts
  cloudinary.service.ts
  cloudinary.service.spec.ts
```

Responsibilities:

- configure Cloudinary from `ConfigService`
- upload preview image from a bounded memory buffer or controlled temporary file
- assign deterministic folder and public ID conventions
- return only safe metadata: secure URL, public ID, width, height, bytes, format
- delete a prior preview by public ID
- apply timeout and sanitized error handling

Do not log the signed upload response or credentials.

### Upload flow

Prefer this transactional order:

1. Authenticate admin.
2. Validate metadata and image.
3. Create or update a draft template record.
4. Upload the image to Cloudinary.
5. Update MongoDB with the returned URL/public ID.
6. If MongoDB update fails after upload, attempt compensating Cloudinary deletion and emit a structured operational event.
7. If replacing an image, delete the old Cloudinary asset only after the new Mongo metadata is safely stored.

If the project needs direct browser-to-Cloudinary upload later, add signed upload parameters generated by the backend. Do not expose `CLOUDINARY_API_SECRET` to the frontend.

### Environment validation

Add Cloudinary configuration validation only when template upload functionality is used, or make the credentials required in production if the feature is enabled. Keep local tests able to run with a mocked Cloudinary service.

### Phase 3 tests

Mock Cloudinary and test:

- successful upload and metadata persistence
- invalid MIME type
- oversized image
- Cloudinary failure
- Mongo failure after Cloudinary success
- replacement upload cleanup
- no secret leakage in thrown errors/logs

## Phase 4 — HTTP endpoints

Add explicit admin and public routes. Keep route names consistent with existing API conventions.

### Public template routes

Suggested:

```text
GET /templates
GET /templates/:uid
GET /templates/slug/:slug
```

Public responses must include only published/active templates and safe metadata. Do not expose internal Cloudinary signing data or audit fields.

### Admin template routes

Suggested:

```text
GET    /admin/templates
GET    /admin/templates/:uid
POST   /admin/templates
PATCH  /admin/templates/:uid
POST   /admin/templates/:uid/preview
POST   /admin/templates/:uid/publish
POST   /admin/templates/:uid/disable
POST   /admin/templates/:uid/restore
DELETE /admin/templates/:uid
```

Use `AuthGuard` plus an explicit admin-role check. Use multipart handling only on the preview upload route. Add request size limits and file validation at the controller boundary.

### Admin pricing routes

Suggested:

```text
GET    /admin/pricing
GET    /admin/pricing/:uid
POST   /admin/pricing
PATCH  /admin/pricing/:uid
POST   /admin/pricing/:uid/activate
POST   /admin/pricing/:uid/disable
DELETE /admin/pricing/:uid
```

Keep existing public subscription routes working during migration.

### Admin payment routes

Suggested:

```text
GET /admin/payments
GET /admin/payments/:txRef
```

Do not add arbitrary payment mutation routes in this phase.

### HTTP tests

Add controller/e2e tests for:

- unauthenticated requests
- authenticated non-admin requests
- valid admin requests
- invalid DTOs
- invalid file uploads
- pagination/filter behavior
- redaction of sensitive fields
- correct status codes and response envelopes

## Phase 5 — Replace the admin JSONPlaceholder provider

Do not point React Admin at `jsonplaceholder.typicode.com`.

Create a real admin data provider that:

- uses `NEXT_PUBLIC_API_URL`
- obtains/stores a real admin JWT through `/admin/login`
- sends `Authorization: Bearer <token>`
- maps React Admin `getList`, `getOne`, `create`, `update`, and `delete` operations to explicit backend routes
- converts backend response envelopes into React Admin `{ data, total }` shapes
- never sends arbitrary React Admin filter/query objects directly to Mongo
- displays API errors without leaking backend stack traces

Implement admin screens in this order:

1. Pricing package list/create/edit/activate/disable
2. Template list/create/edit/upload preview/publish/disable
3. Payment read-only list/detail/filter
4. User management migration from existing custom screen

Remove `ra-data-json-server` only after the replacement provider is working. Do not remove resources merely to hide errors.

## Phase 6 — Client integration

Update the public client to consume published templates and packages only after the backend routes are stable.

- Preserve current local presets as a fallback during migration.
- Add a feature flag or safe fallback if the API is unavailable.
- Do not let an unavailable template API prevent resume creation.
- Enforce paid-template entitlement server-side when a user saves or exports a resume.
- Treat preview images as presentation assets, not authorization proof.

## Phase 7 — Deployment and operations

Add Render environment documentation:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
```

Store values only in Render’s encrypted environment settings. Add separate Cloudinary folders or credentials for staging if appropriate.

Document:

- Cloudinary upload limits
- Mongo index creation expectations
- how to rotate Cloudinary credentials
- how to remove orphaned Cloudinary assets
- how to restore disabled templates/packages
- how to audit payment records
- how to verify `/health/ready`

## Required validation per phase

For every phase, run the relevant commands and record the results:

```bash
cd backend
npm test -- --runInBand
npm run typecheck
npm run lint:check
npm run build

cd ../frontend/kungacv_admin
npm run build
```

Also run:

```bash
git diff --check
rg -n -i 'jsonplaceholder|console\.(log|error|warn|debug)' backend/src frontend/kungacv_admin/src
```

Raw console logging in production backend code and JSONPlaceholder references in the admin app should fail review unless explicitly documented as test-only code.

## Delivery sequence

Use separate commits and pull requests where practical:

1. `feat: add template and pricing schemas`
2. `feat: add admin template and pricing services`
3. `feat: add cloudinary template preview uploads`
4. `feat: add admin template pricing and payment endpoints`
5. `feat: replace admin json placeholder provider`
6. `feat: connect client templates and package entitlements`
7. `docs: document admin media and pricing operations`

Do not merge a later phase if an earlier phase has failing tests, unresolved security findings, or unverified deployment configuration.

## Definition of done

The feature is complete only when:

- Admin users can create, edit, publish, disable, restore, and soft-delete templates.
- Admin users can upload validated preview images stored in Cloudinary.
- Admin users can create and manage pricing packages.
- Public clients see only active published templates and packages.
- Admin users can search and inspect payment records without arbitrary mutation access.
- No admin screen calls JSONPlaceholder.
- All write routes are admin-protected.
- Uploaded files and Cloudinary credentials are handled safely.
- Existing resume creation and payment flows remain compatible.
- Backend and admin builds pass.
- Unit and integration tests cover authorization, validation, upload failure, soft deletion, and response redaction.
- Render deployment variables and operational recovery steps are documented.
