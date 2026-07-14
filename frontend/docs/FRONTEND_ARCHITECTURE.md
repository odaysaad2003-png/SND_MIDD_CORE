# SND Frontend Architecture

## Status and Constraints

This architecture baseline was approved on 2026-07-13 and its F1 foundation was implemented on 2026-07-14. The current code establishes App Router, Arabic/RTL rendering, providers, semantic UI primitives, environment validation, and the shared HTTP boundary. Feature/auth layers remain planned and must follow the current backend contract, in-memory access tokens, the cross-origin HttpOnly refresh cookie, and mobile-first performance constraints.

## Technology Baseline

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- SND-owned shadcn-style accessible primitives adapted to the SND visual system
- TanStack Query for server state
- Zod for runtime validation; React Hook Form begins with the first real form
- Purposeful client-side motion only when a measured requirement justifies adding a library
- next-themes for theme selection
- Lucide icons

Vitest and React Testing Library are active in F1. MSW, Playwright, and axe-based automation remain planned for the feature layers that require them. No Redux or Zustand is justified by the current scope.

## Repository Shape and Planned Growth

```text
root/
  backend/
  frontend/
    docs/
    public/
      brand/
    src/
      app/
        (public)/
        (auth)/
        (protected)/
        api-error.tsx
        global-error.tsx
        layout.tsx
        not-found.tsx
      components/
        ui/
        layout/
        feedback/
      features/
        auth/
        feed/
        posts/
        comments/
        likes/
        saves/
        profiles/
        reports/
      lib/
        api/
        query/
        validation/
        metadata/
      providers/
      styles/
      test/
```

Feature folders own feature-specific components, hooks, API functions, schemas, types, and tests. `components/ui` contains reusable visual primitives, not business logic. Cross-feature imports should go through intentional public exports rather than internal file paths.

## Route Strategy

### Public Routes

- Landing and public feed can be rendered with Server Components where it improves first content, SEO, and low-end-device performance.
- Public post details can fetch the public post on the server and generate dynamic metadata.
- Interactive controls hydrate only where needed.
- Privacy and community-policy pages should be static/server-rendered.

### Auth Routes

Login and register are public pages with client forms. If a valid session is recovered, they redirect to a safe `returnTo` path or the feed. Open redirects are prohibited; return paths must be internal and allowlisted.

### Protected Routes

Protected data loads in Client Components after auth bootstrap because:

- the access token exists only in browser memory;
- the refresh cookie belongs to the Render API origin and is not received by the Vercel Next.js server;
- Next middleware cannot reliably establish the backend session.

Protected layouts show a session-resolution skeleton, then render, redirect to login, or display an account-state error. Backend authorization remains the security boundary; client guards are UX only.

## Server and Client Component Boundaries

Use Server Components for static copy, public read-only data, metadata, and low-interactivity layouts. Use Client Components for forms, TanStack Query, auth state, theme toggles, optimistic mutations, uploads, and motion requiring browser state.

Do not turn an entire public page into a Client Component merely because one control is interactive. Isolate client islands at feed controls, action bars, forms, galleries, and theme/navigation controls.

## API Layer

The API layer has four responsibilities:

1. construct versioned URLs from one validated base URL;
2. attach Bearer access tokens for protected requests;
3. include credentials only for cookie-session operations that require them;
4. normalize backend envelopes into typed data or a typed `ApiError`.

Rules:

- no feature calls `fetch` ad hoc;
- `204` is handled without attempting JSON parsing;
- request IDs exposed by the backend are retained for support/error reporting;
- validation details are mapped to fields only when their structure is known; otherwise show a form-level error;
- public server fetches never attempt refresh;
- protected client requests use one refresh coordinator to prevent refresh storms;
- retries are disabled for validation/auth errors and bounded for safe transient GET failures.

## Auth and Session Architecture

### Storage

- Access token: memory only.
- Current user: TanStack Query/cache or auth provider memory, cleared on logout.
- CSRF token: memory only.
- Refresh token: HttpOnly cookie controlled by the backend.
- Theme preference: local storage through next-themes is allowed because it is not sensitive.

### Bootstrap

1. On a fresh browser load, call `GET /auth/csrf` with credentials.
2. If a refresh cookie exists, receive a CSRF token.
3. Call `POST /auth/refresh` with credentials and `X-CSRF-Token`.
4. Store the returned access and rotated CSRF tokens in memory.
5. Set current-user state from the response.
6. If bootstrap returns an unrecoverable `401`, become anonymous without a refresh loop.

### Expired Access Token

- Pause failed protected requests behind a single in-tab refresh promise.
- Refresh using the current CSRF token and credentials.
- Retry each request once after success.
- On CSRF mismatch, bootstrap CSRF and retry refresh once; never loop.
- On final failure, clear private queries/tokens and redirect only when the current route requires auth.

### Logout

Send `POST /auth/logout` with credentials and `X-CSRF-Token`, then clear local auth state and private query caches even if network cleanup fails. The server attempts to clear the cookie in a `finally` path.

### Session Limitations

One refresh session per user is accepted for V1. Multiple devices can invalidate one another. Tabs share the refresh cookie but not in-memory access/CSRF tokens, so refresh concurrency must be tested and documented; a lightweight `BroadcastChannel` coordination strategy may be introduced only if tests show it is required.

