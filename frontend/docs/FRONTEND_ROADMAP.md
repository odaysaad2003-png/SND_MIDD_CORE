# SND Frontend Roadmap

## Roadmap Status

**Approved by the product owner on 2026-07-13.** Sprint boundaries may still be refined through the documented change process, but implementation follows this roadmap unless a later decision supersedes it.

| Sprint | Focus | Status |
|---|---|---|
| F0 | Documentation and verified contracts | Complete and approved |
| F0.5 | Contract decisions without backend changes | Complete and approved |
| F1 | Frontend foundation and visual direction | In progress — foundation and provider spine implemented |
| F2 | Landing page and public discovery | Proposed |
| F3 | Authentication and session | Proposed |
| F4 | Profiles and current-user content | Proposed |
| F5 | Post creation, editing, and images | Proposed |
| F6 | Comments, likes, saves, and reporting | Proposed |
| F7 | SEO, accessibility, performance, and policy quality | Proposed |
| F8 | Production deployment and verification | Proposed |
| F9 | Admin and moderation frontend | Deferred |

## Sprint F0 — Documentation and Verified Contracts

### Goal

Create one consistent frontend source of truth before code.

### In Scope

- product context and V1 scope;
- architecture and state ownership;
- API and auth contracts extracted from code;
- UI system structure and UX states;
- decisions, testing, deployment, and roadmap drafts;
- documented code/docs conflicts and backend gaps.

### Out of Scope

- Next.js scaffolding;
- visual mockups;
- backend changes;
- final roadmap approval.

### Concepts

Source-of-truth hierarchy, API contract discovery, product boundaries, architectural decision records.

### Deliverables

The eleven files in `frontend/docs/`.

### Verification

- compare every V1 route/field against backend routes, validation, controllers, and services;
- cross-check auth cookie/CSRF behavior;
- ensure the image is referenced as logo-only material;
- owner reviews open assumptions.

### Definition of Done

Documents are internally consistent, all gaps are visible, and the owner explicitly approves or requests revisions.

### Dependencies

Latest backend commit and owner decisions; both supplied.

## Sprint F0.5 — Contract Decisions Without Backend Changes

### Goal

Remove or contain backend contract gaps without changing the backend prematurely.

### In Scope

1. Defer Public Profile from V1; keep supplied author name/avatar display-only and create no public-profile route.
2. Accept lazy per-visible-card `likedByMe`/`savedByMe` calls as temporary V1 performance debt.
3. Record a protected batch viewer-state endpoint as the preferred future optimization.
4. Move deployed cookie/CORS verification to F3/F8, when the stable Vercel origin exists.
5. Defer unrelated backend documentation/refactoring to a separately authorized backend task.

### Out of Scope

- admin role promotion;
- password recovery/change;
- account deletion;
- multi-device sessions;
- other backend refactoring.
- any new public-profile, viewer-state, or batch endpoint.

### Concepts

Contract-first integration, data minimization, N+1 request analysis, cross-origin browser authentication.

### Deliverables

- documented Public Profile deferral and resulting F4/SEO boundary;
- documented lazy visible-card viewer-state decision and future batch direction;
- updated frontend scope, contract, architecture, roadmap, decisions, state, and learning records.

### Verification

Cross-document consistency review. No backend code changed, so no backend build/test result is claimed. F6 must measure visible-card requests; F3/F8 must perform real-browser cookie/CORS checks against a stable origin.

### Definition of Done

F4 and F6 have implementable V1 boundaries with no invented fields or routes, and the temporary Like/Save cost is explicit.

### Dependencies

Owner approval of the scope reductions and temporary performance trade-off; approved on 2026-07-13.

## Sprint F1 — Frontend Foundation and Visual Direction

### Goal

Create a production-ready Next.js foundation and choose the visual direction.

### In Scope

- create `frontend/` App Router project with TypeScript strict;
- Tailwind, shadcn/ui baseline, TanStack Query, forms/Zod, theme, motion, icons;
- environment validation and API envelope/error layer;
- providers and root Arabic/RTL metadata;
- route groups and feature folder boundaries;
- core tokens and foundational accessible components;
- isolate/prepare the supplied سند/SND logo only;
- compare Warm Civic, Calm Contemporary, and Human Editorial style explorations;
- light/dark theme prototype.

### Out of Scope

- real feature pages beyond a controlled showcase;
- final landing copy;
- admin UI.

### Concepts

App Router boundaries, semantic tokens, RTL systems, design-system primitives, dependency discipline.

