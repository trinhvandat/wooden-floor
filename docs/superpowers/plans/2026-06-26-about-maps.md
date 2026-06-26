# About Page + Google Maps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the M4-B about page at `/gioi-thieu` — company story + trust block + showroom/Google-Map + lead CTA — building local trust and local SEO.

**Architecture:** A static server page reading `Settings` (NAP/hours/showroom/mapEmbed). The only logic unit is a security-conscious `extractMapSrc` helper (unit-tested) that turns the operator's free-form `mapEmbed` into a safe Google-Maps `<iframe src>`. The existing `ProjectQuoteCta` is generalized into a shared `LeadCtaSection` used by both the projects detail page and this page.

**Tech Stack:** Next.js 16 (App Router, ISR), Payload CMS 3 (`Settings` global), TypeScript strict, Tailwind, Vitest.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-06-26-about-maps-design.md` — authoritative.
- **Branch:** `feat/about-maps` (already checked out). Commit per task; save memory on-branch before the PR push.
- **Public URL is Vietnamese-no-accent:** route folder English (`app/(app)/about/`), public URL `/gioi-thieu` via `next.config.ts` rewrite. Internal `<Link href>`/canonical use `/gioi-thieu`, never `/about`.
- **Map safety:** never use `dangerouslySetInnerHTML`. The map is a controlled `<iframe src=…>` whose src comes ONLY from `extractMapSrc`, which returns `null` for empty/non-Google/non-https/malformed input. Map renders only when `extractMapSrc` returns non-null.
- **Lead CTA records `source: "quote"`:** the shared `LeadCtaSection` opens `LeadFormSheet` with **no `context`** prop (LeadFormSheet computes `source: context ? "calculator" : "quote"`).
- **Copy is hardcoded** Vietnamese in the page; NAP/hours/showroom/map come from `Settings`. Repo artifacts (code/comments) in English; Vietnamese only in user-facing UI strings.
- **Prices/units** live in `Settings` — not touched here.
- **Gate before PR:** `pnpm exec tsc --noEmit` 0 · `pnpm lint` 0 (2 pre-existing `seed.ts` warnings OK) · `pnpm test` green · `pnpm build` succeeds. All `pnpm` from `fukione-web/`.

---

### Task 1: `extractMapSrc` map helper (TDD)

The only logic unit; fully unit-tested. Turns the free-form `mapEmbed` into a safe Google-Maps iframe src.

**Files:**
- Create: `fukione-web/src/lib/maps.ts`
- Test: `fukione-web/src/lib/maps.test.ts`

**Interfaces:**
- Produces: `extractMapSrc(mapEmbed: string): string | null`.

- [ ] **Step 1: Write the failing tests**

Create `fukione-web/src/lib/maps.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { extractMapSrc } from "./maps";

