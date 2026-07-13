# SND Frontend Product Scope

## Status

This V1 scope was approved by the product owner on 2026-07-13. Later changes require an explicit scope or decision update.

## V1 Product Outcome

Deliver a mobile-first Arabic community experience for Gaza where visitors can discover public posts and registered users can safely publish and interact. The first release should validate the value of a trustworthy community feed without expanding into an unsupported marketplace or admin product.

## Product Principles

1. **Useful before registration:** guests can understand the product and read public content.
2. **Registration at intent:** authentication is requested when the guest tries to interact.
3. **Human and calm:** copy, imagery, motion, and states reduce anxiety and visual noise.
4. **Truthful UI:** never display unsupported post types, counts, profile fields, or moderation outcomes.
5. **Resilient on mobile:** every journey handles slow requests, retries, partial uploads, and small screens.
6. **Safety is visible:** reporting and community rules are discoverable even though report administration is deferred.

## Core User Journeys

### 1. Guest Discovery

1. Open the landing page.
2. Understand what سند provides.
3. Browse a preview or the public feed.
4. Search or sort posts.
5. Open a post and read comments.
6. Select Like, Save, Comment, Report, or Create.
7. Enter authentication and return to the intended context.

### 2. Registration and Session

1. Register with name, email, and password or log in.
2. Receive the current user, access token, and CSRF token.
3. Keep the access token in memory only.
4. Recover the session after reload through CSRF bootstrap and refresh-cookie rotation.
5. On unrecoverable expiration, clear private state and return to login with a safe return path.

### 3. Create a Post with Optional Images

1. Validate title and content locally using rules aligned with the backend.
2. Create the text post as JSON.
3. If images were selected, upload them through the separate multipart endpoint.
4. Show per-operation progress and prevent accidental duplicate submission.
5. If image upload fails, explain that the text post exists, preserve the selected files when possible, and offer retry or continue without images.
6. Invalidate feed and my-post queries only after the relevant operation succeeds.

### 4. Interact from the Feed

1. Show public post data and `likesCount` immediately.
2. For authenticated users, resolve Like/Save viewer state only for cards that enter the viewport, using the current per-post endpoints and Query cache.
3. Apply optimistic interaction with rollback on failure.
4. For guests, open authentication before mutation.

Correct pre-existing Like/Save state is a requirement. Lazy per-visible-card status calls are the accepted temporary V1 cost; request volume must be measured in F6, and a protected batch contract is the preferred later optimization.

### 5. Post Details and Comments

1. Load a public visible post using its ID.
2. Load comments independently with pagination and chosen sort.
3. Use comment metadata for the detail-page comment total.
4. Allow authenticated users to create comments and owners to edit/delete their comments.
5. Allow authenticated users to report the post or a comment.

### 6. Current-User Profile

1. View name, email, role, avatar, account state, and timestamps from the private current-user response.
2. Update name.
3. Replace avatar with validated JPEG/PNG/WEBP.
4. Never expose email on public surfaces.

### 7. Public Profile — Deferred

Public author profiles are removed from V1 to avoid blocking frontend delivery on a missing backend contract. Post and comment surfaces may display the supplied author name and avatar, but they are not public-profile links. No public-profile route, request, SEO surface, or response shape is invented. The feature may return in a separately approved future sprint.

### 8. Saved Posts and My Posts

- Saved posts use the protected paginated saved-post endpoint.
- My posts use the protected current-user endpoint.
- Deleted posts are excluded from the V1 navigation because the backend provides no owner restore action.

## V1 Feature List

| Area | V1 behavior | Contract state |
|---|---|---|
| Landing | Hero, explanation, how it works, feed preview, trust/safety, CTA, FAQ | Ready for content/design |
| Public feed | Pagination, search, newest/oldest sort | Supported |
| Post details | Public visible post | Supported |
| Public comments | Paginated list | Supported |
| Auth | Register, login, refresh recovery, logout, current session | Supported with cookie/CSRF rules |
| Private profile | View/update name and avatar | Supported |
| Public profile | Not present; author identity is display-only | Deferred from V1 |
| Posts | Create, edit, soft-delete, image add/remove | Supported |
| Likes | Feed/detail interaction | Supported, viewer-state N+1 risk |
| Saves | Feed/detail interaction and saved list | Supported, viewer-state N+1 risk |
| Comments | Create/edit/delete on details | Supported |
| Reporting | Submit post/comment reports | Supported |
| Report administration | Admin review UI | Deferred |
| Policies | Privacy and community rules | Frontend content required |
| Dark mode | Full semantic theme | Required |

## Landing Page Content

Approved baseline sections:

1. distinctive hero with a clear value proposition;
2. concise explanation of سند;
3. how participation works;
4. real public-post preview from the API, with a safe empty fallback;
5. trust, privacy, and community-safety section;
6. registration/participation CTA;
7. focused FAQ;
8. footer with privacy and community-policy links.

Final product tagline, exact copy, photography, and color direction remain subject to design review. The attached image supplies the logo only.

## Explicitly Out of Scope

- post categories or typed post workflows;
- marketplace, checkout, payments, merchants, offers, or inventory;
- chat or notifications;
- admin dashboard and report-management UI;
- role promotion UI;
- password recovery/change and email verification;
- account deletion UI;
- multi-device session management;
- comment counts on feed cards;
- public fields beyond name and avatar;
- Redux/Zustand without a newly proven state requirement.

## Success Criteria

### Product

- A guest understands the product and reaches a real public post without registering.
- Registration occurs at a meaningful interaction point rather than blocking discovery.
- A user can create a text post and recover clearly from image-upload failure.
- A user can like, save, comment, and report without ambiguous state.
- The experience works comfortably in Arabic RTL on a narrow mobile viewport.

### Quality

- WCAG 2.2 AA is the accessibility target.
- Primary pages remain usable with reduced motion, keyboard navigation, screen readers, and 200% zoom.
- Public pages provide useful metadata and Open Graph previews.
- Auth secrets are not persisted in browser storage.
- Slow/offline/error states are designed and tested.
- Critical E2E journeys pass against a controlled test environment before production smoke testing.

## V1 Definition of Done

V1 is done only when:

- all in-scope journeys have approved responsive designs and implemented states;
- API types and validators match the verified backend contract;
- auth refresh/logout behavior is verified across Vercel and Render;
- public profile remains absent from V1 navigation, routes, and SEO unless a later approved decision restores it;
- feed Like/Save uses the accepted lazy visible-card strategy with measured request volume and correct pre-existing state;
- no UI implies deferred backend capabilities;
- accessibility, responsive, error-state, upload, and E2E checks pass;
- production environment variables, CORS, cookies, Cloudinary images, metadata, and smoke tests are verified;
- privacy and community-policy content is approved;
- the owner explicitly approves the roadmap and release scope.
