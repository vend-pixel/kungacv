# React Admin API provider contract

The admin frontend must stop using `ra-data-json-server` and `jsonplaceholder.typicode.com`. The Phase 1 backend models establish these resource contracts for the next CRUD phase.

## Authentication

`POST /admin/login` accepts the existing login DTO and returns the JWT response from the NestJS auth service. Store the token in browser storage only through the React Admin auth provider and send it as:

```http
Authorization: Bearer <token>
```

Clear the token and reject the request on HTTP 401 or 403.

## Resource mapping

| React Admin operation | Planned NestJS route           | Response mapping                                                     |
| --------------------- | ------------------------------ | -------------------------------------------------------------------- |
| templates list        | `GET /admin/templates`         | `{ templates, count }` → `{ data: templates, total: count }`         |
| template detail       | `GET /admin/templates/:uid`    | `{ template }` → `{ data: template }`                                |
| template create       | `POST /admin/templates`        | `{ template }` → `{ data: template }`                                |
| template update       | `PATCH /admin/templates/:uid`  | `{ template }` → `{ data: template }`                                |
| pricing list          | `GET /admin/pricing`           | `{ subscriptions, count }` → `{ data: subscriptions, total: count }` |
| pricing create/update | `POST/PATCH /admin/pricing...` | `{ subscription }` → `{ data: subscription }`                        |
| payments list         | `GET /admin/payments`          | `{ payments, count }` → `{ data: payments, total: count }`           |
| payment detail        | `GET /admin/payments/:txRef`   | `{ payment }` → `{ data: payment }`                                  |

The provider must translate React Admin pagination (`page`, `perPage`), sorting, and allowlisted filters into query parameters. It must not forward arbitrary query objects to MongoDB.

## Uploads

Template preview upload is a separate multipart request, not a JSON `create` payload:

```http
POST /admin/templates/:uid/preview
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

The provider or template form should send a `FormData` object without manually setting the multipart boundary header. Cloudinary credentials never belong in the browser.
