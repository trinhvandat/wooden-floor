# Architecture — FUKIONE wooden-floor (Phase 1)

> Single source of truth (SSOT) for the system shape. Distilled from the full design doc.
> Full specs: [`docs/superpowers/specs/`](superpowers/specs/) —
> [design doc](superpowers/specs/2026-06-20-fukione-wooden-floor-ecommerce-design.md),
> [SRS](superpowers/specs/2026-06-20-fukione-phase1-srs.md),
> [use cases](superpowers/specs/2026-06-20-fukione-phase1-usecases.md),
> [class diagram](superpowers/specs/2026-06-20-fukione-phase1-class-diagram.md).
>
> **Status:** Greenfield — design approved, code not yet scaffolded.

## 1. What it is

A **lead-gen-first** B2C website for retail wooden flooring (Hà Nội, Phase 1). It is a "lead machine", not a full e-commerce store: build trust + give a fast quote → capture the lead → sales close via consultation (Zalo/phone). The competitive edge is **SEO + speed + lead conversion**, not backend complexity.

## 2. System shape

Modular monolith — one Next.js deploy with Payload CMS 3 embedded:

```
        Users (Google search, Zalo, Maps)
                     │
        ┌────────────▼─────────────┐
        │   Next.js (App Router)    │  SSG/ISR · Tailwind + shadcn/ui · forms
        └─────┬───────────────┬─────┘
              │               │
     ┌────────▼──────┐  ┌─────▼──────────┐
     │ Payload CMS 3 │  │ Lead handler   │  save lead → DB, email noti, anti-spam
     │ (embedded)    │  └────────────────┘
     │ /admin, REST, │
     │ GraphQL       │
     └────────┬──────┘
              │
        ┌─────▼──────┐
        │ PostgreSQL │  owned data (Neon/Supabase); Phase-2 Spring Boot reads same DB
        └────────────┘

  External: Zalo OA widget · GA4 · Google Search Console · Business Profile/Maps · Resend (email)
```

**Why this stack:** Payload 3 gives schema-as-code (familiar to a Spring background), self-owned Postgres (seamless for the Phase-2 Spring Boot service), and a single cheap deploy (web + CMS + API together). It is open-source and self-hostable — no vendor lock-in.

## 3. Data model (Payload collections)

| Collection | Key fields |
|---|---|
| **Products** | name, slug, collectionRef, thickness, pricePerM2, waterproof, color, surface, roomTypes[], images[], specs, description, seoMeta |
| **Collections** | name, slug, description, coverImage, seoMeta (concept/room bundles) |
| **Articles** | title, slug, excerpt, body (rich text), coverImage, tags[], seoMeta, publishedAt (blog) |
| **Projects** | title, slug, images[], description, productRefs[] (completed installations — social proof) |
| **Leads** | name, phone, email?, source, productId?, area?, estimatedCost?, message?, status, createdAt (mini-CRM) |
| **Settings** | installPricePerM2, trimEstimate, contactInfo (NAP), showroomAddress, mapEmbed, zaloOA, businessHours (global config — prices live here, not in code) |

## 4. Lead flow (the heart of the product)

Multiple lead "doors", no single forced path:

1. **Entry:** Google / Zalo / Maps → view products, read blog, view projects, click Zalo.
2. **Capture CTAs:** "Quick cost calculator" (enter m²) · "Book free survey" · "Get a quote" (short form) · Zalo chat.
3. **Persist:** create a `Lead` in the DB **(DB write first — leads never lost)**.
4. **Notify:** email to sales via Resend (separate step, retry-able) + thank-you screen for the customer.
5. **Close:** sales calls / Zalo to consult and close.

**Cost calculator** = the flagship closing tool: `area × product price` + install + trim estimate → "estimate", then "Get exact quote" → short form (name + phone) → lead. Always shows "final price depends on survey" — transparency + opens the door for sales upsell. Unit prices come from the `Settings` collection.

**Form data:** required = name + phone; optional = email (shorter form → more leads).

## 5. SEO strategy (the #1 free acquisition channel)

- **Technical (Next.js):** SSG/ISR, dynamic meta/OG tags, Schema.org structured data (`Product`, `LocalBusiness`, `Article`, `BreadcrumbList`, `FAQPage`), auto `sitemap.xml` + `robots.txt`, Core Web Vitals (`next/image`, lazy-load).
- **Local SEO:** Google Business Profile + Maps, consistent **NAP** (Name-Address-Phone) site-wide, local keyword pages, Google reviews.
- **Content SEO:** intent-targeted articles (research / buy / brand), each with a calculator/quote CTA.

URLs are **Vietnamese-no-accent** (`/san-pham`, `/bao-gia`) for the VN market.

## 6. Quality & non-functional

- **Validation:** Zod on client + server.
- **Reliability:** lead saved to DB before email (email best-effort + retry); friendly 404/500; image fallbacks.
- **Anti-spam:** honeypot + rate-limit on form APIs.
- **Security:** secrets in `.env` (never hardcoded), Payload admin behind auth, HTTPS (Vercel), API rate-limiting.
- **Testing:** 80% coverage target; priority — calculator (unit), form→lead→email (integration), 2 golden flows (Playwright e2e), Lighthouse CI gate per deploy.

## 7. Roadmap

| Milestone | Content | Est. |
|---|---|---|
| M1 Foundation | Next.js + Payload + Postgres + Vercel deploy; Products & Leads schema | ~1 wk |
| M2 Catalog | Home, category + filters, product detail, import 52 SKUs | ~1.5 wk |
| M3 Lead capture | Cost calculator, forms, email noti (Resend), admin mini-CRM | ~1.5 wk |
| M4 SEO & Trust | Schema.org, sitemap, Maps, projects/blog/about pages | ~1 wk |
| M5 Polish | Tests, Lighthouse, Zalo widget, GA4, go-live | ~1 wk |

## 8. Scope boundaries

**In (Phase 1):** lead-gen site (HN), 52-SKU catalog + filters, cost calculator, lead forms, email notify, admin mini-CRM, technical + local SEO, Zalo/GA4/Maps.

**Out (YAGNI):** cart + online payment · realtime inventory · B2B dealer portal (Phase 2) · AR visualizer + online showroom booking (Phase 3) · separate Spring Boot service (Phase 2) · out-of-province shipping · multi-language.

## 9. Evolution path

- **Phase 2 — Dealer Portal (B2B):** tiered wholesale pricing, quote generator, technical library, volume discounts → add a **Spring Boot service reading the shared PostgreSQL** (added when needed, not early).
- **Phase 3 — Virtual Experience:** AR room visualizer, showroom visit booking, "find nearest dealer" map.

Phase 1 architecture is deliberately chosen so these evolve in without a rewrite.
