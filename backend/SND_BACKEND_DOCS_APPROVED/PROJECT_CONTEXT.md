# Project Context

## Project

**SND Community Core** is a backend-first, production-minded learning project for a
future community platform. It evolves the earlier SND Mini prototype into a stronger
modular backend while preserving deep learning as a first-class goal.

## Current Phase

- Sprints 0–6: completed.
- Sprint 7A — Security Foundation: completed and verified.
- Sprint 7B — User Administration: completed and verified.
- Sprint 7C — Post Moderation: completed and verified manually with Postman.
- Sprint 7D — Admin Dashboard Summary: implemented; typecheck/build pass; manual Postman
  verification is the remaining completion gate.
- Current development track: backend only. Frontend integration remains separately scoped.

## Current Stack

- Node.js and Express
- TypeScript
- MongoDB Atlas and Mongoose
- Zod request validation
- JWT access and refresh tokens
- bcrypt-based password and refresh-token hashing
- Helmet, CORS, and rate limiting
- Multer-based multipart handling
- Cloudinary for avatar and post-image storage
- Postman for current manual API verification

The repository's current `package.json` and source code are authoritative for exact
versions and installed dependencies.

## Implemented Backend Domains

- Backend foundation and health checks
- Authentication and refresh-token rotation
- Current-user profile management and active-user revalidation
- Avatar upload/replacement through Cloudinary
- Posts with pagination, search/sort, ownership, soft delete, image management, and a
  separate admin moderation lifecycle
- Comments with parent-post visibility validation and owner mutations
- Likes using a unique user/post relation and denormalized `likesCount`
- Saves/favorites using a unique user/post relation and a private saved-post list
- Reports with admin-protected review/status workflows
- Admin user listing/detail and transactional suspend/reactivate operations
- Admin post listing/detail and transactional hide/restore operations
- Audit events for high-impact user and post administration actions
- Admin dashboard operational summary across users, posts, comments, engagement, and reports
- MongoDB aggregation pipelines for joined/paginated read models and dashboard statistics

## Core Architectural Rules

```text
route → middleware → validation → controller → service → model/database → response
```

- Controllers do not query Mongoose or contain business rules.
- Services do not depend on Express `Request` or `Response`.
- Acting user identity comes from verified authentication context, never client payloads.
- Ownership and high-impact authorization are enforced in the service layer.
- High-impact admin actions revalidate the current admin from MongoDB.
- Client-controlled body, params, and query values are validated before business logic.
- API data is returned through explicit sanitizers/presenters; internal fields are hidden.
- Production uploads use Cloudinary, not persistent local disk.
- Owner deletion and admin post moderation are separate state dimensions.

## Current Authentication Position

- Access tokens are sent in `Authorization: Bearer <token>`.
- Refresh tokens are rotated and stored hashed server-side.
- Refresh tokens are still returned/accepted in JSON for backend/Postman development.
- This transport is an approved interim state, not the production target.
- Before a browser frontend is production-ready, refresh tokens must move to a secure
  HttpOnly cookie strategy with corresponding CSRF and CORS review.
- The current design supports one active refresh session per user.

## Current Production Gaps

The backend is production-minded but not yet production-ready. Remaining gates include:

- Automated unit/integration/permission tests
- Exact production deployment and environment verification
- Secure browser refresh-token transport
- Multi-device session model or explicit acceptance of single-session behavior
- Magic-byte/file-signature validation before accepting production uploads
- Production monitoring, alerting, and enforced log redaction
- Query-plan/index review using real workloads
- Cursor pagination/caching only where measurements justify them
- Manual Postman verification of the Sprint 7D dashboard endpoint

## Working Agreement

Before any new sprint:

1. Read the documentation in `DOCUMENTATION_INDEX.md` order.
2. Inspect the current repository and relevant modules.
3. Identify any code/docs mismatch before implementation.
4. Keep the sprint boundary narrow.
5. Run typecheck, build, and relevant tests/manual verification.
6. Update the state and decisions only after the implementation is verified.
