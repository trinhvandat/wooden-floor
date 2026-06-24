# DB-back the Settings global — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Read site-wide config (prices, NAP, hours, Zalo URL) from the Payload `settings` global via a cached `getSettings()` repository instead of the hardcoded mock, so the operator manages it in `/admin`.

**Architecture:** Mirror M2: a pure mapper (`settings.map.ts`, DB-free, unit-tested) + a `cache()`-wrapped async repository (`settings.ts`). Server components call `getSettings()` directly (deduped per-request by React `cache`); the client consumers (`CalculatorWidget`, `MobileNav`, and the `BypassConsult`/`LeadFormSheet` nested inside the calculator) receive a `settings` prop. The mock `lib/settings.ts` stays as the seed source.

**Tech Stack:** Next.js 16 App Router (server components + React `cache`), Payload 3 (`findGlobal`/`updateGlobal`), TypeScript strict, Vitest 4 (node env).

## Global Constraints

- All code/comments English; Vietnamese only in user-facing copy strings.
- App-facing `Settings` type keeps the CURRENT mock shape: `{ installPricePerM2: number; trimEstimate: number; nap: { name: string; address: string; phone: string }; hours: string; zaloUrl: string; showroomAddress: string; mapEmbed: string }`. `getSettings()` maps the global → this shape, reconciling `businessHours`→`hours` and `zaloOA`→`zaloUrl`.
- `getSettings()` is wrapped in React `cache()` for per-request dedup. Payload access pattern: `import { getPayload } from "payload"; import config from "@payload-config";`.
- Zalo visibility uses `isZaloEnabled(zaloUrl)` (`zaloUrl.trim() !== "" && !== "#"`), evaluated per-render. The module-level `ZALO_ENABLED` const in `lib/settings.ts` is removed once no consumer imports it.
- Mock `src/lib/settings.ts` `SETTINGS` is RETAINED as the seed source — do not delete it.
- `pnpm exec tsc --noEmit` must stay at 0 errors; `pnpm test` green; `pnpm lint` 0 errors.
- Vitest 4, env node, no globals; `vi.mock` refs via `vi.hoisted()`.
- All commands from `fukione-web/`. Branch `feat/db-back-settings`. `pnpm build` (global read at build) is DB-gated → deferred to verification.

---

## File Structure

- `src/lib/types.ts` (modify) — add the `Settings` type.
- `src/lib/data/settings.map.ts` (new) — pure `mapSettings`, `isZaloEnabled`, `SettingsDoc`.
- `src/lib/data/settings.map.test.ts` (new) — unit tests.
- `src/lib/data/settings.ts` (new) — `getSettings()` cached repo.
- `src/lib/data/settings.test.ts` (new) — integration test (mocked `findGlobal`).
- `src/seed.ts` (modify) — seed the global.
- `src/components/site/Footer.tsx`, `BottomActionBar.tsx` (modify) — async, `getSettings()`.
- `src/components/site/Header.tsx` (modify, async) + `MobileNav.tsx` (modify, `settings` prop).
- `src/components/CalculatorWidget.tsx`, `LeadFormSheet.tsx`, `site/BypassConsult.tsx` (modify) + `(app)/products/[slug]/page.tsx`, `(app)/quote/page.tsx` (modify) — calculator tree.
- `src/app/(app)/page.tsx`, `(app)/thank-you/page.tsx` (modify) — pages.
- `src/lib/settings.ts` (modify) — remove `ZALO_ENABLED` const.

---

### Task 1: Settings type + pure mapper + cached repository

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/data/settings.map.ts`, `src/lib/data/settings.map.test.ts`
- Create: `src/lib/data/settings.ts`, `src/lib/data/settings.test.ts`

**Interfaces:**
- Produces:
  - `Settings` (in `@/lib/types`) — shape per Global Constraints.
  - `interface SettingsDoc { installPricePerM2?: number|null; trimEstimate?: number|null; nap?: { name?: string|null; address?: string|null; phone?: string|null }|null; businessHours?: string|null; zaloOA?: string|null; showroomAddress?: string|null; mapEmbed?: string|null }`
  - `mapSettings(doc: SettingsDoc): Settings`
  - `isZaloEnabled(zaloUrl: string): boolean`
  - `getSettings(): Promise<Settings>`

- [ ] **Step 1: Add the `Settings` type**

Append to `src/lib/types.ts`:
```ts
export type Settings = {
  installPricePerM2: number;
  trimEstimate: number;
  nap: { name: string; address: string; phone: string };
  hours: string;
  zaloUrl: string;
  showroomAddress: string;
  mapEmbed: string;
};
```

- [ ] **Step 2: Write the failing mapper test**

Create `src/lib/data/settings.map.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mapSettings, isZaloEnabled } from "./settings.map";
import type { SettingsDoc } from "./settings.map";

