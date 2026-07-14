# SND Frontend Learning Notes

## Educational Goal

The objective is not merely to finish a frontend. The learner should become capable of understanding, changing, debugging, testing, and extending a production-minded Full-Stack product without depending on generated code they cannot explain.

The learning order is:

```text
understand → model the flow → plan → write a small part → explain → modify → test → teach back
```

Understanding comes before code, while writing practice happens in parallel after the mental model is established.

## Core Learning Rules

### 1. Mental Model Before Syntax

Before seeing a new implementation, explain:

- what problem exists;
- who owns the responsibility;
- where data starts and ends;
- what changes over time;
- what can fail;
- how the concept connects to the current SND backend.

Syntax is introduced only after the learner can describe the intended behavior.

### 2. Small Logical Batches

Do not generate a whole sprint at once. Implement one understandable flow or a small set of directly related files. A normal teaching batch contains one to three behavior-bearing files; mechanical setup may be grouped when it introduces no hidden logic.

After each batch:

1. trace inputs and outputs;
2. explain every important line;
3. identify framework code versus project code;
4. ask the learner to change something meaningful;
5. verify before continuing.

### 3. Senior Ladder Mode

Teach important concepts in four layers:

1. simple real-world mental model;
2. implementation inside SND;
3. security, performance, concurrency, and accessibility edge cases;
4. alternative designs and why SND chose its current approach.

Examples: Server Components, Query cache, optimistic updates, token refresh, URL state, image upload, hydration, and error boundaries.

### 4. Connect Frontend to Backend

Every feature follows the complete flow:

```text
user action
→ browser event
→ component/form
→ feature hook or API function
→ HTTP request
→ Express route/middleware/controller/service
→ MongoDB/Cloudinary
→ API envelope
→ query cache/state
→ rendered feedback
```

The learner should know where validation, authentication, authorization, business rules, persistence, caching, and visual feedback belong.

### 5. Active Recall

Do not ask only “هل فهمت؟”. Require the learner to:

- explain the flow without reading;
- predict what happens if one layer fails;
- compare two similar concepts;
- locate the correct file for a change;
- make a small modification;
- find and fix an intentionally simple bug;
- rebuild a smaller version without copying.

### 6. No Hidden Magic

When a framework performs work automatically, explain the mechanism and boundary. Examples:

- what Next.js renders on the server and what hydrates in the browser;
- what TanStack Query caches and what it does not;
- what React Hook Form owns;
- what the browser does with HttpOnly cookies;
- what Next Image optimizes;
- what shadcn/ui provides versus what SND owns.

### 7. Verification Is Part of Learning

A concept is incomplete until the learner sees how to prove it works. Verification includes static checks, automated tests, browser behavior, accessibility, network inspection, and negative cases.

## State Categories the Learner Must Master

| State type | Example in SND | Primary owner |
|---|---|---|
| Server state | Feed posts, comments, saved posts | TanStack Query |
| Form state | Post title/content, login fields | React Hook Form |
| URL state | Search, sort, page | URL search params |
| Auth session state | Access token, CSRF, bootstrap status | Narrow in-memory auth provider |
| Local UI state | Open menu, selected tab, gallery index | Component state |
| Theme state | Light/dark preference | next-themes |

The learner must be able to explain why putting all of these into one global store would create unnecessary coupling.

## Standard Sprint Learning Cycle

### A. Concept Lecture

Explain new concepts using the Senior Ladder, with direct SND examples.

### B. Flow and File Map

Draw the request/data flow and identify every file that participates before creating it.

### C. Prediction Check

Ask the learner to predict outputs, state changes, errors, and cache behavior.

### D. Small Implementation

Write a limited, reviewable batch. Avoid hiding important logic in large generated abstractions.

### E. Line-by-Line Review

Explain imports, types, functions, data movement, control flow, and important framework behavior.

### F. Learner Modification

The learner changes validation, UI behavior, query state, or error handling and predicts the effect first.

### G. Verification

Run the actual project commands and positive/negative browser/test cases.

### H. Teach-Back and Mini Challenge

The learner explains the flow and rebuilds the central pattern in a small independent exercise.

### I. Documentation Update

Update state and durable decisions only after both Done and Learned gates pass.

## Definition of Learned

A feature is learned when the learner can:

- state the user/product problem;
- explain why the chosen frontend concept exists;
- trace the full request and response;
- distinguish server, form, URL, auth, and local state;
- identify the security and accessibility boundaries;
- predict loading, error, empty, and mutation behavior;
- locate and modify the responsible file;
- explain at least one alternative and its trade-off;
- pass a short review quiz;
- rebuild the core idea in a smaller example.

