# SND Frontend API Contract

## Contract Status

This contract is extracted from the supplied backend code. It documents endpoints used by frontend V1 and identifies missing contracts without inventing routes or fields.

## Base URL

```text
Production API origin: https://snd-community-core-api.onrender.com
API prefix:           /api/v1
Frontend environment: NEXT_PUBLIC_API_BASE_URL=https://snd-community-core-api.onrender.com/api/v1
```

The application must validate the base URL at startup/build time and must not concatenate an additional `/api/v1` when the environment value already includes it.

## Standard Envelopes

### JSON Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

`meta` is present only for paginated endpoints.

### Empty Success

`204 No Content` has no response body. The client must not parse JSON.

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Known error codes and default statuses:

| Code | Status |
|---|---:|
| `VALIDATION_ERROR` | 400 |
| `BAD_REQUEST` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `PAYLOAD_TOO_LARGE` | 413 |
| `UNSUPPORTED_MEDIA_TYPE` | 415 |
| `TOO_MANY_REQUESTS` | 429 |
| `INTERNAL_ERROR` | 500 |
| `SERVICE_UNAVAILABLE` | 503 |

The backend exposes `X-Request-Id`; the frontend should retain it with errors and may show it in an expandable support detail.

## Shared Data Shapes

### Private User

```ts
type PrivateUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### Public Author

```ts
type PublicAuthor = {
  id: string;
  name: string;
  avatar: string | null;
};
```

### Post

```ts
type Post = {
  id: string;
  title: string;
  content: string;
  author: PublicAuthor;
  images: string[];
  status: 'active' | 'deleted';
  likesCount: number;
  createdAt: string;
  updatedAt: string;
};
```

Public endpoints return only visible, active, non-deleted posts. `moderationStatus`, storage public IDs, deletion timestamps, and moderation details are not present in this V1 shape.

### Comment

```ts
type Comment = {
  id: string;
  content: string;
  post: string;
  author: PublicAuthor;
  createdAt: string;
  updatedAt: string;
};
```

### Pagination Meta

```ts
type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
```

## Authentication Endpoints

### Register

| Property | Value |
|---|---|
| Method/path | `POST /auth/register` |
| Access | Public, auth-rate-limited |
| Content-Type | `application/json` required |
| Credentials | `include` so the refresh cookie is accepted |
| Body | `{ name, email, password }` |
| Success | `201` |

Constraints: name 2–100 trimmed characters; valid normalized email; password 8–72 characters; strict body with no additional keys.

Success `data`:

```ts
{
  user: PrivateUser;
  accessToken: string;
  csrfToken: string;
}
```

The refresh token is removed from JSON by the controller and set as an HttpOnly cookie. Likely operational errors include `409 CONFLICT` for an existing email, `400 VALIDATION_ERROR`, `415 UNSUPPORTED_MEDIA_TYPE`, and `429 TOO_MANY_REQUESTS`.

Cache/invalidation: never cache; set auth memory state and seed the current-user query.

### Login

| Property | Value |
|---|---|
| Method/path | `POST /auth/login` |
| Access | Public, auth-rate-limited |
| Content-Type | `application/json` required |
| Credentials | `include` |
| Body | `{ email, password }` |
| Success | `200` with the same `data` shape as Register |

Errors intentionally use a generic invalid-credentials message. Never reveal whether an email exists.

Cache/invalidation: never cache; clear stale anonymous/private remnants, then seed auth and current-user state.

### CSRF Bootstrap

| Property | Value |
|---|---|
| Method/path | `GET /auth/csrf` |
| Access | Requires refresh cookie |
| Credentials | `include` required |
| Success | `200`, `data: { csrfToken: string }` |

No access token is required. Use only for session bootstrap/recovery, not before every request. `401` means no usable refresh session.

### Refresh

| Property | Value |
|---|---|
| Method/path | `POST /auth/refresh` |
| Access | Requires refresh cookie and valid CSRF header |
| Header | `X-CSRF-Token: <token>` |
| Credentials | `include` required |
| Body | None |
| Success | `200`, same `data` shape as Login |

The refresh cookie and CSRF token rotate. Only one in-tab refresh may run at a time. Retry a protected request at most once.

### Logout

| Property | Value |
|---|---|
| Method/path | `POST /auth/logout` |
| Access | Requires refresh cookie and valid CSRF header |
| Header | `X-CSRF-Token: <token>` |
| Credentials | `include` required |
| Body | None |
| Success | `200`, `data: { message: 'Logged out successfully' }` |

Clear local tokens and private caches whether the network operation succeeds or fails.

### Auth Current User

| Property | Value |
|---|---|
| Method/path | `GET /auth/me` |
| Access | Bearer access token |
| Success | `200`, `data: PrivateUser` |

Use `/users/me` as the canonical profile feature endpoint; `/auth/me` may be used for explicit session verification but is unnecessary immediately after successful register/login/refresh because those responses already contain the user.

## User/Profile Endpoints

All user routes require a valid Bearer token and an active current account.

### Get My Profile

| Property | Value |
|---|---|
| Method/path | `GET /users/me` |
| Success | `200`, `data: PrivateUser` |

Cache key: `['profile', 'me']`. Private browser cache only; remove on logout.

### Update My Name

| Property | Value |
|---|---|
| Method/path | `PATCH /users/me` |
| Content-Type | `application/json` |
| Body | `{ name: string }`, strict; 2–100 trimmed characters |
| Success | `200`, `data: PrivateUser` |

On success update current-user/profile caches and any displayed local author identity. Existing post/comment API documents are not automatically rewritten in cached lists; invalidate affected lists if immediate name consistency is required.

### Replace My Avatar

| Property | Value |
|---|---|
| Method/path | `PATCH /users/me/avatar` |
| Content-Type | `multipart/form-data` generated by the browser |
| Field | `avatar`, exactly one file |
| Types | JPEG, PNG, WEBP with server-side signature validation |
| Limit | 5 MB |
| Success | `200`, `data: PrivateUser` |

Do not manually set the multipart boundary. On success update profile/auth user state and invalidate public content containing the author's cached avatar if immediate consistency is required.

## Post Endpoints

### Public Feed

| Property | Value |
|---|---|
| Method/path | `GET /posts` |
| Access | Public |
| Query | `page=1`, `limit=10` (max 50), `sort=latest\|oldest`, optional `search` max 100 |
| Success | `200`, `data: Post[]`, `meta: PaginationMeta` |

Frontend usage: landing preview and public feed. Query key includes page, limit, sort, and committed search. Public response lacks `likedByMe`, `savedByMe`, and `commentsCount`.

Deployed-data note verified on 2026-07-14: some legacy Post documents still contain relative `/uploads/posts/...` strings in `images`, although current uploads use Cloudinary and those legacy files are no longer available on Render. The transport shape remains `string[]`; frontend schema validation must not reject the entire post page because one legacy string is relative. Rendering accepts only explicitly supported HTTPS media hosts and omits unavailable legacy media. Removing or migrating the legacy records is a separate backend/data-maintenance task.

### My Posts

| Property | Value |
|---|---|
| Method/path | `GET /posts/me` |
| Access | Bearer + active account |
| Query | `page=1`, `limit=10` (max 50), optional `q`, optional `status=active\|deleted`, `sort=createdAt\|-createdAt\|updatedAt\|-updatedAt` |
| Success | `200`, `data: Post[]`, `meta: PaginationMeta` |

V1 uses the default active filter. Deleted posts are not surfaced until an owner-restore/archive UX is approved.

### Public Post Detail

| Property | Value |
|---|---|
| Method/path | `GET /posts/:postId` |
| Access | Public |
| Params | valid MongoDB ObjectId |
| Success | `200`, `data: Post` |

Unavailable, deleted, or hidden content resolves as `404`; the UI must not disclose which state caused it.

### Create Post

| Property | Value |
|---|---|
| Method/path | `POST /posts` |
| Access | Bearer + active account |
| Content-Type | `application/json` |
| Body | `{ title, content }`, strict |
| Constraints | title 3–100; content 1–5000, both trimmed |
| Success | `201`, `data: Post` with empty `images` |

Invalidate public-feed and my-post lists. If image upload follows, retain the created ID and treat the upload as a separate mutation.

### Update Owned Post

| Property | Value |
|---|---|
| Method/path | `PATCH /posts/:postId` |
| Access | Bearer + active account + owner only |
| Content-Type | `application/json` |
| Body | one or both of `{ title?, content? }`; no extra keys |
| Success | `200`, `data: Post` |

Update the detail cache and invalidate relevant public/my-post lists.

### Soft-Delete Owned Post

| Property | Value |
|---|---|
| Method/path | `DELETE /posts/:postId` |
| Access | Bearer + active account + owner only |
| Success | `204`, no body |

Remove the detail/list item from active caches and invalidate public feed, my posts, saved posts, and related visible content. There is no owner restore endpoint.

### Add Post Images

| Property | Value |
|---|---|
| Method/path | `POST /posts/:postId/images` |
| Access | Bearer + active account + owner only |
| Content-Type | `multipart/form-data` |
| Field | `images` repeated for selected files; no text fields |
| Types | JPEG, PNG, WEBP with signature validation |
| Limits | maximum five images total per post; each maximum 5 MB |
| Success | `200`, `data: Post` |

The server rolls back newly uploaded Cloudinary assets if the database operation fails. The frontend still needs partial-flow UX because the text post already exists.

### Remove One Post Image

| Property | Value |
|---|---|
| Method/path | `DELETE /posts/:postId/images` |
| Access | Bearer + active account + owner only |
| Content-Type | `application/json` |
| Body | `{ imageUrl: string }`, strict valid URL |
| Success | `200`, `data: Post` |

Use the exact URL returned in `post.images`; do not derive Cloudinary public IDs in the frontend.

## Comment Endpoints

### List Post Comments

| Property | Value |
|---|---|
| Method/path | `GET /posts/:postId/comments` |
| Access | Public |
| Query | `page=1`, `limit=10` (max 50), `sort=latest\|oldest` |
| Success | `200`, `data: Comment[]`, `meta: PaginationMeta` |

The parent post must be publicly available. Use `meta.total` as the detail-page comment total; do not fetch this endpoint per feed card solely for a count.

### Create Comment

| Property | Value |
|---|---|
| Method/path | `POST /posts/:postId/comments` |
| Access | Bearer + active account |
| Content-Type | `application/json` |
| Body | `{ content: string }`, strict; 1–1000 trimmed characters |
| Success | `201`, `data: Comment` |

Invalidate or prepend to the appropriate comments query while keeping `meta.total` consistent.

### Update Owned Comment

| Property | Value |
|---|---|
| Method/path | `PATCH /comments/:commentId` |
| Access | Bearer + active account + owner only |
| Body | `{ content: string }`, strict; 1–1000 |
| Success | `200`, `data: Comment` |

### Soft-Delete Owned Comment

| Property | Value |
|---|---|
| Method/path | `DELETE /comments/:commentId` |
| Access | Bearer + active account + owner only |
| Success | `204`, no body |

Remove it from active comment caches and update the local total. There is no restore endpoint.

## Like Endpoints

All Like endpoints require Bearer auth and an active account. The target post must be publicly available.

| Method/path | Success data | Notes |
|---|---|---|
| `GET /posts/:postId/likes/me` | `{ likedByMe: boolean, likesCount: number }` | Current viewer state |
| `POST /posts/:postId/likes` | `{ likedByMe: true, likesCount: number }` | `201` for new relation, otherwise `200`; idempotent |
| `DELETE /posts/:postId/likes` | `{ likedByMe: false, likesCount: number }` | `200`; idempotent |

Cache/invalidation: optimistically update detail/feed copies and status, roll back on error, then reconcile with the returned count. Viewer-state GET per visible card is a known N+1 risk.

## Save Endpoints

All Save endpoints require Bearer auth and an active account. Saves are private and no public saves count exists.

| Method/path | Success data | Notes |
|---|---|---|
| `GET /posts/:postId/saves/me` | `{ savedByMe: boolean }` | Current viewer state |
| `POST /posts/:postId/saves` | `{ savedByMe: true }` | `201` for new relation, otherwise `200`; idempotent |
| `DELETE /posts/:postId/saves` | `{ savedByMe: false }` | `200`; idempotent |

### My Saved Posts

| Property | Value |
|---|---|
| Method/path | `GET /saves/me` |
| Query | `page=1`, `limit=10` (max 50), `sort=latest\|oldest` |
| Success | `200`, paginated saved-post data |

Saved-post items contain the Post fields plus `savedAt`. Only currently public/visible posts appear. Invalidate saved lists after save/unsave.

## Report Submission Endpoints

Report administration is deferred, but authenticated active users can submit reports.

### Report a Post

| Property | Value |
|---|---|
| Method/path | `POST /posts/:postId/reports` |
| Body | `{ reason, details? }`, strict |
| Success | `201`, `data: Report` |

### Report a Comment

| Property | Value |
|---|---|
| Method/path | `POST /comments/:commentId/reports` |
| Body | `{ reason, details? }`, strict |
| Success | `201`, `data: Report` |

Allowed reasons:

```text
spam | harassment | hate_speech | violence | scam |
sexual_content | misinformation | other
```

`details` is optional, trimmed, and at most 1000 characters. A user cannot report their own content. A duplicate report returns `409 CONFLICT`. The V1 frontend uses a success confirmation and does not expose admin review state.

The returned Report can include reporter, target details, reason, optional details, status, review fields, and timestamps. Do not display admin-oriented fields in the user confirmation.

## Health Endpoints

| Method/path | Use |
|---|---|
| `GET /health` | Liveness/basic service status; outside auth |
| `GET /health/ready` | Dependency readiness |

These are deployment/monitoring endpoints, not normal client polling targets.

## Accepted Contract Limitations

### Legacy Post Media

Current backend serialization returns stored image strings without converting or validating them at read time. New images are Cloudinary URLs, but historical relative `/uploads` values may remain. The frontend treats these strings as untrusted media references: posts remain readable, only verified HTTPS Cloudinary images enter `next/image`, and no storage identifier or replacement URL is invented.

### Public Profile

No frontend-usable public user/profile endpoint exists. Public Profile is therefore deferred from V1: the frontend creates no route or query and does not turn post/comment author identity into a profile link. A future product decision must approve both the backend contract and the fields before the feature returns.

### Feed Viewer State

`GET /posts` does not include viewer-specific `likedByMe` or `savedByMe`, and it is public without optional authentication. V1 accepts lazy per-visible-card calls to the current status endpoints after auth bootstrap:

1. guests make no viewer-state requests and authenticate at interaction;
2. authenticated cards do not treat unknown/failed status as `false`;
3. Like/Save status queries start only when the card enters the viewport and reuse Query cache by post ID;
4. F6 measures visible-card request volume and verifies correct pre-liked/pre-saved state;
5. a protected batch viewer-state endpoint is the preferred future optimization.

This is an accepted performance debt, not a new backend contract. The frontend must not invent a combined response.

### Other Deferred Backend Capabilities

No current V1 route exists for change/forgot password, email verification, account deletion, owner restore of posts/comments, or admin role promotion. The frontend must not render controls for them.