describe("mapSettings", () => {
  it("reconciles businessHours→hours and zaloOA→zaloUrl", () => {
    const doc: SettingsDoc = {
      installPricePerM2: 90000,
      trimEstimate: 700000,
      nap: { name: "FUKIONE", address: "Hà Nội", phone: "0900 000 000" },
      businessHours: "8:00–18:00",
      zaloOA: "https://zalo.me/123",
      showroomAddress: "SR",
      mapEmbed: "<iframe>",
    };
    const s = mapSettings(doc);
    expect(s.hours).toBe("8:00–18:00");
    expect(s.zaloUrl).toBe("https://zalo.me/123");
    expect(s.installPricePerM2).toBe(90000);
    expect(s.nap.phone).toBe("0900 000 000");
    expect(s.showroomAddress).toBe("SR");
  });

  it("falls back to schema-default prices and empty strings when fields are missing", () => {
    const s = mapSettings({});
    expect(s.installPricePerM2).toBe(80000);
    expect(s.trimEstimate).toBe(800000);
    expect(s.hours).toBe("");
    expect(s.zaloUrl).toBe("");
    expect(s.nap).toEqual({ name: "", address: "", phone: "" });
  });
});

describe("isZaloEnabled", () => {
  it("is false for empty or placeholder, true for a real URL", () => {
    expect(isZaloEnabled("")).toBe(false);
    expect(isZaloEnabled("#")).toBe(false);
    expect(isZaloEnabled("  ")).toBe(false);
    expect(isZaloEnabled("https://zalo.me/123")).toBe(true);
  });
});
```

- [ ] **Step 3: Run it — expect FAIL**

Run: `pnpm test src/lib/data/settings.map.test.ts`
Expected: FAIL — cannot find module `./settings.map`.

- [ ] **Step 4: Implement the pure mapper**

Create `src/lib/data/settings.map.ts`:
```ts
import type { Settings } from "@/lib/types";

export interface SettingsDoc {
  installPricePerM2?: number | null;
  trimEstimate?: number | null;
  nap?: { name?: string | null; address?: string | null; phone?: string | null } | null;
  businessHours?: string | null;
  zaloOA?: string | null;
  showroomAddress?: string | null;
  mapEmbed?: string | null;
}

export function mapSettings(doc: SettingsDoc): Settings {
  return {
    installPricePerM2: doc.installPricePerM2 ?? 80_000,
    trimEstimate: doc.trimEstimate ?? 800_000,
    nap: {
      name: doc.nap?.name ?? "",
      address: doc.nap?.address ?? "",
      phone: doc.nap?.phone ?? "",
    },
    hours: doc.businessHours ?? "",
    zaloUrl: doc.zaloOA ?? "",
    showroomAddress: doc.showroomAddress ?? "",
    mapEmbed: doc.mapEmbed ?? "",
  };
}

export function isZaloEnabled(zaloUrl: string): boolean {
  const z = zaloUrl.trim();
  return z !== "" && z !== "#";
}
```

- [ ] **Step 5: Run it — expect PASS**

Run: `pnpm test src/lib/data/settings.map.test.ts`
Expected: PASS.

- [ ] **Step 6: Write the failing repository test**

Create `src/lib/data/settings.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const { findGlobalMock } = vi.hoisted(() => ({ findGlobalMock: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ findGlobal: findGlobalMock })) }));

import { getSettings } from "./settings";

beforeEach(() => findGlobalMock.mockReset());

