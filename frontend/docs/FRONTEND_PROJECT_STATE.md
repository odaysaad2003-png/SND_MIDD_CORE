# SND Frontend Project State

## Project

- Product: سند (SND)
- Primary audience: residents of Gaza
- Frontend: Next.js App Router initialized with TypeScript strict and Tailwind CSS
- Backend: SND Community Core API deployed on Render
- Current milestone: Sprint F1 in progress — foundation and provider spine
- Next implementation group: environment contract and typed API foundation, after the provider learning checkpoint
- Current learning milestone: provider composition and the Server/Client boundary

## Approved Product and Contract Position

Sprint F0 and F0.5 were completed and approved on 2026-07-13.

- Arabic/RTL-first, mobile-first, slow-network-aware, WCAG 2.2 AA target.
- Access and CSRF tokens stay in memory; the refresh token remains in the backend HttpOnly cookie.
- Guests may read public content; authentication is required when interacting.
- Public Profile is deferred from V1. Author name/avatar are display-only and are not profile links.
- Feed Like/Save viewer state uses lazy per-visible-card protected requests for authenticated users as temporary V1 debt.
- Guests send no viewer-state requests; a protected batch endpoint remains the preferred future optimization.
- Admin/report administration, role promotion, account deletion, password recovery/change, and multi-device sessions remain deferred.
- Final cross-origin cookie/CORS verification remains scheduled for F3/F8 after a stable Vercel origin exists.
- The supplied product-board image contributes the سند/SND logo only.

## F1 Verified Implementation State

### Batch 1 — Application Foundation

- Created the Next.js App Router application with Next.js 16.2.10, React 19.2.4, TypeScript strict, Tailwind CSS 4, and ESLint 9.
- Added Arabic root metadata with `lang="ar"` and `dir="rtl"`.
- Kept the root page and root layout server-renderable.
- Added `lint`, `typecheck`, `build`, and production-start scripts.
- Shared-workspace verification passed: lint, typecheck, production build, and an Arabic/RTL runtime smoke check.
- The learner implemented a semantic list and corrected logical list spacing from `pe-5` to `ps-5` for the inline-start marker side in RTL.

### Batch 2.1 — Query Provider

- Installed `@tanstack/react-query` 5.101.2.
- Created `src/providers/query-provider.tsx` as a focused Client Component.
- One stable `QueryClient` owns the Query cache and is preserved with a lazy `useState` initializer.
- Queries remain fresh for 60 seconds by default.
- Automatic retries remain disabled until typed API errors can distinguish transient GET failures from auth, permission, and validation failures.
- The learner ran `npm run typecheck` successfully after implementing the provider.

### Batch 2.2 — Provider Composition and Theme

- Installed `next-themes` 0.4.6.
- Created a focused Theme Provider using class-based `light`, `dark`, and `system` themes with the non-sensitive `snd-theme` storage key.
- Added the Tailwind class-driven dark custom variant to the global stylesheet.
- Created `AppProviders` to compose Theme and Query providers without feature or API logic.
- Connected `AppProviders` inside the server `RootLayout`.
- Added narrow `suppressHydrationWarning` handling on `<html>` because the server cannot read browser theme storage/system state.
- The learner reported successful lint, typecheck, and production build after completing the group; raw logs were not retained in this shared workspace.
- No theme toggle, Auth Provider, API request, Query hook, or feature UI has been added yet.

## Current Learning Position

The learner has demonstrated:

- `QueryClient`, not `useState` or `AppProviders`, owns the Query cache;
- `useState` preserves one Query Client instance for the provider lifetime;
- `staleTime` controls freshness, while inactive-cache retention belongs to `gcTime`;
- static JSX/Tailwind does not require a Client Component;
- a Server Component cannot read `localStorage` or browser system-theme state;
- a theme preference may be persisted because it is not an authentication secret.

The provider learning checkpoint is complete. The learner demonstrated that:

- a Client Provider may wrap server-rendered children without converting `RootLayout` into a Client Component;
- unmounting `AppProviders` discards its React state and the previous in-memory Query Client cache;
- remounting creates a new Query Client with an empty cache;
- browser-dependent theme UI must wait until mount because the server cannot read `localStorage` or the user's system theme.
## Verified Backend Integration Position

- Production API base: `https://snd-community-core-api.onrender.com/api/v1`
- Public API supports visible post feed/detail and public comment lists.
- Protected operations use a Bearer access token.
- Refresh token is an HttpOnly cookie scoped to `/api/v1/auth`.
- Refresh/logout require `X-CSRF-Token`.
- Production cookie position is `Secure`, `SameSite=None`, and host-only.
- Final Vercel origin will be known after deployment and then added to Render CORS.

## Accepted V1 Limitations and Risks

- One active refresh session per user.
- No change/forgot password, email verification, or account deletion.
- No owner restore for deleted posts/comments; deleted content stays outside normal V1 UI.
- No admin interface or report administration in V1.
- No comment count on feed cards.
- No public-profile route, author-profile navigation, or public-profile SEO in V1.
- Authenticated feed viewer state temporarily carries a measured `1 + 2N` risk.
- Two moderate audit findings remain in Next.js's transitive PostCSS dependency; no unsafe forced downgrade was applied.
- Final palette, typography, visual direction, tagline, and prepared logo assets remain open.

## Immediate Next Actions

1. Start the connected F1 environment and typed API foundation group: public environment validation, safe API URL construction, response-envelope parsing, and typed `ApiError`.
2. Start a small connected F1 group for public environment validation, API URL construction, response-envelope parsing, and typed `ApiError`.
3. Define retry behavior only after typed errors exist; never blindly retry auth, forbidden, validation, or unsafe mutation failures.
4. Run and retain lint, typecheck, and build output after the group.
5. Update this file and `FRONTEND_LEARNING_NOTES.md` after every verified group.
6. Continue the visual-direction comparison later in F1; keep deployed CORS/cookie verification open until the Vercel origin exists.

## F1 Completion Boundary

F1 remains in progress. It is not complete until the foundation, typed API/environment layer, route/feature boundaries, semantic tokens, accessible core components, logo preparation, visual-direction approval, theme prototype, verification, and learning gate are all complete.

## State Update Protocol

After every implementation group or sprint:

1. record only implemented behavior and clearly identify the source of verification;
2. update the current milestone and exact next action;
3. keep unresolved risks visible;
4. record demonstrated concepts and remaining weak points;
5. update decisions/contracts/roadmap only when their own responsibility changed;
6. never mark a sprint complete unless both Definition of Done and Definition of Learned pass.