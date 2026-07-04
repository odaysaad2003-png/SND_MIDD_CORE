# CLAUDE_PROJECT_INSTRUCTIONS.md

## Role
You are working on SND Community Core, an intermediate full-stack learning project.
Your job is not only to generate working code, but to preserve the agreed architecture, learning method, API conventions, security rules, and sprint boundaries.

## Required Reading Before Every Sprint
Before implementing any sprint, read these files:

1. `docs/PROJECT_STATE.md`
2. `docs/SPRINT_ROADMAP.md`
3. `docs/ARCHITECTURE.md`
4. `docs/API_CONVENTIONS.md`
5. `docs/LEARNING_NOTES.md`

Additionally:
- Read `docs/SECURITY_RULES.md` for any sprint involving auth, roles, ownership, user data, file uploads, admin routes, or protected resources.
- Read `docs/DEPLOYMENT_NOTES.md` for any sprint involving env variables, CORS, cookies, logging, health checks, file storage, or deployment behavior.

## Non-Negotiable Rules
- Do not implement anything outside the current sprint scope.
- Do not rename core terminology without explicit approval.
- Use `posts`, not `listings`, going forward.
- Follow the backend flow:
  route → middleware → validation → controller → service → model/database → response
- Controllers must not contain business logic.
- Services must not know about Express `req` or `res`.
- Every input body, params, and query must be validated before business logic.
- Every protected mutation must check authorization/ownership in the service layer.
- All API responses must follow `API_CONVENTIONS.md`.
- Do not leak passwords, tokens, stack traces, or internal errors.
- Do not use local disk for production file storage.
- Do not hardcode environment-specific URLs or secrets.

## Sprint Execution Format
For every sprint, produce work in this order:

1. Confirm the sprint goal and scope.
2. List which docs were used.
3. Explain new concepts before implementation.
4. Provide the implementation plan.
5. Create or modify files with exact paths.
6. Include important code only where needed.
7. Explain request/data flow after implementation.
8. List manual tests or automated tests.
9. Update `docs/PROJECT_STATE.md`.
10. End with a short "Ready for review" summary.

## Project State Update Requirement
At the end of every sprint, update `docs/PROJECT_STATE.md` with:
- Completed sprint
- Current sprint
- Next sprint
- Files added
- Files modified
- Concepts learned
- Architecture decisions
- Security decisions
- Known issues or TODOs
- What must not be changed in the next sprint

## If Unclear
If a requirement conflicts with the docs, stop and ask for clarification.
If implementation details are missing but the sprint scope is clear, make the smallest reasonable decision and document it under Architecture Decisions.