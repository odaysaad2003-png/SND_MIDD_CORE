# SECURITY_RULES.md

## Authentication vs Authorization
- **Authentication** answers "who are you?" — verifying identity (e.g. valid
  JWT).
- **Authorization** answers "are you allowed to do this?" — checking role
  and/or ownership after identity is known.
- Every protected route needs both, in order: authenticate first, then
  authorize.

## Ownership Checks
- Any mutation on a resource owned by a user (e.g. `PATCH /posts/:id`,
  `DELETE /posts/:id`) must verify `resource.owner === req.user.id` (or the
  user is an admin) **in the service layer**, not just the controller.
- Never trust an id in the request body/params to imply ownership — always
  re-derive the acting user from the verified token.

## Role-Based Access
- Roles (e.g. `user`, `admin`) are stored on the user document and included
  in the token payload only as a non-sensitive claim (never trust the token
  claim alone for high-stakes actions — re-check against the DB when it
  matters, e.g. before destructive admin actions).
- Role checks are implemented as reusable middleware (`requireRole('admin')`)
  so they're consistent across routes.

## Admin-Only Access
- Admin routes are clearly separated (e.g. `/api/v1/admin/...`) so it's
  obvious at a glance which endpoints need elevated privilege.
- Admin actions that are destructive or high-impact should be logged with
  actor id, action, target, and timestamp (see Sprint 10 audit logs).

## Input Validation
- Every request body, params, and query that reaches a controller must pass
  through a validation layer first (e.g. Zod/Joi schemas).
- Validation happens **before** any database call — reject early, fail
  cheap.
- Never trust client-supplied fields that imply identity or permission
  (e.g. a `role` or `isAdmin` field in a registration payload must be
  ignored/stripped server-side).

## Password Security
- Passwords are hashed with bcrypt (or argon2) — never stored or logged in
  plain text.
- Minimum password strength rules are enforced in the validation layer.
- Password hashes are never included in API responses — exclude the field at
  the schema/query level (`select: false` in Mongoose), not just by manually
  deleting it in the controller.

## Token Security
- JWTs are signed with a strong secret from environment variables, never
  hardcoded.
- Access tokens are short-lived. Sprint 2 (Auth v2) introduces refresh
  tokens with rotation.
- Tokens are never logged, even in debug logs.

## LocalStorage Warning for Production
- Storing JWTs in `localStorage` (as SND Mini currently does) is convenient
  for a learning project but is vulnerable to XSS token theft — any injected
  script can read `localStorage` and exfiltrate the token.
- This is acceptable for Sprint 0–1 (not changing existing behavior yet) but
  is explicitly flagged as a pre-production risk to be resolved in Sprint 2.

## HttpOnly Cookie Direction for Auth v2
- Sprint 2 will move refresh tokens (and possibly access tokens) into
  `HttpOnly`, `Secure`, `SameSite` cookies, which JavaScript cannot read,
  significantly reducing XSS token-theft risk.
- CSRF considerations must be addressed alongside this change (e.g.
  `SameSite=strict/lax` plus a CSRF token for state-changing requests if
  cookies are used cross-site).

## File Upload Security
- Not implemented until Sprint 3/4, but documented ahead of time:
  - Validate file type by content (magic bytes), not just extension or
    `Content-Type` header.
  - Enforce a strict file size limit.
  - Never trust the client-supplied filename — generate a new safe filename
    server-side.
  - Store uploads in object storage (e.g. S3-compatible), not local disk, for
    production (see `DEPLOYMENT_NOTES.md`).
  - Serve uploaded images through a CDN or storage URL, not directly from the
    app server.

## Rate Limiting
- Applied at the middleware level, especially on auth endpoints (login,
  register, password reset) to slow brute-force attempts.
- General API rate limiting is introduced in Sprint 1's backend foundation,
  with stricter limits layered on sensitive routes later.

## CORS
- Backend explicitly whitelists allowed origins via environment variable
  (frontend URL) — never uses a wildcard `*` origin when credentials/cookies
  are involved.
- Local dev and production have separate allowed-origin configs (see
  `DEPLOYMENT_NOTES.md`).

## Helmet / Security Headers
- `helmet` (or equivalent) middleware is added in Sprint 1 to set standard
  security headers (X-Content-Type-Options, X-Frame-Options, HSTS in
  production, etc.).

## Avoiding IDOR / BOLA Vulnerabilities
- Insecure Direct Object Reference / Broken Object Level Authorization is the
  single most common API vulnerability class for this kind of app.
- Rule: **any** endpoint that accepts an id (`:id` param or id in body) and
  returns or mutates a resource must verify the requesting user is allowed to
  access that specific resource — never assume "logged in" is enough.
- This applies even to seemingly low-risk resources (e.g. reading another
  user's private profile fields).

## Password Reset Security
- Reset tokens are single-use, short-lived, and stored hashed (not plain) in
  the database.
- The API response for "forgot password" is identical whether or not the
  email exists, to avoid user enumeration.
- Reset links/tokens are invalidated after use or after a new reset is
  requested.

## Basic Security Checklist for Every Future Endpoint
- [ ] Is authentication required? If yes, is it enforced by middleware?
- [ ] Is authorization (role and/or ownership) checked in the service layer?
- [ ] Is all input validated before reaching business logic?
- [ ] Does the response avoid leaking sensitive fields (password hash,
      internal ids of unrelated users, etc.)?
- [ ] Is the endpoint rate-limited if it's sensitive (auth, password reset)?
- [ ] Are errors handled without leaking stack traces or internals?
- [ ] Is this endpoint tested for the "wrong user" / "no auth" / "wrong role"
      cases?

## Sprint 2 Note: Refresh Token Transport (Interim Decision)
Sprint 2 implements refresh tokens returned in the response body rather
than HttpOnly cookies, because there is no frontend yet and testing is
Postman-only. This is a deliberate, approved staging decision — not a
deviation from the "HttpOnly Cookie Direction for Auth v2" section above.
The migration to HttpOnly cookies happens when frontend integration
begins. See `docs/AUTH_CONCEPTS.md` for full reasoning.