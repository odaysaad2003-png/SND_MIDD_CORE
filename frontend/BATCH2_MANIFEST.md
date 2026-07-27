# Sprint 5 — Batch 2: My Posts Management Workspace

This patch is applied after Sprint 5 Batch 1 and contains only the new and modified frontend files for the second large Sprint 5 batch.

## Product experience

- Adds the protected `/my-posts` workspace.
- Adds URL-owned search, sort, and pagination for active current-user posts.
- Adds polished loading, background-refresh, empty, filtered-empty, out-of-range, network, invalid-response, forbidden, and narrow-mobile states.
- Adds reusable owner post cards with edit, image management, public preview, and soft-delete actions.
- Adds an edit dialog that submits only changed `title`/`content` fields and preserves recoverable form state.
- Adds an image-management dialog for optional additions and exact single-image removal using the verified `imageUrl` contract.
- Reuses browser MIME/size/magic-signature checks and object-URL cleanup from Batch 1.
- Adds clear no-owner-restore copy before soft deletion without claiming the database record is hard-deleted.
- Adds contextual inline feedback plus the existing SND Toast system.
- Synchronizes affected public/private Query caches and invalidates lists for server reconciliation.
- Adds safe network/invalid-response reconciliation for edit and image operations when the public post remains readable.

## Integration

- Adds `/my-posts` to the safe internal `returnTo` allowlist.
- Adds My Posts access from the account menu and private profile page.
- Updates the existing Header and return-destination tests affected by these integrations.

## Verified backend contracts used

- `GET /posts/me?status=active&page&limit&q&sort`
- `PATCH /posts/:postId` with optional strict `title` and/or `content`
- `DELETE /posts/:postId` returning `204`
- `POST /posts/:postId/images` with repeated multipart field `images`
- `DELETE /posts/:postId/images` with strict JSON body `{ "imageUrl": "..." }`

## Verification status

No npm, lint, typecheck, test, build, or browser command was run, per the owner's explicit request. The batch is implemented but not yet engineering-verified.
