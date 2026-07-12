# Deployment Notes

## Current Position

Deployment constraints are architectural requirements, not Sprint 9 cleanup. The backend
already uses MongoDB Atlas, environment validation, Cloudinary, CORS, Helmet, health checks,
request IDs, and rate limiting. Actual production deployment and verification remain
pending.

## Service Separation

The future frontend and backend deploy independently:

```text
https://snd.example        → frontend
https://api.snd.example    → Express API
```

They communicate only over HTTPS. There is no shared filesystem or direct frontend access
to MongoDB/Cloudinary credentials.

## Required Backend Environment Variables

The exact schema in `src/config/env.ts` is authoritative. The current expected set includes:

```text
NODE_ENV
PORT
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRES_IN
BCRYPT_SALT_ROUNDS
CORS_ORIGIN
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_ROOT_FOLDER
```

Rules:

- Fail startup when required values are missing/invalid.
- Never commit `.env`.
- Keep `.env.example` synchronized with names and safe placeholders only.
- Use separate credentials and database users for development, staging, and production.

## Build and Start Contract

Production deployment must run the repository's verified scripts, normally:

```text
npm ci
npm run typecheck
npm run build
npm start
```

Do not rely on `ts-node-dev` or source TypeScript execution in production unless the
platform contract explicitly requires it.

## MongoDB Atlas

- Use least-privilege database users per environment.
- Restrict network access according to the hosting platform.
- Avoid `0.0.0.0/0` unless there is no platform-specific alternative and credentials are
strong/rotated.
- Enable backups before real user data exists.
- Verify indexes in production and avoid automatic destructive index changes without a
migration plan.
- Run query-plan checks for heavy aggregation/list endpoints before scale hardening.

## Cloudinary

Cloudinary is the current production storage provider for avatars and post images.

- Keep API secret server-side only.
- Use environment/root folders to isolate dev/staging/production assets.
- Store display URLs and internal public IDs separately.
- Delete/replace assets through server-authorized identifiers only.
- Handle partial upload failures with best-effort cleanup.
- Confirm delivery transformations, allowed formats, and lifecycle policies before launch.
- Local `/uploads` behavior, if retained for legacy development assets, must not be treated
as durable production storage.

## CORS

- `CORS_ORIGIN` must match the actual allowed frontend origin(s).
- Never use wildcard origin with credentials.
- Test preflight requests after middleware or deployment changes.
- If multiple origins become necessary, parse and validate an explicit allowlist rather
than accepting arbitrary origins.

## Cookies and Browser Auth

Current refresh-token transport is JSON and is not ready for a production browser.
The future cookie deployment must verify:

- `HttpOnly: true`
- `Secure: true` in production
- correct `SameSite` for same-site or cross-site topology
- `credentials: true` on both CORS and client requests where needed
- CSRF strategy for state-changing cookie-authenticated requests
- cookie domain/path/expiry and logout clearing behavior

## Reverse Proxy and Rate Limiting

Most hosting platforms place Express behind a proxy/load balancer. Configure `trust proxy`
with the narrowest correct setting before relying on `req.ip`, secure cookies, or IP-based
rate limiting. Test that the real client IP is not spoofable through untrusted headers.

## Health and Readiness

- Keep `GET /api/v1/health` fast and safe.
- Distinguish process liveness from dependency readiness if the hosting platform requires
it.
- A readiness check may include MongoDB connection state without exposing credentials or
internal topology.
- Configure platform health checks and an external uptime monitor after deployment.

## Graceful Shutdown

`server.ts` should handle termination signals by:

1. stopping new HTTP connections
2. allowing in-flight requests a bounded shutdown window
3. closing the MongoDB connection
4. logging the shutdown outcome
5. exiting non-zero on unrecoverable startup/runtime failures

## Logging and Observability

- Emit structured logs with timestamp, level, request ID, method, route, status, and latency
where appropriate.
- Never log secrets, tokens, passwords, or full sensitive payloads.
- Add enforced redaction before production.
- Send production logs/errors to an external service.
- Add alerting for repeated 5xx errors, health failure, high latency, and auth/report abuse.

## Deployment Order

1. Verify typecheck/build/tests locally.
2. Provision production MongoDB and Cloudinary configuration.
3. Deploy backend with production env vars.
4. Verify health, logs, CORS, upload, auth, and database behavior.
5. Run a minimal production smoke suite.
6. Deploy/connect the frontend only after the backend contract is verified.
7. Monitor and keep a rollback path.

## Production Smoke Checklist

- [ ] Application starts with `NODE_ENV=production`.
- [ ] Missing env vars fail startup clearly.
- [ ] Health endpoint reports expected state.
- [ ] MongoDB connection and indexes are healthy.
- [ ] CORS succeeds only for approved origins.
- [ ] Helmet/security headers are present.
- [ ] Rate limiting observes real client IP behavior.
- [ ] Register/login/refresh/logout work under the deployed URL.
- [ ] Avatar and post-image upload/delete work through Cloudinary.
- [ ] Protected routes reject no-auth/wrong-role requests.
- [ ] Report/admin routes do not leak to normal users.
- [ ] Logs contain request IDs and no secrets.
- [ ] Backup, monitoring, alerts, and rollback are configured.
