---
name: 0008-lead-funnel-route-handler
description: Lead funnel wires forms to DB+email via a Route Handler /api/leads (not Server Action / Payload hook)
metadata: { type: decision, date: 2026-06-22 }
---
The lead-capture funnel (the core of this lead-gen-first site) is wired with a single
Next.js **Route Handler** `POST /api/leads`, not a Server Action and not a Payload
collection hook. Flow: client form → fetch JSON → honeypot drop → Zod validate
(`leadInputSchema`) → `payload.create({ collection: 'leads' })` (DB = source of truth,
must succeed first) → `notifyLead()` best-effort Resend email (2–3 retries, never throws,
never blocks the response) → `{ success, data:{ id } }`. Both `SurveyForm`
(source=survey) and `LeadFormSheet` (source=calculator when it has a calculator context,
else quote) post to it. `LeadContext` gained a `productId` so the lead stores the real
product relationship.

**Why:** Route Handler chosen over Server Action for explicit, curl-testable HTTP that a
future Zalo webhook can reuse; over a Payload `afterChange` hook because email retry/
observability is clearer in the route. DB-first + best-effort email is mandated by the
project's #1 gotcha ("leads must never be lost"). Shared Zod schema validates the same
shape on client and server.

**How to apply:** Shared schema/notifier live in `src/lib/leads/{schema,notify}.ts`; the
route at `src/app/(app)/api/leads/route.ts` (a static route that shadows Payload's
`/api/[...slug]` catch-all). New env: `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL` (best-effort —
absent → email skipped, lead still saved). Spec:
`docs/superpowers/specs/2026-06-22-lead-funnel-design.md`; plan:
`docs/superpowers/plans/2026-06-22-lead-funnel.md`. Related: [[0006-embed-payload-backend]],
[[zod4-payload-no-conflict]], [[vn-urls-via-next-rewrites]].
