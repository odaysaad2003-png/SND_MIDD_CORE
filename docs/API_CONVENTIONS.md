# API_CONVENTIONS.md

## Base API Path
All endpoints are versioned under:

```
/api/v1
```

Future breaking changes get a new version prefix (`/api/v2`) instead of
mutating `/v1` in place.

## Resource Naming Conventions
- Resources are **plural nouns**: `/posts`, `/users`, `/comments`.
- Use **posts**, not **listings**, everywhere (see `PROJECT_STATE.md` for the
  terminology decision).
- Nested resources reflect ownership/relationship, e.g. `/posts/:id/comments`.
- The current authenticated user is addressed via `/users/me`, never
  `/users/:id` for self-access, to avoid leaking the concept of "which id am
  I" unnecessarily and to keep "me" routes cache-friendly and permission-safe
  by default.

## Params, Query, and Body

- **Route params** (`:id`) identify a specific resource. Always validated as
  a valid Mongo ObjectId before hitting the service layer.
- **Query params** are used for filtering, sorting, pagination, and search on
  collection (list) endpoints. Never used to send data that mutates state.
- **Body** carries the payload for `POST`, `PATCH`, and `PUT` requests. Always
  validated against a schema before reaching the controller.

## Standard Success Response Format

```json
{
  "success": true,
  "data": { },
  "meta": { }
}
```

- `data` holds the resource or array of resources.
- `meta` is optional and used for pagination info, counts, etc. Omit it when
  not needed.

## Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description of what went wrong.",
    "details": []
  }
}
```
## Backend Foundation Utilities Contract

Starting Sprint 1, the backend must centralize response and error behavior.

Required utilities:

```txt
src/utils/app-error.ts
src/utils/async-handler.ts
src/utils/api-response.ts
src/constants/error-codes.ts
src/middleware/error-handler.ts




- `code` is a stable, machine-readable string (e.g. `VALIDATION_ERROR`,
  `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `INTERNAL_ERROR`).
- `details` is optional — used for field-level validation errors.
- Error responses never leak stack traces or internal error messages in
  production.

## Pagination Format

Cursor or offset pagination, exposed consistently via query params:

```
GET /posts?page=1&limit=20
```

Response `meta`:

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 134,
    "totalPages": 7
  }
}
```

Note: Sprint 10 introduces cursor-based pagination as a performance upgrade
for large collections. Offset pagination (`page`/`limit`) is the Sprint 0–9
standard.

## Filtering and Sorting Conventions

- Filtering uses plain query keys matching the field name where possible:
  `GET /posts?category=help-request&status=open`
- Sorting uses a `sort` query param, prefixing with `-` for descending:
  `GET /posts?sort=-createdAt`
- Full-text or partial search uses a dedicated `q` param:
  `GET /posts?q=flood+relief`

## Auth Header / Cookie Strategy Notes

- **Sprint 0–1 (current)**: Auth continues to use the SND Mini approach
  (JWT in `Authorization: Bearer <token>` header) — not changed in Sprint 0.
- **Sprint 2 (Auth v2)**: Will move toward HttpOnly, Secure cookies for
  refresh tokens, with short-lived access tokens. This is documented ahead of
  time in `SECURITY_RULES.md` so the direction is clear, but it is **not**
  implemented until Sprint 2.

## HTTP Status Code Rules

| Status | Meaning | Usage |
|--------|---------|-------|
| 200 | OK | Successful GET, PATCH, or action with a response body |
| 201 | Created | Successful POST that creates a resource |
| 204 | No Content | Successful DELETE, no body returned |
| 400 | Bad Request | Validation failure |
| 401 | Unauthorized | Missing or invalid auth |
| 403 | Forbidden | Authenticated but not permitted (ownership/role) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/unique constraint violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

## Endpoint Examples

### `GET /posts`
List posts with pagination/filtering.
```
GET /api/v1/posts?page=1&limit=20&category=help-request&sort=-createdAt
```
```json
{
  "success": true,
  "data": [ { "id": "…", "title": "…", "category": "help-request" } ],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

### `GET /posts/:id`
```
GET /api/v1/posts/64f0c2a1b2e4f5a1c0d9e8f7
```
```json
{
  "success": true,
  "data": { "id": "64f0c2a1b2e4f5a1c0d9e8f7", "title": "…" }
}
```

### `POST /posts`
Requires auth. Creates a new post owned by the authenticated user.
```
POST /api/v1/posts
Authorization: Bearer <token>
```
```json
{
  "title": "Need help moving furniture",
  "category": "help-request",
  "description": "…"
}
```
Response: `201 Created` with the new post in `data`.

### `PATCH /posts/:id`
Requires auth + ownership (or admin role).
```
PATCH /api/v1/posts/64f0c2a1b2e4f5a1c0d9e8f7
Authorization: Bearer <token>
```
```json
{ "status": "closed" }
```

### `DELETE /posts/:id`
Requires auth + ownership (or admin role).
```
DELETE /api/v1/posts/64f0c2a1b2e4f5a1c0d9e8f7
Authorization: Bearer <token>
```
Response: `204 No Content`.

### `GET /users/me`
Requires auth. Returns the current user's profile.
```
GET /api/v1/users/me
Authorization: Bearer <token>
```

### `PATCH /users/me`
Requires auth. Updates the current user's own profile fields only.
```
PATCH /api/v1/users/me
Authorization: Bearer <token>
```
```json
{ "displayName": "New Name" }
```
























