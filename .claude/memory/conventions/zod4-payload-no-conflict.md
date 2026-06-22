---
name: zod4-payload-no-conflict
description: zod@4 as a direct dep is fine — Payload is NOT in the zod graph; the zod@3 in the tree is shadcn-CLI tooling only
metadata: { type: convention, date: 2026-06-22 }
---
`fukione-web` has two zod majors installed, but they do **not** conflict. `pnpm why zod`
shows `zod@4` is our direct dependency (and eslint-config-next tooling), while `zod@3`
comes only from the `shadcn` CLI / `@modelcontextprotocol/sdk` / `zod-to-json-schema` —
**Payload does not appear in the zod dependency graph at all**. Our code never passes a Zod
schema *into* Payload (the `/api/leads` route validates with Zod, then hands plain data to
`payload.create`), so the feared Zod-3-vs-4 type mismatch cannot occur.

**Why:** A code review flagged "Payload ships zod 3 → downgrade to zod@3" as an Important
risk. Investigation (`pnpm why zod`) disproved the premise: no Payload↔zod edge, no
schema-into-Payload boundary. zod@4 standalone is correct; the schema tests are green.

**How to apply:** Keep `zod@^4`. Don't downgrade on this basis. Only revisit if a real
type error appears at a genuine zod↔Payload boundary (none exists today). Related:
[[0008-lead-funnel-route-handler]], [[payload-next16-compat]].
