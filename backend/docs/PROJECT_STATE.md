# Project State

## Project

**Name:** SND Community Core Backend  
**Previous prototype:** SND Mini  
**Current milestone:** End of Sprint 7 — Admin Operations & Dashboard  
**Next sprint:** Sprint 8 — Automated Testing, Quality, and Safe Refactoring

## Current Status

Sprints 0 through 7 are complete.

Sprint 7 was intentionally delivered in four separated phases:

```text
7A — Security Foundation       COMPLETE
7B — User Administration      COMPLETE
7C — Post Moderation          COMPLETE
7D — Admin Dashboard          COMPLETE
```

Sprint 7 closes the first complete admin-control layer for the backend: current-user-state
revalidation, user administration, auditable Post moderation, and a safe operational
Dashboard summary.

The verified codebase passes:

```text
npm run typecheck
npm run build
```

Manual verification confirmed the Sprint 7C moderation workflow and the Sprint 7D Dashboard
success path for an active Admin, including internally consistent totals. A normal user was
also confirmed to receive `403 Forbidden` from the Dashboard route. Stale/demoted-Admin and
inactive-Admin Dashboard cases remain explicit first-priority automated permission tests in
Sprint 8; they are not claimed here as newly executed manual cases.

This file is a current snapshot, not an append-only sprint diary. Durable decisions belong
in `DECISIONS.md`; future scope belongs in `SPRINT_ROADMAP.md`.

---

## Implemented Foundation

- `app.ts` and `server.ts` have separate responsibilities.
- Environment variables are validated at startup.
- MongoDB connection lifecycle is centralized.
- Standard success and error responses are centralized.
- `AppError`, `asyncHandler`, request IDs, structured logging, Helmet, CORS, and baseline
  rate limiting are present.
- `GET /api/v1/health` is available for health verification.

## Implemented Authentication and User-State Security

- Register, login, refresh, logout, and authenticated current-user retrieval.
- Short-lived access tokens and longer-lived rotating refresh tokens.
- Separate access-token and refresh-token secrets.
- Password hashes and refresh-token hashes are excluded from normal queries.
- Refresh tokens are hashed at rest and checked during refresh.
- Refresh-token reuse/hash mismatch revokes the current stored session.
- Auth-specific rate limiting is applied to sensitive endpoints.
- Change-password behavior is implemented.
- Protected user operations can revalidate current active-user state from MongoDB.
- High-impact Admin operations revalidate current Admin role and active state from MongoDB.
- Current refresh-token transport remains JSON-body based for backend/Postman development.

### Current Auth Limitations

- One active refresh token/session per user.
- Browser-safe HttpOnly cookie transport is not implemented yet.
- Full token-family/session-device tracking is not implemented.
- Email verification and forgot-password flows are not implemented.

## Implemented Users and Storage

- Read and update the authenticated user's safe profile fields.
- Upload and replace a current user's avatar.
- Avatar responses expose a display URL while Cloudinary public identifiers remain internal.
- Avatar and Post-image storage use Cloudinary.
- Legacy local-storage notes are historical and must not guide new production code.

## Implemented Posts

- Public visible-Post feed with offset pagination, search, and controlled sorting.
- Public visible-Post details.
- Authenticated create and current-user Post listing.
- Owner-only update, image mutation, and soft delete.
- Dedicated multipart endpoint for Post images, separate from JSON Post creation.
- Remove an individual Post image from MongoDB and Cloudinary.
- Maximum image count, file-size, and MIME allowlists are enforced.
- `likesCount` is stored as a denormalized counter and updated atomically.

### Post Owner Lifecycle

```text
status: active | deleted
deletedAt: null | Date
```

### Post Admin Moderation Lifecycle

```text
moderationStatus: visible | hidden
hiddenAt: null | Date
hiddenBy: null | User ObjectId
moderationReason: null | string
```

Owner deletion and Admin moderation are independent state dimensions. Admin restore never
clears owner `status`/`deletedAt` and cannot resurrect owner-deleted content.

