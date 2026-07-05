# AUTH_CONCEPTS.md

## Access Token
A short-lived, signed credential (JWT) proving identity on each request.
Sent as `Authorization: Bearer <token>`. Stateless — the server verifies
the signature and expiry, no DB lookup needed to trust it. Short lifetime
(15m) limits the damage if one is stolen.

## Refresh Token
A longer-lived credential (7d) whose only job is minting new access tokens
without forcing a re-login. Because it's long-lived, it needs to be harder
to steal and easy to revoke — unlike the access token, we *do* check it
against the database on every use.

## Why Refresh Tokens Exist
Without them, either access tokens live for days (large theft window) or
users re-enter their password every 15 minutes (bad UX). Splitting the two
lets the "prove who I am to every request" token stay short-lived while a
separate, more tightly controlled token handles renewal.

## Token Rotation (Sprint 2 version)
Every successful `/refresh` issues a brand-new refresh token and
overwrites the stored hash. Presenting an old, already-rotated token
produces a hash mismatch even though its signature is technically still
valid — that mismatch is treated as reuse/theft, and the whole session is
revoked server-side. This is a simplified version of real reuse-detection;
production systems often track a "token family" so they can tell which
specific chain was compromised. That's a Sprint 10 hardening candidate.

## Why We Hash the Refresh Token Before Storing It
The database is a bigger attack surface than a single JWT signature.
Storing the raw refresh token means a DB leak = working logins for every
active session. Hashing it (bcrypt) means the leaked data alone isn't
enough — same reasoning as password hashing.

## Approved Sprint 2 Decision: Refresh Token in Response Body
`SECURITY_RULES.md` and `SPRINT_ROADMAP.md` describe the target state as
HttpOnly cookies. For Sprint 2, the refresh token is returned in the JSON
response body instead, because testing is backend-only via Postman and
there is no frontend yet to own a cookie. This is a **deliberate,
documented staging decision**, not a missed requirement — the migration to
HttpOnly cookies is planned for when frontend integration begins.

## Common Mistakes
- Storing refresh tokens in plaintext.
- Using the same secret for access and refresh tokens.
- Trusting a refresh token's signature alone without checking it against
  the stored hash (this is what makes rotation/reuse-detection possible).
- Leaking which of email/password was wrong on login.

## Production Notes (not implemented this sprint)
- **HttpOnly cookies**: once the frontend exists, refresh tokens move into
  `HttpOnly; Secure; SameSite` cookies (see `SECURITY_RULES.md`), removing
  them from JS-readable storage entirely.
- **Email verification**: concept only. A signed, single-use, short-lived
  token would be emailed on registration; `/auth/verify-email` would flip
  an `isVerified` flag. Not built in Sprint 2.
- **Forgot password**: concept only. A hashed, single-use, short-lived
  reset token stored server-side (same pattern as refresh tokens);
  response identical whether or not the email exists, per
  `SECURITY_RULES.md`. Not built in Sprint 2.
- **Multi-device sessions**: current design supports exactly one active
  refresh token per user. Supporting multiple devices means storing an
  array of hashed tokens (or a separate `sessions` collection) instead of
  a single field.
- **Refresh token reuse detection (full version)**: track a token "family"
  id across rotations so a reused-old-token event can revoke just that
  family instead of relying on a single hash slot.

## Review Questions
1. Why does the access token not need a database check, but the refresh
   token does?
2. What's the actual attack this rotation scheme protects against?
3. Why is a hashed refresh token safer to store than a plaintext one, if
   both ultimately expire?
4. What's the security gap between "refresh token in body" and "refresh
   token in HttpOnly cookie", and why doesn't it matter yet at this stage?