# Sprint Roadmap

## Roadmap Status

| Sprint | Focus | Status |
|---|---|---|
| 0 | Direction, architecture, and documentation | Completed |
| 1 | Strong backend foundation | Completed |
| 2 | Authentication core | Completed |
| 3 | Users, profile, avatar, and cloud storage migration | Completed |
| 4 | Posts, pagination, and cloud image management | Completed |
| 5 | Comments, likes, and saves | Completed |
| 6 | Reports, moderation, and aggregation | Completed |
| 7 | Admin operations and dashboard | Next |
| 8 | Automated testing and quality | Planned |
| 9 | Production deployment | Planned |
| 10 | Performance, scale, and security hardening | Planned |

The code and `PROJECT_STATE.md` define the exact implemented state. This roadmap defines
learning outcomes and sprint boundaries.

---

## Sprint 0 — Direction and Architecture

**Outcome:** Established project terminology, modular layering, API conventions, security
rules, deployment awareness, learning method, and sprint governance.

**Key decision:** Use `posts`, not `listings`.

---

## Sprint 1 — Strong Backend Foundation

**Outcome:** Implemented environment validation, app/server separation, MongoDB lifecycle,
central errors/responses, logging, request IDs, health check, Helmet, CORS, and baseline
rate limiting.

**Deep concepts:** Fail-fast startup, process lifecycle, operational errors, centralized
middleware, structured diagnostics.

---

## Sprint 2 — Authentication Core

**Outcome:** Implemented register, login, refresh rotation, logout, current-user auth,
protected routes, password hashing, refresh-token hashing, auth rate limiting, and change
password.

**Approved variance from original plan:** Refresh tokens remain JSON-body based during
backend/Postman development. HttpOnly cookie migration, email verification, forgot
password, token families, and multi-device sessions remain future work.

**Deep concepts:** Access vs refresh lifecycle, rotation/reuse detection, hash-at-rest,
generic credential errors, authentication vs authorization.

---

## Sprint 3 — Users, Profile, Avatar, and Storage

**Outcome:** Implemented authenticated profile reads/updates and avatar upload/replacement.
The original local-storage learning implementation was later migrated to Cloudinary and is
no longer the production direction.

**Deep concepts:** Multipart parsing, upload validation, safe profile presenters, storage
URLs vs internal public IDs, replacement cleanup.

---

## Sprint 4 — Posts and Images

**Outcome:** Implemented posts with title/content ownership, public active reads, current
user listing, offset pagination, search/sort, soft delete, Cloudinary multi-image upload,
and single-image removal.

**Approved implementation scope:** Current model uses active/deleted semantics; speculative
categories and open/closed/archived workflow were not added.

**Deep concepts:** Query params, pagination metadata, route ordering, soft delete, storage
abstraction, upload rollback, regex search trade-offs.

---

## Sprint 5 — Community Interaction

**Outcome:** Implemented:

- comments with parent-post validation and owner/admin mutations
- likes with unique compound index, toggle semantics, and atomic `likesCount`
- saves with unique compound index, private state, and aggregation-backed saved-post list

**Backend-only boundary:** Optimistic UI and React Query behavior belong to a later frontend
integration phase.

**Deep concepts:** Many-to-many modeling, unique indexes as race guards, idempotency,
denormalization, atomic updates, `$lookup`, `$unwind`, `$facet`, and `$project`.

---

## Sprint 6 — Reports and Moderation

**Outcome:** Implemented the Reports module and moderation core for supported targets,
including validated creation, admin-protected review/list behavior, pagination/filtering,
and aggregation-backed report read models. TypeScript typing for the aggregation pipeline
was corrected, and the completed behavior was manually verified in Postman.

**Deep concepts:** Moderation state machines, polymorphic/typed targets, admin authorization,
joined read models, pipeline stage typing, deterministic sorting, and auditability.

**Boundary:** Broad user/post administration and dashboard-wide statistics remain Sprint 7.

---

## Sprint 7 — Admin Operations and Dashboard

**Goal:** Give trusted operators safe platform visibility and control without duplicating
the completed reports core.

**Planned scope:**

- clear admin route namespace/conventions
- paginated user administration
- user active/suspended state operations with safeguards
- admin post listing and hide/restore/moderation operations aligned with existing soft-delete
semantics
- dashboard statistics/read models using aggregation
- current-admin database revalidation for high-impact actions
- audit-event design for destructive/admin actions, at least at contract/schema level
- Postman verification for privilege escalation and negative paths

**Out of scope:**

- frontend admin dashboard UI
- microservices, queues, or Redis
- rebuilding report creation/review behavior already completed
- broad analytics warehouse/event tracking

**Deep concepts:** Least privilege, stale role claims, aggregation composition, read models,
admin state transitions, audit logs, high-value IDOR/BOLA testing.

**Definition of done:**

- admin-only access is enforced at route and service boundaries
- normal users cannot enumerate/manage users or hidden content
- list endpoints are validated/paginated and return standard metadata
- dashboard pipelines are typed and tested with empty/mixed data
- high-impact operations are designed for auditability
- typecheck/build and Postman negative tests pass
- docs are updated after verification

---

## Sprint 8 — Automated Testing and Quality

**Goal:** Replace manual-only confidence with repeatable automated coverage.

**Planned scope:**

- unit tests for service invariants
- integration/API tests for core routes
- authentication/refresh tests
- permission tests: no auth, wrong owner, wrong role, inactive/deleted state
- upload validation/cleanup tests
- duplicate/concurrency behavior for likes/saves/reports where applicable
- test database strategy and fixtures/factories
- CI-ready typecheck/build/test commands

**Deep concepts:** Test pyramid, integration boundaries, deterministic test data, mocking
external storage, permission matrices, regression protection.

---

## Sprint 9 — Production Deployment

**Goal:** Deploy and verify the backend in a real production-like environment.

**Planned scope:**

- hosting selection/configuration
- production environment variables and secrets
- MongoDB Atlas production access/backups
- Cloudinary environment separation
- CORS and reverse-proxy/trust-proxy verification
- health/readiness checks and graceful shutdown
- structured external logs, uptime monitoring, and rollback
- production smoke tests

**Browser cookie migration may occur here or in a dedicated frontend-auth sprint, but it
must be explicitly scoped and tested.**

---

## Sprint 10 — Performance, Scale, and Security Hardening

**Goal:** Measure and harden the verified system rather than optimize speculatively.

**Planned scope:**

- query/index review using `explain()`
- aggregation performance review
- cursor pagination only for justified endpoints
- caching only for measured hot read paths
- refresh-token session families/multi-device strategy
- secure cookie/CSRF final review
- magic-byte upload validation
- enforced log redaction
- audit-log persistence
- abuse-specific rate limits
- error monitoring and alerts
- data reconciliation/maintenance tools for denormalized counters

**Deep concepts:** Query selectivity, consistency vs performance, cache invalidation,
session revocation, defense in depth, observability vs logging.
