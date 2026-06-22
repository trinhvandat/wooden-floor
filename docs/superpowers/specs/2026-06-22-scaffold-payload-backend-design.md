# Design — Scaffold Payload CMS backend (Phase 1 · M1 Foundation)

**Date:** 2026-06-22
**Scope:** Embed Payload CMS 3 into the existing `fukione-web` Next.js app — schema-as-code for all 8 collections, Postgres (Neon) connection, working `/admin`, type codegen. **Foundation only.**
**Related:** [architecture.md](../../architecture.md) §2–3 · [class diagram](2026-06-20-fukione-phase1-class-diagram.md) · [SRS](2026-06-20-fukione-phase1-srs.md) §4, FR-CMS

> **Status:** Approved (user, 2026-06-22). Compatibility verified against primary Payload/Next sources.

---

## 1. Objective

Stand up the backend foundation so the lead-gen site has an owned data layer and an admin panel, **without** wiring any runtime behaviour yet. After this, the next phase can wire the lead flow (forms → DB → email) and migrate the catalog off mock data.

**Why now:** the frontend is fully built on mock data (`src/lib/mock-data.ts`); the product's core value (capture + persist leads, CMS-managed prices/content) needs a real backend. This is milestone **M1 Foundation** in `architecture.md` §7.

---

## 2. Compatibility verdict (verified)

| Component | Version | Verdict |
|---|---|---|
| Payload | **3.85.1** (3.x stable) | `@payloadcms/next` peerDep: `next >=16.2.6 <17.0.0` |
| Next.js | 16.2.9 (installed) | ✅ in range — **no** `--legacy-peer-deps`/override needed |
| React | 19.2.4 (installed) | ✅ no React peerDep declared; 19.x assumed |
| Node | ≥ 20.9.0 | required by both Payload 3.x and Next 16 |

**Do NOT** target Payload 4.0.0-beta (main branch, needs Node 24) — pin the `3.x` line.

