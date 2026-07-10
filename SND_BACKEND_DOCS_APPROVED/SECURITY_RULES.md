# Security Rules

These rules are mandatory for all current and future backend work.

## Authentication and Authorization

- Authentication answers who the requester is.
- Authorization answers whether that authenticated actor may access a specific operation
or resource.
- Authentication middleware must run before protected controller logic.
- Resource ownership/high-impact permission checks belong in the service layer even when a
route-level role middleware is also present.

## Identity and Mass Assignment

- The acting user ID comes only from verified auth context.
- Never accept or spread client fields such as `author`, `owner`, `user`, `reporter`,
`role`, `isAdmin`, counters, `deletedAt`, storage public IDs, or moderation actor fields.
- Mutating Zod objects are strict and services explicitly assign allowlisted fields.
- Never pass `req.body`, `req.query`, or `req.params` wholesale into Mongoose operations.

## Object-Level Authorization / IDOR Prevention

For every endpoint receiving an ID:

- Validate ObjectId format before business logic.
- Load the resource under the correct visibility/state constraints.
- Verify ownership, role, or allowed public visibility.
- Revalidate parent resources where child access depends on the parent.
- Prefer a safe `404` when exposing existence would leak deleted/private content.

## Role Security

- Token role claims are useful for baseline routing but can become stale.
- For destructive or high-impact admin/moderation actions, re-check the current user and
role/active status from the database where practical.
- Admin operations require explicit admin authorization and service-level enforcement.
- High-impact admin/moderation actions must eventually produce audit records containing
actor, action, target, outcome, and timestamp.

## Password Security

- Passwords are hashed with the project-approved bcrypt configuration.
- Passwords and hashes are never logged or returned.
- Hash fields use `select: false` and are selected explicitly only in auth operations.
- Login errors are generic to prevent email/user enumeration.
- Password validation is enforced before hashing.
- Change-password behavior should invalidate the stored refresh session and require the
current password according to the implemented contract.

## Token Security

- Access and refresh tokens use different strong environment secrets.
- Tokens are never logged, added to URLs, committed, or included in error details.
- Access tokens are short-lived and sent as Bearer tokens in the current backend phase.
- Refresh tokens are long-lived, rotated, stored hashed, and checked against server state.
- A valid JWT signature alone is not sufficient for refresh; the stored session/hash must
match.
- Current JSON refresh-token transport is development-only and must not be represented as
browser production security.
- Before production browser integration, use HttpOnly/Secure cookie settings and complete
CSRF/CORS analysis.
- The current single-hash model means one active refresh session; multi-device support
requires a sessions/token-family design.

## User and Resource State

- Inactive users must not continue protected operations merely because an old token is
cryptographically valid.
- High-impact operations must account for current user state.
- Soft-deleted posts/comments and inactive parent resources are excluded consistently.
- State transitions use allowlisted enums and service methods; clients cannot set internal
status values freely.

## MongoDB Query Safety

- Build filters from validated primitives and allowlisted enums.
- Do not accept raw Mongo operators (`$where`, `$regex`, `$ne`, etc.) from clients.
- Escape or safely construct regex search values and limit search length.
- Unique indexes are the authoritative concurrency guard for duplicate relationships;
application pre-checks alone are insufficient.
- Atomic updates are required for counters and toggle transitions where races matter.

## File Upload Security

Current controls:

- Authentication/ownership before final resource mutation.
- Strict count and byte-size limits.
- JPEG/PNG/WEBP MIME allowlist.
- Server/vendor-generated storage identifiers.
- Cloudinary storage rather than production local disk.
- Cleanup of newly uploaded assets when later operations fail.

Required before production launch:

- Validate file signatures/magic bytes, not only `Content-Type`.
- Decode/re-encode or otherwise sanitize images if threat modeling requires it.
- Confirm Cloudinary transformations/delivery settings and prevent exposing credentials.
- Never allow client-supplied Cloudinary public IDs to authorize deletion.

## Reports and Moderation Security

- Reporter identity is derived from auth context.
- Supported target types, reasons, states, and actions are allowlisted.
- The target is verified before report creation or moderation.
- Duplicate-report policy must be enforced by the model/index and service, not only by a
pre-query.
- Report queues/details are admin-protected and must not leak private reporter or target
data beyond the approved presenter.
- Moderation actions require current admin authorization and should be auditable.

## CORS, Cookies, and Headers

- CORS uses explicit environment-controlled origins; never wildcard with credentials.
- Helmet remains enabled.
- Cookie migration must use appropriate `HttpOnly`, `Secure`, and `SameSite` values based
on the actual deployment domains.
- Cross-site cookies require explicit `SameSite=None; Secure` and CSRF review.

## Rate Limiting and Abuse Controls

- General API rate limiting remains enabled.
- Login/register and other brute-force or abuse-prone endpoints use stricter limits.
- Production deployments behind a proxy must configure Express trust-proxy correctly so
IP-based limits are meaningful.
- Reports/comments/uploads may need endpoint-specific abuse limits based on real usage.

## Error and Logging Security

- Production errors do not expose stack traces, raw Mongoose errors, Cloudinary responses,
secrets, tokens, passwords, or full sensitive request bodies.
- Logs use request IDs and structured fields.
- PII and credentials require redaction; convention-only redaction is a known gap until the
logger enforces it.
- Unexpected errors are logged server-side and returned as safe generic failures.

## Environment and Secret Security

- `.env` is never committed or uploaded to project sources.
- `.env.example` contains names/placeholders only.
- Use separate development/staging/production credentials and database users.
- Rotate credentials after suspected exposure and during production hardening.

## Security Checklist for Every Endpoint

- [ ] Is authentication required and enforced?
- [ ] Is the acting identity server-derived?
- [ ] Are body, params, and query validated strictly?
- [ ] Is object-level authorization enforced in the service?
- [ ] Are parent/current-state constraints checked?
- [ ] Are database writes atomic or index-protected where races matter?
- [ ] Does the presenter hide internal/sensitive fields?
- [ ] Are no-auth, wrong-user, wrong-role, invalid-ID, and deleted-target cases tested?
- [ ] Does logging avoid secrets/PII?
- [ ] Does the endpoint need a stricter abuse/rate limit?
