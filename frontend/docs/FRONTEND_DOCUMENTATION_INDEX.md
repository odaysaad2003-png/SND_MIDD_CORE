# SND Frontend Documentation Index

## Purpose

This index is the entry point for every human or AI working on the SND frontend. It defines the reading order, source-of-truth hierarchy, and ownership of each document so the project does not drift across sprints.

## Current Milestone

- Sprint F0: complete and approved on 2026-07-13.
- Sprint F0.5: contract decisions complete and approved on 2026-07-13; no backend code changed.
- Sprint F1: implementation and learning work complete; final owner-run verification is the only remaining closure gate after the 2026-07-14 code/document synchronization.
- Next: Sprint F2 — landing page and public discovery.
- Frontend implementation code: F1 foundation exists; no F2 feature implementation has started.
- Current learning step: audit the F2 public-read contract and trace the first public data flow before implementation.

## Mandatory Reading Order

Before planning a sprint or making a material frontend change, read:

1. `FRONTEND_DOCUMENTATION_INDEX.md`
2. `FRONTEND_PROJECT_CONTEXT.md`
3. `FRONTEND_PROJECT_STATE.md`
4. `FRONTEND_PRODUCT_SCOPE.md`
5. `FRONTEND_DECISIONS.md`
6. `FRONTEND_ARCHITECTURE.md`
7. `FRONTEND_API_CONTRACT.md`
8. `FRONTEND_AUTH_CONTRACT.md`
9. `FRONTEND_UI_SYSTEM.md`
10. `FRONTEND_UX_STATES.md`
11. `FRONTEND_TESTING_STRATEGY.md`
12. `FRONTEND_DEPLOYMENT_NOTES.md`
13. `FRONTEND_ROADMAP.md`
14. `FRONTEND_LEARNING_NOTES.md`
15. `FRONTEND_AI_PROJECT_INSTRUCTIONS.md`
16. `FRONTEND_SPRINT_PROMPT_TEMPLATE.md` when preparing a sprint prompt

Then inspect actual code and configuration:

- frontend `package.json`, lockfile, TypeScript/configuration files, and current source tree;
- relevant frontend feature files and their direct dependencies;
- current backend routes, validation, controllers, services, and presenters for the feature being integrated;
- current Git diff and working-tree state.

## Source-of-Truth Priority

When information conflicts, use this order:

1. Verified current frontend and backend code.
2. Accepted decisions in frontend/backend decision documents.
3. Verified API and authentication contracts.
4. Current project state and approved product scope.
5. Frontend architecture, UI system, UX states, testing, and deployment rules.
6. Approved roadmap and sprint prompt.
7. Old conversations, screenshots, mockups, or assumptions.

Never silently choose between material conflicts. Report the conflict and stop before implementation when it changes security, API behavior, product scope, data exposure, or architecture.

## Document Map

| File | Owns | Does not own |
|---|---|---|
| `FRONTEND_PROJECT_CONTEXT.md` | Product identity, audience, V1 boundary, backend relationship, major risks | Current sprint progress |
| `FRONTEND_PROJECT_STATE.md` | Current verified snapshot, learning position, next action, open blockers | Long-term roadmap history |
| `FRONTEND_PRODUCT_SCOPE.md` | V1 goals, journeys, included/deferred features, release DoD | Low-level code structure |
| `FRONTEND_DECISIONS.md` | Durable ADR-style decisions and their consequences | Temporary task notes |
| `FRONTEND_ARCHITECTURE.md` | App Router, boundaries, API/query/auth/state ownership, performance rules | Exact backend route details |
| `FRONTEND_API_CONTRACT.md` | Exact frontend-used API methods, paths, inputs, outputs, errors, caching notes | Invented future endpoints |
| `FRONTEND_AUTH_CONTRACT.md` | Access/refresh/CSRF/CORS/session responsibilities | General UI design |
| `FRONTEND_UI_SYSTEM.md` | Approved visual direction, semantic tokens, components, RTL, responsive and accessibility rules | Feature-specific layouts and final F2 content |
| `FRONTEND_UX_STATES.md` | Loading, empty, errors, forms, uploads, retries, accessibility messaging | Business contracts |
| `FRONTEND_TESTING_STRATEGY.md` | Test layers, matrices, mocking, accessibility, responsive and smoke policy | Claims that unexecuted tests passed |
| `FRONTEND_DEPLOYMENT_NOTES.md` | Vercel/Render environments, CORS/cookies, smoke, rollback, monitoring | Local feature implementation |
| `FRONTEND_ROADMAP.md` | Sprint sequence, scope, dependencies, deliverables and DoD | Current verified state |
| `FRONTEND_LEARNING_NOTES.md` | Learning method and Definition of Learned | Product/API authority |
| `FRONTEND_AI_PROJECT_INSTRUCTIONS.md` | Mandatory working behavior for AI assistants | Feature-specific sprint scope |
| `FRONTEND_SPRINT_PROMPT_TEMPLATE.md` | Reusable sprint request structure | Approved facts by itself |

## Update Rules

- Update `FRONTEND_PROJECT_STATE.md` after verified progress; replace the current snapshot rather than appending contradictory history.
- Add or supersede durable decisions in `FRONTEND_DECISIONS.md`; do not rewrite accepted reasoning silently.
- Change `FRONTEND_ROADMAP.md` only when sprint order, scope, or status changes.
- Update API/Auth contracts only after the corresponding backend behavior is verified.
- Update architecture/UI/UX/testing/deployment documents only for project-wide rules.
- Update learning notes when a new reusable mental model or recurring mistake is discovered.
- Never mark a sprint complete before engineering verification and the learning gate both pass.

## Completion Gates

Every sprint has two independent gates:

### Definition of Done

The behavior is implemented, secure, accessible, tested, documented, and verified by the actual project commands.

### Definition of Learned

The learner can explain the flow, identify layer responsibilities, modify the implementation, predict important failure paths, and rebuild the core pattern in a smaller exercise.

Both gates are required before the sprint is closed.
