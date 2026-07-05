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