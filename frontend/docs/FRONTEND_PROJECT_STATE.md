# SND Frontend Project State

## Project

- Product: سند (SND)
- Primary audience: residents of Gaza
- Frontend: Next.js App Router, React, TypeScript strict, Tailwind CSS, Arabic/RTL-first
- Backend: SND Community Core API deployed on Render
- Current milestone: Sprint F2 implementation candidate after the 2026-07-14 public-discovery architecture and visual revision
- Remaining F2 engineering gate: owner runs and reports `lint`, `type`, `test`, and `build`, followed by browser checks for `/`, `/posts`, public post details, comments, dark mode, mobile, and reduced motion
- Remaining F2 learning gate: learner explains Query ownership, prefetch/hydration, URL state, retry boundaries, and legacy-media handling

## Approved Product and Contract Position

- Sprint F0 and F0.5 were completed and approved on 2026-07-13.
- Guests may read public content; authentication is required when interacting.
- Access and CSRF tokens remain in memory; the refresh token remains in the backend HttpOnly cookie.
- Public Profile, admin/report administration, account recovery/change/deletion, and multi-device sessions remain deferred.
- Final cross-origin cookie/CORS verification remains scheduled for F3/F8 after a stable Vercel origin exists.
- The supplied product-board image contributes the سند/SND logo only; no claims, features, layouts, or colors were copied from it.

## F1 Implemented Foundation

### Application and Providers

- Next.js 16.2.10, React 19.2.4, TypeScript strict, Tailwind CSS 4, ESLint 9, Arabic metadata, and root `lang="ar" dir="rtl"`.
- Focused Query, Theme, and composed application providers preserve the Server/Client boundary.
- One stable `QueryClient` instance owns server-state cache; default automatic retries remain disabled until feature-specific policy exists.
- Theme selection supports light, dark, and system without storing sensitive data.
- The theme control waits for browser mount before exposing the persisted selection, preventing server/client theme-state mismatch.

### Environment and API Foundation

- `.env.example` documents the required public API base URL without containing a secret.
- `NEXT_PUBLIC_API_BASE_URL` is validated with Zod when the Next configuration/API module initializes, normalized, restricted to `/api/v1`, and HTTPS-only in production.
- API URL construction accepts relative feature endpoints only and rejects empty/base-only endpoints, absolute URLs, protocol-relative URLs, boundary traversal, and fragments.
- The shared API client adds `Accept`, preserves caller headers and abort signals, handles `204` without JSON parsing, validates envelope shape, retains request IDs, and distinguishes HTTP, network, and invalid-response failures.
- Authorization, CSRF, refresh coordination, feature schemas, feature retry policy, and mutation behavior remain intentionally outside this infrastructure layer until their owning sprints.

### UI and Visual Foundation

- `Calm Contemporary` is the approved visual direction.
- IBM Plex Sans Arabic is installed and imported locally at weights 400, 500, 600, and 700, with system fallbacks.
- Light and dark themes use independently tuned semantic tokens, visible focus, logical RTL spacing, minimum touch targets, and reduced-motion handling.
- Reusable Button, Input, Field, Card, Feedback, and Theme Toggle primitives exist with focused component tests.
- The prepared transparent logo asset is stored at `public/brand/snd-logo.png` and rendered without recoloring.
- The `(public)` foundation showcase remains a Server Component; only the Theme Toggle is a focused client island.
- The temporary visual-direction comparison component was removed after owner approval so dead exploratory styles do not remain in production source.

### Test Foundation and Commands

- Vitest, React Testing Library, user-event, jest-dom, and jsdom are configured.
- Unit tests cover environment validation, API-boundary construction, envelopes, `204`, request IDs, error classification, and abort preservation.
- Component tests cover disabled state, accessible field relationships, blocking feedback, and theme selection.
- Actual package commands are `npm run lint`, `npm run type`, `npm test`, and `npm run build`.
- Browser E2E, MSW integration tests, and automated axe checks are not installed yet; they must be added only when their planned feature layer needs them.
- No post-synchronization command result is claimed in this document until the owner reports it.

## F2 Implementation Candidate — Not Yet Verified

- Landing is split into focused Hero, steps, live-feed preview, trust, CTA, and FAQ components; the route `page.tsx` remains a clean feature entry point.
- The Hero uses the scoped `motion` package for purposeful entrance, orbit, and floating-signal movement. Reduced-motion users receive stable content without required animation.
- Public feed preview, full feed, and public comments now use feature-owned Query Keys and Query Options, server prefetch, dehydration/hydration, browser cache reuse, abort signals, bounded retry, and local refetch UI.
- Search, sort, and pagination remain URL state; TanStack Query owns only server state.
- Header, footer, theme menu, cards, skeletons, and loading route were visually revised. The original logo is never recolored and is placed on a stable white brand plate so it remains visible in dark mode.
- The deployed feed was inspected and revealed legacy relative `/uploads/posts/...` image strings. The response schema now follows the actual `string[]` shape, while media rendering accepts only supported HTTPS Cloudinary URLs. Broken legacy media no longer rejects the entire feed.
- `next/image` is restricted to the verified Cloudinary host.
- No verification command result is claimed yet, and F2 is not Complete.

## Learning Position

The learner has demonstrated the provider lifecycle and Server/Client boundary, identified that `204` must bypass JSON parsing, distinguished feature-specific data ownership from shared HTTP infrastructure, preserved `AbortError`, explained why blindly retrying a POST can duplicate a mutation, and studied the semantic-token/global-CSS foundation. Detailed test-file mechanics were intentionally deferred and remain a scheduled learning debt rather than hidden completion.

## Accepted Limitations and Open Risks

- One active refresh session per user and the accepted authenticated feed `1 + 2N` viewer-state risk remain V1 constraints.
- Final Vercel origin/CORS/cookie verification is not possible before deployment.
- The last reported audit contained two moderate findings in a Next.js transitive PostCSS dependency with no compatible fix; re-check this only at a planned dependency/security gate rather than changing framework versions blindly.
- React Hook Form remains uninstalled until the first real form consumer in F3/F5. The `motion` package is now installed for the scoped F2 landing Hero/reveal consumer and must not spread into ordinary controls or server-renderable routes without a new need.
- The tagline and final production landing content remain open; F1 does not invent them.
- Contrast, responsive, keyboard, and reduced-motion browser review remain part of the owner-run final F1 gate and later F2 quality work.

## Immediate Next Action

1. Owner copies/extracts the synchronized F2 candidate and runs `npm install`, then reports `npm run lint`, `npm run type`, `npm test`, and `npm run build` separately.
2. Perform browser review on narrow mobile and desktop for `/`, `/posts`, one legacy post, one Cloudinary-image post, comments, light/dark, keyboard focus, and reduced motion.
3. Study the implementation in this order: query factory → server prefetch wrapper → hydrated client list → API/schema/media boundary → visual motion island.
4. Only after engineering and learning gates pass, mark F1/F2 status consistently and prepare the final Sprint 2 commit.

## State Update Protocol

After every implementation group or sprint:

1. record only implemented behavior and the commands or behavior that verified it;
2. update the current milestone and exact next action;
3. keep unresolved risks and missing test layers visible;
4. update durable decisions/contracts only when their responsibility changed;
5. never describe an unexecuted check as passing.
