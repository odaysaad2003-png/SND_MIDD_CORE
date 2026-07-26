# Authentication Concepts and Current Contract

## Current Authentication Model

SND Community Core uses:

- short-lived JWT access tokens;
- longer-lived JWT refresh tokens with a separate secret;
- server-side hashed refresh-token state;
- refresh rotation with one active session per user;
- Bearer access-token authentication;
- a host-only HttpOnly refresh cookie scoped to `/api/v1/auth`;
- a CSRF token bound to the refresh-token payload;
- explicit credentialed CORS origins.

The implementation source of truth is:

```text
src/modules/auth/auth.routes.ts
src/modules/auth/auth-session.middleware.ts
src/modules/auth/auth-cookie.ts
src/modules/auth/auth.controller.ts
src/modules/auth/auth.service.ts
src/config/env.ts
src/config/cors.ts
```

## Access Token

The access token proves the authenticated identity for a short period. The frontend keeps
it in memory and sends:

```http
Authorization: Bearer <access-token>
```

Cryptographic validity does not make every old claim authoritative forever. Active-user
checks and high-impact Admin operations can revalidate current database state.

## Refresh Token

The refresh token exists only to obtain a new session without asking for the password. It
has a longer lifetime and therefore requires revocation state.

The server verifies:

1. JWT signature and expiry;
2. user subject;
3. refresh session ID;
4. the stored bcrypt hash;
5. active account state;
6. the CSRF token for Refresh/Logout.

The raw token is never returned in JSON. Register, Login, and Refresh set it in the
HttpOnly cookie. Browser JavaScript cannot read its value.

## Why the Refresh Token Is Hashed

A raw refresh token from a database leak would be immediately usable. Storing only a hash
means the presented cookie value must still pass bcrypt comparison, similar to password
verification.

## Rotation and Concurrent Requests

After successful Refresh:

- issue a new access token;
- issue a new refresh token and CSRF token;
- atomically replace the stored refresh hash/session ID only when the previous state still
  matches;
- replace the browser cookie.

The conditional database update rejects concurrent reuse of the old session. The current
single-session model means another device or tab can lose its refresh ability after a
rotation.

## CSRF Model

The browser automatically attaches an eligible cookie, so cookie-authenticated
state-changing requests need an independent value that another site cannot read.

The refresh-token payload contains a random CSRF value:

- `GET /auth/csrf` requires the refresh cookie and returns only that value;
- `POST /auth/refresh` and `POST /auth/logout` require the cookie and
  `X-CSRF-Token`;
- comparison uses timing-safe equality;
- a missing/invalid CSRF value returns `403`;
- a missing/invalid refresh session returns `401`.

CSRF does not replace CORS, authentication, or authorization.

## Cookie Contract

The base cookie is:

```text
Name     AUTH_REFRESH_COOKIE_NAME (default snd_refresh)
HttpOnly true
Path     /api/v1/auth
Domain   unset/host-only by default
Secure   true in production
SameSite environment-controlled
```

For the current Vercel frontend ↔ Render API cross-site topology, production uses
`SameSite=None; Secure`. Cookie clearing uses the same base options.

## CORS and Credentials

The backend normalizes an explicit comma-separated `CORS_ORIGIN` allowlist, rejects `*`,
sets `credentials: true`, allows `Content-Type`, `Authorization`, `X-CSRF-Token`, and
`X-Request-Id`, and exposes the request ID.

Register/Login/CSRF/Refresh/Logout use browser credentials. Ordinary feature requests use
the Bearer access token and do not need the refresh cookie.

## Logout and Password Change

Logout verifies the cookie/CSRF pair, revokes the matching stored session when possible,
and clears the cookie in a controller `finally` path. Password change also invalidates the
stored refresh session.

An already-issued access token can remain valid until its short expiry unless a separate
access-token denylist or session-version mechanism is introduced.

## Current Single-Session Limitation

One stored refresh hash/session ID means one active session. Full multi-device support
requires a sessions collection/token-family design with explicit revocation and device
metadata.

## Deployment Verification Still Required

Implementation is not equivalent to production proof. The exact Vercel production origin
must be placed in Render `CORS_ORIGIN`, production cookie variables must be loaded, and a
real browser must confirm:

- `Set-Cookie` attributes;
- no `refreshToken` in JSON;
- reload CSRF bootstrap and rotation;
- preflight headers;
- Logout clearing;
- invalid CSRF and disallowed-origin rejection;
- multi-tab/single-session behavior.

## Common Mistakes

- Storing access or refresh tokens in browser storage.
- Returning the refresh token in JSON after setting the cookie.
- Sending refresh/CSRF values in application JSON bodies.
- Using wildcard credentialed CORS.
- Setting `SameSite=None` without `Secure`.
- Setting a shared cookie Domain without a real requirement.
- Trusting a refresh JWT without checking the stored hash/session ID.
- Refreshing on every `403` instead of distinguishing CSRF recovery from feature
  authorization.
- Logging tokens or placing them in URLs.
- Assuming Logout instantly invalidates already-issued access tokens.

## Review Questions

1. Why does the access token usually avoid a database query while Refresh checks stored
   state?
2. Why can JavaScript send the refresh cookie but not read its value?
3. Why does moving Refresh into a cookie introduce a CSRF requirement?
4. What is the difference between a refresh `401` and a refresh `403`?
5. Why does concurrent rotation reject one of two requests under the single-session model?
6. Why must the exact Vercel Origin be allowlisted even when Postman works?
