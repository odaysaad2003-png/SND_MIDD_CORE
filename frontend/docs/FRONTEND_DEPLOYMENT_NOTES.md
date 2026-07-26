# SND Frontend Deployment Notes

## Status

Approved deployment baseline for a Vercel frontend using the existing Render backend. The F3 candidate passed local static/unit/build gates on 2026-07-26. Production Auth integration remains unverified until the exact active Vercel production origin is synchronized to Render and the browser smoke matrix is recorded.

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

### Exact Vercel F3 Check

1. Open the Vercel project, then **Settings → Build and Deployment**.
2. Confirm:
   - Framework Preset: Next.js;
   - Root Directory: `frontend`;
   - Install/Build commands: framework defaults, which use the checked-in lockfile and
     `npm run build`;
   - Production Branch: the branch actually pushed for release.
3. Open **Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_API_BASE_URL` for **Production** to:

   ```text
   https://snd-community-core-api.onrender.com/api/v1
   ```

5. Add the same value to Preview only when the exact stable Preview origin is intentionally
   included in Render CORS.
6. Save, then create a new Production deployment. An existing deployment does not receive
   a later environment-variable edit.
7. Copy the resulting stable production Origin, for example
   `https://your-project.vercel.app`. Do not copy a page path.

Reference:
[Vercel environment variables](https://vercel.com/docs/environment-variables) and
[Vercel Git deployments](https://vercel.com/docs/git).

## Frontend Environment Variables

Expected public variables:

```text
NEXT_PUBLIC_API_BASE_URL=https://snd-community-core-api.onrender.com/api/v1
```

Rules:

- `NEXT_PUBLIC_API_BASE_URL` is required by the current build, must be absolute HTTPS in
  production, and must end exactly in `/api/v1`.
- `NEXT_PUBLIC_SITE_URL` is not consumed by the current F3 code. Add and validate it with
  the F7 canonical/metadata implementation rather than documenting an unused required
  variable.
- Do not put JWT secrets, refresh secrets, MongoDB credentials, Cloudinary API secrets, or backend-only settings in Vercel.
- `NEXT_PUBLIC_*` values are intentionally visible to browsers.
- Cloudinary display URLs come from the API; the frontend does not need Cloudinary API credentials.
- Use environment-specific values for Development, Preview, and Production.
- Vercel environment-variable edits affect only new deployments. Redeploy after every
  relevant change.

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

Use the origin only: for example `https://example.vercel.app`, with no route, query, or
trailing path. Keep `AUTH_COOKIE_DOMAIN` absent/unset for the host-only Render cookie.
After changing Render variables, save them and deploy/restart the service before testing.

### Exact Render F3 Check

1. Open the Render backend Web Service.
2. Under **Settings**, confirm:
   - Root Directory: `backend` when the Git repository is a monorepo;
   - Build Command: `npm ci && npm run build`;
   - Start Command: `npm start`;
   - Health Check Path: `/api/v1/health`;
   - Auto-Deploy targets the intended Git branch/commit.
3. Under **Environment**, keep the existing MongoDB, JWT, refresh-secret, hashing, and
   Cloudinary secrets. Do not copy any of them to Vercel.
4. Confirm the complete safe name list in `backend/.env.example`, then set the
   Auth-critical production values from the table below.
5. Do not hardcode `PORT`; Render supplies it to the service.
6. Keep `JWT_SECRET` and `REFRESH_TOKEN_SECRET` different. Changing either intentionally
   invalidates issued tokens/sessions.
7. Save the environment and deploy the latest commit. Wait for a healthy
   `/api/v1/health` response before testing the frontend.

Reference:
[Render environment variables](https://render.com/docs/configure-environment-variables),
[Render web services](https://render.com/docs/web-services), and
[Render deploys](https://render.com/docs/deploys).

### F3 Environment Synchronization

| Platform | Key | Required value/policy |
|---|---|---|
| Vercel | `NEXT_PUBLIC_API_BASE_URL` | Exact Render API base ending `/api/v1` |
| Vercel | Environment scope | Production; Preview only when its exact stable origin is also intentionally allowlisted |
| Render | `NODE_ENV` | `production` |
| Render | `AUTH_COOKIE_SECURE` | `true` |
| Render | `AUTH_COOKIE_SAME_SITE` | `none` for Vercel ↔ Render cross-site Auth |
| Render | `AUTH_COOKIE_DOMAIN` | Unset |
| Render | `AUTH_REFRESH_COOKIE_NAME` | Keep the deployed value stable; default is `snd_refresh` |
| Render | `CORS_ORIGIN` | Exact Vercel production origin; comma-separated explicit origins only when needed |
| Render | `TRUST_PROXY_HOPS` | Keep the currently verified numeric value; do not guess a hop count. It governs client-IP/rate-limit trust, not the explicit cookie `Secure` flag |

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
npm run lint
npm run type
npm test
npm run build
```

The build should fail clearly for missing/invalid required environment variables. No build should require access to private backend secrets.

## F3 Browser Auth Verification Matrix

Before starting, clear old site data for both the Vercel frontend and Render API, open
DevTools, enable **Network → Preserve log**, and keep **Application → Cookies → Render
origin** visible.

| Case | Action | Blocking expected evidence |
|---|---|---|
| Register | Create one controlled test account | `POST /auth/register` is `201`; JSON has `user`, `accessToken`, `csrfToken` and no `refreshToken`; Render cookie is HttpOnly, Secure, SameSite=None, Path `/api/v1/auth`, and host-only |
| Login | Log out, then log in with the account | `POST /auth/login` is `200`; Header switches to user state; no token enters Local/Session Storage |
| Reload | Hard reload while logged in | `GET /auth/csrf` then `POST /auth/refresh` succeed once; session remains authenticated; no loop |
| Protected retry | Allow an access token to expire, then trigger a future protected request | one refresh and one original-request retry only; a `403` never starts refresh |
| Invalid CSRF | Send Refresh with an invalid `X-CSRF-Token` | `403`; no new authenticated session is accepted |
| Missing cookie | Delete the Render refresh cookie and reload | CSRF/bootstrap receives `401`; UI settles anonymous without a loop |
| Logout | Log in and choose Logout | local UI/cache clear immediately; `POST /auth/logout` succeeds and cookie disappears |
| Disallowed Origin | Run preflight from an origin not in the allowlist | no approved CORS response; never reflect arbitrary Origin |
| Session replacement | Log in to the same account in another isolated browser | older single-session refresh is rejected and settles cleanly |
| Multi-tab | Reload two tabs around the same time | record the current single-session/rotation behavior; no endless refresh storm |

To exercise the invalid-CSRF case from the authenticated frontend's browser console:

```js
await fetch(
  "https://snd-community-core-api.onrender.com/api/v1/auth/refresh",
  {
    method: "POST",
    credentials: "include",
    headers: {"X-CSRF-Token": "invalid"},
  }
).then(async (response) => ({
  status: response.status,
  body: await response.json(),
}));
```

Do not paste or print real tokens. A browser privacy policy may still block cross-site
cookies despite correct `SameSite=None; Secure`; if so, record the browser/policy and use
same-site custom frontend/API subdomains as the durable topology rather than weakening
CORS or cookie security.

## Image Configuration

- Allow only the necessary Cloudinary remote image host/pattern returned by the API.
- Provide explicit dimensions or stable aspect ratios.
- Verify avatar and post-image URLs from production responses.
- Keep a fallback for broken/deleted remote images.
- Do not allow arbitrary remote image hosts unless the contract expands intentionally.

## Security and Privacy Checks

- Keep Next.js at `16.2.12` or a later verified patch. Current residual audit findings are
  transitive PostCSS/Sharp versions pinned by Next.js; track the upstream patch instead of
  forcing an incompatible framework downgrade/override.
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
2. Run the local/CI quality gates.
3. Configure Vercel's API base and create the production deployment.
4. Copy the exact stable Vercel Origin into Render `CORS_ORIGIN`.
5. Confirm Render cookie variables and redeploy the latest backend commit.
6. Redeploy Vercel after any frontend environment edit.
7. Run the F3 browser Auth matrix with controlled accounts/content.
8. Monitor errors, auth failures, latency, and Web Vitals.
9. Record release outcome and any accepted limitations.

## Rollback

- Keep the last known-good Vercel deployment available for instant promotion/rollback.
- Roll back frontend first when the frontend alone caused the regression.
- If an API contract changed incompatibly, coordinate backend/frontend rollback or forward fix; do not leave mismatched versions silently.
- Re-run public and auth smoke checks after rollback.
- Avoid destructive data migrations as part of a frontend release.

## Known Release Blockers

1. The exact active Vercel production origin has not yet been recorded and verified against Render `CORS_ORIGIN`.
2. Current Next.js has no safe compatible automated resolution for its pinned
   PostCSS/Sharp audit findings; the present input boundaries reduce applicability, but the
   upstream patch must be tracked.
3. Feed Like/Save uses accepted lazy visible-card status calls; F6 measurement may still require a future protected batch contract.
4. Final policy/landing copy and production imagery are not approved; Calm Contemporary and the F1 token direction are approved.
5. F4–F7 feature implementation, browser E2E, deployed accessibility/performance checks, and the F3 production Auth smoke evidence do not yet exist.

The verified F3 candidate is ready for deployment testing, but it is not the complete V1 release.
