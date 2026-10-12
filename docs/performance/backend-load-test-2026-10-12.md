# Backend load-test report — 2026-10-12

## Scope

This run exercised the newly indexed MongoDB query paths and the actual NestJS login route carrying the in-memory rate-limit guard.

Command:

```bash
cd backend
npm run load:test
```

The harness starts MongoDB 7.0.24 through `mongodb-memory-server`, seeds 10,000 resumes and 10,000 payments, starts the real Nest application on an ephemeral HTTP port, and sends 40 login requests at concurrency 5.

## Results

| Area | Result |
|---|---:|
| Resume owner + recency query | 0 ms Mongo execution; 50 keys / 50 documents examined |
| Pending payment + recency query | 0 ms Mongo execution; 50 keys / 50 documents examined |
| Paired indexed query latency, p50 | 4.86 ms |
| Paired indexed query latency, p95 | 7.23 ms |
| Paired indexed query maximum | 9.60 ms |
| Login requests | 40 |
| Login HTTP 401 responses | 10 |
| Login HTTP 429 responses | 30 |
| Rate-limit endpoint duration | 166.70 ms |
| Connection errors | 0 |

MongoDB selected these intended indexes:

- `user_uid_1_updatedAt_-1`
- `status_1_createdAt_1`

The rate-limit result confirms the configured 10 requests/minute login quota: the first 10 requests reached authentication and the remaining 30 were rejected with HTTP 429.

## Interpretation and limits

These are **local synthetic measurements**, not production capacity evidence. The benchmark uses an ephemeral MongoDB instance, a 10,000-document dataset, localhost networking, and no Render CPU/memory contention. Use it as a regression check that the query planner selects the intended indexes and that the limiter behaves correctly. Repeat against staging with representative data, concurrency, and an external load generator before capacity planning.

The initial unbounded SuperTest run produced connection resets under this local harness; the bounded-concurrency real-listener run above completed with zero errors. The benchmark now uses a real ephemeral HTTP listener and concurrency five to avoid client-harness socket noise.

## Render deployment-log diagnosis

The attached Render log checked out commit `d9481f1` and completed the build successfully. Runtime failed before Nest startup with:

```text
Error: Missing required environment variables: MONGO_URI, JWT_SECRET
```

This is a Render environment configuration failure, not an indexing or application query failure. Add `MONGO_URI` and a strong `JWT_SECRET` to the `kungacv-api` service, and add the corresponding staging values to `kungacv-api-staging`; `sync: false` in `render.yaml` only declares that Render should expect a secret and does not supply its value. Redeploy, confirm a `server_started` event, then check `/health/ready`.