## TanStack Query Design

### Key Factory Examples

```text
['posts', 'public', filters]
['posts', 'detail', postId]
['posts', 'mine', filters]
['comments', postId, filters]
['like-status', postId]
['save-status', postId]
['saves', 'mine', filters]
['profile', 'me']
```

Keys must include every server-controlled filter. Mutation success updates the narrow affected cache and invalidates only dependent lists. Private query data must be removed on logout/account suspension.

Feed status queries are disabled for guests and start for authenticated users only when a card enters the viewport. Unknown or failed status is never treated as `false`. Query cache is reused by post ID; Like/Save mutations update the narrow status/card copies, roll back on failure, and reconcile with the server response. This reduces but does not remove the current `1 + 2N` request risk. F6 measures the cost; a protected batch contract is the preferred later improvement.

## Navigation Boundary

Use Next.js `Link` for navigation. A focused reusable active-link Client Component may use `usePathname` to apply exact/prefix matching and `aria-current="page"`. Keep it under shared layout/navigation components because it knows routing behavior but no business feature. Do not add React Router, and do not make the whole header or route layout a Client Component merely to highlight the current destination.

## Forms and Validation

Zod schemas mirror current frontend-relevant backend constraints but are not treated as authorization. React Hook Form owns field lifecycle. Backend errors remain authoritative.

- Register: name 2–100, valid email, password 8–72.
- Login: valid email and non-empty password.
- Profile name: 2–100.
- Post: title 3–100, content 1–5000.
- Comment: content 1–1000.
- Report details: optional, up to 1000; reason uses backend enum values.

Disable duplicate submissions, focus the first invalid field, connect errors through `aria-describedby`, and retain user input after recoverable failures.

## Upload Architecture

- Avatar field name: `avatar`; one JPEG/PNG/WEBP; max 5 MB.
- Post image field name: `images`; up to five total per post; each max 5 MB; JPEG/PNG/WEBP.
- Perform client preflight checks for user feedback, while treating server signature/MIME validation as final.
- Use a small `XMLHttpRequest` upload adapter if real progress is required; do not add Axios solely for progress.
- Image selection should provide preview, removal, accessible status, retry, and memory cleanup for object URLs.
- Post text creation and image upload are separate mutations. Never falsely roll back a successfully created text post when upload fails.

## State Ownership

| State | Owner |
|---|---|
| API data and mutation status | TanStack Query |
| Form values/errors | React Hook Form |
| Search, sort, page, and shareable filters | URL search params |
| Access/CSRF token and auth bootstrap | Auth provider in memory |
| Theme | next-themes |
| Temporary modal/menu state | Local component state |
| Toast queue | Small UI provider if required |

No global client store is currently justified.

## Error Handling

- Route-level `error.tsx` handles recoverable rendering failures.
- `global-error.tsx` handles root failures with minimal dependencies.
- API errors preserve `code`, message, details, HTTP status, and request ID when available.
- `401` can trigger one controlled refresh for protected requests.
- `403` is not treated as expired auth; show forbidden/account-state guidance.
- `404` public resources render a not-found experience without leaking moderation/deletion state.
- `429` shows a retry message and respects rate-limit headers when available.
- Offline state is distinct from server failure.

## Theming and Visual System

Use semantic tokens for background, surface, elevated surface, text, muted text, border, brand, accent, success, warning, danger, focus, and overlays. Final token values remain open until visual-style review. Dark mode must be designed independently for readable hierarchy and comfortable contrast.

The reference image contributes only the سند/SND logo. Product claims and colors in that image are not design requirements.

## Motion

Use Framer Motion for small reveal sequences, page-level continuity only where useful, and interaction feedback. Prefer CSS transitions for simple hover/focus states. Respect `prefers-reduced-motion`, avoid animating layout-critical dimensions, and never delay access to content.

## Accessibility

Target WCAG 2.2 AA. Required practices include semantic landmarks, one logical H1, visible focus, keyboard-complete menus/dialogs, correctly named icon buttons, RTL-aware directional meaning, live regions for mutation/upload feedback, sufficient target sizes, accessible form errors, reduced motion, and zoom/reflow testing.

## Performance

- Design from narrow/mobile screens upward.
- Keep landing and public post content server-renderable.
- Use `next/image` with explicit sizes and a reviewed Cloudinary remote pattern.
- Prevent layout shift with stable media/aspect-ratio containers.
- Load motion and rich galleries only where used.
- Paginate instead of unbounded feeds; infinite scrolling may be added only with accessible fallback/navigation.
- Debounce search input and reflect committed search in the URL.
- Prefetch intentionally, not on every card under slow-network conditions.
- Measure Core Web Vitals and JavaScript cost on a low-end mobile profile and throttled 3G/4G.

## Scalability Rules

- Keep domain API/types beside their feature.
- Centralize query keys and envelope/error parsing.
- Do not couple UI components directly to raw Mongoose-shaped data.
- Treat backend contract changes as versioned documentation changes.
- Add dependencies only for a concrete requirement and record the decision.
- Keep admin features in a separate future route group and feature boundary.
- Keep Public Profile absent from V1 until a later approved contract exists; keep the accepted feed viewer-state workaround centralized so it can be replaced by a future batch contract.
