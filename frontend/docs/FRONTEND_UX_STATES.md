# SND Frontend UX States

## Purpose

Every networked feature must define its state behavior before implementation. States share typography, tokens, accessibility rules, and action patterns, but should not all look like the same generic card.

## State Anatomy

Where relevant, a state contains:

1. concise Arabic title;
2. context-specific explanation;
3. primary recovery action;
4. optional secondary navigation;
5. accessible live announcement;
6. request ID in support details for server errors.

## Loading

### Initial Page Loading

- Landing shell and static content render immediately.
- Public feed/post skeletons match final geometry to prevent layout shift.
- Protected pages show a neutral session-resolution shell; they do not flash login or private content.
- Loading longer than a reasonable threshold may reveal explanatory text and a cancel/back option.

### Pagination Loading

Keep existing items visible and show loading at the list boundary. Do not replace the entire feed. Disable repeated page requests while one is pending.

### Background Refresh

Retain current data, show a subtle non-blocking indicator only when useful, and never reset scroll position.

## Skeletons

Create domain-specific skeletons for post cards, comments, profile headers, and forms. Skeletons:

- preserve final dimensions;
- use restrained animation;
- stop animation under reduced-motion preference;
- are hidden appropriately from assistive technology or labelled once at the container level.

## Empty States

| Context | Message purpose | Primary action |
|---|---|---|
| Public feed | No public posts match current filters | Clear search/filter |
| New community feed | No posts exist yet | Register/create if authenticated |
| My posts | User has not posted | Create a post |
| Saved posts | Nothing saved | Browse feed |
| Comments | Conversation has not started | Add comment or log in |

Empty states may use quiet illustrations or shapes, but should not suggest missing features such as categories or chat.

## Network and Server Errors

### Offline

Detect likely offline state separately. Explain that the connection is unavailable, keep safe local input, and offer Retry. Do not log the user out merely because the network disappeared.

### Timeout/Transient Failure

Keep stale data when available, offer bounded retry, and avoid duplicate mutations. Public content may show a compact retry region; forms keep entered values.

### General Server Error

Show a calm error with Retry and navigation. Preserve `X-Request-Id` for support. Do not reveal stack traces or raw objects.

### Rate Limit

For `429`, stop rapid retries, explain that requests were temporarily limited, and enable retry when appropriate. Auth and upload screens must not encourage repeated clicking.

## Authentication States

### Anonymous

Public content remains available. Interaction actions open login/register with a safe return path.

### Session Resolving

Use a stable protected-page skeleton. Navigation may show a neutral placeholder rather than the wrong user state.

### Session Expired

Attempt one controlled refresh. If it fails, clear private data and show login with a message that the session ended. Do not claim the account was deleted.

### Unauthorized (`401`)

For a protected request, enter the refresh flow once. A final `401` becomes anonymous/session-ended state.

### Forbidden (`403`)

Do not refresh automatically. Explain that the action is unavailable. Owner-only edit/delete failures retain the content and return the user to a safe view.

### Inactive/Suspended Account

Clear private session state, prevent mutations, and show neutral guidance/contact information without exposing internal moderation details.

## Not Found

Use one privacy-preserving public message for missing, deleted, or hidden posts/comments. Offer return to feed. Do not reveal moderation or ownership state.

Route-level unknown pages use a branded not-found page with navigation to landing/feed.

## Form States

### Validation

- Validate on submit and sensibly on blur/change after first error.
- Focus the first invalid field.
- Link messages with `aria-describedby`.
- Preserve backend and client messages without duplication.
- Unknown backend detail shapes become a form-level message.

### Pending

- Disable duplicate submit.
- Keep fields readable.
- Use stable pending label and spinner/icon.
- Announce progress once.

### Success

Use inline confirmation when the context remains visible. Toasts may reinforce, not replace, the result. Move focus when navigation/content changes substantially.

### Conflict

For duplicate email or duplicate report, explain the existing state without suggesting repeated submission.

## Mutation States

### Like and Save

- Guests are routed to auth.
- Authenticated state may update optimistically.
- Lock only the affected action while pending.
- Roll back icon/count on failure.
- Reconcile with the server response.
- An accessible pressed state and live text must communicate the result without relying on color.

### Comment Create/Edit/Delete

- Preserve comment text on failed create/edit.
- Insert/update only after success or with a clearly managed optimistic item.
- Deletion requires confirmation appropriate to risk, then removes the item and updates the local detail-page total.
- No restore promise is shown.

### Post Delete

Confirm that deletion removes the post from public view and has no owner restore in V1. On success remove it from active caches. On ambiguous failure, refetch before claiming success.

### Report

Show selectable localized reasons mapped to exact backend enums. After success, confirm receipt without promising a moderation outcome. A duplicate report explains that it was already submitted.

## Upload States

### Selection

- Show accepted formats and size/count limits before file selection.
- Validate type, size, and count locally for fast feedback.
- Server validation remains final.

### Preview

Show removable previews with accessible file names/status. Revoke temporary object URLs when removed/unmounted.

### Uploading

Show real progress when available, otherwise an honest indeterminate state. Prevent duplicate upload and warn before navigation if cancellation would lose selected files.

### Partial Post Flow

After the text post is created, image upload is a separate operation. If upload fails:

- state explicitly that the text post was published;
- keep the returned post ID;
- offer Retry images;
- offer Continue without images;
- never submit a second text post during retry.

### Upload Failure Types

| Failure | UX |
|---|---|
| Wrong format/signature | Identify rejected file and allowed formats |
| Too large | Show 5 MB per-file limit |
| Too many | Show five-image total limit |
| Network failure | Preserve files where possible and offer retry |
| Authorization/ownership | Stop upload and return to safe post state |
| Server/storage failure | Keep created text post and provide retry/support ID |

## Slow Network Mode

- Render text before non-critical media.
- Use properly sized images and stable placeholders.
- Avoid automatic prefetching of many post details/statuses.
- Lazy-load Like/Save viewer-state requests for visible cards only.
- Keep pagination explicit or provide accessible load-more behavior.
- Show that an action is still processing instead of accepting repeated taps.

## Retry Policy

| Operation | Automatic retry |
|---|---|
| Public GET | Bounded for transient network/5xx only |
| Protected GET | One auth refresh/retry plus bounded safe retry |
| Register/login | No |
| Create/update/delete mutation | No general automatic retry |
| Like/save idempotent mutation | Only with an explicit, tested policy |
| Upload | User-triggered retry using the existing post ID |

## Accessibility Messaging

- Use polite live regions for background success and status.
- Use assertive messaging only for blocking errors.
- Do not announce every skeleton cell.
- Move focus to dialogs/errors only when it helps recovery.
- Icon-only feedback always has text for assistive technology.
- Color, motion, and sound are never the sole state indicators.

## Required State Review

Every page/feature design must demonstrate at least: loading, content, empty, offline, server error, unauthorized/forbidden where applicable, validation, pending mutation, success, and narrow-mobile behavior. Upload features additionally demonstrate selection, progress, failure, and retry.
