# SPRINT_ROADMAP.md

This roadmap covers Sprint 0 through Sprint 10. Each sprint after Sprint 0
includes four learning sections: **What we learned before**, **What we will
build now**, **Why this matters in the real SND product**, and **New
concepts we must understand deeply**.

---

## Sprint 0 — Audit, Direction & Architecture
**Goal:** Define the system direction, documentation, architecture rules,
and learning roadmap. No feature code.

Deliverables: `PROJECT_STATE.md`, `ARCHITECTURE.md`, `API_CONVENTIONS.md`,
`SECURITY_RULES.md`, `DEPLOYMENT_NOTES.md`, `SPRINT_ROADMAP.md`,
`LEARNING_NOTES.md`.

---

## Sprint 1 — Strong Backend Foundation
**Goal:** Build the strong backend column: config, env validation,
app/server separation, error handling, logger, request id, health check,
security middlewares, response format.

- **What we learned before:** SND Mini gave us a working Express + TypeScript
  + Mongoose backend, but config, error handling, and logging were ad hoc.
- **What we will build now:** Centralized config loader with env validation,
  a clean split between `app.ts` (Express wiring) and `server.ts` (process
  startup), a global error-handling middleware, a structured logger, a
  request-id middleware, a `/health` route, and baseline security middleware
  (`helmet`, CORS, rate limiting).
- **Why this matters in the real SND product:** Every future feature depends
  on this foundation being solid — inconsistent error handling or missing
  env validation causes silent failures in production that are hard to
  debug at scale.
- **New concepts we must understand deeply:** Fail-fast startup validation,
  centralized error handling vs try/catch sprawl, structured logging,
  request tracing via request id, the difference between `app.ts` and
  `server.ts`.


  ### Definition of Done — Sprint 1
- [ ] `app.ts` and `server.ts` are separated correctly.
- [ ] Environment variables are validated at startup and fail fast when missing.
- [ ] Database connection is centralized and logged safely.
- [ ] Global error handler exists and returns `API_CONVENTIONS.md` error format.
- [ ] `AppError` exists for operational errors.
- [ ] `asyncHandler` exists and is used in async controllers.
- [ ] API response helpers exist and follow the standard success format.
- [ ] Request id middleware exists and is included in logs/responses where useful.
- [ ] Structured logger exists and does not log secrets/tokens.
- [ ] `/health` or `/api/v1/health` endpoint exists.
- [ ] `helmet`, CORS, and baseline rate limiting are configured.
- [ ] No business feature code is added.
- [ ] `PROJECT_STATE.md` is updated at the end of the sprint.

---

## Sprint 2 — Auth v2 Professional
**Goal:** Deepen authentication before using external auth providers in the
future. Include access tokens, refresh tokens, HttpOnly cookies, logout,
password reset refinement, change password, email verification concept,
roles, ownership.

- **What we learned before:** SND Mini's auth covered register/login/JWT/
  protected routes using a single token in `localStorage`.
- **What we will build now:** Short-lived access tokens + rotating refresh
  tokens stored in HttpOnly cookies, a real logout flow (token invalidation),
  password reset hardening, change-password flow, an email verification
  concept (even if email sending is mocked initially), and formal
  role/ownership middleware.
- **Why this matters in the real SND product:** Auth is the security
  backbone of the whole platform — weak auth undermines every other feature,
  and this is also the natural on-ramp to plugging in an external provider
  (e.g. OAuth) later without redesigning the user model.
- **New concepts we must understand deeply:** Access vs refresh token
  lifecycles, token rotation and reuse detection, HttpOnly/Secure/SameSite
  cookie semantics, CSRF considerations when using cookies, secure
  password-reset token design.

---

## Sprint 3 — Users, Profile & Avatar
**Goal:** Build real user profile management with avatar upload. Learn
FormData, image validation, upload middleware, image preview, saving avatar
URL, updating user cache.

- **What we learned before:** SND Mini had basic user profile fields but no
  file upload handling.
- **What we will build now:** Profile update endpoints, `multipart/form-data`
  handling middleware, server-side image validation (type/size), avatar
  upload to storage, saving the resulting URL on the user document, and
  frontend cache updates (React Query) after a successful upload.
- **Why this matters in the real SND product:** Community trust relies
  partly on real profiles; avatar upload is also the first file-upload
  feature, establishing the pattern reused for post images in Sprint 4.
- **New concepts we must understand deeply:** `multipart/form-data` vs JSON
  bodies, client-side vs server-side image validation, optimistic UI updates,
  cache invalidation after a mutation.

---

## Sprint 4 — Posts v2 with Images
**Goal:** Replace listings thinking with posts. Build posts with image
upload, multiple images later, search, filters, sorting, pagination, post
status, ownership, soft delete.

- **What we learned before:** SND Mini's listings CRUD gave us the base
  pattern for a resource with ownership and validation.
- **What we will build now:** The `posts` module fully replacing `listings`,
  with categories (help request, offer, announcement, campaign, update,
  story), image upload reusing the Sprint 3 pattern, search/filter/sort/
  pagination per `API_CONVENTIONS.md`, a post status field (open/closed/
  archived), and soft delete instead of hard delete.
- **Why this matters in the real SND product:** Posts are the core content
  type of the entire platform — this sprint is effectively rebuilding the
  product's primary feature on a much stronger foundation.
