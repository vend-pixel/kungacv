# React Admin API provider contract

The admin frontend must stop using `ra-data-json-server` and `jsonplaceholder.typicode.com`. Phase 3 provides the template, pricing, and read-only payment admin routes below.

## Authentication

`POST /admin/login` accepts the existing login DTO and returns the JWT response from the NestJS auth service. Store the token in browser storage only through the React Admin auth provider and send it as:

```http
Authorization: Bearer <token>
```

Clear the token and reject the request on HTTP 401 or 403.

## Resource mapping

| React Admin operation | Planned NestJS route                 | Response mapping                                                     |
| --------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| templates list        | `GET /admin/templates`               | `{ templates, count }` → `{ data: templates, total: count }`         |
| template detail       | `GET /admin/templates/:uid`          | `{ template }` → `{ data: template }`                                |
| template create       | `POST /admin/templates`              | `{ template }` → `{ data: template }`                                |
| template update       | `PATCH /admin/templates/:uid`        | `{ template }` → `{ data: template }`                                |
| template publish      | `POST /admin/templates/:uid/publish` | `{ template }` → `{ data: template }`                                |
| template disable      | `POST /admin/templates/:uid/disable` | `{ template }` → `{ data: template }`                                |
| template restore      | `POST /admin/templates/:uid/restore` | `{ template }` → `{ data: template }`                                |
| template soft-delete  | `DELETE /admin/templates/:uid`       | `{ template }` → `{ data: template }`                                |
| pricing list          | `GET /admin/pricing`                 | `{ subscriptions, count }` → `{ data: subscriptions, total: count }` |
| pricing detail        | `GET /admin/pricing/:uid`            | `{ subscription }` → `{ data: subscription }`                        |
| pricing create/update | `POST/PATCH /admin/pricing...`       | `{ subscription }` → `{ data: subscription }`                        |
| pricing activate      | `POST /admin/pricing/:uid/activate`  | `{ subscription }` → `{ data: subscription }`                        |
| pricing disable       | `POST /admin/pricing/:uid/disable`   | `{ subscription }` → `{ data: subscription }`                        |
| pricing soft-delete   | `DELETE /admin/pricing/:uid`         | `{ subscription }` → `{ data: subscription }`                        |
| payments list         | `GET /admin/payments`                | `{ payments, count }` → `{ data: payments, total: count }`           |
| payment detail        | `GET /admin/payments/:txRef`         | `{ payment }` → `{ data: payment }`                                  |

The provider must translate React Admin pagination (`page`, `perPage`), sorting, and allowlisted filters into query parameters. It must not forward arbitrary query objects to MongoDB.

Payment resources are intentionally read-only. Do not add `create`, `update`, or `delete` calls for payments in the provider.

## Uploads

Template preview upload is a separate multipart request, not a JSON `create` payload. The endpoint is now available:

```http
POST /admin/templates/:uid/preview
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

The provider or template form should send a `FormData` object without manually setting the multipart boundary header. Cloudinary credentials never belong in the browser.