### Deliverables

Buildable frontend foundation, component showcase, logo asset variants, and owner-approved visual direction.

### Verification

Lint/typecheck/build, responsive component review, keyboard/focus review, contrast checks, reduced-motion check, and no-secret environment review.

### Definition of Done

The foundation builds cleanly; token direction is explicitly approved; core components meet accessibility baseline; no feature contract is duplicated ad hoc.

### Dependencies

F0 approval. Final color values depend on owner selection during this sprint.

## Sprint F2 — Landing Page and Public Discovery

### Goal

Make سند understandable and useful to guests before registration.

### In Scope

- landing hero, product explanation, how it works, trust/safety, CTA, FAQ, footer;
- public feed preview and full public feed;
- search, newest/oldest sort, and pagination/load-more behavior;
- public post details;
- public comment reading;
- responsive images, skeletons, empty/error states;
- basic landing and post metadata.

### Out of Scope

- mutations and authenticated viewer state;
- public profile, which is deferred from V1;
- admin features.

### Concepts

Server Components, public data fetching, metadata, URL state, progressive hydration, mobile performance.

### Deliverables

Landing, feed, and post-detail read experience using the live contract.

### Verification

Guest journeys, search/sort/page URLs, empty/error/404 behavior, RTL mobile layouts, slow-network behavior, initial accessibility scan, and public API failure fallback.

### Definition of Done

A guest can understand سند, browse real public content, and open a post/comments without registering; no unsupported product claim appears.

### Dependencies

F1 foundation and approved landing copy/imagery.

## Sprint F3 — Authentication and Session

### Goal

Provide secure browser authentication with reliable cross-origin session recovery.

### In Scope

- register and login forms;
- in-memory auth provider;
- CSRF bootstrap and refresh rotation;
- Bearer API integration and single-flight retry;
- logout and private-cache cleanup;
- protected-route UX and safe `returnTo`;
- session-expired, forbidden, offline, and suspended states.

### Out of Scope

- forgot/change password;
- email verification;
- multi-device management;
- admin navigation.

### Concepts

HttpOnly cookies, CSRF, CORS credentials, access/refresh separation, client route guards vs server authorization.

### Deliverables

Complete auth/session feature and protected layout shell.

### Verification

Register/login/reload/refresh/logout, access expiry, invalid CSRF, missing cookie, wrong origin, session replacement, multi-tab behavior, open-redirect prevention, and private-cache cleanup.

### Definition of Done

No token is persisted in browser storage; deployed-style cross-origin session behavior passes automated and manual browser tests without refresh loops.

### Dependencies

F1 foundation and a controlled frontend environment. Final deployed completion still requires the exact Vercel origin to be allowlisted and verified.

## Sprint F4 — Profiles and Current-User Content

### Goal

Give users clear personal identity and content-management entry points.

### In Scope

- private profile view;
- update name;
- avatar preview/upload/replacement states;
- my active posts with search/sort/pagination;

### Out of Scope

- deleted-content restore;
- email change;
- account deletion;
- admin user management.
- public profile, author-profile links, and public-profile SEO.

### Concepts

Private vs public data, upload preflight, cache identity propagation, profile SEO boundary.

### Deliverables

Private profile and my-posts list.

### Verification

Privacy field audit, owner/non-owner behavior, missing profile, empty posts, avatar type/size/signature errors, upload retry, cache refresh, mobile/keyboard/screen-reader checks.

### Definition of Done

Email never appears publicly; private profile and current-user content management work without inventing a public-profile contract.

### Dependencies

F3 auth.

## Sprint F5 — Post Creation, Editing, and Images

### Goal

Deliver a resilient authoring flow aligned with the two-step backend contract.

### In Scope

- create text post;
- select/preview/remove up to five images;
- separate upload with progress and retry;
- edit owned title/content;
- remove individual image;
- soft-delete owned post with clear no-restore confirmation;
- query invalidation and draft form preservation during recoverable errors.

### Out of Scope

- post types/categories;
- drafts or scheduling;
- owner restore;
- admin moderation.

### Concepts

Multi-step mutations, multipart boundaries, object-URL cleanup, optimistic vs confirmed state, idempotent recovery.

### Deliverables

Create/edit/delete/image-management experiences.

### Verification

Text-only, one/five images, too many/too large/wrong signature, network interruption after post creation, upload retry without duplicate post, remove image, wrong owner, deleted/hidden target, and slow mobile connection.