Legacy Post documents physically missing `moderationStatus` are treated as effectively
visible only when the owner lifecycle is active. The canonical public Post visibility rule
is centralized in `src/modules/posts/post-visibility.ts` and propagated through Posts,
Comments, Likes, Saves, and new Report creation.

## Implemented Comments

- Public paginated Comment listing under an available parent Post.
- Authenticated Comment creation under an available parent Post.
- Owner/Admin update and soft delete through direct Comment routes.
- Parent Posts are revalidated using the canonical public Post visibility rule.
- Existing Comments remain stored when a parent Post is Admin-hidden.

## Implemented Likes

- Like, unlike, and current-user Like-status operations.
- One document per `(post, user)` pair enforced by a unique compound index.
- Active/deleted toggle semantics and idempotent behavior.
- `likesCount` changes use atomic database updates.
- Hidden Posts reject interaction while existing Like records and `likesCount` remain intact.

## Implemented Saves

- Save, unsave, and current-user Save-status operations.
- Private paginated `my saved posts` listing.
- One document per `(post, user)` pair enforced by a unique compound index.
- Active/deleted toggle semantics and idempotent behavior.
- Aggregation with lookup/facet returns only publicly available saved Posts, with matching
  data and pagination totals.
- Existing Save records remain stored while a Post is hidden and can reappear after restore.

## Implemented Reports

- Reports for supported Post and Comment targets.
- Reporter identity is derived from authenticated context.
- New Reports require an available target; a Comment target also requires an available
  parent Post.
- Admin-protected Report review/list/detail/status workflow.
- Aggregation-backed Report read models and validated pagination/filter/sort inputs.
- Existing Reports remain Admin-reviewable when their target is later hidden or owner-deleted.
- Report status transitions and Post moderation remain separate workflows.

---

## Sprint 7A — Security Foundation

- Protected user operations revalidate current active-user state.
- Admin route role claims remain a baseline gate rather than the final authorization source.
- High-impact Admin services revalidate current Admin role and active state from MongoDB.
- Request IDs are available for correlation and audit metadata, never identity.

## Sprint 7B — User Administration

Routes:

```http
GET   /api/v1/admin/users
GET   /api/v1/admin/users/:userId
PATCH /api/v1/admin/users/:userId/status
```

- Validated pagination, search, filtering, and deterministic sorting.
- Dedicated sanitized Admin User presenters.
- Admin cannot suspend/reactivate self.
- Admin accounts cannot be changed through the normal-user status endpoint.
- Suspend/reactivate uses one MongoDB transaction for current-Admin revalidation, target
  load, transition validation, User write, and AuditEvent write.
- Suspension revokes the stored refresh session.

## Sprint 7C — Post Moderation

Routes:

```http
GET   /api/v1/admin/posts
GET   /api/v1/admin/posts/:postId
PATCH /api/v1/admin/posts/:postId/moderation
```

- Dedicated Admin Post list/detail presenters without `imagePublicIds` or sensitive User data.
- Separate visible/hidden moderation state machine.
- Repeated transitions return `409 Conflict`.
- Owner-deleted Posts cannot transition through the moderation endpoint.
- Hide/restore writes and typed Post AuditEvents share one transaction and `ClientSession`.
- Hidden Posts are unavailable through public Posts, Comments, Likes, Saves, and new Reports.
- Existing Comments/Likes/Saves/Reports and Cloudinary assets are preserved.
- Typecheck, build, and the approved manual Postman moderation flow passed.

## Sprint 7D — Admin Dashboard Summary

Route:

```http
GET /api/v1/admin/dashboard/summary
```

- Inherits Admin authentication and role gating from the Admin router.
- Revalidates the current Admin from MongoDB in the service layer.
- Returns a safe operational snapshot across:
  - Users by active/suspended state and user/Admin role
  - Posts by public-visible, Admin-hidden, and owner-deleted state
  - Comments by active/deleted lifecycle
  - Active Likes and Saves
  - Reports by pending/reviewed/dismissed/actioned state
