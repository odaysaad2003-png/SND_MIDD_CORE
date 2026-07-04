# PROJECT_STATE.md (Sprint 1 update)

## Project Name
SND Community Core

## Previous Sprint
Sprint 0 — Audit, Direction & Architecture (complete)

## Current Sprint
Sprint 1 — Strong Backend Foundation (complete)

## Next Sprint
Sprint 2 — Auth v2 Professional

## Files Added
```
backend/package.json
backend/tsconfig.json
backend/.env.example
backend/src/config/env.ts
backend/src/config/db.ts
backend/src/constants/error-codes.ts
backend/src/utils/app-error.ts
backend/src/utils/async-handler.ts
backend/src/utils/api-response.ts
backend/src/utils/logger.ts
backend/src/middleware/request-id.ts
backend/src/middleware/rate-limiter.ts
backend/src/middleware/error-handler.ts
backend/src/modules/health/health.routes.ts
backend/src/modules/health/health.controller.ts
backend/src/modules/health/health.service.ts
backend/src/app.ts
backend/src/server.ts
```

## Files Modified
None (no prior backend code existed to modify — SND Mini source was not
present in this workspace, so Sprint 1 built the foundation fresh, following
`ARCHITECTURE.md`).

## Concepts Learned
- Fail-fast environment validation at startup (zod schema, exits before
  listening if config is invalid).
- `app.ts` (Express wiring) vs `server.ts` (process lifecycle: listen,
  connect DB, graceful shutdown) separation.
- Centralized error handling: `AppError` for operational errors, a single
  `errorHandler` middleware, generic messages in production.
- `asyncHandler` to eliminate try/catch sprawl in controllers.
- Structured (JSON) logging vs raw `console.log`.
- Request id middleware for cross-layer request tracing.

## Architecture Decisions
- Health module follows full route → controller → service layering even
  though it has no database writes, to keep the pattern consistent for
  future modules.
- `serverSelectionTimeoutMS: 5000` added to the Mongo connection so an
  unreachable database fails fast (a few seconds) instead of hanging — a
  smallest-reasonable-decision beyond what the docs specified explicitly,
  in the spirit of "fail-fast" already established for env validation.
- Rate limiting is applied globally on `/api` for now; sensitive-route
  specific limits (login/register) are deferred to Sprint 2 per
  `SECURITY_RULES.md`.

## Security Decisions
- `helmet` and environment-driven CORS (`credentials: true`, no wildcard)
  applied in `app.ts`.
- Global error handler never leaks stack traces or internal messages in
  production; unexpected errors are logged server-side only.
- Logger utility documented as never receiving secrets/tokens — enforced by
  convention, not automatic redaction (callers must comply).

## Known Issues / TODOs
- No auth, no posts, no profile — expected, out of scope for Sprint 1.
- `JWT_SECRET` / `JWT_EXPIRES_IN` are validated in `env.ts` but unused until
  Sprint 2 (Auth v2).
- No automated test suite yet (Sprint 8).

## What Must Not Be Changed in Sprint 2
- `app.ts` / `server.ts` separation.
- Standard success/error response shapes in `api-response.ts` /
  `error-handler.ts`.
- Error code list in `constants/error-codes.ts` (extend, don't rename).
- Backend layering: route → middleware → validation → controller → service
  → model → response.
- "posts" terminology.

## Definition of Done — Sprint 1 (status)
- [x] `app.ts` and `server.ts` are separated correctly.
- [x] Environment variables are validated at startup and fail fast when
      missing.
- [x] Database connection is centralized and logged safely.
- [x] Global error handler exists and returns `API_CONVENTIONS.md` error
      format.
- [x] `AppError` exists for operational errors.
- [x] `asyncHandler` exists and is used in async controllers.
- [x] API response helpers exist and follow the standard success format.
- [x] Request id middleware exists and is included in logs/responses.
- [x] Structured logger exists and does not log secrets/tokens (by
      convention).
- [x] `/api/v1/health` endpoint exists.
- [x] `helmet`, CORS, and baseline rate limiting are configured.
- [x] No business feature code is added.
- [x] `PROJECT_STATE.md` is updated at the end of the sprint.
