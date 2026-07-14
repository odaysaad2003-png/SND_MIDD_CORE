# SND Frontend Deployment Notes

## Status

Approved deployment baseline for a Vercel frontend using the existing Render backend. The final Vercel production URL will be obtained after the first successful deployment, so production integration is not yet considered verified.

## Topology

```text
Browser
  ├─ public/protected UI → Vercel frontend
  ├─ public API requests → Render API
  └─ Bearer + cookie-session requests → Render API

Render API → MongoDB Atlas
Render API → Cloudinary
```

The refresh cookie is host-only for the Render API and scoped to `/api/v1/auth`. The Vercel server does not receive it; browser auth bootstrap is required.

## Vercel Project Setup

- Connect the monorepo and set the Vercel Root Directory to `frontend`.
- Use the lockfile and package manager selected during F1.
- Deploy from the approved production branch/workflow.
- Require a successful production build before promotion.
- Keep framework defaults unless a measured requirement justifies overrides.

## Frontend Environment Variables

Expected public variables:

```text
NEXT_PUBLIC_API_BASE_URL=https://snd-community-core-api.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=https://<final-frontend-domain>
```

Rules:

- Validate both as absolute HTTPS URLs in production.
- Do not put JWT secrets, refresh secrets, MongoDB credentials, Cloudinary API secrets, or backend-only settings in Vercel.
- `NEXT_PUBLIC_*` values are intentionally visible to browsers.
- Cloudinary display URLs come from the API; the frontend does not need Cloudinary API credentials.
- Use environment-specific values for Development, Preview, and Production.

## Render Configuration Required for Frontend

Production must keep:

```text
NODE_ENV=production
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_DOMAIN=<unset>
CORS_ORIGIN=https://<exact-production-frontend-origin>
```

`CORS_ORIGIN` may be an explicit comma-separated allowlist as supported by the backend. Never use `*` with credentials.

The user confirmed the current cookie settings are already aligned; the remaining step is the exact Vercel origin and deployed browser verification.

## Cross-Origin Request Rules

### Session Requests

Register, login, CSRF bootstrap, refresh, and logout use `credentials: 'include'` so the browser accepts/sends the Render cookie.

Refresh/logout also send:

```text
X-CSRF-Token: <in-memory-token>
```

### Protected Feature Requests

Send the in-memory access token:

```text
Authorization: Bearer <token>
```

Feature requests do not need refresh-cookie credentials unless the centralized client deliberately applies a consistent safe policy. Session endpoints must always be correct.

### Preflight

Verify browser OPTIONS/preflight behavior for Authorization, Content-Type, X-CSRF-Token, and multipart uploads. Do not judge CORS using Postman because Postman does not enforce browser CORS.

## Preview Environment Strategy

Vercel creates changing preview origins, while credentialed CORS requires explicit origins. Recommended order:

1. Use one stable staging frontend domain with a staging backend/database for complete auth E2E.
2. Use ordinary Vercel previews for public/non-auth visual review.
3. Do not point arbitrary contributor previews at production credentialed auth.

Do not implement permissive origin reflection or wildcard credentialed CORS merely to support dynamic previews.

## Build Contract

Before deployment, the frontend must pass the scripts defined in its actual `package.json`, at minimum:

```text
lint
typecheck
test
build
```

The build should fail clearly for missing/invalid required environment variables. No build should require access to private backend secrets.

## Image Configuration

- Allow only the necessary Cloudinary remote image host/pattern returned by the API.
- Provide explicit dimensions or stable aspect ratios.
- Verify avatar and post-image URLs from production responses.
- Keep a fallback for broken/deleted remote images.
- Do not allow arbitrary remote image hosts unless the contract expands intentionally.

## Security and Privacy Checks

