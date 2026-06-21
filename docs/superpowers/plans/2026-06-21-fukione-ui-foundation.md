# FUKIONE UI Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Next.js + Tailwind + shadcn app, wire the FUKIONE design tokens, and build the 5 conversion screens as real, responsive, mock-data screens — so "detailed screen design" lives as production code.

**Architecture:** UI-first slice. No Payload/Postgres yet — screens read from a typed in-repo mock-data module. The one piece of real logic, the cost calculator, is a pure function built with TDD (it is the highest-risk path: a wrong number loses trust). Everything else is presentational and verified by running the dev server + a visual check. Backend (Payload, leads, email) is a later milestone.

**Tech Stack:** Next.js 14+ (App Router), TypeScript (strict), Tailwind CSS, shadcn/ui, pnpm. Vitest for the calculator unit tests.

## Global Constraints

- Package manager: **pnpm** (per `docs/architecture.md`). TypeScript **strict**.
- Mobile-first, responsive; sticky bottom action bar ≤768px only; touch targets ≥44px.
- Design tokens are the source of truth — see `docs/superpowers/specs/2026-06-21-fukione-visual-design.md`. Amber `#E8852B` is **primary-CTA only**; base background is warm paper `#FAF7F2`; teal `#0F766E` = trust; walnut `#6B4A2E` = sparing premium accent.
- Wireframes are the layout spec — see `docs/superpowers/specs/2026-06-20-fukione-uiux-design.md` §5.
- UI copy and route slugs stay Vietnamese (e.g. `/san-pham`, "Tính chi phí"); code/comments English (`english-only-artifacts`).
- Every conversion point shows a bypass: "hoặc 💬 tư vấn ngay / ☎ gọi". Every estimate shows "* giá cuối phụ thuộc khảo sát thực tế".
- Font: Be Vietnam Pro or Inter with the Vietnamese subset — verify diacritics render.
- Git-flow: this whole plan runs on branch `feat/scaffold-ui` off `master`; squash-merge via PR when done.

---

### Task 1: Scaffold the Next.js app + tooling