**Critical gotcha — Turbopack production build (Payload issue #15429, open):** with Payload 3.x + Next 16 + Turbopack, the config returns `null` in RSC during **production** builds → `/admin` crashes. **Mitigation:** keep Turbopack for `next dev` (fast local), but run production builds with `next build --webpack`. Also add `turbopack: {}` to `next.config` to silence the webpack/turbopack co-config warning (issue #14354).

---

## 3. Architecture & directory restructure

Embed Payload into `fukione-web` (one app, one deploy — `architecture.md` §2). Next.js allows only one root layout rendering `<html>/<body>`; Payload `/admin` needs its own. Therefore split into two **route groups**, each with its own root layout (the official Payload pattern). Route-group folders `(…)` are **transparent to URLs** — public paths do not change.

### Before
```
fukione-web/src/app/
├─ layout.tsx · globals.css · favicon.ico · page.tsx
├─ products/ · quote/ · book-survey/ · thank-you/
```

### After
```
fukione-web/
├─ payload.config.ts                 # NEW — at app root (alias @payload-config)
├─ next.config.ts                    # wrapped with withPayload + turbopack:{}
├─ src/
│  ├─ app/
│  │  ├─ (app)/                       # MOVED: all existing UI (git mv, content unchanged)
│  │  │  ├─ layout.tsx · globals.css · page.tsx
│  │  │  ├─ products/ · quote/ · book-survey/ · thank-you/
│  │  └─ (payload)/                   # NEW — verbatim from Payload blank template
│  │     ├─ layout.tsx
│  │     ├─ admin/[[...segments]]/page.tsx + not-found.tsx
│  │     ├─ api/[...slug]/route.ts
│  │     ├─ api/graphql/route.ts · api/graphql-playground/route.ts
│  │     └─ custom.scss
│  ├─ collections/                    # NEW — one file per collection
│  └─ globals/                        # NEW — Settings.ts
├─ payload-types.ts                   # GENERATED (generate:types)
```

`favicon.ico` stays at `src/app/` root (shared) or moves into `(app)/` — either works; keep it at root.

> The `(payload)` route-group files are **auto-generated / boilerplate** copied from the Payload 3.x blank template (`templates/blank/src/app/(payload)`). Do not hand-edit them; regenerate via `payload generate:importmap` when collections change.

---

## 4. Packages

```bash
pnpm add payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical sharp graphql
pnpm add -D cross-env
```

- `@payloadcms/db-postgres` — Postgres adapter for Neon (NOT the Vercel variant; that has local-dev constraints).
- `@payloadcms/richtext-lexical` — rich-text editor (Articles `body`).
- `sharp` — image processing for the Media collection.

---

## 5. Data model — collections (schema-as-code)

8 entities from the class diagram + SRS §4. Enum fields → Payload `select`. Relations → `relationship`. **Field details are settled here; mock-data/`lib/types.ts` are NOT touched in this phase.**

| File | Type | Key fields |
|---|---|---|
| `collections/Users.ts` | auth | `email` (auth), `role`: select `admin`\|`editor`\|`sale` (default `sale`) |
| `collections/Media.ts` | upload | `alt` (required); Payload auto-adds url/sizes; `sharp` resize |
| `collections/Products.ts` | collection | `name`, `slug` (unique), `collectionRef`→rel Collections, `thicknessMm`: select `8`\|`12`, `pricePerM2`: number, `waterproof`: checkbox, `color`, `surface`, `roomTypes`: text array, `images`: array of rel→Media, `specs`: array `{k,v}`, `description`: textarea, `seoMeta` group `{title,description}`, `status`: select `draft`\|`published` |
| `collections/Collections.ts` | collection | `name`, `slug` (unique), `description`, `coverImage`→rel Media, `seoMeta` group |
| `collections/Articles.ts` | collection | `title`, `slug` (unique), `excerpt`, `body`: lexical richText, `coverImage`→rel Media, `tags`: text array, `seoMeta` group, `publishedAt`: date, `status`: select `draft`\|`published` |
| `collections/Projects.ts` | collection | `title`, `slug` (unique), `description`, `images`: array rel→Media, `productRefs`: rel→Products (hasMany), `location`, `areaM2`: number |
| `collections/Leads.ts` | collection | `name` (req), `phone` (req), `email`, `source`: select `calculator`\|`survey`\|`quote`\|`zalo`, `productId`→rel Products, `area`: number, `estimatedCost`: number, `message`: textarea, `address`, `preferredTime`, `status`: select `new`\|`contacted`\|`quoted`\|`won`\|`lost` (default `new`); `createdAt` is Payload-default. Admin: `useAsTitle: name`, default columns for mini-CRM. |
| `globals/Settings.ts` | **global** | `installPricePerM2`: number, `trimEstimate`: number, `nap` group `{name,address,phone}`, `showroomAddress`, `businessHours`, `mapEmbed`: textarea, `zaloOA` |

Notes:
- `slug` fields: simple `text` + `unique: true` + `index` for this phase (no auto-slug hook yet — YAGNI; can add later).
- Access control: this phase uses Payload defaults (auth required for admin/write, read open). Fine-grained role rules (FR-CMS-05) are deferred to the wiring phase.
- No seed data — Payload prompts to create the first admin user on first `/admin` visit.

---

## 6. Config, env, scripts

**`payload.config.ts`** (root):
```ts
buildConfig({
  admin: { user: 'users' },
  editor: lexicalEditor(),
  collections: [Users, Media, Products, Collections, Articles, Projects, Leads],
  globals: [Settings],
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } }),
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
})
```

**`next.config.ts`**: wrap existing config with `withPayload(nextConfig)`; add `turbopack: {}`.

**`tsconfig.json`**: add path `"@payload-config": ["./payload.config.ts"]`.

**`package.json` scripts:**
```jsonc
"dev":       "next dev",                                  // Turbopack (Next 16 default)
"build":     "cross-env payload generate:importmap && next build --webpack",
"generate:types":     "cross-env payload generate:types",
"generate:importmap": "cross-env payload generate:importmap",
"start":     "next start",
"test":      "vitest run"                                 // unchanged
```

**`.env.example`** (committed; real `.env` is user-owned, read-only to Claude):
```
DATABASE_URL=postgres://USER:PASSWORD@HOST.pooler.neon.tech:5432/DB?sslmode=require
PAYLOAD_SECRET=replace-with-long-random-string
```
Neon: use the **pooled** endpoint (`.pooler.neon.tech`) + `?sslmode=require`.

---

## 7. Out of scope (this phase)

- Wiring lead forms to a real API route (Zod → DB-first → Resend email).
- Migrating catalog/product pages off `mock-data.ts` to Payload queries.
- Seeding Settings/Products; importing the 52 SKUs.
- Role-based access control, draft/publish workflow, auto-slug hooks.
- SEO structured data, sitemap, GA4/Zalo/Maps integrations.

These belong to M2/M3 and get their own spec → plan → PR.

---

## 8. Verification (definition of done)

1. `pnpm install` resolves cleanly (no peer-dep errors).
2. `pnpm generate:types` produces `payload-types.ts` with all 8 entities.
3. `pnpm build` (webpack) completes without error.
4. `pnpm dev` boots; visiting `/admin` (with a real Neon `DATABASE_URL` + `PAYLOAD_SECRET` in `.env`) shows the create-first-user screen, and all 7 collections + Settings global appear in the sidebar.
5. Existing public routes (`/`, `/products`, `/quote`, …) still render unchanged.
6. `pnpm test` still passes (4/4 calculator tests).

> Steps 1–3, 5, 6 are verifiable by Claude. Step 4 (live `/admin`) depends on the user supplying real Neon credentials in `.env`.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Turbopack prod build crashes admin (#15429) | `next build --webpack` in build script |
| webpack/turbopack co-config warning (#14354) | `turbopack: {}` in next.config |
| Route-group move breaks an import path | imports are relative within moved files; verify with `pnpm build` |
| Neon SSL/pooling misconfig | `.env.example` documents pooled host + `?sslmode=require` |
| Payload 4 beta pulled in by mistake | pin exact `3.x` versions from install |
