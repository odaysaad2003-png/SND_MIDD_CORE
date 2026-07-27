# Sprint 6 — Batch 3: Saved Posts and Final Integration

## Scope

- Adds the protected `/saved` workspace using the verified `GET /saves/me` contract.
- Adds strict runtime validation, private Query ownership, URL-owned pagination/sort,
  loading/error/empty/out-of-range states, RTL/responsive UI, and no-index metadata.
- Invalidates active saved-list caches after Save/Unsave reconciliation.
- Integrates the required `authorId` into feed/detail interaction actions.
- Adds Saved Posts to the safe Auth return allowlist, account menu, and private profile.
- Adds contract and navigation coverage for the new surface.

## Contract preserved

```text
GET /saves/me?page&limit&sort
```

No backend route, request field, role, permission, or error code was added.

## Closure

Sprint 6 is engineering-complete only after `lint`, `type`, `test`, `build`, and the
documented browser/network matrix pass. Learning closure remains a separate owner gate.
