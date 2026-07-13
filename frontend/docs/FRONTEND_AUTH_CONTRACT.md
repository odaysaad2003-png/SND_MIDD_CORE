# SND Frontend Authentication Contract

## Approved Position

- Access tokens are short-lived Bearer tokens returned in JSON.
- The access token is stored in browser memory only.
- Refresh tokens are stored only in an HttpOnly cookie.
- Refresh sessions rotate and one active refresh session per user is accepted for V1.
- CSRF protection is required for refresh and logout.
- Multi-device sessions, password change/recovery, and email verification are deferred.

## Backend Cookie Contract

| Property | Current code/production decision |
|---|---|
| Name | Configured by `AUTH_REFRESH_COOKIE_NAME`; default `snd_refresh` |
| HttpOnly | `true` |
| Secure | `true` in production |
| SameSite | Confirmed `none` for Vercel ↔ Render cross-site requests |
| Path | `/api/v1/auth` |
| Domain | Unset/host-only |
| Max age | Remaining refresh-token lifetime |

Cookie clearing uses the same base options. The frontend cannot and must not attempt to read the refresh token.

## CORS Contract

The backend:

- uses an explicit origin allowlist from `CORS_ORIGIN`;
- sets `credentials: true`;
- allows `Content-Type`, `Authorization`, `X-CSRF-Token`, and `X-Request-Id`;
- exposes `X-Request-Id`;
- does not permit wildcard origins.

Before production verification, add the exact Vercel production origin. Preview URLs require an explicit controlled strategy; credentialed wildcard CORS is forbidden.

## Token and User Shapes

Register, login, and refresh return:

```ts
type AuthSessionData = {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    avatar: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  csrfToken: string;
};
```

The refresh token exists in the service result but is deliberately removed from the JSON response before sending it.

## Register

```text
POST /api/v1/auth/register
Content-Type: application/json
credentials: include
```

Body: name 2–100, valid email, password 8–72. On `201`, accept the refresh cookie, hold access/CSRF tokens in memory, seed the current user, and navigate to the safe return target or feed.

## Login

```text
POST /api/v1/auth/login
Content-Type: application/json
credentials: include
```

Body: valid email and non-empty password. On `200`, handle the session exactly as Register. Invalid credentials remain generic.

## Fresh-Page Session Bootstrap

The Vercel server cannot read the Render-hosted refresh cookie, so protected session recovery occurs in the browser:

1. Render a stable session-loading shell for protected routes.
2. Call `GET /api/v1/auth/csrf` with `credentials: 'include'`.
3. If successful, keep `csrfToken` in memory.
4. Call `POST /api/v1/auth/refresh` with credentials and `X-CSRF-Token`.
5. Replace in-memory access token and CSRF token with the rotated values.
6. Set the returned user as the authenticated principal.
7. If CSRF bootstrap or refresh returns a final `401`, become anonymous.

Do not call `/auth/me` after a successful refresh solely to fetch the same returned user.

## Protected API Requests

Send:

```text
Authorization: Bearer <in-memory-access-token>
```

Normal protected content requests do not need `credentials: include`; refresh-cookie operations do. Keeping cookie credentials scoped to session endpoints reduces accidental coupling.

## Access-Token Expiration

Use a single-flight refresh coordinator per tab:

1. Receive `401` from a protected request.
2. If that request was already retried, fail and clear the session.
3. Otherwise wait on or start one refresh operation.
4. Refresh with the current CSRF token and credentials.
5. Retry waiting requests once with the new access token.

Never refresh on `403`, `404`, validation errors, or arbitrary network errors. Never create an infinite refresh loop.

If refresh fails due to an out-of-date/missing CSRF token, call `/auth/csrf` and retry refresh once. A second failure ends the session.

## Logout

```text
POST /api/v1/auth/logout
X-CSRF-Token: <in-memory-csrf-token>
credentials: include
```

The backend revokes the matching stored session when possible and clears the cookie in a `finally` path. The frontend must always:

- clear access and CSRF memory state;
- clear the current user;
- remove all private TanStack Query caches;
- cancel or ignore pending protected mutations;
- navigate to a public route.

Local cleanup occurs even if the logout request fails.

## Route Protection

Client route guards improve UX but are not authorization. Protected layouts wait for bootstrap before deciding among:

- render authenticated content;
- redirect an anonymous user to login with an internal `returnTo` value;
- show an inactive/forbidden state;
- show a recoverable network state without incorrectly logging out.

Only internal relative return paths are allowed. Admin role checks in a future frontend are also UX gates; the backend remains authoritative and revalidates sensitive admin state from MongoDB.

## Server/Client Responsibilities

### Server Components May

- fetch public feed and public post details;
- generate metadata and Open Graph fields from public data;
- render landing/policy content.

### Server Components Must Not

- assume the user is authenticated from the Render cookie;
- access or persist the in-memory access token;
- fetch protected user data directly under the current topology.

### Client Auth Layer Owns

- access and CSRF tokens;
- session bootstrap status;
- single-flight refresh;
- private request authorization;
- logout cleanup;
- current-user cache seeding and removal.

## Account State

The backend rejects inactive users during login/refresh/current-user operations and revalidates active state on protected feature routes. The frontend should:

- treat a final inactive/unauthorized response as session loss;
- avoid claiming an account was deleted when it may be suspended;
- show a neutral support/contact message where appropriate;
- never infer admin or active state solely from an old access-token claim.

## One-Session Limitation

Logging in or rotating the session can invalidate a previously stored refresh session. This is accepted in V1. User-facing copy should say that the session expired or was replaced, without exposing token internals.

Tabs share the refresh cookie but not in-memory tokens. Test concurrent tab bootstrap and refresh. If coordination is necessary, prefer a narrow browser-channel mechanism over adding a global state library.

## Security Prohibitions

- Never store access or refresh tokens in `localStorage`, `sessionStorage`, IndexedDB, URL parameters, logs, analytics, or error reports.
- Never expose the CSRF token outside in-memory session logic.
- Never decode a JWT and treat its contents as proof of current authorization.
- Never send refresh or CSRF tokens in application JSON bodies.
- Never use wildcard credentialed CORS.
- Never render raw backend error details without safe mapping.
- Never retry mutations automatically after an ambiguous network failure unless the operation is known to be idempotent and the UI accounts for it.

## Required Auth Verification

1. Register and login set the cookie and return no refresh token in JSON.
2. Reload recovers the session through CSRF + refresh.
3. Access expiration triggers one refresh and one request retry.
4. Logout clears the cookie and private frontend state.
5. Missing cookie returns anonymous state without a loop.
6. Missing/invalid CSRF is rejected.
7. Disallowed CORS origin cannot use credentialed auth.
8. Suspended user cannot continue protected operations.
9. A second login/session replacement produces understandable behavior.
10. Multiple-tab bootstrap/rotation has a documented result.

## Open Deployment Item

The final Vercel production origin is still TBD. Authentication is not production-verified until that exact origin is allowlisted and the full cookie/CSRF flow passes in the deployed browser environment.