**Files:**
- Create: project files via `create-next-app` (`package.json`, `tsconfig.json`, `next.config.ts`, `app/`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`)
- Create: `.nvmrc` (node version), update `.gitignore` if needed
- Test: none (scaffold task; verified by build/dev run)

**Interfaces:**
- Produces: a running Next.js App Router app at `/`, Tailwind active, shadcn CLI initialized, `pnpm dev` and `pnpm build` working.

- [ ] **Step 1: Create the app** (run from a temp dir, then move into repo root, since repo is non-empty)

```bash
# repo already has docs/ and .claude/ — scaffold into a subfolder then merge,
# or scaffold in place accepting the prompt to proceed in a non-empty dir.
pnpm create next-app@latest fukione-web --ts --tailwind --eslint --app \
  --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
```
Decision: keep app in `fukione-web/` subfolder OR move contents to repo root. Default: **subfolder `fukione-web/`** (keeps `docs/`, `.claude/` clean at root). All later paths are relative to `fukione-web/`.

- [ ] **Step 2: Verify dev server boots**

Run: `cd fukione-web && pnpm dev`
Expected: server starts on `http://localhost:3000`, default page renders. Stop it (Ctrl-C).

- [ ] **Step 3: Initialize shadcn/ui**

```bash
cd fukione-web && pnpm dlx shadcn@latest init -d
```
Expected: creates `components.json`, `src/lib/utils.ts` (with `cn()`), updates `globals.css`.

- [ ] **Step 4: Add the shadcn primitives we will use**

```bash
cd fukione-web && pnpm dlx shadcn@latest add button input label sheet card badge select separator
```
Expected: components land in `src/components/ui/`.

- [ ] **Step 5: Verify production build**

Run: `cd fukione-web && pnpm build`
Expected: build succeeds, no type errors.

- [ ] **Step 6: Commit**

```bash
git add fukione-web .gitignore
git commit -m "chore: scaffold Next.js app with Tailwind and shadcn"
```

---

### Task 2: Wire design tokens into the theme

**Files:**
- Modify: `fukione-web/src/app/globals.css` (Tailwind v4 `@theme` tokens + base layer)
- Modify: `fukione-web/src/app/layout.tsx` (load Be Vietnam Pro via `next/font`, set `<html lang="vi">`, base bg)
- Test: none (verified visually + build)

> **Tailwind v4 note:** this project uses Tailwind v4 (CSS-first). There is **no `tailwind.config.ts`** — design tokens are declared in an `@theme` block inside `globals.css`, which auto-generates the matching utilities. Do not create a JS/TS Tailwind config.

**Interfaces:**
- Produces: Tailwind utilities `bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `bg-cta`, `text-cta`, `bg-trust`, `border-line`, `bg-wood`; radius `rounded-pill`; shadow `shadow-cta`, `shadow-card`. These are consumed by every later component.

- [ ] **Step 1: Declare design tokens in a Tailwind v4 `@theme` block** — in `globals.css`, after `@import "tailwindcss";`, add the block below. In v4 these `--color-*` / `--radius-*` / `--shadow-*` variables AUTO-GENERATE the utilities (`bg-bg`, `text-ink`, `border-line`, `rounded-pill`, `shadow-cta`, `bg-result-bg`, …). Values copied verbatim from the visual-design doc §2:

```css
@theme {
  --color-bg: #FAF7F2;
  --color-surface: #FFFFFF;
  --color-surface-warm: #F2EEE7;
  --color-ink: #241F1B;
  --color-muted: #6B6259;
  --color-cta: #E8852B;
  --color-cta-ink: #9C5A16;
  --color-trust: #0F766E;
  --color-wood: #6B4A2E;
  --color-line: #ECE5DC;
  --color-cta-soft-from: #FBEFE0;
  --color-cta-soft-to: #F6E2CC;
  --color-trust-soft: #EAF5F3;
  --color-trust-soft-border: #D3ECE8;
  --color-result-bg: #FBF6EF;
  --color-result-border: #E6C9A6;
  --radius-pill: 999px;
  --radius-card: 14px;
  --radius-input: 10px;
  --radius-sheet: 22px;
  --shadow-cta: 0 8px 20px rgba(232,133,43,.32);
  --shadow-card: 0 4px 14px rgba(0,0,0,.05);
  --shadow-bar: 0 -2px 12px rgba(0,0,0,.05);
  --shadow-sheet: 0 -10px 30px rgba(0,0,0,.2);
}
```

- [ ] **Step 2: Set base page colors** — also in `globals.css`:

```css
@layer base {
  html, body { background-color: var(--color-bg); color: var(--color-ink); }
}
```
This makes `bg-cta`, `text-trust`, `text-muted`, `border-line`, `rounded-pill`, `shadow-cta`, `bg-result-bg`, `border-result-border`, etc. available to every later component. (Reminder: NO `tailwind.config.ts` in Tailwind v4.)

- [ ] **Step 3: Load the font** — in `layout.tsx`:

```tsx
import { Be_Vietnam_Pro } from "next/font/google";
const font = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400","500","700","800"] });
// <html lang="vi"> ... <body className={font.className}>
```

- [ ] **Step 4: Verify diacritics + tokens** — temporarily render a test line with "ô ư ạ ằ đ" and a `bg-cta` box on `bg-bg`.

Run: `cd fukione-web && pnpm dev` → check the diacritics render in all weights and colors match the mockup. Remove the test line after.

- [ ] **Step 5: Commit**

```bash
git add fukione-web/src/app/globals.css fukione-web/src/app/layout.tsx
git commit -m "feat: wire FUKIONE design tokens into Tailwind theme"
```

---

### Task 3: Mock-data module + domain types

**Files:**
- Create: `fukione-web/src/lib/types.ts` (Product, Collection, Project, Article)
- Create: `fukione-web/src/lib/mock-data.ts` (≥8 products spanning filter values, 2 collections, 2 projects)
- Create: `fukione-web/src/lib/settings.ts` (install rate, trim estimate, NAP, hotline, Zalo — mirrors Payload `Settings`)
- Test: none (data module)

**Interfaces:**
- Produces:
  - `type Product = { id: string; slug: string; name: string; pricePerM2: number; thicknessMm: 8|12; waterproof: boolean; color: string; surface: string; roomTypes: string[]; images: string[]; specs: {k:string;v:string}[] }`
  - `PRODUCTS: Product[]`, `COLLECTIONS`, `PROJECTS`
  - `SETTINGS = { installPricePerM2: number; trimEstimate: number; nap: {name:string;address:string;phone:string}; hours: string; zaloUrl: string }`

- [ ] **Step 1: Write `types.ts`** with the interfaces above (full definitions, exported).
- [ ] **Step 2: Write `settings.ts`** with `installPricePerM2: 80000`, `trimEstimate: 800000`, NAP placeholders ("FUKIONE", "Số 12 đường ABC, Cầu Giấy, Hà Nội", "0900 000 000"), `hours: "8:00–18:00 hằng ngày"`, `zaloUrl: "#"`.
- [ ] **Step 3: Write `mock-data.ts`** — 8 products incl. F8-12mm @450000, O-Sồi @520000, Walnut @610000, mixing thickness 8/12, waterproof true/false, varied colors/rooms so filters have something to do.
- [ ] **Step 4: Typecheck**

Run: `cd fukione-web && pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add fukione-web/src/lib/types.ts fukione-web/src/lib/mock-data.ts fukione-web/src/lib/settings.ts
git commit -m "feat: add domain types and mock data for UI build"
```

---

### Task 4: Cost calculator (pure logic, TDD)

**Files:**
- Create: `fukione-web/src/lib/calculator.ts`
- Test: `fukione-web/src/lib/calculator.test.ts`
- Modify: `fukione-web/package.json` (add vitest), create `fukione-web/vitest.config.ts`

**Interfaces:**
- Produces: `estimateCost(input: { areaM2: number; pricePerM2: number; withInstall: boolean }, settings: { installPricePerM2: number; trimEstimate: number }): { material: number; install: number; trim: number; total: number }`
- Consumed by: Product detail (Task 7) and Calculator page (Task 8).

- [ ] **Step 1: Add vitest**

```bash
cd fukione-web && pnpm add -D vitest
```
Create `vitest.config.ts` with the default node/jsdom-less config; add `"test": "vitest run"` to `package.json` scripts.

- [ ] **Step 2: Write the failing test** — `calculator.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { estimateCost } from "./calculator";

const settings = { installPricePerM2: 80000, trimEstimate: 800000 };

describe("estimateCost", () => {
  it("computes material + install + trim for the example case", () => {
    const r = estimateCost({ areaM2: 25, pricePerM2: 450000, withInstall: true }, settings);
    expect(r.material).toBe(11250000);
    expect(r.install).toBe(2000000);
    expect(r.trim).toBe(800000);
    expect(r.total).toBe(14050000);
  });

  it("excludes install when withInstall is false", () => {
    const r = estimateCost({ areaM2: 25, pricePerM2: 450000, withInstall: false }, settings);
    expect(r.install).toBe(0);
    expect(r.total).toBe(12050000);
  });

  it("returns zeros for zero/negative area", () => {
    const r = estimateCost({ areaM2: 0, pricePerM2: 450000, withInstall: true }, settings);
    expect(r.total).toBe(0);
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `cd fukione-web && pnpm test`
Expected: FAIL — `estimateCost` not defined.

- [ ] **Step 4: Implement** — `calculator.ts`:

```ts
export function estimateCost(
  input: { areaM2: number; pricePerM2: number; withInstall: boolean },
  settings: { installPricePerM2: number; trimEstimate: number },
) {
  const area = Math.max(0, input.areaM2);
  if (area === 0) return { material: 0, install: 0, trim: 0, total: 0 };
  const material = area * input.pricePerM2;
  const install = input.withInstall ? area * settings.installPricePerM2 : 0;
  const trim = settings.trimEstimate;
  return { material, install, trim, total: material + install + trim };
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `cd fukione-web && pnpm test`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add fukione-web/src/lib/calculator.ts fukione-web/src/lib/calculator.test.ts fukione-web/vitest.config.ts fukione-web/package.json
git commit -m "feat: add cost calculator with unit tests"
```

---

### Task 5: App shell — header, bottom action bar, footer, formatting

**Files:**
- Create: `fukione-web/src/components/site/Header.tsx`, `BottomActionBar.tsx`, `Footer.tsx`, `TrustStrip.tsx`, `BypassConsult.tsx`
- Create: `fukione-web/src/lib/format.ts` (`formatVnd(n)`)
- Modify: `fukione-web/src/app/layout.tsx` (compose Header + Footer; reserve space for the bottom bar)
- Test: none (presentational; visual check)

**Interfaces:**
- Produces:
  - `<Header />` — sticky top bar (logo "FUKI" wood + "ONE" amber, hamburger, ☎ + 💬 icons).
  - `<BottomActionBar primaryLabel={string} primaryHref={string} />` — mobile-only sticky; amber pill CTA + teal circular Zalo. Hidden ≥768px (`md:hidden`).
  - `<Footer />` — `surface-warm`, NAP from SETTINGS, hours, Zalo, Maps link.
  - `<TrustStrip items={string[]} />` — teal checks row.
  - `<BypassConsult />` — "hoặc 💬 tư vấn ngay" line, teal bold links to Zalo/hotline.
  - `formatVnd(11250000) === "11.250.000đ"`.

- [ ] **Step 1: Write `format.ts`** — `formatVnd` using `Intl.NumberFormat("vi-VN")` + "đ" suffix.
- [ ] **Step 2: Build `Header.tsx`** per wireframe §2: sticky, `bg-bg/90 backdrop-blur`, `border-b border-line`; logo wordmark; right-side call + Zalo icons (lucide `Phone`, `MessageCircle`, colored `text-trust`/`text-ink`, never amber).
- [ ] **Step 3: Build `BottomActionBar.tsx`** — `fixed bottom-0 inset-x-0 md:hidden`, `bg-surface/96 backdrop-blur shadow-bar border-t border-line`; full-width `bg-cta text-white rounded-pill shadow-cta font-extrabold` button + 50px teal circular Zalo.
- [ ] **Step 4: Build `Footer.tsx`, `TrustStrip.tsx`, `BypassConsult.tsx`** per the visual-design doc §5.
- [ ] **Step 5: Compose in `layout.tsx`** — `<Header/>{children}<Footer/>`; add `pb-24 md:pb-0` to main so the bottom bar never covers content.
- [ ] **Step 6: Verify**

Run: `cd fukione-web && pnpm dev` → header sticky, footer shows NAP, bottom bar visible on a narrow viewport and hidden ≥768px (use devtools responsive mode).

- [ ] **Step 7: Commit**

```bash
git add fukione-web/src/components/site fukione-web/src/lib/format.ts fukione-web/src/app/layout.tsx
git commit -m "feat: add site shell (header, action bar, footer)"
```

---

### Task 6: Reusable UI pieces — ProductCard, SpecChip, SectionHeading, CalculatorWidget, LeadFormSheet

**Files:**
- Create: `fukione-web/src/components/ProductCard.tsx`, `SpecChip.tsx`, `SectionHeading.tsx`, `CtaStrip.tsx`
- Create: `fukione-web/src/components/CalculatorWidget.tsx` (client component; uses `estimateCost`)
- Create: `fukione-web/src/components/LeadFormSheet.tsx` (shadcn `sheet`; bottom-sheet form)
- Test: none (visual); calculator logic already tested in Task 4

**Interfaces:**
- Produces:
  - `<ProductCard product={Product} />` — image, name (800), price `text-cta` (via `formatVnd`), waterproof tag `text-trust`.
  - `<SpecChip>✓ Chống nước</SpecChip>` — teal-soft pill.
  - `<CalculatorWidget product?={Product} variant="embedded"|"page" />` — client; live `estimateCost` on input change; renders result box with the mandatory note + primary "Nhận báo giá" (opens `LeadFormSheet`) + `<BypassConsult/>`.
  - `<LeadFormSheet open onOpenChange context?={{productName;areaM2;total}} />` — Tên*/SĐT*/Email + teal "📎 Đã đính kèm" line + "Gửi yêu cầu" → routes to `/cam-on` + `<BypassConsult/>`. (No real submit yet — navigates to thank-you; backend later.)

- [ ] **Step 1: Build `SpecChip`, `SectionHeading` (optional wood underline), `CtaStrip`, `ProductCard`** per visual-design §5.
- [ ] **Step 2: Build `CalculatorWidget`** (client): inputs area (number) + product select (when `variant="page"`) + install toggle; compute with `estimateCost(SETTINGS)` live; result box `bg-result-bg border border-dashed border-result-border` (Tailwind v4 utilities from the `@theme` tokens); total `formatVnd`; note italic muted; primary opens the sheet.
- [ ] **Step 3: Build `LeadFormSheet`** using shadcn `Sheet` (side="bottom"); fields + context block; "Gửi yêu cầu" calls `router.push("/cam-on")`.
- [ ] **Step 4: Verify** on a scratch route or via Storybook-less quick page: calculator recomputes live; sheet slides up; bypass links present.
- [ ] **Step 5: Commit**

```bash
git add fukione-web/src/components
git commit -m "feat: add product card, calculator widget, and lead form sheet"
```

---

### Task 7: Conversion screens — Home, Catalog, Product detail

**Files:**
- Create: `fukione-web/src/app/page.tsx` (Home)
- Create: `fukione-web/src/app/san-pham/page.tsx` (Catalog + filters)
- Create: `fukione-web/src/app/san-pham/[slug]/page.tsx` (Product detail)
- Create: `fukione-web/src/components/ProductFilters.tsx` (client; bottom-sheet filters)
- Test: none (visual); verified by dev run

**Interfaces:**
- Consumes: `PRODUCTS`, `COLLECTIONS`, `PROJECTS`, components from Tasks 5–6.
- Produces: three routes wired into the nav; `BottomActionBar` primary label per page (Home → "Tính chi phí" → `/bao-gia`; Product → "Nhận báo giá" → opens sheet).

- [ ] **Step 1: Home `page.tsx`** — compose per wireframe §5.1: hero (headline, primary `/bao-gia`, secondary `/san-pham`, `TrustStrip`), reasons (3), featured `ProductCard` carousel, collections, a project card, `CtaStrip`. `BottomActionBar primaryLabel="Tính chi phí" primaryHref="/bao-gia"`.
- [ ] **Step 2: Catalog `san-pham/page.tsx` + `ProductFilters.tsx`** — sticky filter bar + active chips; 2-col `ProductCard` grid; filters in a bottom `Sheet` (Màu/Độ dày/Chống nước/Phòng/Giá) applying client-side over `PRODUCTS`; sort control.
- [ ] **Step 3: Product detail `san-pham/[slug]/page.tsx`** — gallery, name, `text-cta` price, `SpecChip` row, **`<CalculatorWidget variant="embedded" product={product} />`**, spec table, related `ProductCard`s. `BottomActionBar primaryLabel="Nhận báo giá"`.
- [ ] **Step 4: Verify**

Run: `cd fukione-web && pnpm dev` → browse Home → Catalog → filter → Product detail; calculator on the product pre-fills the product; matches the mockup `hero-screens-C.html`.

- [ ] **Step 5: Commit**

```bash
git add fukione-web/src/app/page.tsx fukione-web/src/app/san-pham fukione-web/src/components/ProductFilters.tsx
git commit -m "feat: build home, catalog, and product detail screens"
```

---

### Task 8: Calculator page, Survey booking, Thank-you

**Files:**
- Create: `fukione-web/src/app/bao-gia/page.tsx` (Calculator page)
- Create: `fukione-web/src/app/dat-lich-khao-sat/page.tsx` (Survey booking form)
- Create: `fukione-web/src/app/cam-on/page.tsx` (Thank-you)
- Create: `fukione-web/src/components/SurveyForm.tsx` (client)
- Test: none (visual); calculator logic already covered

**Interfaces:**
- Consumes: `CalculatorWidget` (page variant), `LeadFormSheet`, `BypassConsult`, `SETTINGS`.
- Produces: routes `/bao-gia`, `/dat-lich-khao-sat`, `/cam-on`.

- [ ] **Step 1: `bao-gia/page.tsx`** — title + sublead + `<CalculatorWidget variant="page" />` (product select from `PRODUCTS`); `BottomActionBar primaryLabel="Tính chi phí"`.
- [ ] **Step 2: `SurveyForm.tsx` + `dat-lich-khao-sat/page.tsx`** — fields Tên*/SĐT*/**Địa chỉ***/Khung giờ (select Sáng/Chiều)/Ghi chú; "Đặt lịch" → `/cam-on`; "Khảo sát gồm gì?" 3-point reassurance; `<BypassConsult/>`.
- [ ] **Step 3: `cam-on/page.tsx`** — success state per wireframe §5.7: "Cảm ơn!" + sales-call message + Zalo + hotline buttons + "Xem dự án" / "Xem thêm SP" links. (GA4 event hook left as a `// TODO(analytics)` comment is **not** allowed — instead add a real no-op `trackConversion()` call in `src/lib/analytics.ts` that logs to console now and is swapped for GA4 later.)
- [ ] **Step 4: Verify full golden path A**

Run: `cd fukione-web && pnpm dev` → Home → "Tính chi phí" → enter 25m² + product + install → see ~14.050.000đ → "Nhận báo giá" → sheet → "Gửi yêu cầu" → `/cam-on`. Then golden path B via Catalog.

- [ ] **Step 5: Build + commit**

```bash
cd fukione-web && pnpm build   # must pass
git add fukione-web/src/app/bao-gia fukione-web/src/app/dat-lich-khao-sat fukione-web/src/app/cam-on fukione-web/src/components/SurveyForm.tsx fukione-web/src/lib/analytics.ts
git commit -m "feat: build calculator, survey booking, and thank-you screens"
```

---

## Out of scope (later milestones)
- 8 content/trust screens (blog, projects, collection, about, contact, 404/500) — separate plan.
- Payload CMS + Postgres, real lead persistence, Resend email, anti-spam, GA4 wiring.
- Real product photography, SEO schema, sitemap, Zalo widget.

## Self-Review
- **Spec coverage:** global frame (T5), tokens (T2), 5 conversion screens incl. embedded + page calculator and bottom-sheet form + thank-you (T6–T8), bypass + estimate-note rules (T5/T6), golden paths A & B (T7/T8 verify). Content screens explicitly deferred.
- **Placeholders:** calculator + format have real test/impl code; analytics is a real no-op module, not a TODO. No "implement later".
- **Type consistency:** `Product`, `estimateCost(...)` signature, `SETTINGS` shape are defined in T3/T4 and consumed unchanged in T6–T8.
