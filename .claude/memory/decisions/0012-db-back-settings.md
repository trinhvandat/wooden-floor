---
name: 0012-db-back-settings
description: site config (prices/NAP/hours/Zalo) reads the Payload `settings` global via cached getSettings() + props to client components; operator manages it in /admin
metadata: { type: decision, date: 2026-06-24 }
---
Site-wide config — install/trim prices, NAP, business hours, Zalo OA URL — now reads from the
Payload `settings` GLOBAL instead of the hardcoded mock `src/lib/settings.ts`. Branch
`feat/db-back-settings`. Resolves the "prices live in Settings, never in code" gotcha and lets the
operator set the real **Zalo URL** / NAP / prices via `/admin` (no code change). Verified end-to-end:
seed writes the global, `pnpm build` reads it at build, dev renders real values.

**Why:** the funnel/SEO needed operator-editable config; hardcoding it in `lib/settings.ts` meant
every change (incl. the missing Zalo URL) required a deploy.

**How to apply:**
- `src/lib/data/settings.ts` — `getSettings(): Promise<Settings>` wrapped in **React `cache()`**
  (per-request dedup), reads `payload.findGlobal({ slug: "settings" })`. Pure mapper in
  `src/lib/data/settings.map.ts` (`mapSettings`, `isZaloEnabled`, `SettingsDoc`) — DB-free,
  unit-tested. Mirrors M2's repo/mapper split ([[0010-db-back-catalog-repository]]).
- **Access pattern: cached getSettings() + props (NOT React Context).** Server components
  (Header, Footer, BottomActionBar, home, thank-you, book-survey) `await getSettings()` directly
  (cache dedupes). Client consumers receive a `settings: Settings` prop: `CalculatorWidget`,
  `MobileNav`, and the nested `LeadFormSheet`/`BypassConsult`/`SurveyForm`. (`BypassConsult` has
  THREE client callers — Calculator, LeadFormSheet, SurveyForm — easy to miss; tsc enforces it.)
- **Field reconciliation** (global ≠ app type): `businessHours`→`hours`, `zaloOA`→`zaloUrl`; nap +
  prices passthrough; the `Settings` type keeps the old mock shape so consumers just swap the import.
- **Zalo visibility** is now per-render `isZaloEnabled(settings.zaloUrl)` everywhere (replaces the
  old module-level `ZALO_ENABLED`). Builds on the a11y guard.
- **Seed** writes the global (`payload.updateGlobal({ slug:"settings", … })`) from the mock; mock
  `SETTINGS` is RETAINED as the seed source (mirror M2 keeping mock-data).

**Backlog / known:** `src/components/CtaStrip.tsx` is dead code (not rendered) with its own Zalo
guard — delete or settings-wire in a cleanup. Home meta description still mentions Zalo while the
CTA is hidden (self-heals once the operator sets the real OA URL). DB-back Settings does NOT render
`mapEmbed`/`showroomAddress` yet (mapped into the type for the future about page).
