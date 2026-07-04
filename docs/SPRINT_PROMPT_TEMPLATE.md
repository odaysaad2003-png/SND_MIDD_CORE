# SPRINT_PROMPT_TEMPLATE.md

Use this template when asking Claude to execute any sprint.

---

## Sprint Request

We are working on SND Community Core.

Before writing code, read:

- `docs/PROJECT_STATE.md`
- `docs/SPRINT_ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/API_CONVENTIONS.md`
- `docs/LEARNING_NOTES.md`
- `docs/SECURITY_RULES.md` if the sprint touches auth, permissions, ownership, user data, admin, uploads, or protected routes
- `docs/DEPLOYMENT_NOTES.md` if the sprint touches env, CORS, cookies, health checks, logging, storage, or deployment

## Current Sprint

Sprint X — [Sprint Name]

## Goal

[Paste the goal from SPRINT_ROADMAP.md]

## Scope

You may only implement what belongs to this sprint.

## Out of Scope

Do not implement:
- Features from later sprints
- Unrequested UI redesigns
- Unapproved architecture changes
- Unapproved dependency swaps
- Large refactors outside the sprint boundary

## Required Learning Behavior

Before implementation, explain every new important concept using the project learning style:
- What it is
- Why it exists
- What problem it solves
- How it fits into SND Community Core
- Common mistakes
- Production notes

## Required Architecture Behavior

Follow:

route → middleware → validation → controller → service → model/database → response

Use:
- Standard API response format
- Standard error response format
- `asyncHandler` for async controllers
- `AppError` for expected operational errors
- Global error middleware
- Validated params/query/body
- Service-layer ownership checks for protected resources

## Required Output

1. Sprint understanding
2. Files to create/modify
3. Concept explanation
4. Implementation
5. Request/data flow explanation
6. Security notes
7. Testing/manual verification steps
8. `PROJECT_STATE.md` update
9. Final review checklist