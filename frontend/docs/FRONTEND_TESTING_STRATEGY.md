# SND Frontend Testing Strategy

## Status

Approved V1 strategy as of 2026-07-13. The frontend project does not yet exist, so no frontend test result is claimed.

## Objectives

- protect auth and authorization-sensitive UX from regressions;
- verify UI behavior against backend envelopes and failure states;
- make mobile/RTL/accessibility requirements repeatable;
- test multi-step post/image behavior;
- keep tests fast enough for normal development and CI;
- use production smoke tests as a final layer, not the primary safety net.

## Proposed Tooling

- Vitest for unit tests;
- React Testing Library and user-event for components;
- MSW for API-bound component/integration tests;
- Playwright for browser E2E, responsive, and deployed smoke tests;
- axe integration for automated accessibility checks;
- TypeScript strict, lint, and production build as required static gates.

Tool versions are selected when F1 is created and recorded in the lockfile; this document does not assume versions.

## Test Layers

### Unit Tests

Test pure, high-value logic:

- API envelope parsing and `204` handling;
- URL/query serialization and query-key factories;
- error-code normalization;
- safe `returnTo` validation;
- Zod schemas aligned with backend limits;
- auth refresh coordinator state machine;
- optimistic Like/Save cache-update helpers;
- file type/size/count preflight;
- date/RTL-safe display helpers.

Avoid unit-testing framework internals or trivial markup.

### Component Tests

Test components through user behavior:

- register/login and field errors;
- post/comment forms;
- Like/Save pressed, pending, rollback, and keyboard states;
- post cards in text, single-image, multi-image, loading, and error modes;
- report dialog reason mapping and duplicate-report response;
- avatar/post upload selection, preview, rejection, progress, and retry;
- dialogs, menus, sheets, tabs, toasts, and focus return;
- empty, forbidden, not-found, offline, and rate-limit states;
- light/dark and reduced-motion behavior where material.

### Integration Tests

Use MSW to exercise feature flows through the real API client, Query provider, forms, and UI:

- list/search/sort/paginate feed;
- public post plus paginated comments;
- auth bootstrap from CSRF to refresh;
- expired access token with one coordinated retry;
- logout clearing private caches;
- create post followed by successful/failed image upload;
- profile update reflected in relevant caches;
- optimistic Like/Save mutation with server reconciliation;
- saved list invalidation;
- comment mutation and metadata total;
- report success, self-report, and conflict.

### E2E Tests

Critical browser journeys:

1. guest opens landing → feed → post/comments;
2. guest selects interaction → login/register → returns safely;
3. register/login → reload → recovered session;
4. access-token expiry → refresh → original action succeeds;
5. logout → private pages/data unavailable;
6. update name/avatar;
7. confirm author identity is display-only and does not link to a missing public-profile route;
8. create text-only post;
9. create post with images;
10. image upload fails after post creation → retry without duplicate;
11. edit/delete owned post;
12. Like/Save from feed and detail with pre-existing state;
13. saved-post list;
14. comment create/edit/delete;
15. report post/comment and duplicate/self-report behavior;
16. hidden/deleted/not-found resources do not leak state.

## Auth Test Matrix

| Case | Expected result |
|---|---|
| No refresh cookie | Anonymous; no loop |
| Valid cookie + CSRF | Refresh succeeds and rotates tokens |
| Missing/invalid CSRF | Forbidden; one controlled recovery attempt at most |
| Expired access token | Single refresh; queued requests retry once |
| Invalid/revoked refresh | Private state cleared; login required |
| Suspended user | Protected use stops; neutral account-state UX |
| Second login/session replacement | Previous session ends understandably |
| Two tabs bootstrap/refresh | Documented, non-looping behavior |
| Disallowed origin | Credentialed auth blocked |
| Logout network failure | Local private state still clears |

Do not assert exact secret/cookie values. Assert cookie attributes in an appropriate controlled environment and verify no refresh token appears in response JSON.

## API Mocking Policy

