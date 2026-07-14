# SND Frontend Project State

## Project

- Product: سند (SND)
- Primary audience: residents of Gaza
- Frontend: Next.js App Router, React, TypeScript strict, Tailwind CSS, Arabic/RTL-first
- Backend: SND Community Core API deployed on Render
- Current milestone: Sprint F1 complete on 2026-07-14
- Next milestone: Sprint F2 — landing page and public discovery; no F2 feature implementation has started

## Approved Product and Contract Position

- Sprint F0 and F0.5 were completed and approved on 2026-07-13.
- Guests may read public content; authentication is required when interacting.
- Access and CSRF tokens remain in memory; the refresh token remains in the backend HttpOnly cookie.
- Public Profile, admin/report administration, account recovery/change/deletion, and multi-device sessions remain deferred.
- Final cross-origin cookie/CORS verification remains scheduled for F3/F8 after a stable Vercel origin exists.
- The supplied product-board image contributes the سند/SND logo only; no claims, features, layouts, or colors were copied from it.

## F1 Verified Implementation

### Application and Providers

- Next.js 16.2.10, React 19.2.4, TypeScript strict, Tailwind CSS 4, ESLint 9, Arabic metadata, and root `lang="ar" dir="rtl"`.
- Focused Query, Theme, and composed application providers preserve the Server/Client boundary.
- One stable `QueryClient` instance owns server-state cache; default automatic retries remain disabled.
- Theme selection supports light, dark, and system without storing sensitive data.

### Environment and API Foundation

- `NEXT_PUBLIC_API_BASE_URL` is runtime-validated with Zod, normalized, restricted to `/api/v1`, and HTTPS-only in production.
- API URL construction rejects empty endpoints, absolute/cross-origin paths, traversal outside the configured boundary, and URL fragments.
- The shared API client adds `Accept`, preserves caller headers and abort signals, handles `204` without JSON parsing, validates envelope shape, retains request IDs, and distinguishes HTTP, network, and invalid-response failures.
- Authorization, CSRF, refresh coordination, feature schemas, feature retry policy, and mutation behavior remain intentionally outside this infrastructure layer until their owning sprints.

### UI and Visual Foundation

- `Calm Contemporary` is the approved visual direction.
- IBM Plex Sans Arabic is bundled locally with the application.
- Light and dark themes use independently tuned semantic tokens, visible focus, logical RTL spacing, minimum touch targets, and reduced-motion handling.
- Reusable Button, Input, Field, Card, Feedback, and Theme Toggle primitives exist with focused component tests.
- The prepared transparent logo asset is stored at `public/brand/snd-logo.png` and used without recoloring.
- The controlled `(public)` foundation showcase remains a Server Component; only the theme control is a client island.

### Test Foundation and Commands

- Vitest, React Testing Library, user-event, jest-dom, and jsdom are configured.
- Unit tests cover environment validation, API-boundary construction, envelopes, `204`, request IDs, error classification, and abort preservation.
- Component tests cover disabled state, accessible field relationships, blocking feedback, and theme selection.
- Actual package commands are `npm run lint`, `npm run type`, `npm test`, and `npm run build`.
- Browser E2E, MSW integration tests, and automated axe checks are not installed yet; they must be added only when their planned feature layer needs them.

## Learning Gate

The learner demonstrated the provider lifecycle and Server/Client boundary, identified that `204` must bypass JSON parsing, distinguished feature-specific data ownership from shared HTTP infrastructure, preserved `AbortError`, and explained why blindly retrying a POST can duplicate a mutation. Runtime network data still begins as `unknown`; feature schemas remain the place for deeper domain-shape validation when features are built.

## Accepted Limitations and Open Risks

- One active refresh session per user and the accepted authenticated feed `1 + 2N` viewer-state risk remain V1 constraints.
- Final Vercel origin/CORS/cookie verification is not possible before deployment.
- Two moderate `npm audit` findings remain in Next.js's transitive PostCSS dependency. The current audit reports no compatible fix; this transitive risk remains tracked rather than applying an unsafe framework change.
- React Hook Form and Framer Motion are not installed without a current consumer. Form ownership remains approved for F3/F5; motion remains optional and must be added only for a measured, purposeful interaction.
- The tagline and final production content remain open; F1 did not invent them.

## Immediate Next Action

Audit the F2 scope against the current code and backend public-read contracts, then define the smallest landing/public-discovery feature slice without crossing into F3 authentication.

## State Update Protocol

After every implementation group or sprint:

1. record only implemented behavior and the commands or behavior that verified it;
2. update the current milestone and exact next action;
3. keep unresolved risks and missing test layers visible;
4. update durable decisions/contracts only when their responsibility changed;
5. never describe an unexecuted check as passing.
