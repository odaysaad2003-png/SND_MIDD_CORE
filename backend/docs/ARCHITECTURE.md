# Architecture

## System Context

SND Community Core is currently a backend-first modular monolith:

```text
Client / Postman / future Next.js
              │ HTTPS + JSON/multipart
              ▼
      Express REST API (/api/v1)
              │
       Mongoose + Cloudinary
          │             │
          ▼             ▼
     MongoDB Atlas   Image CDN/storage
```

A future Next.js frontend will consume the API as an independent application. It has no
direct database or storage access.

## Backend Directory Responsibilities

```text
src/
  config/        environment and infrastructure configuration
  constants/     shared stable constants and error codes
  middleware/    cross-cutting HTTP concerns
  modules/       domain modules
  shared/        reusable infrastructure abstractions (for example storage)
  types/         global/Express type augmentation
  utils/         small framework/application utilities
  app.ts         Express wiring; no network listen
  server.ts      process startup, DB connection, listen, graceful shutdown
```

A typical module contains only what it needs:

```text
modules/posts/
  post.model.ts
  post.validation.ts
  post.service.ts
  post.controller.ts
  post.routes.ts
  post.upload.middleware.ts     # when module-specific HTTP upload handling is needed
```

File names use singular domain names (`post.service.ts`) while route resources are plural
(`/posts`). Preserve the naming style already used in the repository.

## Request Lifecycle

```text
route
  → cross-cutting middleware
  → authentication/authorization middleware where applicable
  → request validation
  → controller
  → service
  → model/database and/or shared infrastructure
  → presenter/sanitizer
  → standard response
```

Not every endpoint needs every possible component. A health endpoint may not need a model;
a simple service may not need a repository. The invariant is that responsibilities are not
collapsed into controllers or route files.

## Layer Contracts

### Routes

- Declare method, path, middleware order, validation, and controller.
- Contain no business rules and no database queries.
- Mount static routes such as `/me` before dynamic routes such as `/:postId`.
- Mount nested routers before generic dynamic handlers that could swallow the path.

### Middleware

- Handles HTTP cross-cutting concerns: request IDs, rate limiting, authentication, role
gates, parsing, upload limits, and global errors.
- Must call `next(error)` rather than building ad hoc error envelopes.
- Authentication establishes identity; it does not replace resource-level authorization.

### Validation

- Validates and transforms `body`, `params`, and `query` before the controller.
- Uses strict object schemas for mutating payloads to prevent mass assignment.
- Coerces pagination inputs deliberately and applies defaults/maximums.
- Does not perform substantial database business logic.

### Controllers

- Extract validated values and authenticated context.
- Call one or more service operations.
- Choose the HTTP status and standard response envelope.
- Never access Mongoose models or Cloudinary directly.

### Services

- Own business rules, authorization/ownership, state transitions, and data integrity.
- Are independent of Express `Request` and `Response`.
- May coordinate multiple models and shared infrastructure services.
- Use atomic database operations for counters/toggles where concurrency matters.
- Use transactions only when an invariant truly spans multiple writes and cannot be made
safe with atomic updates/idempotency/unique indexes.

### Models

- Define persistence schema, required fields, enums, indexes, defaults, and data-level
constraints.
- Use `select: false` for secrets/hashes.
- Keep indexes aligned with real query shapes; avoid speculative index accumulation.

### Presenters / Sanitizers

- Convert database documents/aggregation rows into public API shapes.
- Convert ObjectIds to strings and hide storage IDs, hashes, internal flags, and unrelated
user data.
- Fail safely when required populated data is unexpectedly missing.

### Shared Infrastructure

- Cloud storage, token helpers, logging, and similar infrastructure remain behind focused
helpers/services.
- Domain services depend on the abstraction/contract, not raw vendor calls scattered
through controllers.

## Module Dependency Rules

- Modules may read another module's model/service when the domain rule requires it, as in
comments validating an active post.
- Prefer a public service/helper when cross-module logic is reusable or security-sensitive.
- Avoid circular imports and two modules mutating each other's internals unpredictably.
- Shared constants belong in `constants/` only when they are genuinely cross-domain.

## Data and Consistency Patterns

### Soft Delete

Posts/comments are not physically removed during normal user actions. Public queries must
explicitly filter active/non-deleted records. Soft-deleted parent resources must not leak
active child threads.

### Relationship Toggles

Likes/saves use one document per user/resource pair plus a unique compound index. Service
logic handles create, restore, no-op, and duplicate-key races idempotently.

### Denormalized Counters

`likesCount` is updated with atomic `$inc` operations and guarded from becoming negative.
Read-then-write counter updates are not allowed. A future reconciliation job may repair
drift.

### Aggregation Pipelines

Use aggregation for joined, filtered, paginated read models. Pipelines should:

- `$match` as early as possible.
- preserve deterministic sorting, usually including `_id` as a tie-breaker.
- use `$facet` when returning page data and a total from the same filtered set.
- project only public fields.
- be typed as `PipelineStage[]` or with explicit stage/result types.
- be decomposed into builders when a single service function becomes difficult to review.

## API Boundary

- `/api/v1` is the stable current API version.
- Backward-incompatible route/response changes require migration planning and normally a
new version.
- Exact route contracts live in current route/validation/controller code until an OpenAPI
document is generated and verified.

## Backend-First Development Slices

For the current track, a feature slice includes:

- model/indexes
- validation
- service logic
- controller/routes
- authentication/authorization
- response sanitization
- negative-path verification
- documentation updates
- deployment/security awareness

Frontend code is added only in a dedicated frontend integration phase.

## Future Architecture — Add Only When Justified

- Repositories for substantial reusable query/data-access complexity
- Background queues for slow/retryable work
- Domain events/notifications
- Redis caching for measured hot reads
- Dedicated sessions collection for multi-device auth
- Audit-log collection for high-impact operations
- External observability and alerting

Do not introduce these solely to imitate a larger architecture.
