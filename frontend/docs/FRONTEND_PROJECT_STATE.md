# SND Frontend Project State

## Snapshot

- Product: سند (SND)
- Primary audience: residents of Gaza
- Frontend: Next.js App Router, React, TypeScript strict, Tailwind CSS, Arabic/RTL-first
- Backend: SND Community Core API on Render
- Current milestone: Sprint F9 Admin and moderation frontend
- Snapshot date: 2026-07-27
- Exact next action: apply the unified Admin Dashboard patch, then run lint/type/test/build
  and the documented Admin browser/security smoke matrix

This file records verified current behavior. Older F1/F2 implementation detail remains in
Git history and the durable architecture/decision documents rather than being repeated as
the current snapshot.

## Sprint F9 Admin Dashboard — Implemented, Pending Local Verification

- Added a protected Arabic/RTL `/admin` route group with a dedicated responsive shell,
  desktop Sidebar, mobile navigation Dialog, active-route state, current Admin identity,
  theme control, return-to-app action, and local-first Logout.
- Added an Admin route gate that distinguishes session checking, anonymous redirect,
  authenticated non-Admin Forbidden, and authenticated Admin states. Frontend gating is
  UX only; every operation remains protected by backend authentication, role gating, and
  current-Admin database revalidation.
- Added a real Dashboard Overview backed only by `GET /admin/dashboard/summary`, including
  refresh, Skeleton, error/retry, generated-at context, and direct links to operational
  sections.
- Added paginated Users management with URL-owned search/status/role/sort filters, safe
  details, avatar display, self/Admin-account safeguards, reason-required suspend/reactivate
  confirmation, Toast feedback, and precise Admin cache invalidation.
- Added paginated Posts moderation with URL-owned search/lifecycle/moderation/sort filters,
  administrative detail context, owner-deleted safeguards, reason-required hide/restore,
  and invalidation of affected Admin/public/interaction/saved caches.
- Added paginated Reports management with exact backend statuses, target types, and reasons;
  missing targets remain reviewable as `null`; pending Reports support reviewed/dismissed/
  actioned decisions with optional Admin note and explicit separation from Post moderation.
- Added strict Zod runtime validation for every Admin response and centralized Admin Query
  keys with private-cache metadata, AbortSignal propagation, bounded staleness, and previous
  page preservation.
- Extended safe Auth return destinations to the `/admin` namespace and exposed the Admin
  entry only to authenticated Admin users in the existing account menu.
- No role-promotion, account deletion, Admin suspension, comment moderation, or automatic
  Report-to-Post action was invented.

This section records implementation only. No lint, TypeScript, test, build, deployment, or
browser result is claimed for the Admin patch until the owner runs the required gates.

## Completed Foundation and Public Discovery

- Sprint F0 and F0.5 documentation/contract decisions are complete.
- Sprint F1 provides the verified Next.js, TypeScript, environment, API-client, Query,
  theme, semantic UI, RTL, accessibility, and unit/component-test foundation.
- Sprint F2 provides the landing page, public feed, public post detail, public comments,
  Query Options, server prefetch/hydration, URL-owned filters, scoped motion, and legacy
  media compatibility boundary.
- Public routes remain server-renderable where appropriate and are preserved by the current
  production build.

## Sprint F3 Implemented Behavior

### Auth Contract and Forms

- Register and Login use React Hook Form with Zod rules aligned to the backend.
- Email is trimmed and normalized to lowercase before transport.
- Auth responses are runtime-validated and reject unexpected fields, including any leaked
  `refreshToken`.
- Register/Login send `credentials: "include"` so the browser can accept the Render
  refresh cookie.
- Form errors distinguish validation, invalid credentials, conflict, inactive/forbidden,
  rate limit, offline/network, invalid response, and service failure.
- Duplicate submission is disabled; field focus, `aria-describedby`, pending/success
  labels, password visibility, Caps Lock guidance, and reduced-motion behavior are present.

### In-Memory Session and Refresh

- `auth-session-store.ts` keeps the access and CSRF tokens in module memory only.
- The public React snapshot contains only `status` and `user`; tokens never enter component
  props, URL state, localStorage, sessionStorage, or Query data.
- `AuthProvider` bridges the external store through `useSyncExternalStore`, bootstraps in
  the browser, exposes Login/Register/Logout/retry, and owns private Query cleanup.
- Bootstrap uses `GET /auth/csrf` followed by `POST /auth/refresh`.
- `refresh-auth-session.ts` provides one in-tab refresh promise, cancellation, generation
  guards against stale Login/Logout races, one fresh-CSRF recovery attempt, and final
  session cleanup on `401`/`403`.

### Protected Request Boundary

