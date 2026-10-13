# Deployment Runbook

## Render services

The repository defines six Render web services in [`render.yaml`](../render.yaml): three staging services on `develop` and three production services on `main`.

| Service | Runtime      | Build                                                   | Start                                     | Health check    |
| ------- | ------------ | ------------------------------------------------------- | ----------------------------------------- | --------------- |
| API     | Node/NestJS  | `cd backend && npm ci && npm run build`                 | `cd backend && npm run start:prod`        | `/health/ready` |
| Client  | Node/Next.js | `cd frontend/kungacv_client && npm ci && npm run build` | `cd frontend/kungacv_client && npm start` | Render default  |
| Admin   | Node/Next.js | `cd frontend/kungacv_admin && npm ci && npm run build`  | `cd frontend/kungacv_admin && npm start`  | Render default  |

The services use Frankfurt to reduce latency for Malawi and regional users. Free plans are suitable for early staging and low-volume validation, but they can suspend when idle; upgrade the API and client when uptime and cold-start behavior become product requirements.

## First-time Render setup

1. Connect the GitHub repository `vend-pixel/kungacv` to Render.
2. Create the Blueprint from `render.yaml`, or create the six services with the same names and commands.
3. Enter staging secrets into the `*-staging` API service and production secrets into `kungacv-api`.
4. Set `NEXT_PUBLIC_API_URL` on each client service to the matching API URL. Because this is a public Next.js build variable, changing it requires a new client build.
5. Confirm the API `/health/ready` endpoint returns HTTP 200 before testing authentication or payments. Use `/health/live` to distinguish a running process from a Mongo-ready service.

## Required API environment variables

Non-secret defaults are defined in the Blueprint. The following values must be supplied in Render and must not be committed:

| Variable                                       | Purpose                                                         |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `MONGO_URI`                                    | MongoDB connection endpoint                                     |
| `MONGO_DB_NAME`                                | Database name used by the API                                   |
| `MONGO_AUTH_SOURCE`                            | MongoDB authentication source                                   |
| `MONGO_USERNAME` / `MONGO_PASSWORD`            | Database credentials when required                              |
| `JWT_SECRET`                                   | Token signing secret; use a unique random value per environment |
| `PAYCHANGU_SECRET_KEY`                         | PayChangu API credential                                        |
| `PAYCHANGU_WEBHOOK_SECRET`                     | Webhook HMAC secret                                             |
| `ADMIN_SIGNUP_TOKEN`                           | Optional protected admin signup token                           |
| `CLOUDINARY_CLOUD_NAME`                        | Cloudinary cloud identifier for template previews               |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary server-side upload credentials                       |
| `CLOUDINARY_FOLDER`                            | Root folder for template previews; default `kungacv/templates`  |

`MONGO_URI`, `MONGO_DB_NAME`, and `JWT_SECRET` are required at startup. The API also accepts Atlas-generated aliases `MONGODB_URI`, `MONGODB_USERNAME`, and `MONGODB_PASSWORD`. In production, `JWT_SECRET` must be at least 32 characters and must not use the placeholder from `.env.example`. When MongoDB credentials are supplied, the API passes the configured authentication values to Mongoose.

Use a separate Mongo database, JWT secret, and PayChangu test credentials for staging. Never copy production secrets into GitHub Actions or local issue comments.

Template preview uploads use Cloudinary. Enter `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` as encrypted Render environment variables for each API service. The API stores only the returned secure URL and public ID in MongoDB; Cloudinary secrets never reach the browser. Preview uploads are limited to 5 MB and JPEG, PNG, or WebP images. Use separate Cloudinary folders or credentials for staging and production when practical.

### Configure Cloudinary for the production API

1. In Cloudinary, open the production account dashboard and copy the **Cloud name**, **API Key**, and **API Secret**. Never put the API Secret in frontend variables or GitHub.
2. In Render, open the `kungacv-api` service, then open **Environment**.
3. Add or update these values:

   ```text
   CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
   CLOUDINARY_API_KEY=<Cloudinary API key>
   CLOUDINARY_API_SECRET=<Cloudinary API secret>
   CLOUDINARY_FOLDER=kungacv/templates
   ```

4. Save the environment changes and deploy the API. Do the same for `kungacv-api-staging` with a staging Cloudinary account or folder if available.
5. Verify the API health endpoint, then use the protected admin upload route with a JPEG, PNG, or WebP preview no larger than 5 MB:

   ```text
   POST /admin/templates/:uid/preview
   multipart field: file
   Authorization: Bearer <admin JWT>
   ```

