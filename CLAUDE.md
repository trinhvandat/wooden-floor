# CLAUDE.md — FUKIONE wooden-floor

> Project memory for Claude Code. Read this first when entering the repo.
> Stack/architecture context for a **greenfield** project: code is not scaffolded yet —
> the design lives in `docs/` and `docs/architecture.md`.

## Project

**FUKIONE** — a B2C retail website for wooden flooring, **lead-gen-first** commerce, Phase 1 scoped to Hà Nội. The site builds trust + gives fast quotes → captures leads → sales close via consultation (Zalo/phone). It is **not** a full e-commerce store (no cart, no online payment, no realtime inventory in Phase 1).

- **Type:** Web app (marketing/lead-gen) · **Team:** Solo · **Stage:** Greenfield
- Full product/design context: [`docs/architecture.md`](docs/architecture.md) → links to the full specs in `docs/superpowers/specs/`.

## Stack

| Layer | Tech |
|---|---|
| Framework | **Next.js 14+ App Router** (SSG/ISR for SEO) |
| CMS + API + Admin | **Payload CMS 3**, embedded in the Next.js app (one deploy) |
| Database | **PostgreSQL** (Neon/Supabase free tier) |
| UI | **Tailwind CSS + shadcn/ui** |
| Validation | **Zod** (client + server) |
| Email | **Resend** (lead notifications) |
| Hosting | **Vercel** |
| Language | **TypeScript (strict)** |
| Package manager | **pnpm** |
| Integrations | Zalo OA widget · GA4 · Google Search Console · Business Profile/Maps |

## Architecture (summary)

Modular monolith: a single Next.js deploy with Payload embedded — web pages, the `/admin` panel, and REST/GraphQL APIs all in one app, backed by an owned PostgreSQL database. Deliberately chosen to **evolve** to a Phase-2 Spring Boot service that reads the same DB, without a rewrite. See [`docs/architecture.md`](docs/architecture.md) for the data model, lead flow, and scope boundaries.

## Commands (pnpm)

```bash
pnpm install            # install deps
pnpm dev                # run Next.js + Payload locally
pnpm build              # production build (runs Payload codegen first)
pnpm lint               # eslint
pnpm test               # unit + integration
pnpm test:e2e           # Playwright golden flows
```

> These are the intended commands; wire them up in `package.json` when scaffolding.

## Conventions

- **Language:** All repo artifacts (code, docs, `.claude/**`, commits) in **English**. Vietnamese is only for user↔Claude chat.
- **Commits:** Conventional Commits, English (`feat:`, `fix:`, `chore:`…). Use the `/git-commit` skill.
- **Branching (git-flow):** Trunk-based — `master` is always deployable; **never commit risky work directly to it, branch first** (`feat/*`, `fix/*`, `chore/*`) → PR → squash-merge → delete branch. Parallel agents each use their own git worktree. Review is a separate pass (code-reviewer agent), never self-approve in the authoring context. Full pipeline: `.claude/memory/conventions/git-flow-agent.md` (rationale: `decisions/0004-git-flow-trunk-based.md`).
- **Mermaid diagrams:** No emoji and no `« »` guillemets (tofu-font rendering issue); validate with `mmdc` before committing.
- **Code style:** Many small, focused files; immutable data; validate at boundaries with Zod.

## Testing

Target **80% coverage**, with priority on the highest-risk paths:
1. **Cost calculator** (unit) — a wrong number destroys trust.
2. **Form submit → create lead → email** (integration).
3. **2 golden e2e flows** (Playwright): "calculate cost → leave a lead" and "filter products → view detail".
4. **Lighthouse CI** gate on SEO/Performance per deploy.

## Visual development (design review)

Front-end changes are graded against the project's own design system, not a generic one:
- **Standards:** [`.claude/context/design-principles.md`](.claude/context/design-principles.md) (conversion, trust, VN localization, a11y) and [`.claude/context/style-guide.md`](.claude/context/style-guide.md) (real tokens/fonts/routes). Always consult these for UI work; `globals.css` wins on any token conflict.
- **Quick check after any UI change:** with the dev server running (`cd fukione-web && pnpm dev`), navigate to the affected route via the Playwright MCP, screenshot at **375px first** (mobile-first), compare against the two files above, and check the console for errors.
- **Full review:** run the `/design-review` command (reviews the branch diff vs `master` on the live site) or invoke the `design-review` subagent before finalizing a PR with visual changes. Requires the **Playwright MCP** to be configured.

## Gotchas (read before touching these areas)

- **Prices/unit-costs** (install price, trim estimate, …) live in the Payload **`Settings` collection** — never hardcode them in code.
- **Leads must never be lost:** save the lead to the DB **first**, then send the email as a separate step with retry. Email is best-effort, the DB write is the source of truth.
- **Public URLs are Vietnamese-no-accent** (`/san-pham`, `/bao-gia`, `/dat-lich-khao-sat`) — required for VN SEO; don't "fix" them to English.
- **Payload-generated artifacts** (DB migrations, generated types, the `/admin` UI) are generated — don't hand-edit; change the collection schema instead.
- **Build order:** Payload type codegen runs before the TS/Next build.
- **Secrets** live in `.env` (never committed, never hardcoded); `.env` / `.env.local` are read-only to Claude.

## Scope boundaries (Phase 1 — YAGNI)

In: lead-gen site, 52-SKU catalog with filters, cost calculator, lead forms, email notify, mini-CRM in `/admin`, technical + local SEO, Zalo/GA4/Maps.
**Out (do not build in Phase 1):** cart + online payment, realtime inventory, B2B dealer portal (Phase 2), AR visualizer (Phase 3), a separate Spring Boot service (Phase 2), out-of-province shipping, multi-language.

## Project memory system

This repo carries a self-contained cross-session memory at [`.claude/memory/`](.claude/memory/) (durable `decisions/` + `conventions/`, ephemeral `HANDOFF.md` + `sessions/`), loaded by a SessionStart hook and nudged by a Stop hook. Run the **`/save-memory`** skill when ending a session. See `.claude/memory/README.md`.