- `authorizedApiRequest` is client-only.
- It attaches the in-memory Bearer access token, explicitly omits cookie credentials and
  CSRF from business requests, refreshes only after `401`, and retries the original request
  once.
- It does not refresh on `403`.
- A late stale `401` can reuse an already-rotated access token without starting a second
  refresh.
- A second `401` after retry clears the local session.

### Logout, Navigation, and Feedback

- Logout clears local tokens and private Query data before waiting for the network.
- The public Header is now a focused Auth client island:
  - unresolved sessions do not flash anonymous actions;
  - guests receive Login/Register actions;
  - authenticated users see their name and a Logout action;
  - remote Logout failure stays locally logged out and produces a persistent warning.
- Safe `returnTo` accepts only allowlisted internal routes and rejects external,
  protocol-relative, malformed, control-character, and unsupported targets.
- The custom SND Toast provider supports loading/success/error/warning/info, ID-based
  update, promise tracking, action callbacks, dismiss/clear, timers, progress, a four-item
  mobile-safe viewport, portal rendering, RTL/dark tokens, reduced motion, and live-region
  semantics.
- Auth retry credentials remain owned by the mounted form; Toast callbacks do not retain
  password values after the form lifetime.

## Verification Evidence — 2026-07-26

Executed against the extracted candidate with:

```text
NEXT_PUBLIC_API_BASE_URL=https://snd-community-core-api.onrender.com/api/v1
```

| Gate | Result |
|---|---|
| `npm ci` | PASS — 476 packages installed from the lockfile |
| `npm run lint` | PASS |
| `npm run type` | PASS — Next route types generated and `tsc --noEmit` passed |
| `npm test` | PASS — 10 files, 66 tests |
| `npm run build` | PASS — optimized Next.js production build |
| Next.js security patch | APPLIED — `16.2.10` → `16.2.12`; direct affected Next.js range removed |
| `npm audit --omit=dev` | REVIEW — three High transitive PostCSS/Sharp advisories remain in the dependencies pinned by current Next.js; no safe compatible automated fix is offered |

The initial supplied test run had 44 passing and 2 failing assertions because the tests
did not include the implemented `AbortSignal`. The expectations were corrected to verify
the signal rather than remove it.

Current automated coverage includes the environment/API foundation, public Query helpers,
Auth session store, single-flight refresh, Bearer retry behavior, actual Auth cookie/CSRF
request options, refusal of JSON refresh-token leakage, safe return destinations, Header
Logout states, and Toast store lifecycle.

## Remaining F3 Production Gate

F3 is not marked fully Complete until the deployed browser proves the cross-origin behavior:

1. exact Vercel production origin is allowlisted by Render;
2. Register and Login set a host-only `HttpOnly; Secure; SameSite=None` refresh cookie
   scoped to `/api/v1/auth`;
3. Auth JSON contains `user`, `accessToken`, and `csrfToken`, never `refreshToken`;
4. reload performs CSRF bootstrap and refresh without a loop;
5. Logout clears the cookie and local private state;
6. missing cookie becomes anonymous;
7. invalid CSRF is rejected;
8. a disallowed Origin is rejected;
9. a replaced/single-session Login ends the older session understandably;
10. multi-tab bootstrap/rotation behavior is observed and recorded.

Automated browser E2E, MSW integration tests, and a real protected F4 page are not present
yet. The protected request infrastructure is unit-tested, but its first product consumer
belongs to the private Profile/current-user sprint rather than an invented placeholder
route.

## Open Risks and Boundaries

- The backend intentionally supports one active refresh session per user. Multi-device and
  concurrent-tab rotation can replace another session.
- Current Next.js still pins vulnerable PostCSS/Sharp ranges. This application does not
  accept user-authored CSS, and backend/Cloudinary image input is restricted to
  JPEG/PNG/WebP, reducing the known advisory paths. Keep this visible, upgrade when Next.js
  adopts patched transitive versions, and do not use `npm audit fix --force` to downgrade
  the framework.
- Vercel Preview URLs are dynamic; do not allow wildcard credentialed CORS. Use the
  production domain or a stable staging origin for full Auth testing.
- A Logout network failure cannot prove remote cookie revocation; local cleanup remains
  final and the UI warns the user.
- Browser/manual checks are still required for 320 px layout, keyboard, screen reader,
  light/dark, reduced motion, Render cold start, and real cookie attributes.
- F4 Profile is the next feature sprint only after the live F3 deployment matrix is
  recorded.

## Update Protocol

After the deployed smoke pass:

1. record the exact Vercel and Render deployment identifiers/commits without secrets;
2. record each Auth matrix result and any request ID needed for diagnosis;
3. change F3 from `production verification pending` to `Complete` only if all blocking
   cases pass;
4. keep any multi-tab/single-session limitation visible;
5. set the next action to Sprint F4 Profile and current-user content.