6. Confirm the template record stores a Cloudinary `previewUrl` and `previewPublicId`. Do not expect the Cloudinary secret or signed upload data in any API response.

If Render logs `Missing required environment variables: MONGO_URI, JWT_SECRET`, the service is failing before Nest starts. In the Render dashboard, open both `kungacv-api` and `kungacv-api-staging`, add the missing values under **Environment**, save, and redeploy. The `sync: false` entries in `render.yaml` declare secrets but intentionally do not provide their values. Confirm the next deploy logs `server_started` and that `/health/ready` returns HTTP 200.

For MongoDB Atlas, set `MONGODB_URI` or `MONGO_URI` to the complete driver URI, including any `?appName=...` query. Set `MONGO_DB_NAME=kungacv`. The API inserts the database name before query parameters, so the Atlas-generated URI format is supported. Do not leave `<db_password>` as a literal placeholder; use the actual database-user password, URL-encoding reserved characters when necessary. Atlas Network Access must also allow Render’s outbound connection.

## Release procedure

1. Merge a feature PR into `develop` after CI is green.
2. Confirm Render staging has deployed the new commit.
3. Run smoke checks: `/health/live`, `/health/ready`, landing page, login page, resume editor, registration, and a PayChangu test transaction when payment code changed.
4. Open a release PR from `develop` to `main` and merge only after staging verification.
5. Confirm the three production Render services deploy the same commit.
6. Record the release tag and deploy IDs in the release notes.

## Database indexes and rate limits

Mongoose creates the declared collection indexes during service startup. Review index-build output after the first production deploy and verify the expected indexes with MongoDB `db.collection.getIndexes()` for `users`, `resumes`, `payments`, `purchases`, and `subscriptions`. For large existing collections, schedule index creation during a low-traffic window and confirm there are no duplicate `purchases.uid` values before the unique index is built.

The API currently applies per-IP in-memory limits to login, signup, admin authentication, payment initiation, and payment webhooks. Responses include `X-RateLimit-*`, `RateLimit-Policy`, and `Retry-After` headers when a quota is active. These limits reset when an instance restarts and are not shared across multiple API instances.

### Redis migration strategy

Before horizontal scaling, migrate the guard storage behind a `RateLimitStore` interface using this staged plan:

1. **Prepare:** provision a private Redis instance in the same region, restrict network access, enable TLS/authentication, and add `REDIS_URL` as a Render secret. Define a key version such as `rl:v1:{policy}:{client}:{windowStart}`; hash or truncate untrusted client identifiers so keys cannot grow without bound.
2. **Shadow mode:** write Redis counters with an atomic `INCR` plus `EXPIRE` (or one Lua script), but continue enforcing the local store. Emit sampled comparison metrics for local versus Redis decisions; do not log IP addresses or request bodies.
3. **Redis primary:** switch enforcement to Redis after shadow counts agree across a staging load test. Use one atomic operation for increment, limit, and remaining count so concurrent instances cannot overshoot the quota.
4. **Fallback policy:** fail closed for credential-probing routes (`/auth/login`, `/admin/login`) if Redis is unavailable; fail open with an alert for signed payment webhooks so provider retries are not discarded. Keep a short-lived local emergency bucket only as a circuit-breaker guard, not as the source of truth.
5. **Rollback:** retain the local implementation behind a feature/config switch for one release. If Redis latency or errors breach the error budget, switch enforcement back to local storage, drain the Redis keys, and investigate without changing route limits.

Monitor Redis command latency, error rate, key cardinality, limiter decision mismatches, and 429 rates before and after cutover. Never put credentials, raw request bodies, or full IP addresses in logs.

## Rollback procedure

Render keeps prior deploys for each service. Open the affected service, select the last successful deploy, and choose rollback. Roll back the API before the clients when an API contract regression is causing user impact. Do not roll back database changes unless the migration is explicitly reversible; prefer a forward-compatible fix.

## Operational checks

- Monitor Render deploy events and logs after every production release.
- Confirm CORS allows only the matching client URL plus explicitly documented origins.
- Confirm payment webhooks use HTTPS and signature validation remains enabled.
- Rotate JWT, database, and payment secrets after suspected exposure.
- Keep the `develop` staging database disposable and scrubbed of real user data.
- Monitor rate-limit responses and review whether legitimate PayChangu webhook retries are being throttled.
- Treat missing required Render secrets as a deployment-blocking configuration error, not an application retry condition.
