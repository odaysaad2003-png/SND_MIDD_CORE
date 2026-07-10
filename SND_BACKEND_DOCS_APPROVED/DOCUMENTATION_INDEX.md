# Documentation Index

## Purpose

This directory is the durable source of truth for the SND Community Core backend.
It exists so a developer or AI assistant can understand the project without relying
on old chat history.

## Required Reading Order

Read the documents in this order before planning a sprint or making a material change:

1. `PROJECT_CONTEXT.md` — compact orientation and current product boundaries.
2. `PROJECT_STATE.md` — current implemented state, known gaps, and next sprint.
3. `DECISIONS.md` — approved architectural and product decisions.
4. `ARCHITECTURE.md` — module boundaries and request/data flow.
5. `API_CONVENTIONS.md` — HTTP contract and response conventions.
6. `SECURITY_RULES.md` — non-negotiable security requirements.
7. `SPRINT_ROADMAP.md` — completed and future sprint outcomes.
8. `AUTH_CONCEPTS.md` or `DEPLOYMENT_NOTES.md` when relevant.
9. `LEARNING_NOTES.md` — required teaching and review method.

## Source-of-Truth Priority

When sources disagree, use this order:

1. Current repository code that passes typecheck/build/tests.
2. Explicit approved decisions in `DECISIONS.md`.
3. Current implementation snapshot in `PROJECT_STATE.md`.
4. `SECURITY_RULES.md`, `ARCHITECTURE.md`, and `API_CONVENTIONS.md`.
5. `SPRINT_ROADMAP.md`.
6. Old commits, generated notes, and chat history.

A code/docs conflict is not permission to silently keep insecure code. Material
security, API-contract, or data-integrity conflicts must be surfaced and resolved.

## Update Ownership

- Update `PROJECT_STATE.md` after a sprint is implemented and verified.
- Update `DECISIONS.md` only when a durable decision is approved or superseded.
- Update `SPRINT_ROADMAP.md` when scope or ordering changes.
- Update `API_CONVENTIONS.md`, `ARCHITECTURE.md`, or `SECURITY_RULES.md` only when
  the project-wide rule changes, not for every implementation detail.
- Keep exact API route inventories and schema fields in code unless a dedicated
  generated API reference is introduced later.

## Files Replaced by This Documentation Set

- Replace `CLAUDE_PROJECT_INSTRUCTIONS.md` with `AI_PROJECT_INSTRUCTIONS.md`.
- Replace the accumulated old `PROJECT_STATE.md` with the clean snapshot here.
- Delete or archive `PROJECT_STATE_UPDATED.md`; it is an obsolete Sprint 1 snapshot.
- Do not keep duplicate active versions of the same documentation file.

## Repository Placement

Recommended layout:

```text
backend/
  docs/
    DOCUMENTATION_INDEX.md
    PROJECT_CONTEXT.md
    PROJECT_STATE.md
    DECISIONS.md
    ARCHITECTURE.md
    API_CONVENTIONS.md
    SECURITY_RULES.md
    AUTH_CONCEPTS.md
    DEPLOYMENT_NOTES.md
    LEARNING_NOTES.md
    SPRINT_ROADMAP.md
  AI_PROJECT_INSTRUCTIONS.md
  SPRINT_PROMPT_TEMPLATE.md
```
