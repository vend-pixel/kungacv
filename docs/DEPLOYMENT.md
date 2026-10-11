# Deployment Runbook

## Render services

The repository defines six Render web services in [`render.yaml`](../render.yaml): three staging services on `develop` and three production services on `main`.

| Service | Runtime | Build | Start | Health check |
|---|---|---|---|---|
| API | Node/NestJS | `cd backend && npm ci --include=dev && npm run build` | `cd backend && npm run start:prod` | `/health` |
| Client | Node/Next.js | `cd frontend/kungacv_client && npm ci --include=dev && npm run build` | `cd frontend/kungacv_client && npm start` | Render default |
| Admin | Node/Next.js | `cd frontend/kungacv_admin && npm ci --include=dev && npm run build` | `cd frontend/kungacv_admin && npm start` | Render default |

The services use Frankfurt to reduce latency for Malawi and regional users. Free plans are suitable for early staging and low-volume validation, but they can suspend when idle; upgrade the API and client when uptime and cold-start behavior become product requirements.

## First-time Render setup

1. Connect the GitHub repository `vend-pixel/kungacv` to Render.
2. Create the Blueprint from `render.yaml`, or create the six services with the same names and commands.
3. Enter staging secrets into the `*-staging` API service and production secrets into `kungacv-api`.
4. Set `NEXT_PUBLIC_API_URL` on each client service to the matching API URL. Because this is a public Next.js build variable, changing it requires a new client build.
5. Set the API service health-check path to `/health` in Render when creating services manually; the Blueprint declares this automatically.
6. Confirm the API `/health` endpoint returns HTTP 200 before testing authentication or payments.

## Required API environment variables

Non-secret defaults are defined in the Blueprint. The following values must be supplied in Render and must not be committed:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection endpoint |
| `MONGO_AUTH_SOURCE` | MongoDB authentication source |
| `MONGO_USERNAME` / `MONGO_PASSWORD` | Database credentials when required |
| `JWT_SECRET` | Token signing secret; use a unique random value per environment |
| `PAYCHANGU_SECRET_KEY` | PayChangu API credential |
| `PAYCHANGU_WEBHOOK_SECRET` | Webhook HMAC secret |
| `ADMIN_SIGNUP_TOKEN` | Optional protected admin signup token |

Use a separate Mongo database, JWT secret, and PayChangu test credentials for staging. Never copy production secrets into GitHub Actions or local issue comments.

## Release procedure

1. Merge a feature PR into `develop` after CI is green.
2. Confirm Render staging has deployed the new commit.
3. Run smoke checks: `/health`, landing page, login page, resume editor, registration, and a PayChangu test transaction when payment code changed.
4. Open a release PR from `develop` to `main` and merge only after staging verification.
5. Confirm the three production Render services deploy the same commit.
6. Record the release tag and deploy IDs in the release notes.

## Rollback procedure

Render keeps prior deploys for each service. Open the affected service, select the last successful deploy, and choose rollback. Roll back the API before the clients when an API contract regression is causing user impact. Do not roll back database changes unless the migration is explicitly reversible; prefer a forward-compatible fix.

## Operational checks

- Monitor Render deploy events and logs after every production release.
- Confirm CORS allows only the matching client URL plus explicitly documented origins.
- Confirm payment webhooks use HTTPS and signature validation remains enabled.
- Rotate JWT, database, and payment secrets after suspected exposure.
- Keep the `develop` staging database disposable and scrubbed of real user data.
