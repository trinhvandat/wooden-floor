---
name: leadformsheet-source-by-context
description: LeadFormSheet derives the lead `source` from whether a `context` prop is passed — pass no context for a plain quote CTA
metadata: { type: convention, date: 2026-06-25 }
---
`LeadFormSheet` (`components/LeadFormSheet.tsx`) computes the lead's `source` field as
`source: context ? "calculator" : "quote"`. The presence of the `context` prop — NOT its
contents — flips the source.

**Gotcha:** a non-calculator CTA that passes any `context` (even just `{ productId }`) will
mislabel the lead as `source: "calculator"` in the mini-CRM. To record `source: "quote"`,
render the sheet with **no `context` prop** (e.g. `ProjectQuoteCta` on the project detail page).

**How to apply:** for any new lead CTA that is not the cost calculator, open `LeadFormSheet`
without `context`. Only the calculator (which has area/total/productId to attribute) should pass
a `context`. If a future CTA needs its own distinct source value, change the `source` derivation
in `LeadFormSheet` rather than abusing `context`. Related: [[0008-lead-funnel-route-handler]],
[[0014-projects-gallery]].