describe("getSettings", () => {
  it("reads the settings global and maps it", async () => {
    findGlobalMock.mockResolvedValue({ businessHours: "8-18", zaloOA: "https://zalo.me/x", installPricePerM2: 90000 });
    const s = await getSettings();
    expect(findGlobalMock).toHaveBeenCalledWith(expect.objectContaining({ slug: "settings" }));
    expect(s.hours).toBe("8-18");
    expect(s.zaloUrl).toBe("https://zalo.me/x");
    expect(s.installPricePerM2).toBe(90000);
  });
});
```

- [ ] **Step 7: Run it — expect FAIL**

Run: `pnpm test src/lib/data/settings.test.ts`
Expected: FAIL — cannot find module `./settings`.

- [ ] **Step 8: Implement the cached repository**

Create `src/lib/data/settings.ts`:
```ts
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Settings } from "@/lib/types";
import { mapSettings, type SettingsDoc } from "./settings.map";

export const getSettings = cache(async (): Promise<Settings> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "settings" });
  return mapSettings(doc as unknown as SettingsDoc);
});
```

- [ ] **Step 9: Run both + lint/tsc**

Run: `pnpm test src/lib/data/settings.test.ts && pnpm lint && pnpm exec tsc --noEmit`
Expected: PASS, 0 lint errors, 0 tsc errors.

- [ ] **Step 10: Commit**

```bash
git add src/lib/types.ts src/lib/data/settings.map.ts src/lib/data/settings.map.test.ts src/lib/data/settings.ts src/lib/data/settings.test.ts
git commit -m "feat: add cached Settings repository + pure mapper"
```

---

### Task 2: Seed the Settings global

**Files:**
- Modify: `src/seed.ts`

**Interfaces:**
- Consumes: the mock `SETTINGS` from `./lib/settings`.

- [ ] **Step 1: Import the mock SETTINGS**

In `src/seed.ts`, add a new import line next to the existing `import { PRODUCTS, COLLECTIONS, PROJECTS } from "./lib/mock-data";` (the seed runner does not resolve `@/` aliases, so use the RELATIVE path):
```ts
import { SETTINGS } from "./lib/settings";
```

- [ ] **Step 2: Seed the global after projects, before the log**

In `src/seed.ts`, immediately after the projects loop closes (the `}` that ends `for (const j of PROJECTS) { … }`) and BEFORE the `console.log(...)`, insert:
```ts
  // 4. Settings global (singleton) — seed initial real values from the mock.
  await payload.updateGlobal({
    slug: "settings",
    data: {
      installPricePerM2: SETTINGS.installPricePerM2,
      trimEstimate: SETTINGS.trimEstimate,
      nap: SETTINGS.nap,
      businessHours: SETTINGS.hours,
      zaloOA: SETTINGS.zaloUrl,
    },
  });
```

- [ ] **Step 3: Update the log line**

Change the `console.log` to mention settings:
```ts
  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${COLLECTIONS.length} collections, ${PRODUCTS.length} products, ${PROJECTS.length} projects, 1 settings global.`,
  );
```

- [ ] **Step 4: Verify it type-checks**

Run: `pnpm exec tsc --noEmit`
Expected: 0 errors. (Running `pnpm seed` is DB-gated and covered in Task 8 / manual follow-up.)

- [ ] **Step 5: Commit**

```bash
git add src/seed.ts
git commit -m "feat: seed the Settings global from the mock values"
```

---

### Task 3: Footer + BottomActionBar (server, self-fetch)

**Files:**
- Modify: `src/components/site/Footer.tsx`, `src/components/site/BottomActionBar.tsx`

**Interfaces:**
- Consumes: `getSettings` from `@/lib/data/settings`; `isZaloEnabled` from `@/lib/data/settings.map`.

- [ ] **Step 1: Footer — read from getSettings()**

In `src/components/site/Footer.tsx`:
Replace `import { SETTINGS, ZALO_ENABLED } from "@/lib/settings";` with:
```ts
import { getSettings } from "@/lib/data/settings";
import { isZaloEnabled } from "@/lib/data/settings.map";
```
Make the component async and read settings; replace the `ZALO_ENABLED` use:
```ts
export async function Footer() {
  const { nap, hours, zaloUrl } = await getSettings();
  const zaloOn = isZaloEnabled(zaloUrl);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nap.address)}`;
