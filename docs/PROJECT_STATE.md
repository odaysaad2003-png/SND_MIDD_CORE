# PROJECT_STATE.md

## Project Name
SND Community Core

## Previous Phase
SND Mini (completed learning prototype)

## Current Sprint
Sprint 0 — Audit, Direction & Architecture

## Main Goal
Move from a mini learning project (SND Mini) to a stronger intermediate product
foundation that prepares the codebase and the developer for the larger future
product: SND, a full community support platform.

Sprint 0 does not add features. It defines direction, rules, conventions, and
a roadmap so every future sprint has a clear learning goal, production
relevance, and technical boundary.

## What Was Learned in SND Mini
- Node.js + Express backend fundamentals
- TypeScript backend structure
- MongoDB/Mongoose models
- Auth basics: register, login, JWT, protected routes
- User profile basics
- Listings CRUD
- Validation layer
- Controller/service/routes structure
- Standard API responses
- Params, query, and body usage
- Frontend integration with Next.js
- API client layer
- React Query hooks
- Frontend/backend data flow
- Basic deployment awareness

SND Mini proved the core request lifecycle end-to-end but was built quickly,
as a learning exercise, without strict architectural boundaries, security
hardening, or a naming model that scales beyond a simple listings/marketplace
concept.

## What Will Change in the Next Phase
- Terminology shifts from "listings" to "posts" (see below).
- Backend gets a formal architectural layering standard (route → middleware →
  validation → controller → service → model → response) applied consistently.
- Security, deployment, and testing become first-class concerns from Sprint 1
  onward instead of afterthoughts.
- Features are built as complete vertical slices (backend + frontend + tests +
  docs together) rather than backend-only or frontend-only passes.
- Auth will eventually be upgraded to Auth v2 (access/refresh tokens, HttpOnly
  cookies) — but NOT in Sprint 0 or Sprint 1.

## Current Approved Terminology
**"posts" replaces "listings"** everywhere in code, docs, routes, and
conversation going forward.

Reason: the larger SND platform is a community platform, not just a
marketplace. A "post" can represent:
- help requests
- offers of help
- community announcements
- campaigns
- updates
- stories
- public posts

A "listing" implies a marketplace item for sale/trade, which is too narrow
for this product's future scope.

## Current Development Strategy
**Architecture First → Backend Foundation → Vertical Slices**

1. Define product and architecture rules first (Sprint 0 — this sprint).
2. Build a strong backend foundation (Sprint 1).
3. Build each feature as a complete full-stack vertical slice (Sprint 2+).
4. Keep deployment, security, testing, and performance in mind from the
   beginning of every sprint, not bolted on at the end.

## Current Roadmap Summary
See `SPRINT_ROADMAP.md` for full detail. Short version:

| Sprint | Focus |
|--------|-------|
| 0 | Audit, Direction & Architecture (this sprint) |
| 1 | Strong Backend Foundation |
| 2 | Auth v2 Professional |
| 3 | Users, Profile & Avatar |
| 4 | Posts v2 with Images |
| 5 | Community Interaction (likes, saves, comments) |
| 6 | Reports & Moderation |
| 7 | Admin Dashboard |
| 8 | Testing & Quality |
| 9 | Deployment |
| 10 | Performance, Scale & Security Hardening |

## Current Technical Priorities
1. Documentation and architecture rules (Sprint 0)
2. Config, env validation, error handling, logging, health checks (Sprint 1)
3. Strong auth foundation before adding new features (Sprint 2)
4. Consistent API conventions across all future endpoints

## What Must Not Be Done Yet
Per Sprint 0 scope, the following are explicitly **out of scope** for this
sprint:
- Auth v2 implementation
- Posts feature implementation
- Admin feature implementation
- File upload implementation
- Aggressive refactor of the existing SND Mini codebase
- Any new business/feature code at all

## Definition of Done for Sprint 0
- [ ] All 7 required docs exist in `docs/` and are complete
- [ ] No feature implementation code was added or changed
- [ ] The roadmap covers all sprints through Sprint 10
- [ ] Deployment, security, testing, and performance are addressed from the
      start (not deferred to "later")
- [ ] The "posts instead of listings" terminology decision is documented
- [ ] The vertical slice development strategy is documented
- [ ] The project is ready to begin Sprint 1 — Strong Backend Foundation



## Sprint 1 Status — Strong Backend Foundation

Status: Completed

Completed items:

* Backend dependencies installed successfully.
* Environment variables configured using `.env`.
* MongoDB Atlas connection established successfully.
* Express server starts on port 4000.
* Health route tested successfully with Postman.
* Health route returns server status, uptime, database connection status, and timestamp.
* Core backend foundation files are in place:

  * app setup
  * server bootstrap
  * environment validation
  * database connection
  * logger
  * async handler
  * error codes
  * middleware foundation
  * health route

