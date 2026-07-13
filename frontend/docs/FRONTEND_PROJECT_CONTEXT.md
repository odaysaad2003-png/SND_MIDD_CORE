# SND Frontend Project Context

## Document Status

- Phase: Sprint F0 — documentation and contract discovery
- Status: approved by the product owner on 2026-07-13
- Product name used in this document: **سند (SND)**
- Primary audience: residents of Gaza
- Backend source: the latest backend commit supplied for this review, matching the commit deployed on Render

## Product Definition

سند is an Arabic-first community platform centered in V1 on public posts. A post may express a personal situation, a request for help or service, a community topic, or a general update. V1 must not imply a marketplace, merchant workflow, payment system, notification system, or typed-post taxonomy that the current backend does not implement.

The frontend should make the product feel human, trustworthy, calm, youthful, and useful under Gaza's mobile and connectivity constraints. The interface is RTL-first, mobile-first, accessible, and usable on slow connections and lower-end phones.

## Frontend Goal

Build a coherent product experience on top of the existing API while keeping backend contracts explicit. The frontend should provide:

- a distinctive landing page with a public feed preview;
- public browsing of visible posts and their comments;
- registration, login, session recovery, and logout;
- authenticated post creation, editing, deletion, and image management;
- likes and saves from feed cards and post details;
- comments and reporting from post details;
- current-user profile management; Public Profile is a future feature outside V1;
- saved posts and current-user posts;
- privacy, community-policy, and related public information pages;
- a complete system for loading, empty, error, upload, and slow-network states.

## Users and Roles

### Guest

Can use the public API to list visible posts, open a visible post, search/sort the feed, and read its comments. Any attempt to create or mutate content should lead to authentication and then return the user to the intended action where practical.

### Authenticated User

Can manage their safe profile fields and avatar, create and manage their own posts and images, comment, like, save, and report supported content. Publicly exposed identity is limited to name, avatar, and the backend-provided user ID. Email is private.

### Admin

The backend contains admin operations, but the admin UI, report management, account deletion operations, and user-to-admin promotion are deferred to the later dashboard phase. The current backend has no role-promotion endpoint.

## V1 Boundary

### Included

- landing page and public feed;
- public post details and comments;
- registration/login/session/logout;
- current-user profile and avatar;
- posts and post-image management;
- comments, likes, saves, and user reporting;
- saved-post and my-post experiences;
- dark mode and semantic design tokens;
- responsive, accessible, and slow-network-aware behavior;
- SEO for the landing page and public posts;
- privacy and community-policy pages.

### Deferred

- admin and moderation interfaces;
- report-review interface;
- admin promotion UI and backend operation;
- change/forgot password and email verification;
- account deletion UI and backend operation;
- multi-device session support;
- notifications, chat, payments, merchants, volunteers, typed listings, and complex marketplace features.
- public author profiles, author-profile navigation, and public-profile SEO.

## Backend Relationship

The API is the authority for fields, permissions, states, and validation. The frontend must not invent post types, counts, user attributes, or routes. Standard JSON success responses use `{ success: true, data, meta? }`; errors use `{ success: false, error: { code, message, details? } }`; `204` responses have no body.

Important integration constraints:

- access tokens are returned in JSON and sent as Bearer tokens;
- refresh tokens are HttpOnly cookies scoped to `/api/v1/auth`;
- refresh and logout require `X-CSRF-Token`;
- production cookies are confirmed as `Secure`, `SameSite=None`, with no shared cookie domain;
- browser requests that need the refresh cookie must use credentials;
- the access token is held in memory only;
- protected server rendering is not available with the current cross-origin cookie topology; protected data loads on the client after session bootstrap;
- public pages can use Server Components and public API requests;
- post creation and image upload are separate operations.

## Deployment Context

- Backend: Render
- API base URL: `https://snd-community-core-api.onrender.com/api/v1`
- Backend production branch: `production`
- Frontend target: Vercel
- Frontend production URL: TBD
- Repository layout target:

```text
root/
  backend/
  frontend/
```

The final Vercel origin must be added to the backend CORS allowlist before production auth verification. Preview deployments require an explicit policy; wildcard credentialed CORS is prohibited.

## Visual Direction

- Arabic and RTL first;
- realistic community photography combined with restrained abstract shapes;
- light and dark themes designed as related systems, not simple color inversion;
- final colors remain undecided and must be selected after reviewing several visual styles;
- the supplied reference image is a **logo source only**. No product scope, copy, categories, roles, features, or colors may be inferred from it;
- only the سند/SND logo may be isolated from that reference when an asset is prepared.

## Key Risks and Gaps

1. No public-user profile endpoint exists. Public Profile is explicitly deferred from V1, and author identity remains display-only until a future approved contract exists.
2. Feed responses include `likesCount` but not `likedByMe` or `savedByMe`. V1 accepts lazy per-visible-card status calls for authenticated users as measured temporary `1 + 2N` performance debt; guests make no viewer-state calls.
3. Posts do not expose `commentsCount`; V1 will show comment totals only on the detail page using comment-list metadata.
4. A text post is created before images upload. Image failure must keep the created post visible and offer retry/removal states.
5. A single refresh session per user is an accepted V1 limitation; multi-device and multi-tab edge cases require careful session recovery.
6. Password recovery/change, email verification, and account deletion do not exist in the current route contract.
7. The frontend production origin is not yet known, so final CORS verification remains open.
8. Backend documentation contains stale JSON-refresh statements; frontend auth documentation follows the current cookie implementation in code.

## Approved Working Decisions

- Deleted posts are not surfaced in the normal V1 interface because no owner restore endpoint exists.
- Testing includes unit/component coverage and E2E coverage for critical auth, posting, upload, and interaction journeys.
- The product name shown to users is سند, with SND as the Latin mark; the final tagline remains TBD.
- Admin and Public Profile backend gaps do not block V1. Feed viewer state uses the accepted lazy visible-card strategy in F6; a protected batch endpoint is the preferred future optimization if measurement shows the cost is unacceptable.