```
Then change the guard `{ZALO_ENABLED && (` → `{zaloOn && (`. (The rest of the JSX is unchanged.)

- [ ] **Step 2: BottomActionBar — read from getSettings()**

In `src/components/site/BottomActionBar.tsx`:
Replace `import { SETTINGS, ZALO_ENABLED } from "@/lib/settings";` with:
```ts
import { getSettings } from "@/lib/data/settings";
import { isZaloEnabled } from "@/lib/data/settings.map";
```
Make it async and resolve zalo from settings:
```ts
export async function BottomActionBar({ primaryLabel, primaryHref }: BottomActionBarProps) {
  const { zaloUrl } = await getSettings();
  const zaloOn = isZaloEnabled(zaloUrl);
```
Change `{ZALO_ENABLED && (` → `{zaloOn && (` and `href={SETTINGS.zaloUrl}` → `href={zaloUrl}`.

> Both components are server components already rendered by server pages/layout — making them `async` is safe; React `cache` dedupes the `getSettings()` calls.

- [ ] **Step 3: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: 0 errors. (`lib/settings.ts` still exports `ZALO_ENABLED`; it's removed in Task 7 after all consumers stop importing it.)

- [ ] **Step 4: Commit**

```bash
git add src/components/site/Footer.tsx src/components/site/BottomActionBar.tsx
git commit -m "feat: source Footer + BottomActionBar from the Settings repo"
```

---

### Task 4: Header (server) + MobileNav (client prop)

**Files:**
- Modify: `src/components/site/Header.tsx`, `src/components/site/MobileNav.tsx`

**Interfaces:**
- Consumes: `getSettings`, `isZaloEnabled`, `Settings`.
- Produces: `MobileNav({ settings }: { settings: Settings })`.

- [ ] **Step 1: MobileNav — accept a `settings` prop**

In `src/components/site/MobileNav.tsx`:
Replace `import { SETTINGS, ZALO_ENABLED } from "@/lib/settings";` with:
```ts
import type { Settings } from "@/lib/types";
import { isZaloEnabled } from "@/lib/data/settings.map";
```
Change the signature + derive values from the prop:
```ts
export function MobileNav({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false);
  const tel = `tel:${settings.nap.phone.replace(/\s/g, "")}`;
  const zaloOn = isZaloEnabled(settings.zaloUrl);
```
Replace `{SETTINGS.nap.phone}` → `{settings.nap.phone}`, `{ZALO_ENABLED && (` → `{zaloOn && (`, `href={SETTINGS.zaloUrl}` → `href={settings.zaloUrl}`.

- [ ] **Step 2: Header — async, fetch settings, pass to MobileNav**

In `src/components/site/Header.tsx`:
Replace `import { SETTINGS, ZALO_ENABLED } from "@/lib/settings";` with:
```ts
import { getSettings } from "@/lib/data/settings";
import { isZaloEnabled } from "@/lib/data/settings.map";
```
Make async + read settings:
```ts
export async function Header() {
  const settings = await getSettings();
  const tel = `tel:${settings.nap.phone.replace(/\s/g, "")}`;
  const zaloOn = isZaloEnabled(settings.zaloUrl);
```
Pass the prop: `<MobileNav />` → `<MobileNav settings={settings} />`.
Replace both `{ZALO_ENABLED && (` → `{zaloOn && (` and both `href={SETTINGS.zaloUrl}` → `href={settings.zaloUrl}`.

- [ ] **Step 3: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/site/Header.tsx src/components/site/MobileNav.tsx
git commit -m "feat: source Header from Settings repo, thread to MobileNav"
```

---

### Task 5: Calculator tree (CalculatorWidget → LeadFormSheet → BypassConsult + pages)

**Files:**
- Modify: `src/components/site/BypassConsult.tsx`, `src/components/LeadFormSheet.tsx`, `src/components/CalculatorWidget.tsx`, `src/app/(app)/products/[slug]/page.tsx`, `src/app/(app)/quote/page.tsx`

**Interfaces:**
- Consumes: `Settings` from `@/lib/types`; `isZaloEnabled` from `@/lib/data/settings.map`; `getSettings` from `@/lib/data/settings`; existing `estimateCost(input, settings)` from `@/lib/calculator` (settings = `{ installPricePerM2, trimEstimate }`).
- Produces: `BypassConsult({ settings })`, `LeadFormSheet({ …, settings })`, `CalculatorWidget({ product?, products?, variant, settings })`.

> This whole tree must change together to keep tsc green (changing a leaf's required prop breaks its callers).

- [ ] **Step 1: BypassConsult — accept `settings`**

In `src/components/site/BypassConsult.tsx`:
Replace `import { SETTINGS, ZALO_ENABLED } from "@/lib/settings";` with:
```ts
import type { Settings } from "@/lib/types";
import { isZaloEnabled } from "@/lib/data/settings.map";
```
Change the signature + derive:
```ts
export function BypassConsult({ settings }: { settings: Settings }) {
  const { zaloUrl, nap } = settings;
  const zaloOn = isZaloEnabled(zaloUrl);
```
Replace the Zalo guard `{ZALO_ENABLED && (` → `{zaloOn && (`. (Phone/markup unchanged.)

- [ ] **Step 2: LeadFormSheet — accept + forward `settings`**

In `src/components/LeadFormSheet.tsx`:
Add `import type { Settings } from "@/lib/types";`. Add `settings: Settings` to its props interface and destructure it. Change the rendered `<BypassConsult />` → `<BypassConsult settings={settings} />`.

- [ ] **Step 3: CalculatorWidget — accept `settings`, use for estimate + children**

In `src/components/CalculatorWidget.tsx`:
Remove `import { SETTINGS } from "@/lib/settings";`. Add `import type { Settings } from "@/lib/types";`.
Add `settings: Settings` to `CalculatorWidgetProps` and destructure it in the signature.
Replace the estimate call `estimateCost({ … }, SETTINGS)` → `estimateCost({ … }, settings)`.
Change `<BypassConsult />` → `<BypassConsult settings={settings} />` and `<LeadFormSheet open={…} … />` → add `settings={settings}` to its props.

- [ ] **Step 4: Detail page — fetch + pass settings**

In `src/app/(app)/products/[slug]/page.tsx`: add `import { getSettings } from "@/lib/data/settings";`. In the component, alongside the existing `await getProductBySlug`/`Promise.all`, fetch settings (add to the `Promise.all`), e.g.:
```ts
  const [collections, all, settings] = await Promise.all([getCollections(), getProducts(), getSettings()]);
```
Pass it: `<CalculatorWidget variant="embedded" product={product} />` → `<CalculatorWidget variant="embedded" product={product} settings={settings} />`.

- [ ] **Step 5: Quote page — fetch + pass settings**

In `src/app/(app)/quote/page.tsx`: add `import { getSettings } from "@/lib/data/settings";`. Fetch alongside products:
```ts
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
```
Pass it: `<CalculatorWidget variant="page" products={products} />` → `<CalculatorWidget variant="page" products={products} settings={settings} />`.

- [ ] **Step 6: Verify lint + types + tests**

Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
Expected: all pass (the existing `calculator.test.ts` passes a literal settings object and is unaffected).

- [ ] **Step 7: Commit**

```bash
git add src/components/site/BypassConsult.tsx src/components/LeadFormSheet.tsx src/components/CalculatorWidget.tsx "src/app/(app)/products/[slug]/page.tsx" "src/app/(app)/quote/page.tsx"
git commit -m "feat: thread DB Settings through the calculator tree"
```

---

### Task 6: Home + thank-you pages

**Files:**
- Modify: `src/app/(app)/page.tsx`, `src/app/(app)/thank-you/page.tsx`

**Interfaces:**
- Consumes: `getSettings`, `isZaloEnabled`.

- [ ] **Step 1: Home — settings for JSON-LD + Zalo CTA**

In `src/app/(app)/page.tsx`:
Replace `import { SETTINGS, ZALO_ENABLED } from "@/lib/settings";` with:
```ts
import { getSettings } from "@/lib/data/settings";
import { isZaloEnabled } from "@/lib/data/settings.map";
```
In the async component, add `const settings = await getSettings();` alongside the existing `Promise.all`. Update the LocalBusiness JSON-LD args to read from `settings.nap`/`settings.hours` (replace `SETTINGS.nap.*`/`SETTINGS.hours`). Wrap the Zalo CTA (`href={SETTINGS.zaloUrl}` block, ~line 388) in `{isZaloEnabled(settings.zaloUrl) && ( … )}` and change the href to `settings.zaloUrl`. (The home page currently always renders that Zalo `<a>`; guard it now.)

- [ ] **Step 2: Thank-you — settings for NAP/Zalo**

In `src/app/(app)/thank-you/page.tsx`:
Replace `import { SETTINGS, ZALO_ENABLED } from "@/lib/settings";` with:
```ts
import { getSettings } from "@/lib/data/settings";
import { isZaloEnabled } from "@/lib/data/settings.map";
```
Make the component async; replace `const { zaloUrl, nap } = SETTINGS;` with `const { zaloUrl, nap } = await getSettings();` and `const zaloOn = isZaloEnabled(zaloUrl);`. Replace any `ZALO_ENABLED` guard with `zaloOn`. (If the page already destructures `zaloUrl, nap`, the downstream JSX is unchanged except the guard.)

- [ ] **Step 3: Verify lint + types**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/page.tsx" "src/app/(app)/thank-you/page.tsx"
git commit -m "feat: source home + thank-you from the Settings repo"
```

---

### Task 7: Remove the dead ZALO_ENABLED const

**Files:**
- Modify: `src/lib/settings.ts`

- [ ] **Step 1: Confirm nothing imports ZALO_ENABLED anymore**

Run: `grep -rn "ZALO_ENABLED" src` 
Expected: no matches (all consumers now use `isZaloEnabled`). If any remain, fix them to use `isZaloEnabled` before continuing.

- [ ] **Step 2: Remove the const**

In `src/lib/settings.ts`, delete the trailing block:
```ts
export const ZALO_ENABLED =
  SETTINGS.zaloUrl.trim() !== "" && SETTINGS.zaloUrl.trim() !== "#";
```
Leave the `SETTINGS` mock object intact (it is the seed source).

- [ ] **Step 3: Verify lint + types + full suite**

Run: `pnpm lint && pnpm exec tsc --noEmit && pnpm test`
Expected: all pass, 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/settings.ts
git commit -m "chore: drop the dead ZALO_ENABLED const (replaced by isZaloEnabled)"
```

---

### Task 8: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full suite + lint + types**

Run: `pnpm test && pnpm lint && pnpm exec tsc --noEmit`
Expected: all suites pass (settings map + repo + existing), lint 0 errors, tsc 0 errors.

- [ ] **Step 2: Confirm the mock is only referenced by the seed**

Run: `grep -rn "from \"@/lib/settings\"" src`
Expected: no matches (app code no longer imports the mock; only `src/seed.ts` imports it via the relative `./lib/settings`).

- [ ] **Step 3: Seed + build (DB-gated — defer if no DATABASE_URL)**

> Requires `DATABASE_URL`. If unavailable in the worker, flag as a manual follow-up — do not claim success without output.

Run: `pnpm seed` (expect `Seeded 2 collections, 8 products, 2 projects, 1 settings global.`), then `pnpm build` (succeeds; the global is read at build).

---

## Self-Review

**Spec coverage:**
- §4.1 `getSettings()` cached + `mapSettings` pure → Task 1. ✓
- §3 field reconciliation (`businessHours`→`hours`, `zaloOA`→`zaloUrl`, defaults) → Task 1 mapper + tests. ✓
- §4.2 seed the global → Task 2. ✓
- §4.3 server consumers (Header, Footer, BottomActionBar, BypassConsult, home, thank-you) → Tasks 3, 4, 5, 6. ✓
- §4.4 client consumers (CalculatorWidget, MobileNav) via props → Tasks 4, 5. ✓
- §4.5 `ZALO_ENABLED` → per-render `isZaloEnabled`, const removed → Tasks 3–7. ✓
- §2 keep mock as seed source → retained (Task 7 keeps `SETTINGS`). ✓
- §7 testing (mapper unit, repo integration, calculator unaffected) → Task 1; Task 8 verifies. ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code. (Task 2 Step 1 deliberately shows the wrong-then-corrected import to prevent the `./lib/mock-data` mistake — the corrected `./lib/settings` is the one to use.)

**Type consistency:** `Settings`, `SettingsDoc`, `mapSettings`, `isZaloEnabled`, `getSettings`, and the `settings` prop name are used identically across Tasks 1–6. `BypassConsult({ settings })` / `LeadFormSheet({ …, settings })` / `CalculatorWidget({ …, settings })` / `MobileNav({ settings })` signatures match their call sites.

**Cross-task ordering note:** The calculator tree (Task 5) must land as one task — changing a leaf's required `settings` prop breaks its callers until they pass it. Task 7 (remove `ZALO_ENABLED`) must come after Tasks 3–6 (all consumers migrated to `isZaloEnabled`).