- **New concepts we must understand deeply:** Soft delete patterns
  (`deletedAt` field + query filtering), multi-image upload handling,
  compound MongoDB indexes for filter/sort performance, search strategy
  trade-offs (regex vs text index vs external search).

---

## Sprint 5 — Community Interaction
**Goal:** Likes, favorites/saves, comments. Learn many-to-many
relationships, unique indexes, optimistic UI, cache invalidation, duplicate
prevention.

- **What we learned before:** Posts (Sprint 4) gave us a solid single-resource
  pattern; this sprint introduces relationships between resources.
- **What we will build now:** Like/unlike and save/unsave on posts (unique
  compound index on `userId + postId` to prevent duplicates), a comments
  sub-resource with its own ownership rules, and optimistic UI updates on the
  frontend with correct rollback on failure.
- **Why this matters in the real SND product:** Interaction features are
  what turn a list of posts into an actual community — they also introduce
  data modeling patterns (many-to-many, unique constraints) used repeatedly
  later.
- **New concepts we must understand deeply:** Many-to-many modeling in
  MongoDB, unique compound indexes for duplicate prevention, optimistic UI
  with rollback, cache invalidation strategy across related queries.

---

## Sprint 6 — Reports & Moderation
**Goal:** Report posts/comments, admin review, archive/hide content,
moderation workflow.

- **What we learned before:** Sprint 5 gave us relationship modeling; this
  sprint adds a workflow/state-machine element on top of existing resources.
- **What we will build now:** A `reports` resource linking a reporter, a
  target (post or comment), and a reason; an admin review queue; and
  moderation actions (hide/archive) that affect the target resource's
  visibility without deleting data.
- **Why this matters in the real SND product:** A community platform without
  moderation tooling cannot stay safe or usable at scale — this is a
  trust-and-safety requirement, not an optional feature.
- **New concepts we must understand deeply:** Simple state machines
  (pending → reviewed → actioned/dismissed), visibility flags vs deletion,
  designing admin workflows that are auditable.

---

## Sprint 7 — Admin Dashboard
**Goal:** Admin statistics, manage users, manage posts, manage reports,
admin-only routes, aggregation queries.

- **What we learned before:** Sprint 6 introduced the `reports` resource and
  basic admin-only routes; this sprint expands admin capability broadly.
- **What we will build now:** An admin-only route namespace, user management
  (view/suspend), post management (hide/restore), a reports management view,
  and dashboard statistics using MongoDB aggregation pipelines.
- **Why this matters in the real SND product:** Operators of the platform
  need visibility and control without touching the database directly —
  this is standard for any real production community product.
- **New concepts we must understand deeply:** MongoDB aggregation pipeline
  basics (`$match`, `$group`, `$project`), designing admin-only route
  security carefully (this is a high-value target for privilege escalation
  bugs), building dashboard-style read-heavy endpoints.

---

## Sprint 8 — Testing & Quality
**Goal:** Unit tests, integration tests, API permission tests, auth tests,
upload tests, error tests.

- **What we learned before:** By this point, most core features exist but
  have only been manually tested.
- **What we will build now:** Unit tests for service-layer logic,
  integration tests for key API routes, explicit permission tests (wrong
  user, wrong role, no auth), auth flow tests, upload validation tests, and
  error-handling tests.
- **Why this matters in the real SND product:** Tests are what let the team
  change code confidently without re-manually-testing the entire app every
  time — this becomes critical as the codebase grows.
- **New concepts we must understand deeply:** Unit vs integration testing,
  mocking the database vs using a test database, test-driven thinking for
  permission edge cases, structuring tests to mirror the module layout.

---

## Sprint 9 — Deployment
**Goal:** Deploy backend and frontend correctly, configure environment
variables, CORS, cookies, production API URLs, logs, health checks.

- **What we learned before:** `DEPLOYMENT_NOTES.md` was written in Sprint 0
  and referenced throughout; this sprint executes it for real.
- **What we will build now:** Actual deployment of the backend and frontend
  to their hosting platforms, production environment variables, verified
  CORS and cookie behavior in production, confirmed health check and log
  output.
- **Why this matters in the real SND product:** A feature that isn't
  deployed correctly doesn't exist for real users — this sprint proves the
  whole system works outside of `localhost`.
- **New concepts we must understand deeply:** Environment parity issues
  (works locally, fails in production), platform-specific deployment
  quirks, verifying cross-origin cookie behavior for real, production
  debugging without direct terminal access.

---

## Sprint 10 — Performance, Scale & Security Hardening
**Goal:** Indexes, query optimization, cursor pagination, caching basics,
CDN/storage strategy, rate limiting, secure cookies, file security, audit
logs, monitoring awareness.

- **What we learned before:** Every prior sprint built correct, secure
  features; this sprint makes them fast and resilient at scale.
- **What we will build now:** Review and add MongoDB indexes based on real
  query patterns, migrate list endpoints to cursor-based pagination, add
  basic caching for expensive reads, confirm CDN usage for stored images,
  tighten rate limiting, review cookie security settings, add audit logging
  for sensitive actions, and add basic uptime/error monitoring.
- **Why this matters in the real SND product:** A platform that works for
  10 users but falls over at 10,000 users isn't production-ready — this
  sprint is where "it works" becomes "it scales and stays secure."
- **New concepts we must understand deeply:** Index selectivity and query
  planning (`explain()`), offset vs cursor pagination trade-offs, cache
  invalidation strategy, CDN fundamentals, audit logging design, the
  difference between logging and monitoring/alerting.
