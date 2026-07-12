# Authentication Concepts and Current Contract

## Current Authentication Model

SND Community Core currently uses:

- short-lived JWT access tokens
- longer-lived JWT refresh tokens
- separate signing secrets
- server-side hashed refresh-token state
- refresh-token rotation
- one active refresh session per user
- Bearer access-token authentication
- JSON refresh-token transport during backend/Postman development

## Access Token

An access token proves a request's authenticated identity for a short period. The current
client sends it as:

```http
Authorization: Bearer <access-token>
```

The token can be cryptographically verified without a database query. That does **not**
mean every authorization decision should trust old token state forever. User activation,
role changes, password changes, and high-impact admin actions may require current database
state.

## Refresh Token

A refresh token exists only to obtain a new token pair without asking for a password each
time the access token expires. It has a longer lifetime and therefore requires server-side
revocation state.

The server verifies:

1. JWT signature and expiry.
2. Subject/user identity.
3. The stored refresh-token hash/session state.
4. The project's rotation/reuse rule.

## Why the Refresh Token Is Hashed

A raw refresh token from a database leak would be immediately usable. Storing only a hash
reduces that risk: the presented token must still be verified against the stored hash,
similar to password verification.

The current project uses the approved hashing implementation in code. Exact cost values
come from validated environment configuration.

## Rotation and Reuse Detection

After a successful refresh:

- issue a new access token
- issue a new refresh token
- replace the stored refresh-token hash

Presenting an old rotated token can have a valid signature but fail the stored-hash check.
The current simplified strategy treats this as an invalid/compromised session and revokes
the stored session. Full token-family tracking is deferred.

## Logout and Password Change

Logout invalidates the current stored refresh session. Change-password behavior should
also invalidate the stored refresh session so an existing long-lived token cannot continue
minting access tokens after a password change.

An already-issued access token may remain valid until its short expiry unless a separate
access-token denylist/session-version mechanism is introduced.

## Current JSON Transport Decision

During backend-only testing, the refresh token is accepted/returned in JSON. This makes
Postman verification straightforward but exposes the token to whichever client storage is
chosen later.

This is an **interim development contract**, not the final browser production design.
Do not store the refresh token in browser `localStorage` for production.

## Browser Production Target

Before production frontend integration:

- place the refresh token in an HttpOnly cookie
- use `Secure` in HTTPS production
- choose `SameSite` based on the real frontend/backend domains
- configure CORS credentials and exact origins
- add explicit CSRF protection when required by the cross-site model
- decide whether access tokens remain in memory/Bearer headers or also use cookies

Cookie migration changes both security and API behavior; it requires dedicated tests.

## Current Single-Session Limitation

One refresh-token hash on the user means one active refresh session. New login/rotation can
invalidate another device. Real multi-device support requires a sessions collection with,
for example:

- session ID
- user ID
- refresh-token hash/token family
- device metadata
- created/last-used/expiry timestamps
- revoked timestamp/reason

## Role and User-State Considerations

A role claim in an access token can become stale. Baseline protected routes may use the
claim, but high-impact admin/moderation operations should verify current database role and
active state where practical.

## Common Mistakes

- Reusing the same secret for access and refresh tokens.
- Storing raw refresh tokens in MongoDB.
- Trusting refresh-token signature without checking server-side session state.
- Logging tokens or placing them in URLs.
- Returning detailed login failure reasons.
- Treating body-based refresh transport as production browser security.
- Assuming logout instantly invalidates every already-issued access token.
- Adding multi-device behavior without redesigning the single-hash model.

## Review Questions

1. Why can an access token be verified without MongoDB while a refresh token still checks
server-side state?
2. What happens when an already-rotated refresh token is presented?
3. Why does password change need to revoke the stored refresh session?
4. What security problem does an HttpOnly cookie reduce, and what CSRF concern can it
introduce?
5. Why can a valid token role be insufficient for a destructive admin action?
