---
name: payload-typed-api-data-widening
description: Payload's generated-typed local API rejects a widened `const data = {…}`; pass literals inline or cast (as const, Map<string,number>, select-union) — and relationship fields need numbers
metadata: { type: convention, date: 2026-06-23 }
---
`payload-types.ts` IS generated in this repo, so `payload.create/update/find` are strongly typed.
Building an intermediate `const data = { … }` and then passing it WIDENS literal/relationship
fields and breaks `tsc`:
- `status: "published"` widens to `string` → not `"draft"|"published"` → fix `as const`.
- a `select` field written as `String(p.thicknessMm)` widens to `string` → cast `as "8"|"12"`.
- id maps typed `Map<string, number|string>` → relationship fields require **number**; type them
  `Map<string, number>` (Payload doc `.id` is a number for these Postgres collections).
- a string in a relationship field (e.g. `productId: string`) → the field type is
  `number | Doc | null`; coerce with `Number(...)`.

**Why:** the same object written INLINE in the `create` call narrows via contextual typing and
compiles (that's why `route.ts`'s inline `status:"new"` was fine but the seed's `const data`
wasn't). Caught only because we started running `pnpm exec tsc --noEmit` — the repo gate is
`pnpm lint` + `pnpm test`, which both MISS these (a latent `route.ts` productId error had shipped).

**How to apply:** when a Payload write fails `tsc`, prefer `as const` on literal-union fields,
type id maps as `number`, cast `select` values to their string union, and coerce relationship ids
to numbers. Run `pnpm exec tsc --noEmit` (not just lint+test) when touching Payload writes.
Related: [[0010-db-back-catalog-repository]], [[zod4-payload-no-conflict]], [[payload-next16-compat]].
