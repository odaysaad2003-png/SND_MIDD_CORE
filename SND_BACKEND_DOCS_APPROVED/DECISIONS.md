# Approved Decisions

This file records durable decisions. New entries are appended with a status. Existing
entries are not silently rewritten; a superseding decision should reference the old one.

## ADR-001 — Modular Monolith Backend

**Status:** Accepted  
**Decision:** Keep one Express application organized by domain modules. Do not introduce
microservices until operational boundaries and measured scale justify them.  
**Consequence:** Modules may collaborate inside one process, but circular dependencies and
uncontrolled cross-module writes must be avoided.

## ADR-002 — Use “Posts,” Not “Listings”

**Status:** Accepted  
**Decision:** `posts` is the core content term in code, routes, and documentation.  
**Reason:** A community post can represent requests, offers, announcements, stories, and
future content types; “listing” is too marketplace-specific.

## ADR-003 — Backend-First Sprint Track

**Status:** Accepted  
**Decision:** The current SND Community Core roadmap is backend-only through the current
milestone. Frontend integration is separately scoped.  
**Consequence:** Backend sprints must not add React/Next.js work implicitly.

## ADR-004 — Standard Layering

**Status:** Accepted  
**Decision:** Use route → middleware → validation → controller → service → model/database
→ response. Controllers remain thin; services hold business rules and database work.  
**Consequence:** Presenters, storage helpers, or query builders may support this flow, but
controllers must not access Mongoose directly.

## ADR-005 — Standard API Envelope

**Status:** Accepted  
**Decision:** Successful JSON responses use `{ success, data, meta? }`; errors use
`{ success: false, error: { code, message, details? } }`. A `204` response has no body.

## ADR-006 — Authentication Identity Is Server-Derived

**Status:** Accepted  
**Decision:** The acting user ID and role come from verified authentication context. Client
payloads never define owner, author, reporter, user, role, or admin state.

## ADR-007 — Interim Refresh Token Transport

**Status:** Accepted, temporary  
**Decision:** During backend/Postman development, refresh tokens are accepted and returned
in JSON. They are rotated and stored hashed.  
**Exit condition:** Before production browser integration, migrate refresh tokens to an
HttpOnly cookie strategy and review CSRF/CORS behavior.

## ADR-008 — Single Active Refresh Session

**Status:** Accepted, temporary  
**Decision:** Store one refresh-token hash per user, meaning one active refresh session.  
**Consequence:** A new login/rotation can invalidate another device. Multi-device support
requires a sessions collection or token-family model and is deferred.

## ADR-009 — Soft Delete Owned Content

**Status:** Accepted  
**Decision:** Posts and comments use status/deletedAt semantics instead of immediate hard
delete. Public queries exclude deleted content; protected operations treat unavailable
content according to the module contract.

## ADR-010 — Separate Post Creation and Image Upload

**Status:** Accepted  
**Decision:** Create a post with JSON first, then upload images through a dedicated
multipart endpoint.  
**Reason:** Validation, retries, ownership, cleanup, and storage failures remain isolated.

## ADR-011 — Cloudinary for Current Image Storage

**Status:** Accepted  
**Decision:** Avatars and post images use Cloudinary. Store display URLs separately from
internal public IDs needed for cleanup.  
**Consequence:** New production upload code must not depend on local persistent disk.

## ADR-012 — Like and Save Relationship Documents

**Status:** Accepted  
**Decision:** Likes and saves use one document per `(post, user)` pair, protected by a
unique compound index, with active/deleted toggle semantics.  
**Reason:** The database index is the race-safe duplicate guard.

## ADR-013 — Denormalize Only Publicly Useful Counts

**Status:** Accepted  
**Decision:** Keep `Post.likesCount` as an atomically maintained denormalized counter. Do
not add `savesCount` because saves are private. Comment count remains deferred until a
proven read requirement exists.

## ADR-014 — Offset Pagination as Current Standard