describe("extractMapSrc", () => {
  it("accepts a plain Google Maps embed URL", () => {
    const src = "https://www.google.com/maps/embed?pb=!1m18!2m3";
    expect(extractMapSrc(src)).toBe(src);
  });

  it("extracts the src from a full <iframe> snippet", () => {
    const snippet =
      '<iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600" height="450" loading="lazy"></iframe>';
    expect(extractMapSrc(snippet)).toBe("https://www.google.com/maps/embed?pb=!1m18");
  });

  it("rejects a non-Google host (URL or snippet)", () => {
    expect(extractMapSrc("https://evil.com/maps/embed?pb=x")).toBeNull();
    expect(extractMapSrc('<iframe src="https://evil.com/x"></iframe>')).toBeNull();
  });

  it("rejects non-https and non-/maps paths", () => {
    expect(extractMapSrc("http://www.google.com/maps/embed?pb=x")).toBeNull();
    expect(extractMapSrc("https://www.google.com/search?q=x")).toBeNull();
  });

  it("returns null for empty / malformed input", () => {
    expect(extractMapSrc("")).toBeNull();
    expect(extractMapSrc("   ")).toBeNull();
    expect(extractMapSrc("not a url")).toBeNull();
    expect(extractMapSrc("<iframe></iframe>")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test maps`
Expected: FAIL — `extractMapSrc` not found / module `./maps` missing.

- [ ] **Step 3: Implement `extractMapSrc`**

Create `fukione-web/src/lib/maps.ts`:

```ts
const GOOGLE_MAPS_HOSTS = new Set(["www.google.com", "google.com", "maps.google.com"]);

/**
 * Turn the operator's free-form `mapEmbed` (a Google "Embed a map" src URL, or the full
 * `<iframe …>` snippet) into a safe <iframe src>. Returns null for empty / non-Google /
 * non-https / malformed input so the page never renders an arbitrary third-party iframe.
 */
export function extractMapSrc(mapEmbed: string): string | null {
  const trimmed = mapEmbed.trim();
  if (!trimmed) return null;

  // Full `<iframe …src="…">` snippet → pull out the src; otherwise treat the whole value as the URL.
  let candidate = trimmed;
  if (trimmed.includes("<iframe")) {
    const m = trimmed.match(/src=["']([^"']+)["']/i);
    if (!m) return null;
    candidate = m[1];
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!GOOGLE_MAPS_HOSTS.has(url.hostname)) return null;
  if (!url.pathname.startsWith("/maps")) return null;
  return url.toString();
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test maps`
Expected: PASS (all 5 cases).

Note: `new URL(src).toString()` is identity for the test URLs (no trailing-slash/normalization changes on a `?pb=` query), so `toBe(src)` holds.

- [ ] **Step 5: Commit**

```bash
git add fukione-web/src/lib/maps.ts fukione-web/src/lib/maps.test.ts
git commit -m "feat: add extractMapSrc — safe Google Maps embed src from Settings.mapEmbed"
```

---

### Task 2: Generalize `ProjectQuoteCta` → shared `LeadCtaSection`

Rename + parameterize the CTA so the about page and the projects detail page share one component. No behaviour change on the projects page.

**Files:**
- Rename: `fukione-web/src/components/site/ProjectQuoteCta.tsx` → `fukione-web/src/components/site/LeadCtaSection.tsx`
- Modify: `fukione-web/src/app/(app)/projects/[slug]/page.tsx:12,114`

**Interfaces:**
- Produces: `LeadCtaSection({ settings: Settings; title: string; body: string })` — opens `LeadFormSheet` with no context (`source: "quote"`); section `id="nhan-bao-gia"`.

- [ ] **Step 1: Rename the file (preserve history)**

```bash
git mv fukione-web/src/components/site/ProjectQuoteCta.tsx fukione-web/src/components/site/LeadCtaSection.tsx
```

- [ ] **Step 2: Rewrite the component with `title`/`body` props**

Replace the entire contents of `fukione-web/src/components/site/LeadCtaSection.tsx`:

```tsx
"use client";

import { useState } from "react";
import { LeadFormSheet } from "@/components/LeadFormSheet";
import { BypassConsult } from "@/components/site/BypassConsult";
import type { Settings } from "@/lib/types";

interface LeadCtaSectionProps {
  settings: Settings;
  title: string;
  body: string;
}

/** Shared lead CTA — opens the quote sheet with no context (records source: "quote"). */
export function LeadCtaSection({ settings, title, body }: LeadCtaSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <section
      id="nhan-bao-gia"
      className="scroll-mt-20 rounded-card border border-line bg-surface p-6 text-center"
    >
      <h2 className="font-display text-[19px] font-extrabold leading-tight text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-relaxed text-muted">
        {body}
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center justify-center rounded-pill bg-cta px-6 py-3 text-sm font-extrabold text-ink shadow-cta"
      >
        Nhận báo giá
      </button>
      <div className="mt-3">
        <BypassConsult settings={settings} />
      </div>
      <LeadFormSheet open={open} onOpenChange={setOpen} settings={settings} />
    </section>
  );
}
```

- [ ] **Step 3: Update the projects detail page to use it (unchanged copy)**

In `fukione-web/src/app/(app)/projects/[slug]/page.tsx`:
- Line 12 import — replace:
```tsx
import { LeadCtaSection } from "@/components/site/LeadCtaSection";
```
- Line ~114 usage — replace `<ProjectQuoteCta settings={settings} />` with:
```tsx
        <LeadCtaSection
          settings={settings}
          title="Muốn một công trình tương tự?"
          body="Để lại thông tin — FUKIONE sẽ tư vấn và báo giá cho không gian của bạn."
        />
```

- [ ] **Step 4: Verify green (no behaviour change)**

Run: `pnpm exec tsc --noEmit` → 0 errors. Then `pnpm lint` → 0 errors (2 pre-existing `seed.ts` warnings OK). Then `pnpm test` → still 45/45 + the new maps tests from Task 1 (no test references `ProjectQuoteCta`).
Expected: all green; no remaining reference to `ProjectQuoteCta` (`grep -rn ProjectQuoteCta fukione-web/src` returns nothing).

- [ ] **Step 5: Commit**

```bash
git add fukione-web/src/components/site/LeadCtaSection.tsx "fukione-web/src/app/(app)/projects/[slug]/page.tsx"
git commit -m "refactor: generalize ProjectQuoteCta into shared LeadCtaSection"
```

---

### Task 3: About page + rewrite + nav + sitemap

Create the `/gioi-thieu` page (hero/story, trust block, map+contact, lead CTA), wire the rewrite, nav links, and sitemap.

**Files:**
- Create: `fukione-web/src/app/(app)/about/page.tsx`
- Modify: `fukione-web/next.config.ts`
- Modify: `fukione-web/src/components/site/Header.tsx`
- Modify: `fukione-web/src/components/site/MobileNav.tsx`
- Modify: `fukione-web/src/app/sitemap.ts`

**Interfaces:**
- Consumes: `getSettings()`, `isZaloEnabled` (`@/lib/data/settings.map`), `extractMapSrc` (Task 1), `LeadCtaSection` (Task 2), `SectionHeading`, `JsonLd`, `buildLocalBusinessJsonLd`, `buildBreadcrumbJsonLd`, `SITE_URL`, `BASE_OPEN_GRAPH`.

- [ ] **Step 1: Create the about page**

Create `fukione-web/src/app/(app)/about/page.tsx`:

```tsx
import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { isZaloEnabled } from "@/lib/data/settings.map";
import { extractMapSrc } from "@/lib/maps";
import { SectionHeading } from "@/components/SectionHeading";
import { LeadCtaSection } from "@/components/site/LeadCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildLocalBusinessJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL, BASE_OPEN_GRAPH } from "@/lib/seo/site";

export const revalidate = 3600;

export const metadata = {
  title: "Giới thiệu",
  description:
    "FUKIONE — sàn gỗ cao cấp, lắp đặt trọn gói tại Hà Nội. Câu chuyện, cam kết và showroom của chúng tôi.",
  alternates: { canonical: "/gioi-thieu" },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: "Giới thiệu — FUKIONE",
    description: "Sàn gỗ cao cấp, lắp đặt trọn gói tại Hà Nội.",
  },
};

const TRUST = [
  { stat: "8+", label: "năm kinh nghiệm" },
  { stat: "1.000+", label: "công trình đã thi công" },
  { stat: "12 tháng", label: "bảo hành thi công" },
  { stat: "Trọn gói", label: "khảo sát · thi công · vệ sinh" },
];

export default async function AboutPage() {
  const settings = await getSettings();
  const { nap, hours, zaloUrl, showroomAddress } = settings;
  const zaloOn = isZaloEnabled(zaloUrl);
  const mapSrc = extractMapSrc(settings.mapEmbed);
  const address = showroomAddress || nap.address;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildLocalBusinessJsonLd(
          { name: nap.name, address: nap.address, phone: nap.phone, hours },
          SITE_URL,
        )}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Giới thiệu", path: "/gioi-thieu" },
          ],
          SITE_URL,
        )}
      />

      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
        {/* Hero / story */}
        <section className="max-w-2xl">
          <SectionHeading as="h1" withUnderline>
            Về FUKIONE
          </SectionHeading>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            FUKIONE là thương hiệu sàn gỗ cao cấp tại Hà Nội, chuyên cung cấp và lắp đặt trọn gói
            cho căn hộ, nhà phố và biệt thự. Chúng tôi chọn lọc vật liệu bền đẹp, thi công bởi đội
            ngũ tay nghề cao và đồng hành cùng khách hàng từ khảo sát đến bàn giao — để mỗi sàn nhà
            là một không gian đáng tự hào.
          </p>
        </section>

        {/* Trust block */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TRUST.map((t) => (
            <div
              key={t.label}
              className="rounded-card border border-line bg-surface p-4 text-center"
            >
              <p className="font-display text-[22px] font-extrabold text-cta-ink">{t.stat}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-muted">{t.label}</p>
            </div>
          ))}
        </section>

        {/* Map + contact */}
        <section className={mapSrc ? "grid gap-6 lg:grid-cols-2" : ""}>
          <div>
            <SectionHeading withUnderline>Showroom</SectionHeading>
            <address className="not-italic mt-4 space-y-2 text-sm text-muted">
              <p className="font-semibold text-ink">{nap.name}</p>
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-trust" />
                <span>{address}</span>
              </span>
              <a
                href={`tel:${nap.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 hover:text-trust"
              >
                <Phone className="h-4 w-4 shrink-0 text-trust" />
                <span>{nap.phone}</span>
              </a>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-trust" />
                <span>{hours}</span>
              </span>
            </address>
            <div className="mt-4 flex flex-wrap gap-3">
              {zaloOn && (
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-pill border-2 border-trust px-4 py-2.5 text-sm font-bold text-trust transition-colors hover:bg-trust hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat Zalo
                </a>
              )}
              {!mapSrc && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-pill border-2 border-line px-4 py-2.5 text-sm font-bold text-muted transition-colors hover:border-trust hover:text-trust"
                >
                  <MapPin className="h-4 w-4" />
                  Xem bản đồ
                </a>
              )}
            </div>
          </div>
          {mapSrc && (
            <div className="overflow-hidden rounded-card border border-line">
              <iframe
                src={mapSrc}
                title="Bản đồ showroom FUKIONE"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full"
              />
            </div>
          )}
        </section>

        {/* Lead CTA */}
        <LeadCtaSection
          settings={settings}
          title="Sẵn sàng làm mới sàn nhà bạn?"
          body="Để lại thông tin — FUKIONE sẽ tư vấn và báo giá miễn phí cho không gian của bạn."
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the rewrite**

In `fukione-web/next.config.ts`, add to the array returned by `rewrites()` (after the `/du-an/:slug` entry):

```ts
      { source: "/gioi-thieu", destination: "/about" },
```

- [ ] **Step 3: Add the nav link (both files)**

In `fukione-web/src/components/site/Header.tsx` AND `fukione-web/src/components/site/MobileNav.tsx`, add to the `NAV` array between the `Dự án` and `Báo giá` entries:

```ts
  { label: "Giới thiệu", href: "/gioi-thieu" },
```

- [ ] **Step 4: Add the page to the sitemap**

In `fukione-web/src/app/sitemap.ts`, add `"/gioi-thieu"` to the `staticPaths` array (line 6):

```ts
  const staticPaths = ["/", "/san-pham", "/bao-gia", "/dat-lich-khao-sat", "/du-an", "/gioi-thieu"];
```

- [ ] **Step 5: Verify (tsc + lint; DB-gated build optional)**

Run from `fukione-web/`:
- `pnpm exec tsc --noEmit` → 0 errors.
- `pnpm lint` → 0 errors (2 pre-existing `seed.ts` warnings OK).
- `pnpm test` → still green (no new test this task; page/components aren't unit-tested, consistent with the repo).

(The DB-gated `pnpm build` + Playwright recheck — with `mapEmbed` empty and set — are the controller's job.)

- [ ] **Step 6: Commit**

```bash
git add "fukione-web/src/app/(app)/about/page.tsx" fukione-web/next.config.ts \
  fukione-web/src/components/site/Header.tsx fukione-web/src/components/site/MobileNav.tsx \
  fukione-web/src/app/sitemap.ts
git commit -m "feat: about page at /gioi-thieu with showroom map + nav + sitemap"
```

---

## Self-Review

**Spec coverage:**
- §3.1 route + rewrite + nav + metadata → Task 3 Steps 1–3. ✓
- §3.2 `extractMapSrc` → Task 1. ✓
- §3.3 page sections (hero/trust/map+contact/CTA) + LocalBusiness & breadcrumb JSON-LD → Task 3 Step 1. ✓
- §3.4 generalize `ProjectQuoteCta` → `LeadCtaSection` + update projects page → Task 2. ✓
- §3.5 sitemap + JSON-LD → Task 3 Steps 1 & 4. ✓
- §4 unit-test `extractMapSrc`; page via build/Playwright → Task 1; controller gate. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; the test step shows assertions. Hardcoded VN copy/trust numbers are intentional content (spec §3.3), editable. ✓

**Type consistency:** `extractMapSrc(string): string | null` defined in Task 1, consumed in Task 3. `LeadCtaSection({ settings, title, body })` defined in Task 2, consumed by Task 2 (projects page) and Task 3 (about page) with the same prop names. `Settings.mapEmbed`/`showroomAddress` match the existing type. ✓
