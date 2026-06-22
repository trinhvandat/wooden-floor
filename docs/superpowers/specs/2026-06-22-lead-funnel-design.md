# Lead Funnel — wiring forms to DB + email

> Status: approved design (2026-06-22) · Branch: `feat/lead-funnel`
> Scope: Phase 1, Hà Nội. Makes the lead-gen funnel real — the core purpose of FUKIONE.

## Objective

The site is **lead-gen-first**, but the lead funnel is currently fake: `SurveyForm`
and `LeadFormSheet` only `router.push("/cam-on")` on submit — nothing is persisted and
no one is notified. This iteration wires both forms end-to-end:

```
form submit → POST /api/leads → validate → create Lead in DB → notify by email → /cam-on
```

This directly satisfies the project's #1 gotcha ("Leads must never be lost: save to DB
**first**, email is best-effort with retry") and testing priority #2
("Form submit → create lead → email").

## Out of scope (YAGNI)

- Routing changes — `next.config.ts` rewrites (Vietnamese public URL → English route)
  **already exist and work**, including `/cam-on → /thank-you`. No routing work needed.
- CalculatorWidget as an independent lead source (deferred; calculator leads flow through
  `LeadFormSheet` with `source='calculator'`).
- Zalo webhook ingestion into `/api/leads` (future; the route is designed to allow it later).
- Reading product/settings data from Payload instead of `mock-data.ts` (separate iteration).
- A durable email queue / cron retry — best-effort in-request retry only (serverless).

## Decisions (settled in brainstorming)

| Decision | Choice | Why |
|---|---|---|
| Scope | Both main forms (`SurveyForm` + `LeadFormSheet`) | Covers the whole primary funnel in one pass |
| Transport | **Route Handler** `POST /api/leads` (not Server Action / Payload hook) | Explicit HTTP, testable with curl, reusable for a future Zalo webhook |
| Email | **Wire Resend now**, best-effort after DB write | Completes the funnel per gotcha #1 |
| DB | Already live (Neon, tables migrated) | End-to-end + e2e testing possible now |
| Product link | Extend `LeadContext` with `productId` | Store the real relationship, not just a name |

## Data flow

```
Client form (SurveyForm | LeadFormSheet)
  → fetch POST /api/leads  (application/json)
      [1] honeypot: if body.website is non-empty → return 200 success WITHOUT creating (silent drop)
      [2] Zod: leadInputSchema.safeParse(body) → 400 on failure
      [3] payload.create({ collection: 'leads', data })   ← DB = source of truth, MUST succeed first
      [4] notifyLead(lead)   ← Resend, best-effort, 2–3 retries, errors swallowed, does NOT block
      → 200 { success: true, data: { id } }
  → form: success → router.push("/cam-on")
          failure → show error message, keep entered data, re-enable submit
```

Ordering is load-bearing: **step 3 must complete before step 4**, and a step-4 failure must
never fail the request — the lead is already safe in the DB.

## Components (small, focused files)

| File | Responsibility | Depends on |
|---|---|---|
| `src/lib/leads/schema.ts` | `leadInputSchema` (Zod) + `type LeadInput`; shared client + server | `zod` |
| `src/lib/leads/notify.ts` | `notifyLead(lead): Promise<void>` — Resend send, retry, swallow errors | `resend`, env |
| `src/app/(app)/api/leads/route.ts` | `POST` handler: honeypot → validate → `getPayload` → create → notify → JSON | schema, notify, payload |
| `src/components/SurveyForm.tsx` | replace `handleSubmit`: `loading`/`error` state, fetch, field map | schema (type) |
| `src/components/LeadFormSheet.tsx` | same; extend `LeadContext` with `productId?` | schema (type) |

### `leadInputSchema` (shape)

```ts
{
  name: string (required, trimmed, 1–120)
  phone: string (required, VN phone regex, e.g. /^0\d{9,10}$/ after stripping spaces)
  email: string email (optional)
  source: 'calculator' | 'survey' | 'quote' | 'zalo'   // enum mirrors Leads collection
  message: string (optional, max 2000)
  address: string (optional)
  preferredTime: string (optional)
  productId: string (optional)
  area: number (optional, min 0)
  estimatedCost: number (optional, min 0)
  website: string (optional)   // honeypot; expected empty
}
```

The API maps validated input onto the `leads` collection fields (`website` is dropped before create).

### Field maps

- **SurveyForm** → `{ source:'survey', name, phone, address, preferredTime: timeSlot, message: note }`
- **LeadFormSheet** → `{ source: context ? 'calculator' : 'quote', name, phone, email, message: note,
  productId: context?.productId, area: context?.areaM2, estimatedCost: context?.total }`

`LeadContext` gains `productId?: string`. Callers that open the sheet with a product pass its id.

> **Implementation note — `/api/leads` vs Payload REST.** Payload's catch-all
> (`src/app/(payload)/api/[...slug]`) also serves `/api/*`, including an auth-gated
> `POST /api/leads`. A static `src/app/(app)/api/leads/route.ts` is more specific and
> shadows the catch-all, so our public handler wins. Verify this during implementation
> (curl the endpoint); if Next.js flags a parallel-path conflict, fall back to a distinct
> path such as `/api/leads/submit` and update the form fetch targets.

## Error handling & security

- **DB write fails** → `500 { success:false, error }`; form keeps data, shows a retry message; user is **not** sent to `/cam-on`.
- **Email fails** → logged, swallowed; response stays `200` (lead is already persisted). Gotcha #1.
- **`RESEND_API_KEY` / `LEAD_NOTIFY_EMAIL` missing** → `notifyLead` is a no-op with a `console.warn`; never throws, never crashes the route.
- **Spam** → honeypot `website` field + Zod validation reject junk.
- **Prices/costs** (`estimatedCost`, install price) are computed client-side from the calculator;
  unit costs still live in `Settings` (not hardcoded in this code path).

## Env additions (`.env` + `.env.example`)

```
RESEND_API_KEY=          # Resend API key (server-only)
LEAD_NOTIFY_EMAIL=       # inbox that receives new-lead notifications
```

`.env` is user-maintained and read-only to Claude; only `.env.example` is updated in-repo.

## Testing (priority order from CLAUDE.md)

1. **Unit** — `leadInputSchema`: valid payload passes; missing `phone` fails; bad `source` fails;
   honeypot field tolerated. `notifyLead`: retries on transient failure, gives up quietly.
2. **Integration** — `POST /api/leads` with mocked `payload` + `resend`:
   - happy path creates a Lead and returns `{ id }`;
   - honeypot-filled body returns success but creates nothing;
   - invalid body → 400;
   - DB-create throws → 500 and **no** thank-you; email throw → still 200.
3. **E2E (golden flow #1)** — "calculate cost → leave a lead" via `LeadFormSheet`,
   asserting navigation to `/cam-on`.

Target ≥80% coverage on this code path.

## Dependencies to add

- `zod` (validation, shared)
- `resend` (email)

## Acceptance criteria

- [ ] Submitting either form with valid data creates a row in the `leads` collection (visible in `/admin`).
- [ ] A notification email is attempted after the DB write; its failure never breaks submission.
- [ ] Invalid/spam submissions are rejected without creating a lead.
- [ ] On success the user lands on `/cam-on`; on failure they see an error and keep their input.
- [ ] Unit + integration + one e2e test pass; coverage ≥80% on new code.
