---
name: 0013-lead-form-client-zod-validation
description: Lead forms validate inline with Zod (reusing the server schema's field validators) instead of native HTML required
metadata: { type: decision, date: 2026-06-25 }
---
The two lead forms (`LeadFormSheet`, `SurveyForm`) replaced native HTML `required` +
`setCustomValidity`/`onInvalid`/`onInput` with **client-side Zod inline validation** — no new
dependency (react-hook-form was explicitly rejected as overkill for two Phase-1 forms).

Pattern:
- `lib/leads/forms.ts` exports per-form schemas (`quoteFormSchema`, `surveyFormSchema`) built by
  **reusing `leadInputSchema.shape.{name,phone,email}`** field validators — single source of truth
  with the server (`lib/leads/schema.ts`). Survey adds its own required `address` (the shared
  schema marks address optional, but the booking form requires it).
- Helpers: `collectFieldErrors(zodError)` → `{ field: firstMessage }`; `validateField(fieldSchema,
  value)` → first error string (used on blur).
- `components/site/FieldError.tsx` — tiny accessible inline error (`role="alert"`).
- Each field: `onBlur` validates one field; submit runs `schema.safeParse` and **blocks** on
  failure (`setErrors(...)`, no fetch). `aria-invalid` + `aria-describedby` wired; red border via
  `aria-[invalid=true]:border-red-500`. On success the API body sends the **parsed/normalized**
  values (`parsed.data.phone` is space-stripped).

**Why:** native browser popovers are jarring and hurt lead-form completion (direct conversion
loss); inline Zod gives controlled, on-brand errors and keeps client/server messages identical.
**How to apply:** for any new lead-adjacent form, add a schema in `lib/leads/forms.ts` reusing
shared field validators, render `FieldError` per field, validate on blur + block on submit. An
empty phone shows "Số điện thoại không hợp lệ" (regex), matching the server — accepted parity.
Related: [[0008-lead-funnel-route-handler]], [[0012-db-back-settings]].