- Mock at the network boundary with MSW, not by replacing TanStack Query or feature hooks.
- Fixtures match documented backend presenters, not raw database documents.
- Include standard success/error envelopes and `204` responses.
- Maintain reusable scenarios: success, empty, validation, unauthorized, forbidden, not found, conflict, rate limit, offline, slow response, and server error.
- E2E uses a controlled backend/test database where possible; do not intercept every request in E2E and mistake it for integration confidence.
- Cloudinary itself may be mocked in backend tests; frontend tests treat returned image URLs as API data.

## Accessibility Tests

Automated checks are required but insufficient. Test:

- landmarks and heading order;
- accessible names and pressed states;
- labels, descriptions, and form errors;
- keyboard flows and focus order/return;
- dialog/menu focus trapping;
- live announcements for upload/mutation;
- light/dark contrast;
- reduced motion;
- 200% zoom and 320 CSS-pixel reflow;
- Arabic screen-reader output and mixed-direction values.

Manual review should cover at least one desktop screen reader/browser combination and representative mobile assistive behavior before release.

## Responsive and Browser Matrix

Minimum viewport coverage:

- narrow phone around 320 px;
- common phone around 375–430 px;
- tablet portrait/landscape;
- desktop/laptop.

Test current stable Chromium, Firefox, and WebKit through Playwright, plus manual checks on representative Android Chrome and iOS Safari when available. Verify touch targets, safe areas, virtual keyboard, file picker, sticky navigation, and RTL overflow.

## Error-State Tests

Each networked page/feature must test:

- initial loading and skeleton geometry;
- empty result;
- offline/network rejection;
- slow response;
- `400`, `401`, `403`, `404`, `409`, `413`, `415`, `429`, `500`, and `503` when relevant;
- retry success/failure;
- stale data retained during background failure;
- request ID retained for support detail;
- no raw stack/internal field display.

## Upload Tests

- correct field names (`avatar`, `images`);
- browser-generated multipart boundary;
- JPEG/PNG/WEBP acceptance;
- unsupported MIME and mismatched signature response;
- 5 MB limit;
- one avatar and five total post images;
- object-URL cleanup;
- navigation/cancel behavior;
- progress announcement;
- server failure after text-post success;
- retry uses existing post ID;
- remove existing image using exact returned URL;
- unauthorized/wrong-owner/deleted target behavior.

## SEO Tests

- one canonical URL per public page;
- landing and public post indexing rules;
- auth/private pages `noindex`/robots exclusion as designed;
- title/description fallbacks;
- Open Graph values and image fallback;
- `404` behavior for unavailable posts;
- sitemap excludes private/unknown content;
- no user email in HTML, metadata, JSON-LD, or social previews.

## Performance Tests

- measure initial public-page JavaScript and Core Web Vitals;
- emulate throttled network/CPU and a low-end mobile viewport;
- detect layout shift in skeleton/media transitions;
- count feed requests, specifically Like/Save status N+1 behavior;
- verify search debounce and aborted/obsolete requests;
- verify image sizing/lazy loading;
- set budgets during F1/F2 from measured baselines rather than inventing numbers now.

## CI Gates

Proposed pull-request gates:

```text
install locked dependencies
lint
typecheck
unit/component/integration tests
production build
critical accessibility checks
```

Run the critical Playwright suite on protected branches or a stable preview environment. Full cross-browser E2E may run before merge/release depending on duration.

No command is reported as passing unless it was actually executed in that environment.

## Test Data and Cleanup

- Use deterministic factories for users, posts, comments, and interaction state.
- Give E2E entities unique test-run identifiers.
- Never run destructive tests against real user content.
- Clean test data through controlled test utilities or isolated databases.
- Seed a pre-liked/pre-saved post to verify initial viewer state.
- Include hidden/deleted fixtures without exposing their state in public UI.

## Production Smoke Suite

After deployment, verify with controlled accounts:

- landing/feed/post/comments;
- register or login;
- reload/session refresh;
- profile/avatar;
- text post and image upload;
- Like/Save/comment/report;
- logout;
- mobile layout and basic accessibility;
- metadata/canonical/robots;
- request IDs and error visibility;
- no client-bundle secrets.

Smoke tests must be narrow, reversible, and cleaned up.

## Definition of Tested

A feature is tested when its positive journey, important negative permissions, network/error states, accessibility behavior, mobile layout, and cache/session side effects have repeatable evidence. A manually observed happy path alone is insufficient.
