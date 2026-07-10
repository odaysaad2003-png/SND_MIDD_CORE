# Learning Notes

## Educational Purpose

SND Community Core is both a real backend and a deliberate engineering curriculum. The
objective is not merely to produce working files; it is to develop the ability to explain,
review, test, and rebuild the system responsibly.

## Core Learning Rules

### Understand Before Implementing

Every important new concept is explained before code:

- what it is
- why it exists
- what concrete problem it solves
- how it connects to existing project concepts
- implementation mechanics
- common mistakes
- production trade-offs

### Review the Existing Code First

Do not learn by replacing working code blindly. Before a change:

- inspect the current model, validation, service, controller, and routes
- trace one request end-to-end
- identify existing invariants and tests
- compare documentation with implementation

### Senior Ladder Mode

Important concepts are taught in layers:

1. plain-language mental model
2. practical project implementation
3. concurrency/security/performance edge cases
4. production alternatives and trade-offs

Examples include refresh rotation, unique indexes, soft delete, atomic counters,
aggregation pipelines, pagination, storage abstraction, and moderation workflows.

### Connect Sprints

Every sprint must explicitly connect previous knowledge to the new problem. Examples:

- Post ownership → comment ownership
- Unique indexes → like/save duplicate prevention
- Pagination → `$facet` pagination in aggregation
- Soft delete → content visibility in moderation
- Authentication → admin authorization and IDOR prevention

### Active Learning, Not Code Dumps

Implementation output should be reviewable in small logical sections. The student should
be able to answer:

- What enters this layer?
- What leaves it?
- Which invariant is protected here?
- Why is this query/index needed?
- What happens on the negative path or concurrent request?

### Verification Is Part of Learning

A feature is not learned or complete until it is verified:

- typecheck and build
- positive Postman/integration case
- invalid input
- no authentication
- wrong owner/role
- missing/deleted parent/target
- duplicate/concurrent behavior where relevant
- cleanup after partial upload/database failure

### Documentation Is a Compression Tool

`PROJECT_STATE.md` stores the current snapshot, not every conversation. `DECISIONS.md`
stores durable reasoning. The roadmap stores future outcomes. This separation teaches how
real teams prevent documentation drift.

## Feature Explanation Template

For each feature explain:

1. User/business need
2. Data model and indexes
3. Request lifecycle
4. Authorization boundary
5. State transitions
6. Error and edge cases
7. Frontend integration implications, even when frontend is out of scope
8. Production and scaling notes
9. Review questions

## Definition of Learned

Before moving forward, the student should be able to:

- explain the concept without reading the generated answer
- trace the implemented request through each layer
- identify the security boundary
- predict the database query/write behavior
- describe at least one alternative and why it was not selected
- reproduce the core pattern in a smaller example

## Current Focus After Sprint 6

The next learning layer is admin operations and dashboard read models. Key topics include:

- admin route design and privilege escalation prevention
- aggregation pipeline design and type safety
- read-model/dashboard endpoint boundaries
- user/content moderation state transitions
- auditability before adding broad administrative power
