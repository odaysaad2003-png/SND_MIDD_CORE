# Sprint 5 — Batch 1: Global Post Composer

This patch contains only the new and modified frontend files for the first Sprint 5 batch.

## Behavior

- Authenticated users can open a reusable global post composer from the header or account menu.
- The composer publishes JSON text first, then uploads optional images to the verified multipart endpoint.
- Up to five JPEG/PNG/WEBP images, 5 MB each.
- Browser-side MIME, size, and magic-signature checks.
- Local previews and object-URL cleanup.
- Clear create/upload stages, partial-success state, upload retry without recreating the text post, and continue-without-images.
- Query invalidation for public and current-user post lists.
- Existing SND Toast system and semantic UI tokens are reused.

## Verification status

No npm, lint, typecheck, test, build, or browser command was run, per the owner's explicit request.