Verified endpoint:
GET /api/v1/health

Successful response example:
{
"success": true,
"data": {
"status": "ok",
"uptimeSeconds": 331,
"database": "connected",
"timestamp": "2026-07-04T14:25:40.712Z"
}
}

Sprint 1 conclusion:
The backend foundation is now running correctly and is ready for the next sprint after completing typecheck, build, and 404 route validation.



## Sprint 3 Preparation — Users, Profile & Avatar

Sprint 2 Auth is complete and tested through Postman.

Current confirmed capabilities:
- Register works.
- Login works.
- Access token is saved dynamically in Postman.
- Refresh token flow is understood and ready for testing.
- Protected routes can be tested with `Authorization: Bearer {{accessToken}}`.

Sprint 3 will focus on:
- Current authenticated user profile.
- Reading current user data.
- Updating safe profile fields.
- Uploading user avatar with multipart/form-data.
- Validating uploaded files server-side.
- Saving avatar path/URL on the user document.
- Returning sanitized user data.
- Testing all profile/avatar routes in Postman.

Important Sprint 3 decisions:
- Do not rewrite Auth.
- Do not move refresh tokens to cookies in this sprint.
- Do not introduce frontend work.
- Use local disk storage for avatar uploads during this learning sprint.
- External storage such as Cloudinary/S3 is deferred to a future production/deployment sprint.

## Sprint 4 Approved Decisions — Posts v2 with Separate Images

Approved scope:
- Build a `posts` resource as the first full production-minded resource in the backend.
- Posts are simple community posts: `title`, `content`, `images`, `author`, `status`, `deletedAt`, timestamps.
- Public users may read active posts:
  - `GET /api/v1/posts`
  - `GET /api/v1/posts/:postId`
- Authenticated users may:
  - create posts
  - view their own posts
  - update their own posts
  - soft-delete their own posts
  - upload images to their own posts through a dedicated endpoint
- Admin users may update/delete/upload images for any post.
- Post images must be uploaded through a separate endpoint, not inside `POST /posts`.
- Use local disk storage for Sprint 4, but design upload/storage code with a clear storage abstraction so it can later be migrated to S3/Cloudinary without rewriting post business logic.
- Maximum post images per post: 5.
- Allowed image MIME types: image/jpeg, image/png, image/webp.
- Max size per image: 5MB.
- Do not implement comments, likes, reports, notifications, Cloudinary/S3, or magic-byte validation in Sprint 4.



## Sprint 4 Status — Posts v2 with Separate Image Uploads

Status: Completed

Files Added:
backend/src/modules/posts/post.model.ts
backend/src/modules/posts/post.validation.ts
backend/src/modules/posts/post.service.ts
backend/src/modules/posts/post.controller.ts
backend/src/modules/posts/post.routes.ts
backend/src/middleware/post-images.middleware.ts
backend/src/utils/file-storage.ts

Files Modified:
backend/src/config/upload.ts (added POST_IMAGE_* constants; avatar exports untouched)
backend/src/app.ts (mounted /api/v1/posts)

Concepts Learned:
- Separating resource creation (JSON) from file upload (multipart) as distinct endpoints.
- Soft delete vs hard delete, and why reversibility argues against also deleting files immediately.
- Ownership re-derivation from req.user (never trusting client-supplied ids) at the service layer.
- Regex vs $text search trade-offs for a small-scale feed.
- Cleaning up orphaned uploaded files when a later validation/DB step fails.

Architecture Decisions:
- Post images live under uploads/posts, served via the existing /uploads static route — no new static mount needed.
- Image URLs stored on the post document as plain strings; storage constants centralized in config/upload.ts for a future S3/Cloudinary swap.
- DELETE /posts/:postId returns 204 (no body), a deliberate one-off exception to sendSuccess, matching API_CONVENTIONS.md's status table.
- deletePost is idempotent (deleting an already-deleted post is a no-op, not an error).

Security Decisions:
- author/status/images/deletedAt are never accepted from the client on create or update (.strict() schemas).
- Ownership/role check happens in post.service.ts, not the controller.
- Post image mime type enforced server-side; filenames always server-generated.

Known Issues / TODOs:
- Magic-byte validation still deferred (per Sprint 3 decision).
- Soft-deleted posts' image files remain on disk (documented, deferred cleanup).
- Search uses regex, not $text or an external search engine (fine at current scale).

What Must Not Be Changed in Sprint 5:
- posts module layering and ownership pattern.
- Soft delete semantics (status/deletedAt).
- Image upload separation from post creation.