# SND Frontend Decisions

This file records durable frontend Architecture Decision Records. `Accepted` means approved by owner direction or unavoidable current backend behavior. `Proposed` requires explicit review before implementation.

## FADR-001 — Next.js App Router

**Status:** Accepted  
**Decision:** Use Next.js App Router with TypeScript strict.  
**Consequence:** Public content can use Server Components and metadata APIs; interactive/protected areas use focused Client Components.

## FADR-002 — Arabic and RTL First

**Status:** Accepted  
**Decision:** Arabic is the primary product language and the interface is RTL-first.  
**Consequence:** Logical CSS properties, bidirectional-content isolation, Arabic typography, and RTL testing are baseline requirements.

## FADR-003 — Gaza, Mobile, and Slow Connectivity as Primary Context

**Status:** Accepted  
**Decision:** Design first for Gaza residents, narrow mobile screens, lower-end phones, and slow/unstable connections.  
**Consequence:** Public content prioritizes text, media is responsive/lazy, JavaScript and motion are constrained, and offline/retry states are first-class.

## FADR-004 — Feature-Based Frontend Structure

**Status:** Accepted  
**Decision:** Organize business code by feature with shared primitives/infrastructure in narrow common folders.  
**Reason:** Keeps posts, comments, auth, saves, profiles, and reports independently maintainable without premature package complexity.

## FADR-005 — TanStack Query Owns Server State

**Status:** Accepted  
**Decision:** Use TanStack Query for API data, cache, mutation state, invalidation, and background refresh. URL parameters own shareable feed state; forms own form state.  
**Consequence:** Do not duplicate server data in a global store.

## FADR-006 — No Unnecessary Global State Library

**Status:** Accepted  
**Decision:** Do not add Redux or Zustand unless a concrete future state problem cannot be handled by Query, URL state, context, or local state.  
**Consequence:** Auth uses a narrow in-memory provider; theme uses next-themes.

## FADR-007 — In-Memory Access Token

**Status:** Accepted  
**Decision:** Store access and CSRF tokens in memory only; keep the refresh token solely in the backend HttpOnly cookie.  
**Consequence:** Protected sessions bootstrap in the browser and protected data is not server-rendered under the current Vercel/Render topology.

## FADR-008 — Cookie/CSRF Session Recovery

**Status:** Accepted  
**Decision:** Recover a session through `/auth/csrf` then `/auth/refresh`, using credentials and `X-CSRF-Token`; coordinate refresh as a single flight.  
**Consequence:** A final refresh failure clears private state. Refresh/logout never use localStorage tokens or JSON refresh-token bodies.

## FADR-009 — One Refresh Session in V1

**Status:** Accepted, temporary  
**Decision:** Accept the backend's single active refresh session per user and defer multi-device session design.  
**Consequence:** Session-replaced messaging and multi-tab tests are required.

## FADR-010 — Public Reading, Authentication at Interaction

**Status:** Accepted  
**Decision:** Guests can browse the feed, post details, and comments. Registration/login is required when they try to create, like, save, comment, or report.  
**Consequence:** Auth routes preserve safe internal return paths.

## FADR-011 — V1 Community Interaction

**Status:** Accepted  
**Decision:** Comments, likes, saves, and report submission are V1. Report administration is deferred with the admin dashboard.  
**Consequence:** User-facing reporting confirms submission without exposing admin workflow.

## FADR-012 — Like and Save on Feed Cards

**Status:** Accepted, temporary V1 implementation  
**Decision:** Keep Like and Save on feed cards and post details without changing the backend now. Guests make no viewer-state calls. After auth bootstrap, authenticated clients request Like/Save status only for cards that enter the viewport and cache each result by post ID. Unknown or failed status is not treated as `false`.  
**Consequence:** The current per-post endpoints still create a measured `1 + 2N` request risk as more cards become visible. F6 must measure the actual volume, reuse cached results, and reconcile mutations with server responses. A protected batch viewer-state endpoint is the preferred future improvement while the public feed remains independently cacheable.

## FADR-013 — Comment Count Only on Post Detail

**Status:** Accepted  
**Decision:** Do not show comment totals on feed cards because Post responses have no `commentsCount`. Use comment pagination metadata on the detail page.  
**Consequence:** Avoid one comments request per feed card.

## FADR-014 — Public Profile Deferred from V1

**Status:** Accepted, deferred  
**Decision:** Remove the public author-profile journey from V1 and revisit it in a separately approved future backend/frontend sprint. Continue showing the author name and avatar supplied with posts/comments, but do not make them profile links.  
**Consequence:** V1 creates no `/users/[userId]` route, public-profile query, author-profile navigation, or profile SEO. The private current-user profile, My Posts, and Saved Posts remain in scope. No frontend route or response is fabricated.

## FADR-015 — Separate Post and Image Mutations

**Status:** Accepted  
**Decision:** Follow the backend flow: create the text post first, then upload optional images.  
**Consequence:** Failed image upload does not undo the text post; the UI offers retry using the existing post ID.

## FADR-016 — Deleted Owner Content Hidden in V1

**Status:** Accepted  
**Decision:** Do not expose deleted posts/comments in normal V1 navigation because no owner restore endpoint exists.  
**Consequence:** No misleading restore/archive controls are rendered.

## FADR-017 — Admin Surface Deferred

**Status:** Accepted  
**Decision:** Defer admin dashboard, report management, account deletion operations, and role-promotion UI.  
**Consequence:** Admin backend routes are outside V1 frontend bundles/navigation. The missing role-promotion backend operation is tracked for the admin phase.

## FADR-018 — Dark Mode Uses Semantic Tokens

**Status:** Accepted  
**Decision:** Support light/dark themes from V1 using semantic tokens with independently designed values.  
**Consequence:** Dark mode is not an automatic inversion or pure-black variant.

## FADR-019 — Visual Direction Remains Open

**Status:** Accepted  
**Decision:** Review multiple visual styles before adopting final color and typography values. Use realistic photography with restrained abstract shapes.  
**Consequence:** Sprint F0 defines token roles only. The supplied image contributes the logo and no other product/design facts.

## FADR-020 — WCAG 2.2 AA

**Status:** Accepted  
**Decision:** Treat WCAG 2.2 AA as the product accessibility target.  
**Consequence:** Accessibility is included in component design, testing, content, motion, and Definition of Done.

## FADR-021 — SEO for Landing and Public Posts

**Status:** Accepted  
**Decision:** Index the landing page and public post pages; keep auth and private pages out of search results.  
**Consequence:** Public post metadata is server-generated from public API data. Public-profile SEO is deferred with the public-profile feature.

## FADR-022 — Repository Separation

**Status:** Accepted  
**Decision:** Keep `backend/` and `frontend/` as clear siblings in one repository.  
**Consequence:** Frontend code and configuration do not enter the backend directory.

## FADR-023 — Critical Automated Test Coverage

**Status:** Accepted  
**Decision:** Use unit/component tests plus E2E tests for auth, posts, images, comments, likes, saves, reporting, accessibility, and production smoke paths.  
**Consequence:** Sprint completion requires repeatable verification, not manual browser checks alone.

## FADR-024 — Reusable Active Navigation Link

**Status:** Accepted  
**Decision:** Build a small reusable navigation-link component on top of Next.js `Link` and `usePathname` rather than adding React Router. It owns exact/prefix route matching and applies `aria-current="page"` to the active destination.  
**Consequence:** Only the active-link island requires client JavaScript; the whole header/layout does not become a Client Component. Active state must remain visible without relying on color alone and must be verified for RTL, keyboard focus, nested routes, and mobile touch targets.
