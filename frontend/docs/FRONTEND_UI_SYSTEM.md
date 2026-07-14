# SND Frontend UI System

## Status

The UI-system structure was approved on 2026-07-13. Calm Contemporary, IBM Plex Sans Arabic, and the F1 semantic light/dark token direction were approved and implemented on 2026-07-14. The F2 landing/header/footer/loading revision is an implementation candidate awaiting owner browser verification; final production photography remains future work.

## Brand Boundary

- Display name: **سند**
- Latin mark: **SND**
- Final tagline: TBD
- Audience: residents of Gaza
- The supplied image is a source for the logo only.
- Do not copy product claims, categories, features, roles, layouts, or colors from that image.
- The prepared transparent mark is stored at `public/brand/snd-logo.png`; preserve its proportions and colors. F2 places the unchanged asset on a stable white brand plate in navigation, Hero, and footer so its dark-blue strokes remain visible in dark mode without CSS recoloring.

## Design Principles

1. **Human before technical:** people and community needs lead the visual story.
2. **Calm clarity:** strong hierarchy without crowded cards or constant decoration.
3. **Trust through consistency:** actions, permissions, confirmations, and errors behave predictably.
4. **Mobile dignity:** the narrow-screen experience is the primary design, not a compressed desktop version.
5. **Progressive detail:** essential content appears first; secondary metadata and controls stay available without competing.
6. **Accessible character:** the product can feel distinctive without sacrificing contrast, focus, motion preferences, or readable type.

## Visual Direction Decision

`Calm Contemporary` is the adopted direction: generous whitespace, crisp Arabic typography, low-noise surfaces, controlled brand accents, subtle depth, and restrained motion.

`Warm Civic` and `Human Editorial` remain comparison history only. They are not alternate runtime themes, and their exploratory hard-coded styles do not remain in production source. Future F2 compositions must use the semantic tokens rather than copying colors from the comparison exercise.

## Semantic Color Tokens

Define tokens by purpose rather than literal color names:

```text
--background
--surface
--surface-raised
--surface-muted
--text-primary
--text-secondary
--text-inverse
--border
--border-strong
--brand
--brand-foreground
--accent
--focus-ring
--success
--warning
--danger
--info
--overlay
```

Light and dark themes get independently tuned values for these roles. Dark mode must use layered surfaces and comfortable contrast rather than pure black backgrounds and inverted light colors. Destructive, warning, and success meanings remain stable across themes.

## Typography

Requirements:

- excellent Arabic readability at small mobile sizes;
- distinct but compatible Arabic and Latin metrics;
- clear numerals and punctuation;
- variable-font delivery when it materially reduces weight;
- no dependence on font weight alone for hierarchy.

IBM Plex Sans Arabic is the adopted F1 family. The application imports local package assets for weights 400, 500, 600, and 700 and keeps Arial, Helvetica, and generic `sans-serif` fallbacks. Adding more weights requires a demonstrated UI need because each file affects delivery size.

Type roles:

| Role | Use |
|---|---|
| Display | Landing hero only; restrained |
| Heading 1–3 | Page and section hierarchy |
| Body | Posts, policy copy, descriptions |
| UI | Buttons, tabs, navigation, form labels |
| Meta | Dates and secondary post information |

Body text should remain comfortable at mobile width, use adequate line height, and avoid overly long full-width desktop lines.

## Spacing and Layout

Use a consistent spacing scale derived from a 4 px base. Prefer a small deliberate set rather than arbitrary values.

