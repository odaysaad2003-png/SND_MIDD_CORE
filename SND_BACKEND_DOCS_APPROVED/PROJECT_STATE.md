# Project State

## Project

**Name:** SND Community Core Backend  
**Previous prototype:** SND Mini  
**Current milestone:** End of Sprint 6  
**Next sprint:** Sprint 7 — Admin Operations & Dashboard

## Current Status

Sprints 0 through 6 are complete. The backend core supports authentication, profiles,
Cloudinary uploads, posts, comments, likes, saves, reports, moderation, pagination,
filtering, and aggregation-backed list queries. Completed routes have been manually
verified with Postman, and the Sprint 6 TypeScript aggregation typing issue was resolved.

This file is a **current snapshot**, not an append-only sprint diary. Durable decisions
belong in `DECISIONS.md`; future scope belongs in `SPRINT_ROADMAP.md`.

## Implemented Foundation

- `app.ts` and `server.ts` have separate responsibilities.
- Environment variables are validated at startup.
- MongoDB connection lifecycle is centralized.
- Standard success and error responses are centralized.
- `AppError`, `asyncHandler`, request IDs, structured logging, Helmet, CORS, and
  baseline rate limiting are present.
- `GET /api/v1/health` is available for health verification.

## Implemented Authentication

- Register, login, refresh, logout, and authenticated current-user retrieval.
- Short-lived access tokens and longer-lived rotating refresh tokens.
- Separate access-token and refresh-token secrets.
- Password hashes and refresh-token hashes are excluded from normal queries.
- Refresh tokens are hashed at rest and checked during refresh.
- Refresh-token reuse/hash mismatch revokes the current stored session.
- Auth-specific rate limiting is applied to sensitive endpoints.
- Change-password behavior is implemented.
- Current transport remains JSON-body based for backend/Postman development.

### Current Auth Limitations

- One active refresh token/session per user.
- Browser-safe HttpOnly cookie transport is not implemented yet.
- Full token-family/session-device tracking is not implemented.
- Email verification and forgot-password flows are not implemented.

## Implemented Users and Storage

- Read and update the authenticated user's safe profile fields.
- Upload and replace a current user's avatar.
- Avatar responses expose a display URL while Cloudinary public identifiers remain
  internal for deletion/replacement.
- Avatar and post-image storage were migrated from local disk to Cloudinary.
- Legacy local-storage notes are historical and must not guide new production code.

## Implemented Posts

- Public active-post feed with offset pagination, search, and controlled sorting.
- Public active-post details.
- Authenticated create and current-user post listing.
- Owner/admin update and soft delete.
- Dedicated multipart endpoint for post images, separate from JSON post creation.
- Remove an individual post image from MongoDB and Cloudinary.
- Maximum image count, file-size, and MIME allowlists are enforced.
- Post status currently follows the source model's active/deleted soft-delete semantics.
- `likesCount` is stored as a denormalized counter and updated atomically.

## Implemented Comments

- Public paginated comment listing under a post.
- Authenticated comment creation under a post.
- Owner/admin update and soft delete through direct comment routes.
- Parent posts are revalidated as active before comment operations.
- Soft-deleted comments are excluded from public reads and treated as unavailable for
  protected mutations.

## Implemented Likes

- Like, unlike, and current-user like-status operations.
- One document per `(post, user)` pair enforced by a unique compound index.
- Active/deleted toggle semantics and idempotent behavior.
- `likesCount` changes use atomic database updates, not read-modify-write logic.

## Implemented Saves

- Save, unsave, and current-user save-status operations.
- Private paginated `my saved posts` listing.
- One document per `(post, user)` pair enforced by a unique compound index.
- Active/deleted toggle semantics and idempotent behavior.
- Aggregation with lookup/facet returns active saved posts and correct pagination totals.
- No public `savesCount` is stored on posts.

## Implemented Reports and Moderation

- Reports module completed for supported report targets such as posts/comments.
- Reporter identity is derived from authenticated context.
- Report target existence/visibility and input are validated before persistence.
- Admin-protected report review/listing workflow is implemented.
- Report list/read behavior uses validated pagination/filter/sort inputs.
- MongoDB aggregation is used where the report view needs joined target/reporter data and
  pagination metadata.
- Moderation decisions follow the states and actions defined by the current report model
  and service; code remains authoritative for exact enum and route names.
- Sprint 6 endpoints were manually tested in Postman after typecheck passed.

## Stable Decisions That Must Be Preserved

- Use `posts`, never `listings`, in new code and documentation.
- Preserve the modular route/controller/service/model separation.
- Do not trust client-supplied identity, role, owner, status, counters, storage IDs, or
  moderation metadata.
- Preserve soft-delete semantics for posts/comments and toggle semantics for likes/saves.
- Keep post creation and post-image upload as separate operations.
- Keep Cloudinary details behind storage helpers/services.
- Preserve unique compound indexes as the race-safe duplicate guard for likes/saves and
  any equivalent relationship rules.
- Do not replace offset pagination globally without a measured, versioned migration.

## Known Technical Debt / Deferred Work

- Automated test suite is not yet established.
- Browser refresh-token cookie migration is pending.
- Magic-byte image validation is pending.
- No multi-device session collection/token-family model.
- No formal audit-log collection for admin/moderation actions.
- No production deployment verification or monitoring/alerting.
- Regex search and offset pagination are acceptable at current scale but must be measured.
- `likesCount` needs a future reconciliation script/maintenance path in case of drift.
- Comment counts are not denormalized.
- Exact API inventory is currently derived from route code rather than a generated spec.

## Verification Standard Before Declaring a Sprint Complete

- `npm run typecheck`
- `npm run build`
- Automated tests when available
- Manual Postman verification for new/changed routes until Sprint 8 completes test coverage
- Negative authorization tests: no auth, wrong user, wrong role, invalid/deleted target
- Documentation update only after successful verification

## Next Sprint Boundary

Sprint 7 may add admin operations and dashboard statistics, but it must not:

- Rebuild the completed reports core.
- Introduce frontend work.
- Change auth transport without a dedicated security migration plan.
- Rename existing routes or response shapes without compatibility review.
- Add repository/caching/event infrastructure merely for architectural fashion.
