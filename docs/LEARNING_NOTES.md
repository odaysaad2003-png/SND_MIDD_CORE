# LEARNING_NOTES.md

## Educational Purpose of This Project
SND Community Core exists to teach full-stack software engineering the way
it's actually practiced in production teams — not as a shortcut to a
finished app. The end product (a working community platform) matters, but
it is secondary to the goal of building a developer who deeply understands
*why* each piece exists, not just how to type it.

## Learning Principles

### The student is learning full-stack software engineering deeply, not just copying code
Every file created in this project should be something the student could
explain, defend, and rebuild from scratch — not code that was pasted in and
never fully understood. When something is generated, it should be
accompanied by reasoning, not just output.

### Every new concept must be explained before implementation
Before writing code that uses a new concept (e.g. refresh token rotation,
aggregation pipelines, optimistic UI), the concept is explained first: what
it is, what problem it solves, and how it fits into what's already known.
Code follows understanding, not the other way around.

### Each sprint must connect old knowledge to new knowledge
Every sprint in `SPRINT_ROADMAP.md` explicitly states "what we learned
before" and builds the new material as an extension of it, so the student
sees a continuous thread rather than disconnected topics.

### Senior Ladder Mode for important concepts
For significant backend, security, database, or frontend concepts, explain
them in layered depth — starting from a plain-language explanation, then a
practical implementation view, then the deeper trade-offs and edge cases a
senior engineer would consider. The student should come away understanding
not just "how" but "why this way and not another way."

### Every feature should explain
When a feature is implemented, the explanation accompanying it should cover:
- **Why it exists** — what user or business need it addresses.
- **What problem it solves** — concretely, not abstractly.
- **How it works internally** — the actual mechanics (data flow, algorithm,
  request lifecycle).
- **How frontend and backend connect** — the specific chain from UI
  interaction to database and back.
- **Common mistakes** — pitfalls other developers (or past-SND-Mini-us) have
  hit with this kind of feature.
- **Production notes** — anything that behaves differently or matters more
  once real users and real infrastructure are involved.
- **Review questions** — a short set of questions the student should be able
  to answer unaided before moving to the next sprint, used as a self-check
  rather than a graded quiz.

## How This Applies Going Forward
Starting with Sprint 1, every sprint's implementation phase should be
preceded by a short concept explanation for anything new, and followed by a
review section using the "every feature should explain" structure above.
This keeps the project simultaneously a working system and a genuine
learning curriculum, matching the intent behind moving from SND Mini to SND
Community Core.
