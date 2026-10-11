# KungaCV System Architecture

## Runtime topology

KungaCV is a three-application monorepo with independently deployable services:

```text
                           ┌──────────────────────────┐
                           │  kungacv-client (Next.js) │
                           │  Render Web Service       │
                           └────────────┬─────────────┘
                                        │ HTTPS / JSON
                                        ▼
┌───────────────┐              ┌────────────────────────┐
│ Browser users │─────────────▶│ kungacv-api (NestJS)   │
└───────────────┘              │ Render Web Service     │
                               └───────┬─────────┬──────┘
                                       │         │
                              MongoDB  │         │ PayChangu
                                       ▼         ▼
                               ┌──────────┐  ┌────────────┐
                               │ MongoDB  │  │ PayChangu  │
                               │ provider │  │ webhooks   │
                               └──────────┘  └────────────┘

             ┌──────────────────────────┐
             │ kungacv-admin (Next.js)  │
             │ Render Web Service       │
             └──────────────────────────┘
```

The public client, API, and admin dashboard are separate Render web services. The API is the only service that talks to MongoDB or PayChangu. The browser never receives database credentials, payment secrets, or JWT signing material.

## Environments

| Environment | Git branch | Render services | Data policy |
|---|---|---|---|
| Staging | `develop` | `kungacv-api-staging`, `kungacv-client-staging`, `kungacv-admin-staging` | Separate Mongo database and PayChangu test credentials |
| Production | `main` | `kungacv-api`, `kungacv-client`, `kungacv-admin` | Production database and live payment credentials |

Staging must never share a production Mongo database, JWT secret, or PayChangu credential. The Render Blueprint in [`render.yaml`](../render.yaml) is the source of truth for service names, branches, build commands, health checks, and non-secret configuration.

## Request boundaries

- **Client → API:** HTTPS requests using `NEXT_PUBLIC_API_URL`; authentication uses bearer tokens.
- **PayChangu → API:** webhook requests to `/payments/webhook`; raw request bodies are retained so the `Signature` HMAC can be validated.
- **API → MongoDB:** server-side Mongoose connection using `MONGO_URI` and credentials stored only in Render.
- **Render health checks:** `GET /health` returns a small JSON response without exposing secrets or user data.

## Availability and rollback

Render performs an automatic deploy when the tracked branch changes. A failed build does not replace the currently running version. A bad release is rolled back by selecting the previous successful deploy in Render. Database changes must be backward-compatible before the application deploy; destructive migrations require a separate reviewed release plan.

## Design rules

1. Keep secrets in Render environment variables or GitHub secrets, never in Git.
2. Keep production and staging credentials and databases separate.
3. Keep API contracts versionable and add tests when routes or payloads change.
4. Make health checks cheap, deterministic, and free of external side effects.
5. Prefer small pull requests and promote the same commit from staging to production.
