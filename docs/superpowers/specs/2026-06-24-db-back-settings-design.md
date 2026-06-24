# Design — DB-back the Settings global

> Date: 2026-06-24 · Branch: `feat/db-back-settings`
> Status: approved (brainstorm) → ready for implementation plan

## 1. Objective

Site-wide config — install/trim prices, NAP (name/address/phone), business hours, and the Zalo OA
URL — currently lives in a hardcoded mock `src/lib/settings.ts` that the app reads synchronously.
The Payload `settings` global exists but the app never reads it. This violates the project gotcha
"prices live in the Settings collection, never in code" and means the operator cannot edit prices /
NAP / **Zalo URL** without a code change.

This work DB-backs the Settings global: the app reads it via a cached `getSettings()` repository
(mirroring M2's catalog repository), the seed populates it, and the operator manages everything via
`/admin`. Notably, this unblocks setting the real **Zalo OA URL** (currently missing) — the Zalo
links auto-reappear once it is set.

## 2. Decisions (settled in brainstorm)

- **Access pattern: cached `getSettings()` + props to client components** (NOT React Context).
  Server components call `await getSettings()` directly (deduped per-request via React `cache()`);
  the two client consumers (`CalculatorWidget`, `MobileNav`) receive what they need via props,
  exactly as M2 threaded `products`. No new context abstraction (YAGNI), consistent with M2.
- **Keep the app-facing `Settings` type shape** (the current mock shape) so consumers barely change;
  `getSettings()` maps the Payload global → that shape, reconciling the field-name differences.
- **Keep mock `src/lib/settings.ts`** as the seed source (mirrors M2 keeping `mock-data.ts`); after
  seeding, no app code reads the mock.

## 3. Field reconciliation (global ≠ app type)

| App `Settings` (current mock shape) | Payload `settings` global field | Note |
|---|---|---|
| `installPricePerM2: number` | `installPricePerM2` (defaultValue 80000) | same |
| `trimEstimate: number` | `trimEstimate` (defaultValue 800000) | same |
| `nap: { name; address; phone }` | `nap` group | same |
| `hours: string` | `businessHours` | rename |
| `zaloUrl: string` | `zaloOA` | rename |
| `showroomAddress?: string` | `showroomAddress` | carried through (optional, future use) |
| `mapEmbed?: string` | `mapEmbed` | carried through (optional, future use) |

## 4. Units

### 4.1 `src/lib/data/settings.ts` (new)
- `getSettings(): Promise<Settings>` — `cache(async () => { const payload = await getPayload({config}); const doc = await payload.findGlobal({ slug: "settings" }); return mapSettings(doc); })`. React `cache()` dedupes calls within one render/request.
- pure `mapSettings(doc): Settings` — reconciles §3, applies safe fallbacks (missing `zaloOA` → `zaloUrl: ""`; missing `nap` fields → `""`; prices fall back to the schema defaults). Kept pure for unit tests (no Payload import in the mapper).
- `Settings` type is added to `src/lib/types.ts` (alongside `Product`/`Collection`/`Project`); it matches the current mock shape so consumers swap the import source, not the field access.

### 4.2 Seed — `src/seed.ts` (modify)
After collections/products/projects, seed the global:
`await payload.updateGlobal({ slug: "settings", data: { installPricePerM2, trimEstimate, nap, businessHours: SETTINGS.hours, zaloOA: SETTINGS.zaloUrl } })` using the mock `SETTINGS` as the initial real values. `updateGlobal` is idempotent by nature (a global is a singleton). The seed log line gains "+ settings".

### 4.3 Server consumers (read `getSettings()` directly)
`Header`, `Footer`, `BottomActionBar`, `BypassConsult`, `(app)/page.tsx` (home), `(app)/thank-you/page.tsx`: replace `import { SETTINGS }` with `const settings = await getSettings()` (these are async server components already, or become async). The home page already builds LocalBusiness JSON-LD from `SETTINGS.nap` → now from `settings.nap`.

### 4.4 Client consumers (receive props)
- `CalculatorWidget` (client): gains a `settings: Settings` prop (for `estimateCost` install/trim and the lead context). The detail/quote pages already `await getProducts()`; they also `await getSettings()` and pass `settings`. `estimateCost(input, settings)` already takes a settings arg — feed the real one.
- `MobileNav` (client): receives `zaloUrl` (and any NAP it shows) via props from `Header` (server).
- `BypassConsult` (rendered inside client `CalculatorWidget`): receives `zaloUrl` via prop from `CalculatorWidget`.

### 4.5 ZALO_ENABLED guard (from a11y work)
Currently a module-level const in `lib/settings.ts` reading the mock. Replace with a per-render check from the live settings: a small helper `isZaloEnabled(zaloUrl)` (`zaloUrl.trim() !== "" && zaloUrl.trim() !== "#"`), evaluated where each Zalo link renders (server components from `settings.zaloUrl`; client components from the passed `zaloUrl` prop). Remove the module-level `ZALO_ENABLED` const.

## 5. Data flow

build / ISR (≤1h) / request → server component `await getSettings()` (React-cache-deduped) →
`payload.findGlobal` → map → typed `Settings` → (client components receive the needed fields as
props). Operator edits prices / NAP / **Zalo URL** / hours in `/admin` → appears within the ISR
window.

## 6. Error handling

- Global not seeded yet → `getSettings()` returns safe values (prices from schema defaults; empty
  NAP/zalo). Empty `zaloUrl` → `isZaloEnabled` false → Zalo links hidden (no crash, no dead link).
- `findGlobal` never returns null for a defined global (Payload returns defaults), so no null path.

## 7. Testing

- **Unit** — `mapSettings`: field reconciliation (`businessHours`→`hours`, `zaloOA`→`zaloUrl`),
  fallbacks for missing fields, `isZaloEnabled` true/false cases.
- **Integration** — `getSettings()` with a mocked `payload.findGlobal` (pattern from `catalog.test.ts`).
- The existing `calculator.test.ts` (pure `estimateCost`) is unaffected — it already takes a
  settings arg; tests pass a literal.
- Build (DB-gated) deferred to verification: `pnpm build` proves the global read at build.

## 8. Out of scope (YAGNI)

On-edit cache invalidation (ISR 1h is enough); a UI/consumer for `mapEmbed`/`showroomAddress`
(mapped into the type but not rendered yet — that's M4-B/about-page work); migrating the calculator
to read prices any way other than the existing `estimateCost(settings)` signature.
