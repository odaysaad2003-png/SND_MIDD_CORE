# DEPLOYMENT_NOTES.md

## Deployment Must Be Considered From the Beginning
Even though Sprint 9 is the dedicated "Deployment" sprint, deployment
constraints shape architecture decisions from Sprint 1 onward (env config,
CORS, storage choices, logging). Waiting until Sprint 9 to think about this
causes rework — so this doc exists from Sprint 0.

## Frontend and Backend Separation
- Backend (Express API) and frontend (Next.js) are deployed as **separate
  services** with separate URLs (e.g. `api.snd.app` and `snd.app`).
- They communicate only over HTTPS via the public API — no shared filesystem
  or in-process coupling.

## Required Environment Variables

Backend (`.env`):
```
NODE_ENV=
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CORS_ORIGIN=
```

Frontend (`.env`):
```
NEXT_PUBLIC_API_URL=
```

Sprint 1 introduces env validation at startup (fail fast if a required
variable is missing, rather than failing later at first use).

## Local vs Production Differences
| Concern | Local | Production |
|---|---|---|
| `CORS_ORIGIN` | `http://localhost:3000` | actual frontend domain |
| `MONGODB_URI` | local Mongo or Atlas dev cluster | Atlas production cluster |
| Cookies (post Auth v2) | `Secure: false` allowed over http | `Secure: true` required (https only) |
| Logging | verbose/console | structured, shipped to a log service |
| File storage | may use local disk temporarily | must use object storage (S3-compatible) |

## CORS Production Rules
- `CORS_ORIGIN` must be set to the exact production frontend origin — never
  `*` when cookies/credentials are used.
- Preflight (`OPTIONS`) handling must be verified after any CORS middleware
  change, since silent CORS failures are one of the most common deployment
  bugs.

## Cookies in Production
- Once Auth v2 (Sprint 2) introduces cookies, production cookies must have:
  `Secure: true`, `HttpOnly: true`, `SameSite: lax` or `strict` depending on
  whether frontend/backend share a top-level domain.
- If frontend and backend are on different domains, cross-site cookie rules
  (and possibly `SameSite=none; Secure`) must be explicitly tested — this is
  a very common production-only bug that doesn't show up locally.

## API URL Management
- The frontend never hardcodes the backend URL — it always reads
  `NEXT_PUBLIC_API_URL` from environment config, consumed by the single
  `api-client.ts` module.
- This allows the same frontend build process to point at local, staging, or
  production backends without code changes.

## MongoDB Atlas Notes
- Use a dedicated database user per environment (dev vs prod) with least
  privilege.
- IP allowlist / network access rules must include the deployment platform's
  egress IPs (or `0.0.0.0/0` only if paired with strong credentials, and only
  as a last resort).
- Enable automated backups on the production cluster before real user data
  exists.

## File Upload Production Warning
**Do not rely on local server storage for production.** Most hosting
platforms (Render, Railway, Vercel, etc.) use ephemeral or read-only
filesystems — anything written to local disk can disappear on redeploy or
restart. File uploads (starting Sprint 3/4) must go to object storage
(S3-compatible) from the point they're implemented, even in early sprints,
to avoid a costly migration later.

## Health Check Route Importance
- A `GET /health` (or `/api/v1/health`) route that checks the process is up
  and (optionally) that the database connection is alive is required before
  any real deployment.
- Hosting platforms and uptime monitors depend on this to detect and restart
  unhealthy instances.
- Introduced in Sprint 1 as part of the backend foundation.

## Logging Importance
- Structured logging (not just `console.log`) is introduced in Sprint 1.
- Production logs should include a request id (also introduced in Sprint 1)
  to trace a single request across middleware, controller, and service logs.
- Never log secrets, tokens, or full request bodies containing sensitive
  data.

## Common Deployment Mistakes Learned From SND Mini
- Forgetting to set `CORS_ORIGIN` correctly for the deployed frontend domain,
  causing silent fetch failures that are hard to diagnose from the frontend
  alone.
- Hardcoding `localhost` API URLs in the frontend instead of using an env
  variable.
- Assuming local file uploads would persist in production.
- Not having a health check route, making it hard to tell if a deploy
  actually succeeded.

## Deployment Checklist — Backend
- [ ] All required env vars set and validated at startup
- [ ] `CORS_ORIGIN` set to the real frontend domain
- [ ] `NODE_ENV=production`
- [ ] MongoDB Atlas connection string uses production cluster/user
- [ ] `/health` route responds correctly
- [ ] Logging is structured and does not leak secrets
- [ ] Rate limiting and security headers active

## Deployment Checklist — Frontend
- [ ] `NEXT_PUBLIC_API_URL` points to the production backend
- [ ] No hardcoded localhost URLs remain
- [ ] Build succeeds with production env vars
- [ ] Error/loading states verified against the real production API (not just
      local mocked data)
