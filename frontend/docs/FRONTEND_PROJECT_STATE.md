# SND Frontend Project State

## Project

- Product: سند (SND)
- Primary audience: residents of Gaza
- Frontend: Next.js App Router, not yet initialized
- Backend: SND Community Core API deployed on Render
- Current milestone: Sprint F0.5 decisions complete and approved
- Next roadmap sprint: F1 — frontend foundation and visual direction
- Current learning milestone: six foundation lessons and the F0.5 contract-first lesson completed

## Current Status

Sprint F0 documentation was approved by the product owner on 2026-07-13, including:

- the frontend roadmap;
- hiding owner-deleted content from normal V1 UI;
- unit/component and E2E coverage for critical journeys;
- Arabic/RTL-first and mobile-first direction;
- WCAG 2.2 AA target;
- in-memory access token with backend HttpOnly refresh cookie and CSRF;
- public reading with authentication required at interaction;
- comments, likes, saves, and report submission in V1;
- admin, report administration, role promotion, account deletion, password recovery/change, and multi-device sessions deferred.

F0.5 was closed without backend changes on 2026-07-13:

- Public Profile was deferred from V1; author name/avatar remain display-only.
- Lazy per-visible-card Like/Save status requests were accepted as temporary performance debt for authenticated users.
- Guests make no viewer-state requests; a protected batch endpoint is the preferred future optimization.
- A reusable active navigation link using Next.js `Link`, `usePathname`, and `aria-current` was accepted without adding React Router.
- Final cookie/CORS verification remains scheduled for F3/F8 after a stable Vercel origin exists.

No frontend implementation code has been created. No frontend typecheck, build, or test result exists or is claimed.

## Approved Documentation

The approved baseline includes:

- project context and product scope;
- frontend architecture;
- API and auth contracts;
- UI system structure and full UX states;
- decisions and roadmap;
- testing and deployment strategy;
- learning and AI working rules.

Final palette, typography, visual direction, and tagline are intentionally not approved yet. The supplied product-board image is a source for the سند/SND logo only.

## Verified Backend Integration Position

- Production API base: `https://snd-community-core-api.onrender.com/api/v1`
- Public API supports visible post feed/detail and public comment lists.
- Protected operations use a Bearer access token.
- Refresh token is an HttpOnly cookie scoped to `/api/v1/auth`.
- Refresh/logout require `X-CSRF-Token`.
- Production cookie position is `Secure`, `SameSite=None`, and host-only.
- Final Vercel origin will be known after deployment and then added to Render CORS.

## Accepted V1 Limitations

- One active refresh session per user.
- No change/forgot password or email verification.
- No account deletion UI/backend operation.
- No owner restore for deleted posts/comments; deleted content remains outside normal V1 UI.
- No admin interface in V1.
- No comment count on feed cards.
- No public-profile route, author-profile navigation, or public-profile SEO in V1.
- Authenticated feed viewer state uses lazy per-visible-card requests until measured performance justifies a batch backend contract.

## Accepted Deferred Contracts and Risks

### Public Profile

No backend endpoint exists, so Public Profile is explicitly outside V1. The frontend must not invent a route/response or make author identity clickable. A future sprint may restore it after an approved contract.

### Feed Like/Save Viewer State

The feed returns `likesCount`, but not `likedByMe` or `savedByMe`. V1 accepts status calls only for authenticated cards that enter the viewport, reuses Query cache, and does not treat unknown status as `false`. F6 must measure the resulting `1 + 2N` risk. A protected batch endpoint is the preferred later improvement.

## Current Learning Position

The learner has built and deeply studied the backend through authentication, posts, interactions, reports, admin operations, deployment, and Postman verification. The frontend track will follow the same learning-first method.

The learner completed and explained:

1. how a browser request travels through Next.js, Express, and MongoDB;
2. rendering versus data ownership;
3. Server Components versus Client Components;
4. server state, form state, URL state, and local UI state;
5. API client, Query keys, cache freshness, invalidation, and mutation reconciliation;
6. memory access tokens, HttpOnly refresh cookies, CSRF, CORS, bootstrap, single-flight refresh, and logout cleanup;
7. contract-first scope reduction and the Like/Save N+1 trade-off.

## Immediate Next Actions

1. Begin the F1 concept lecture: frontend foundation, tooling responsibilities, and visual-direction process.
2. Prepare the exact F1 file map and small implementation batches before generating code.
3. Compare the approved visual-direction candidates and choose semantic token direction with the owner.
4. Initialize code only after the learner can explain the foundation file map and verification plan.
5. Keep final Vercel CORS/cookie verification open until deployment provides the exact origin.

## Definition of Done for F0

- Eleven foundation documents created and reviewed.
- Five operating/learning documents created.
- Roadmap and the two pending decisions explicitly approved.
- Product/backend gaps recorded without invented contracts.
- No frontend code created prematurely.

## Definition of Learned for F0

F0 learning is complete when the learner can explain:

- why frontend planning starts from product journeys and API contracts;
- why code is a lower source of truth than verified behavior only when the code has not been tested, and why current verified code outranks stale documents;
- which V1 features are supported, deferred, or blocked;
- why Public Profile can be deferred without blocking private profile/My Posts;
- why lazy visible-card viewer-state calls reduce but do not remove the `1 + 2N` risk;
- why unknown relationship state is not equivalent to `false`;
- why implementation should not begin as a large code dump.

## State Update Protocol

After every sprint:

1. record only verified implementation and test results;
2. update current milestone and next action;
3. list unresolved risks honestly;
4. record the learner's demonstrated concepts and remaining weak points;
5. update decisions/contracts/roadmap only where their own responsibility changed;
6. never claim a command or test passed without actual output.

### F1 — Batch 2.1: Query Provider

- Installed `@tanstack/react-query`.
- Created `src/providers/query-provider.tsx`.
- The provider creates one stable `QueryClient` per mounted application.
- Query data remains fresh for 60 seconds by default.
- Automatic retries remain disabled until the typed API error and retry policy are implemented.
- Verification: `npm run lint` and `npm run typecheck` passed.
- The provider is not connected to the root layout yet.