- Uses separate typed domain aggregations/counts executed concurrently.
- Does not use a cross-domain transaction because the Dashboard is an operational snapshot,
  not a cross-document write invariant.
- Includes internal classification consistency checks to avoid silently returning misleading
  totals if an unknown persisted enum/state appears.
- Active-Admin `200 OK` and normal-user `403 Forbidden` behavior were manually confirmed.

## Implemented Audit Events

Current actions:

```text
USER_SUSPENDED
USER_REACTIVATED
POST_HIDDEN
POST_RESTORED
```

Current target types:

```text
user
post
```

High-impact typed writers accept only allowlisted state snapshots and require the same
`ClientSession` as the protected mutation.

---

## Stable Decisions That Must Be Preserved

- Use `posts`, never `listings`, in new code and documentation.
- Preserve modular route/controller/service/model separation.
- Do not trust client-supplied identity, role, owner, status, counters, storage IDs, or
  moderation metadata.
- Preserve soft-delete semantics for Posts/Comments and toggle semantics for Likes/Saves.
- Keep owner deletion separate from Admin moderation.
- Centralize public Post availability and preserve legacy-document compatibility.
- Keep Post creation and Post-image upload as separate operations.
- Keep Cloudinary details behind storage helpers/services.
- Preserve unique compound indexes as race-safe duplicate guards.
- Do not couple Reports automatically to Post hide/restore.
- Do not replace offset pagination globally without a measured, versioned migration.
- Treat the Dashboard as a read-only operational snapshot, not a transactional ledger.
- Do not begin a big-bang refactor before automated regression coverage exists.

## Known Technical Debt / Deferred Work

- Automated test suite is not yet established.
- Browser refresh-token cookie migration is pending.
- Magic-byte image validation is pending.
- No multi-device session collection/token-family model.
- No production deployment verification or monitoring/alerting.
- Regex search and offset pagination are acceptable at current scale but must be measured.
- `likesCount` needs a future reconciliation/maintenance path in case of drift.
- Comment counts are not denormalized.
- Exact API inventory is derived from route code rather than a generated specification.
- The Post title maximum differs between the model and one update validation schema.
- Legacy `/uploads` static serving requires review after confirming no active dependency.
- Cloudinary infrastructure logging still requires enforced centralized redaction.
- Stale/demoted-Admin and inactive-Admin Dashboard authorization need automated regression
  coverage at the start of Sprint 8.

---

# Sprint 8 — Automated Testing, Quality, and Safe Refactoring

## Sprint Goal

Create a reliable automated safety net for the verified backend behavior, then perform only
small, evidence-based refactors while continuously proving that API contracts, permissions,
transactions, visibility rules, and data-integrity invariants remain unchanged.

Sprint 8 is not a rewrite. Testing comes before broad structural refactoring.

## Required Initial Audit

Before installing a test framework or editing production code:

1. Inspect the current `package.json`, TypeScript module target, Node version, and build scripts.
2. Map all route groups and their authentication/authorization middleware order.
3. Identify operations that require MongoDB transactions and therefore require a replica-set
   capable test database.
4. Identify Cloudinary calls that must be mocked or replaced by a test storage adapter.
5. Identify time-, token-, random-ID-, and environment-dependent behavior requiring deterministic
   test control.
6. Define test data isolation and cleanup rules before writing feature tests.
7. Select the smallest compatible test tooling; do not add overlapping frameworks.

## Sprint 8A — Test Foundation

Required outcomes:

- One TypeScript-compatible test runner.
- HTTP integration testing against `createApp()` without opening a real network port.
- An isolated MongoDB test environment.
- Replica-set support for User Administration and Post Moderation transaction tests.
- Deterministic database setup/cleanup between tests.
- Reusable, minimal factories/fixtures for Users, Posts, Comments, Likes, Saves, and Reports.
- Cloudinary/upload behavior mocked at the existing storage boundary; tests must not modify
  real Cloudinary assets.