## Completed Foundation Lesson Track

### Lessons 1–6 — Completed on 2026-07-13

The learner demonstrated the ability to:

- trace read and mutation flows from UI through Next.js, Express, services, MongoDB/Cloudinary, response envelopes, Query cache, and rendered feedback;
- distinguish Server and Client Components, hydration, and focused client islands;
- assign server, form, URL, auth, theme, and local UI state to the correct owner;
- place routing, feature, shared UI, layout, provider, and infrastructure responsibilities in the approved folder architecture;
- distinguish API client, feature API functions, Query keys, cache freshness, garbage collection, invalidation, direct cache updates, and initial/background loading;
- explain access-token memory, HttpOnly refresh cookies, CSRF, CORS, browser bootstrap, single-flight refresh, `401` versus `403`, and logout cleanup.

Corrections retained for practice:

- Login and fresh-page bootstrap are different flows.
- Frontend JavaScript never reads the HttpOnly refresh-token value.
- CSRF primarily protects browser requests that automatically carry cookies; it is not a Postman access-control mechanism.
- Invalidation is not the only mutation strategy; exact server results may update narrow caches directly.
- `isFetching` may be true during background refresh while usable cached data remains visible.

### F0.5 Contract-First Lesson — Completed on 2026-07-13

The learner reviewed why ten feed posts can create `1 + 2N = 21` requests under the current Like/Save status contract. The accepted V1 trade-off is lazy status resolution for authenticated visible cards, no guest status calls, correct unknown/loading behavior, Query-cache reuse, and F6 measurement. Public Profile is deferred rather than supported by an invented frontend contract. A protected batch endpoint remains the preferred future optimization.

### F1 Foundation Batch 1 — Completed on 2026-07-13

The learner created and ran the Arabic RTL Next.js foundation, added a semantic list, and explained that static JSX and Tailwind classes do not require a Client Component. The logical-spacing correction is retained: `ps-*` targets inline start, which is the right side in RTL, while `pe-*` targets inline end.

### F1 Provider Spine — Complete
The learner implemented Query, Theme, and composed application providers and reported successful lint, type generation/check, and production build. Demonstrated concepts:

- `QueryClient`, not React state or `AppProviders`, owns the Query cache;
- a lazy `useState` initializer preserves one Query Client instance for the provider lifetime;
- `staleTime` describes freshness, while inactive-cache retention belongs to `gcTime`;
- the server cannot read browser `localStorage` or system-theme state;
- the theme class may change on `<html>` during hydration, so suppression is narrow and intentional;
- theme preference may be persisted because it is not an authentication secret.

The learning checkpoint passed. The learner explained the Server/Client composition boundary, the Query Client lifecycle 

across provider unmount/remount, and the need to delay browser-dependent theme UI until mount to avoid hydration mismatch.

### F1 Environment and API Foundation — Complete on 2026-07-14

The learner demonstrated that:

- a successful `204 No Content` must not be parsed as JSON;
- feature API functions own feature-specific request/data shapes, while the shared API client owns common HTTP transport and envelope behavior;
- cancelling a request must preserve `AbortError` instead of disguising it as a network or invalid-response failure;
- blindly retrying a POST can duplicate a mutation;
- a public API base URL may be exposed through `NEXT_PUBLIC_*`, while secrets must never enter the client bundle.

The implemented tests cover environment validation, the `/api/v1` URL boundary, JSON/envelope parsing, request IDs, `204`, the three API error categories, and abort preservation. Runtime network payloads still begin as `unknown`; deeper feature-data validation belongs in feature schemas when those features are implemented.

### F1 UI and Visual Foundation — Complete on 2026-07-14

The owner approved Calm Contemporary, IBM Plex Sans Arabic, the semantic token direction, and the prepared logo. The implementation keeps RTL at the document root, uses logical spacing, isolates theme interaction as a client island, gives controls visible focus and adequate targets, distinguishes light/dark token values, and respects reduced-motion preferences. Unit/component tests and the actual lint, type, test, and build commands form the repeatable F1 verification gate.

### Next Lesson

Start Sprint F2 by auditing its landing/public-discovery contracts and tracing one public read flow from a feature API function through the shared client and backend envelope to a server-renderable UI. Do not pull F3 Authorization, CSRF, or refresh coordination into F2.

## Learning Log Rule

After each completed lesson/sprint, record concise reusable insights, mistakes corrected, and concepts that still require practice. Do not turn this file into a chronological transcript or copy large code blocks into it.