**Status:** Accepted  
**Decision:** Use validated `page`/`limit` pagination with a consistent metadata envelope
for current collection endpoints.  
**Exit condition:** Adopt cursor pagination only for endpoints whose scale/order guarantees
justify a versioned migration.

## ADR-015 — Controlled Sort Values

**Status:** Accepted  
**Decision:** Public clients select from validated sort enums such as `latest`/`oldest`.
Do not pass arbitrary MongoDB field names or sort objects from the client.

## ADR-016 — Reports as a Moderation Workflow

**Status:** Accepted  
**Decision:** Reports are first-class records that link an authenticated reporter to a
supported target and move through the model-defined moderation workflow. Admin review is
protected, validated, and separated from public content ownership.  
**Consequence:** Exact states/actions remain centralized in the report model/service; new
code must not invent alternate status strings in controllers.

## ADR-017 — Aggregation for Joined Paginated Views

**Status:** Accepted  
**Decision:** Use MongoDB aggregation where a response requires joined relationship data,
filtering, and total-count metadata in one coherent query, as in saved-post and report
views. Keep pipelines typed and split into readable stages/builders when they grow.

## ADR-018 — Code and Verification Before Documentation Completion

**Status:** Accepted  
**Decision:** A sprint is not marked complete until code passes typecheck/build and the
new behavior is tested. Documentation describes verified implementation, not proposed
code.

## ADR-019 — Current Database State Governs High-Impact Admin Authorization

**Status:** Accepted  
**Decision:** Route-level `role: admin` token checks are only a baseline gate. High-impact
admin services revalidate the acting account's current existence, active state, and admin
role from MongoDB. Mutating transactions perform that revalidation using the same
`ClientSession` as the protected write.  
**Reason:** JWT role claims can become stale after role or account-state changes.

## ADR-020 — Audit Writes Share the High-Impact Mutation Transaction

**Status:** Accepted  
**Decision:** User suspend/reactivate and Post hide/restore writes must persist their typed
AuditEvent in the same MongoDB transaction and `ClientSession`.  
**Consequence:** The protected state change and its audit record commit or roll back together.
Audit writers accept narrow allowlisted state, not arbitrary documents or request payloads.

## ADR-021 — Post Owner Lifecycle and Admin Moderation Are Separate

**Status:** Accepted  
**Decision:** Owner soft delete continues to use `status` and `deletedAt`. Admin moderation
uses independent `moderationStatus`, `hiddenAt`, `hiddenBy`, and `moderationReason` fields.  
**Consequence:** Admin restore never clears owner deletion state and cannot resurrect content
that its owner deleted. Hide/restore changes visibility only and does not delete Cloudinary
assets or relationship records.

## ADR-022 — Canonical Public Post Visibility Includes Legacy Compatibility

**Status:** Accepted  
**Decision:** Public Post availability is centralized in the Post domain and requires an
active owner lifecycle plus either explicit `moderationStatus: visible` or a physically
missing moderation field on a legacy document.  
**Consequence:** Hidden Posts are consistently unavailable through Posts, Comments, Likes,
Saves, and new Reports. Unknown moderation values fail closed rather than being treated as
visible.

## ADR-023 — Reports and Post Moderation Remain Separate Workflows

**Status:** Accepted  
**Decision:** Report status changes do not automatically hide/restore Posts, and Post
hide/restore does not automatically update Reports.  
**Reason:** Automatic coupling requires a separately designed orchestration policy and would
mix review records with content-visibility state prematurely.

## ADR-024 — Admin Dashboard Is a Non-Transactional Operational Snapshot

**Status:** Proposed, pending Sprint 7D manual verification  
**Decision:** The admin dashboard uses separate typed domain aggregations/counts executed
concurrently after current-admin revalidation. It does not use a cross-domain transaction.  
**Reason:** Dashboard figures are operational telemetry, not a financial ledger or a
cross-document write invariant. Small natural read-time skew is acceptable and avoids an
expensive, unnecessary transaction boundary.