- Test environment validation separated safely from development/production credentials.
- Standard scripts such as:

```text
npm test
npm run test:watch
npm run test:coverage
```

Exact script names and libraries remain subject to the Sprint 8 repository/tooling audit.

## Sprint 8B — High-Risk Regression Coverage

### Authentication and Current User State

- Register/login positive and negative paths.
- Access-token authentication failures.
- Refresh rotation and old-token reuse behavior.
- Logout and password-change refresh-session invalidation.
- Inactive user blocked despite an old valid access token.

### Authorization and Admin Security

- No authentication returns `401`.
- Normal user returns `403` on Admin routes.
- Stale/demoted Admin token is rejected after database role change.
- Inactive Admin with an old token is rejected.
- Current active Admin succeeds.
- Self-suspension and protected Admin-target transitions remain blocked.

### User Administration Transactions

- Suspend and reactivate allowed transitions.
- Repeated transitions return `409`.
- User state and AuditEvent commit together.
- Transaction rollback leaves neither partial User state nor partial AuditEvent.

### Post Moderation Transactions and Visibility

- Hide and restore allowed transitions.
- Repeated transitions return `409`.
- Owner-deleted Post moderation returns `409`.
- Legacy Post without `moderationStatus` is effectively visible.
- Post write and AuditEvent commit/rollback together.
- Hidden Post disappears consistently from Posts, Comments, Likes, Saves, and new Reports.
- Existing Comments/Likes/Saves/Reports and engagement counters remain preserved.
- Owner edits do not clear Admin moderation.

### Likes, Saves, and Counters

- Unique relationship behavior under duplicate/concurrent requests.
- Idempotent active/deleted toggles.
- Atomic `likesCount` behavior and non-negative protection.
- Saved-Post aggregation keeps returned data and pagination total consistent.

### Reports

- Supported target validation.
- Duplicate-report policy.
- Hidden/unavailable target rejection for new Reports.
- Admin Report history remains reviewable after target hide/delete.
- Valid and invalid Report state transitions.

### Dashboard

- Active Admin receives a consistent safe snapshot.
- No auth, normal user, stale Admin, and inactive Admin are rejected correctly.
- Empty database returns zeroes, not `null`/`undefined`.
- Mixed data produces correct non-overlapping categories.
- No sensitive fields or full documents are exposed.

## Sprint 8C — Controlled Correctness Refactors

Only after the relevant regression tests are green:

1. Unify the Post title maximum across model and validation.
2. Review and remove legacy `/uploads` serving only after proving it is unused.
3. Replace infrastructure `console.error` calls with centralized safe logging.
4. Refresh or remove outdated generated project-tree documentation.
5. Extract only genuinely duplicated ObjectId, pagination, controlled-sort, and regex-escaping
   rules into focused shared helpers.
6. Decompose oversized services such as Reports only when tests prove behavior preservation.
7. Keep public `/api/v1` routes, response envelopes, status codes, and visibility semantics
   backward compatible.

## Out of Scope for Sprint 8

- Big-bang rewrite.
- Generic Repository/BaseService/BaseController framework.
- Frontend implementation.
- Production deployment.
- Redis, queues, event bus, or microservices.
- Cursor-pagination migration.
- Speculative indexes or caching.
- Browser refresh-cookie migration unless explicitly promoted to a dedicated approved phase.
- Broad API version changes.

## Sprint 8 Definition of Done

```text
npm run typecheck   PASS
npm run build       PASS
npm test            PASS
```

Additionally:

- High-risk Auth/Admin/Moderation permission matrices are automated.
- Transaction success and rollback invariants are tested against a replica-set capable DB.
- No automated test uses production/development MongoDB or real Cloudinary assets.
- Tests are deterministic and isolated.
- Refactors are small, reviewed, and protected by tests written before the structural change.
- Documentation is updated only after the verified implementation is accepted.

## Immediate Next Action

Begin Sprint 8 with a repository and tooling audit, then produce a focused implementation
proposal for the test foundation before installing dependencies or refactoring production
modules.