### Definition of Done

Users always know whether the text post exists; image retry never creates a duplicate post; cache and UI match the returned server state.

### Dependencies

F3 auth and F4 identity/navigation components.

## Sprint F6 — Comments, Likes, Saves, and Reporting

### Goal

Complete the approved V1 community interaction layer.

### In Scope

- Like and Save on feed cards and details;
- correct initial viewer state;
- optimistic state with rollback/reconciliation;
- saved-post list;
- comment create/edit/delete on post details;
- detail-page comment total from metadata;
- post/comment reporting with localized exact reasons;
- authentication-at-interaction return flow.

### Out of Scope

- comment totals on feed cards;
- report history or admin review;
- notifications;
- comment moderation UI.

### Concepts

Optimistic mutations, relationship state, idempotency, cache fan-out, N+1 performance, safe reporting language.

### Deliverables

Full user interaction experience and saved-post page.

### Verification

Guest gating, pre-liked/pre-saved state, duplicate clicks, rollback, count reconciliation, hidden/deleted post behavior, comment ownership, duplicate/self-report errors, pagination, and visible-card request measurement.

### Definition of Done

Feed actions show correct state without unacceptable request volume; failures roll back correctly; reports do not promise an admin outcome.

### Dependencies

F3 auth, F2 feed/detail, and the accepted lazy visible-card viewer-state decision.

## Sprint F7 — SEO, Accessibility, Performance, and Policy Quality

### Goal

Harden the complete user product before deployment.

### In Scope

- final metadata, canonical URLs, sitemap/robots policy, and Open Graph behavior;
- privacy and community-policy pages with approved copy;
- WCAG 2.2 AA audit and remediation;
- responsive/browser matrix;
- throttled-network and low-end-device profiling;
- Core Web Vitals, image and bundle optimization;
- complete UX-state review;
- reduced-motion and theme quality.

### Out of Scope

- new product features;
- admin UI;
- speculative backend scale work.

### Concepts

Technical SEO, accessibility conformance, performance budgets, graceful degradation.

### Deliverables

Release candidate with evidence-backed quality report and approved policy content.

### Verification

Automated accessibility plus manual keyboard/screen-reader review, Lighthouse/Web Vitals, 200% zoom, RTL/bidi cases, dark/light contrast, mobile browsers, slow-network flows, metadata/social preview validation.

### Definition of Done

No critical accessibility issue remains; release budgets and public metadata pass; every important state has reviewed UI.

### Dependencies

F2–F6 feature completion and approved legal/policy copy.

## Sprint F8 — Production Deployment and Verification

### Goal

Deploy safely to Vercel and verify the complete Vercel ↔ Render integration.

### In Scope

- Vercel project and production environment variables;
- final CORS origin and cookie verification;
- preview/staging strategy;
- production build and smoke suite;
- monitoring/error visibility and rollback procedure;
- domain, canonical URL, robots, and sitemap verification.

### Out of Scope

- new features;
- production database mutation beyond controlled test accounts/content;
- admin frontend.

### Concepts

Immutable deployment, environment separation, smoke testing, rollback, observability.

### Deliverables

Verified production deployment and release checklist.

### Verification

Run the production smoke matrix in `FRONTEND_DEPLOYMENT_NOTES.md`, verify logs/request IDs, and test a rollback to the previous good Vercel deployment.

### Definition of Done

Production guest/auth/upload/interaction journeys pass on mobile and desktop; monitoring and rollback are usable; no secret appears in the client bundle.

### Dependencies

F7 release candidate, final Vercel origin, Render availability, and approved production content.

## Sprint F9 — Admin and Moderation Frontend

### Goal

Build a separately scoped operator product after V1 succeeds.

### Possible Scope

Admin dashboard, users, suspend/reactivate, post hide/restore, reports, audit-aware actions, and eventual admin promotion/account-deletion operations after backend contracts exist.

### Boundary

This sprint is intentionally not detailed or approved. Its roadmap must be created from the then-current backend and operational needs, not from V1 assumptions.

## Approval and Dependency Gates

1. F0 documents and this roadmap are approved.
2. The displayed product name is سند/SND; the tagline remains intentionally open.
3. F1 may start with visual exploration, but final tokens require owner approval.
4. F4 cannot complete without the public-profile backend contract.
5. F6 cannot complete without an accepted Like/Save viewer-state performance decision.
6. F3/F8 production auth cannot complete until the exact Vercel origin is known and allowlisted after deployment.