- Inspect the generated client bundle/environment output for secrets.
- Confirm no access/CSRF token is written to browser storage, logs, analytics, URLs, or error reports.
- Confirm the refresh token is absent from JSON and inaccessible to JavaScript.
- Confirm cookies are Secure, HttpOnly, SameSite=None, correct Path, and host-only.
- Verify security headers/CSP chosen for the frontend do not break Cloudinary images or Render API calls.
- Ensure public HTML/metadata never contains email/private profile fields.
- Sanitize/escape user content through React rendering; do not introduce raw HTML rendering for posts.

## SEO Deployment

- Set the production `metadataBase`/site URL from the final domain.
- Index landing and public post pages.
- Exclude auth, profile-private, saved, and my-post pages from indexing.
- Generate canonical URLs from the final production origin, never a preview URL.
- Validate robots and sitemap after deployment.
- Provide Open Graph fallbacks when a post has no image.
- Treat unavailable/hidden/deleted posts as public 404 without state disclosure.

## Observability

Frontend error monitoring should capture:

- route/release/environment;
- sanitized error category and backend error code;
- backend `X-Request-Id` when present;
- performance/Web Vitals;
- no tokens, passwords, emails, full form bodies, or user post content by default.

Track repeated auth bootstrap failures, API 5xx, upload failure rate, and major Web Vital regressions. Respect user privacy and obtain any required consent before analytics.

## Production Smoke Tests

### Public

- Vercel production URL loads over HTTPS.
- Landing copy/logo/theme render correctly in Arabic RTL.
- Feed preview/list, search, sort, pagination, post detail, and comments work.
- Empty, 404, and Render cold-start/transient states recover safely.
- Metadata, canonical, Open Graph, robots, and sitemap use production URLs.

### Auth

- Register/login response sets the cookie and returns no refresh token in JSON.
- Reload performs CSRF + refresh successfully.
- Access expiration refreshes once without a loop.
- Logout clears cookie/private state.
- Invalid CSRF and disallowed origin fail.
- A second login/session replacement is understandable.

### Profile and Content

- View/update profile and avatar.
- Author identity remains display-only; no public-profile route or link is shipped in V1.
- Create text post; create with image(s); retry failed image upload without duplicate post.
- Edit/delete owned post; wrong-owner paths remain blocked.

### Interaction

- Existing Like/Save state is correct on feed and detail.
- Like/Save updates and reconciles counts/state.
- Saved list updates.
- Comment create/edit/delete works.
- Report success, duplicate, and self-report failures are handled.

### Quality

- Narrow mobile, desktop, light/dark, keyboard, reduced motion, and basic screen-reader paths.
- No horizontal overflow at 320 px or 200% zoom.
- Core requests and images do not cause major layout shifts.
- Error UI retains request IDs without leaking internal data.

## Release Procedure

1. Freeze and identify the frontend/backend commits being released.
2. Run CI and the controlled staging E2E suite.
3. Verify Render health/readiness and required environment configuration.
4. Add/confirm the final Vercel origin in Render CORS.
5. Deploy Vercel production.
6. Run the narrow production smoke suite with controlled accounts/content.
7. Monitor errors, auth failures, latency, and Web Vitals.
8. Record release outcome and any accepted limitations.

## Rollback

- Keep the last known-good Vercel deployment available for instant promotion/rollback.
- Roll back frontend first when the frontend alone caused the regression.
- If an API contract changed incompatibly, coordinate backend/frontend rollback or forward fix; do not leave mismatched versions silently.
- Re-run public and auth smoke checks after rollback.
- Avoid destructive data migrations as part of a frontend release.

## Known Release Blockers

1. Final Vercel production domain is not yet known/allowlisted.
2. Feed Like/Save uses accepted lazy visible-card status calls; F6 measurement may still require a future protected batch contract.
3. Final policy/landing copy and production imagery are not approved; Calm Contemporary and the F1 token direction are approved.
4. F2–F7 feature implementation, browser E2E, deployed accessibility/performance checks, and production smoke verification do not yet exist.

The F1 foundation reduces setup risk but does not make V1 production-ready; the remaining blockers belong to their planned feature and deployment sprints.