- Minimum touch target: 44×44 CSS pixels.
- Mobile gutters: stable and generous enough for RTL text and focus rings.
- Content max-widths differ by purpose: narrow for forms/policies, medium for feed, wide for landing compositions.
- Respect safe-area insets on mobile fixed/sticky navigation.
- Use CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline`) so RTL behavior is intrinsic.

## Radius, Borders, and Shadows

- Use a small radius scale for controls, cards, large surfaces, and pills.
- Avoid making every surface a floating rounded card.
- Borders establish structure in dense areas; shadows are reserved for elevation and transient overlays.
- Dark-mode shadows require separate tuning and should not become large black halos.
- Focus rings must remain visible beyond borders and shadows.

## Core Components

### Buttons

Variants: primary, secondary, subtle/ghost, danger, and text/link. Every button defines default, hover, active, focus-visible, disabled, and pending states. Pending labels remain stable in width where possible.

### Inputs

Inputs include visible labels, optional help, error text, required indication, and character count where limits matter. Placeholder text never replaces a label. Password visibility toggles have accessible names.

### Cards

Post cards prioritize author, time, title/content, media, and actions. Avoid displaying unsupported categories or comment counts. Action buttons provide clear pressed state and accessible labels.

### Navigation

- Mobile: compact header and/or bottom navigation only if destinations justify it.
- Desktop: persistent header with restrained page navigation.
- Authenticated and guest navigation differ without layout jumps after bootstrap.
- Admin navigation is not present in V1.
- Use a reusable active navigation link built on Next.js `Link` and `usePathname`; do not add React Router solely for active-link styling.
- Mark the current destination with `aria-current="page"` and a visual treatment that does not rely on color alone. Define exact matching for root destinations and intentional prefix matching for nested routes.
- Keep the active-link behavior as a focused Client Component so the surrounding header/layout can remain server-rendered where possible.

### Dialogs, Menus, and Sheets

Use accessible focus management, Escape handling, labelled titles, and focus return. On mobile, action sheets may replace small menus when this improves reachability.

### Feedback

Inline feedback stays near the action. Toasts are supplementary and never the only place for destructive, validation, or upload information.

## Post Media

- One image uses an aspect-aware stable container.
- Multiple images use an accessible grid/gallery without downloading all full-resolution assets unnecessarily.
- Provide useful alternative text strategy; where author-provided alt text does not exist in the backend, use contextual generic Arabic labels without inventing image contents.
- Never derive storage IDs or transformations from internal data not returned by the API.

## Imagery and Shapes

Use realistic, respectful community photography combined with restrained abstract shapes. Photography must avoid exploitation, shock imagery, or implying a feature that does not exist. Abstract motifs should support flow and identity, not obscure content.

The landing page must have meaningful fallbacks when remote imagery or the feed preview fails.

## RTL Rules

- Root document direction is `rtl` and language is Arabic.
- Use logical CSS properties.
- Numbers, emails, URLs, and code-like values may use local `dir="ltr"` isolation.
- Directional icons are mirrored only when their meaning is spatial; universal symbols are not blindly flipped.
- Mixed Arabic/Latin logo text retains the approved mark orientation.
- Test truncation, punctuation, form errors, menus, carousels, and browser autofill in RTL.

## Responsive Behavior

Design mobile first, then enhance at content-driven breakpoints. Core actions must not move unpredictably between breakpoints. On small screens:

- keep primary creation and interaction actions reachable;
- avoid multi-column forms;
- use media ratios that do not consume the entire first viewport;
- preserve readable post text without forced horizontal scrolling;
- avoid hover-only disclosure.

## Motion Principles

- Soft reveal for major landing sections.
- Micro-interactions for button press, Like/Save state, menus, and successful actions.
- Page transitions only when they improve continuity.
- Skeletons do not shimmer aggressively.
- Respect `prefers-reduced-motion` and provide equivalent instant state changes.
- Animate opacity/transform where possible; avoid layout shift.

## Accessibility Baseline

Target WCAG 2.2 AA. Tokens and components must support:

- text and non-text contrast;
- visible focus and keyboard completion;
- screen-reader labels and status announcements;
- errors linked to fields;
- 200% zoom and narrow reflow;
- reduced motion;
- adequate target sizes;
- semantic headings, lists, articles, navigation, and landmarks.

## Content Voice

Arabic copy should be clear, respectful, direct, and non-judgmental. Avoid technical auth language, exaggerated promises, and language implying that a report guarantees a specific moderation result. Error copy tells the user what happened, what remains safe, and what they can do next.

## Logo Integration

Use `public/brand/snd-logo.png` as the approved transparent source asset. Render it with explicit dimensions or a stable container, preserve its aspect ratio, do not recolor it through CSS filters, and never use the original product-board image in the interface. Navigation-specific variants are created only after the real F2 header establishes a measured need.
