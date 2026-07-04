# ARCHITECTURE.md

## High-Level Architecture

SND Community Core is a two-app system:

- **Backend**: Node.js + Express + TypeScript + MongoDB/Mongoose, exposing a
  versioned REST API (`/api/v1`).
- **Frontend**: Next.js, consuming the API through a dedicated API client
  layer and React Query.

The two apps are deployed and scaled independently. The backend has no
knowledge of how the frontend renders anything; the frontend has no direct
database access — all data flows through the API.

```
┌─────────────┐        HTTPS/JSON        ┌──────────────┐        Mongoose        ┌───────────┐
│   Next.js    │ ───────────────────────▶ │   Express     │ ─────────────────────▶ │  MongoDB   │
│  (frontend)  │ ◀─────────────────────── │  (backend)    │ ◀───────────────────── │  (Atlas)   │
└─────────────┘                          └──────────────┘                        └───────────┘
```

## Backend Structure Philosophy

Every backend feature is split into strict layers, each with one
responsibility. No layer skips another.

```
src/
  config/         environment, db connection, constants
  middleware/      auth, error handler, request id, rate limit, etc.
  modules/
    posts/
      posts.routes.ts
      posts.controller.ts
      posts.service.ts
      posts.validation.ts
      posts.model.ts
    users/
      ...
  utils/
  app.ts           express app wiring (no listen())
  server.ts        starts the http server (calls app.listen())
```

Rules:
- **Routes** only map HTTP verb + path to a controller function. No logic.
- **Validation** checks and shapes incoming data before it reaches the
  controller.
- **Controllers** parse the request, call the service, and shape the HTTP
  response. No direct database access, no business logic.
- **Services** hold business logic and talk to the database (via models).
  Services are framework-agnostic — they don't know about `req`/`res`.
- **Models** define schema, indexes, and data-level constraints only.

## Frontend Structure Philosophy

```
src/
  app/ or pages/         Next.js routing
  components/             reusable UI components
  features/
    posts/
      api.ts              raw API functions (calls api-client)
      hooks.ts             React Query hooks wrapping api.ts
      components/          feature-specific UI
  lib/
    api-client.ts          shared fetch/axios wrapper (base URL, auth header, error handling)
  types/
```

Feature folders keep everything related to one domain (e.g. `posts`)
together, instead of spreading files by technical type only.

## Request Lifecycle

### Backend Flow
```
route → middleware → validation → controller → service → model/database → response
```

1. **Route** matches the HTTP method + path.
2. **Middleware** runs first (auth check, request id, rate limiting, etc.).
3. **Validation** ensures the request body/params/query are well-formed.
4. **Controller** extracts what it needs and calls the service.
5. **Service** executes business logic and talks to the model/database.
6. **Model/database** persists or retrieves data.
7. **Response** is shaped into the standard API response format and sent
   back through the controller.

### Frontend Flow
```
page/component → React Query hook → API function → api-client → backend
```

1. **Page/component** calls a React Query hook (e.g. `usePosts()`).
2. **React Query hook** wraps an API function with caching, loading, and
   error state.
3. **API function** (in `features/posts/api.ts`) knows the specific
   endpoint/shape for that call.
4. **api-client** is the single shared layer that actually performs the
   HTTP request, attaches auth headers, and does baseline error handling.
5. **Backend** responds; the response flows back up through the same chain.

## Vertical Slice Development Strategy

Starting from Sprint 2 onward, every feature is built as a complete vertical
slice, not layer-by-layer across the whole app. A slice for a single feature
includes:

- Backend model/schema
- Validation
- Service logic
- Controller
- Routes
- Permissions
- Error handling
- Frontend API function
- React Query hook
- UI states (loading, empty, error, success)
- Basic tests
- Deployment awareness

This keeps each sprint scoped, testable, and demoable end-to-end, instead of
leaving half-finished layers across the whole codebase.

## Module Naming Rules

- Use **plural, lowercase, kebab-case** for route paths: `/posts`,
  `/users/me`.
- Use **posts**, not **listings**, anywhere in code, folders, files, and
  variable names going forward.
- File naming pattern per module: `<module>.routes.ts`,
  `<module>.controller.ts`, `<module>.service.ts`, `<module>.validation.ts`,
  `<module>.model.ts`.
- Frontend feature folders match backend module names 1:1 where possible
  (`features/posts` ↔ backend `modules/posts`).

## Why We Separate Controller, Service, Validation, Model, and Routes

- **Testability** — services can be unit tested without spinning up HTTP.
- **Replaceability** — a controller can change (e.g. REST → GraphQL) without
  touching business logic.
- **Readability** — a new contributor can find "the business rule" without
  reading HTTP plumbing.
- **Reusability** — the same service logic can be reused by another
  controller, a background job, or a CLI script later.
- **Security** — validation is a single, predictable gate that every request
  passes through before touching business logic.

## Future Architecture Considerations

These are **not** built in Sprint 0 or Sprint 1, but the architecture should
not block them later:

- **Repositories** — an optional data-access layer between services and
  Mongoose models, useful if we ever swap databases or need heavy query
  reuse.
- **Queues** — for background jobs (e.g. sending emails, processing images)
  using something like BullMQ + Redis.
- **Notifications** — in-app and/or email notifications triggered by
  service-layer events.
- **Storage** — object storage (e.g. S3-compatible) for uploaded images
  instead of local disk, required for production.
- **Caching** — Redis or in-memory caching for expensive read paths (e.g.
  public post feeds).
- **Admin** — a separate permission tier and possibly separate route
  namespace (`/api/v1/admin/...`).
- **Monitoring** — structured logging, request tracing (request id), and
  external monitoring (e.g. Sentry, uptime checks) once deployed.
