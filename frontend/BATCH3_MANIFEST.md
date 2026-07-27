# Sprint 5 — Batch 3 Manifest

## Scope

Product integration and UX hardening for post authoring and owner management.

## Added

- `src/features/posts/components/post-composer-entry-card.tsx`
- `src/features/posts/components/post-management-actions.tsx`
- `src/features/posts/components/current-user-post-actions.tsx`
- `src/features/posts/hooks/use-online-status.ts`

## Modified

- `src/features/posts/providers/post-composer-provider.tsx`
- `src/features/posts/components/post-composer-dialog.tsx`
- `src/features/posts/components/edit-post-dialog.tsx`
- `src/features/posts/components/manage-post-images-dialog.tsx`
- `src/features/posts/components/owned-post-card.tsx`
- `src/features/posts/components/public-post-card.tsx`
- `src/features/posts/components/public-post-detail.tsx`
- `src/features/posts/pages/public-posts-page.tsx`
- `src/features/profiles/pages/my-profile-page.tsx`
- `docs/FRONTEND_ROADMAP.md`

## User journeys completed

1. Guest reads `/posts`, chooses to publish, authenticates with a safe `returnTo`, returns to the feed, and the composer opens automatically through `?compose=1`.
2. Authenticated user opens the same global composer from Header, public feed entry card, Profile, or My Posts.
3. A post owner manages the same post from My Posts, its public card, or its public detail page through one reusable action owner.
4. Edit, image upload/removal, and delete preserve confirmed server state and use the existing cache reconciliation rules.
5. Known browser-offline state disables impossible mutations while preserving local text and selected files.

## Backend contracts preserved

- `POST /posts`
- `PATCH /posts/:postId`
- `DELETE /posts/:postId`
- `POST /posts/:postId/images`
- `DELETE /posts/:postId/images`

No backend route, request field, role, permission, or error code was added.

## Verification status

No npm, Lint, TypeScript, test, or production-build command was executed for this batch, following the product owner's explicit instruction. The batch is implemented but not engineering-verified.
