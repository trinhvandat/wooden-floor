<div align="center">

# FUKIONE — Wooden Floor

**A lead-gen-first retail website for wooden flooring.** Build trust, give an instant quote, capture the lead — sales close over Zalo/phone.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Payload CMS](https://img.shields.io/badge/Payload-3-000000?logo=payloadcms&logoColor=white)](https://payloadcms.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)

</div>

---

FUKIONE is a B2C wooden-flooring retail site for Hà Nội (Phase 1). It is a **lead machine, not a store** — the goal is to turn organic search traffic into qualified leads, not to process online payments. The competitive edge is **SEO + speed + lead conversion**.

> **Not in Phase 1 (by design):** shopping cart, online payment, realtime inventory, B2B dealer portal, multi-language.

## Why it's built this way

- **Lead-gen, not e-commerce** — every page funnels toward one action: leave a phone number. A lead is saved to the database **first**, then the notification email is a best-effort, post-response step — so a lead is never lost to an email outage.
- **One deploy, owned data** — a modular monolith: a single Next.js app with **Payload CMS embedded** (public pages, the `/admin` panel, and REST/GraphQL APIs) on an owned PostgreSQL database. No SaaS lock-in for the content or the leads.
- **Built to evolve** — the schema and boundaries are chosen so a Phase-2 Spring Boot service can read the same PostgreSQL without a rewrite. Pay for that complexity only when it's needed.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, SSG/ISR for SEO) |
| CMS · API · Admin | **Payload CMS 3**, embedded in the Next.js app |
| Database | **PostgreSQL** (Neon) |
| UI | **Tailwind CSS 4 + shadcn/ui** |
| Validation | **Zod** (client + server) |
| Email | **Resend** (best-effort lead notifications) |
| Language · PM | **TypeScript (strict)** · **pnpm** |
| Hosting | **Vercel** |
| Integrations | Zalo OA · GA4 · Google Search Console · Business Profile/Maps |

## What's inside

- **Catalog** — wooden-floor SKUs with client-side filters (color, thickness, waterproof, room, price), DB-backed via a typed repository.
- **Cost calculator** — area × price + install + trim, with an always-visible "final price depends on survey" disclaimer. Prices are operator-managed in `/admin`, never hardcoded.
- **Lead capture** — both forms post to `POST /api/leads` → honeypot → Zod → DB-first → best-effort Resend email → `/cam-on`.
- **Mini-CRM** — leads land in the Payload `/admin` panel (new → contacted → quoted → won/lost).
- **Technical + local SEO** — `metadataBase`, canonical (Vietnamese public URLs), a dynamic `sitemap.xml` + `robots.txt`, and JSON-LD (LocalBusiness · Product · BreadcrumbList).
- **Operator-editable config** — prices, NAP, business hours, and the Zalo OA URL all live in the Payload Settings global.

## Quick start

The app lives in [`fukione-web/`](fukione-web/). You need **Node 22**, **pnpm**, and a **PostgreSQL** database (Neon free tier works).

```bash
git clone https://github.com/trinhvandat/wooden-floor.git
cd wooden-floor/fukione-web

pnpm install

# Configure the environment (see the table below)
cp .env.example .env        # then fill in DATABASE_URL + PAYLOAD_SECRET

pnpm seed                   # seed the catalog + Settings into the DB
pnpm dev                    # → http://localhost:3000  (admin at /admin)
```

First visit to `/admin` prompts you to create the initial admin user.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (use the Neon **pooled** endpoint + `?sslmode=require`) |
| `PAYLOAD_SECRET` | ✅ | Long random string for Payload (e.g. `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | ✅ (prod) | Public origin for canonical URLs / sitemap / JSON-LD (falls back to localhost in dev) |
| `RESEND_API_KEY` | optional | Lead-notification email; if unset, leads still save and the email is skipped |
| `LEAD_NOTIFY_EMAIL` | optional | Inbox that receives a notification per new lead |

> `.env` is never committed. See [`fukione-web/.env.example`](fukione-web/.env.example).

## Commands

Run from `fukione-web/`:

```bash
pnpm dev          # Next.js + Payload locally
pnpm build        # production build (Payload codegen → next build)
pnpm seed         # idempotent seed: catalog + Settings global
pnpm test         # unit + integration (Vitest)
pnpm test:e2e     # Playwright golden flows
pnpm lint         # ESLint
```

## Project structure

```
.
├── fukione-web/            # the Next.js + Payload app
│   ├── src/app/(app)/      # public site (Vietnamese URLs via next.config rewrites)
│   ├── src/app/(payload)/  # /admin panel + REST/GraphQL APIs
│   ├── src/collections/    # Payload schema (Products, Leads, …)
│   ├── src/lib/data/       # typed repositories over Payload (catalog, settings)
│   └── src/seed.ts         # idempotent DB seed
├── docs/                   # architecture + design specs/plans
└── .claude/                # project memory, conventions, agents
```

## Documentation

- **[`docs/architecture.md`](docs/architecture.md)** — data model, lead flow, scope boundaries, and the Phase-2/3 evolution path.
- **[`CLAUDE.md`](CLAUDE.md)** — stack, conventions, and gotchas (the source of truth for contributors).
- **[`docs/superpowers/specs/`](docs/superpowers/specs/)** & **[`plans/`](docs/superpowers/plans/)** — per-feature design + implementation records.

## Status

Phase 1, Hà Nội. Foundation, catalog, lead capture, and technical SEO are in place and verified end-to-end. Next up: trust/content pages (projects, about, blog), conversion polish, and go-live instrumentation (GA4, Lighthouse CI).

---

<div align="center">
<sub>Solo project · Conventional Commits · trunk-based git-flow · all repo artifacts in English.</sub>
</div>
