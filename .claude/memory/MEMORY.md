# Project Memory — Index

> Auto-loaded at SessionStart. One line per memory; read the full file when relevant.
> This system lives in git — see [README](README.md) for how it works.

## Decisions (decision + rationale, durable)
- [0001 — connect actors directly](decisions/0001-connect-actors-directly.md) — link each actor straight to each use case; avoid the `&` grouping syntax that merges nodes
- [0002 — self-contained project memory](decisions/0002-project-memory-self-contained.md) — memory lives in the repo, not wrapped around OMC/ECC
- [0003 — adopt shipwithai Tier 1 harness](decisions/0003-adopt-shipwithai-tier1-harness.md) — CLAUDE.md + docs/architecture.md + pnpm permissions; greenfield → Tier 1 only
- [0004 — trunk-based git-flow](decisions/0004-git-flow-trunk-based.md) — master + short-lived branch-per-task + PR + squash; worktrees isolate parallel agents; NOT classic GitFlow
- [0005 — adopt OneRedOak design-review](decisions/0005-adopt-onredoak-design-review.md) — hybrid: reuse the Playwright-MCP engine, swap standards for FUKIONE principles; SubagentStop hook auto-cleans screenshots
- [0006 — embed Payload backend](decisions/0006-embed-payload-backend.md) — Payload 3 embedded in Next.js; split `(app)`/`(payload)` route groups; 8 collections schema-as-code; scaffold-only (M1)
- [0007 — adopt code review-pr](decisions/0007-adopt-code-review-pr.md) — hybrid: reuse Anthropic's /code-review engine (multi-agent + confidence ≥80 + gh pr comment), inject FUKIONE standards; ships as the /review-pr command
- [0008 — lead funnel route handler](decisions/0008-lead-funnel-route-handler.md) — funnel via `POST /api/leads` (not Server Action/Payload hook): honeypot → Zod → DB-first → best-effort Resend email; both forms; `LeadContext.productId`
- [0009 — async notify, deferred channels](decisions/0009-async-notify-deferred-channels.md) — email sent via `after()` (post-response, best-effort); Zalo stays a MANUAL sales action (no automated channel/fan-out/queue — all YAGNI-deferred)
- [0010 — DB-back catalog repository](decisions/0010-db-back-catalog-repository.md) — catalog reads Payload via `lib/data/catalog.ts` + pure mappers, mapping docs back into existing types; ISR 3600; seed 8 SKUs; productId re-enabled (coerced to number, NaN dropped); mock-data kept as seed source only
- [0011 — SEO + structured data (M4-A)](decisions/0011-seo-structured-data.md) — SITE_URL/BASE_OPEN_GRAPH config, metadataBase + title template + VN-path canonical, app-root sitemap/robots, JSON-LD (LocalBusiness/Product/Breadcrumb) via pure builders + `<JsonLd>`; NAP from mock SETTINGS; build deferred to DB
- [0012 — DB-back Settings global](decisions/0012-db-back-settings.md) — prices/NAP/hours/Zalo read the Payload `settings` global via cached `getSettings()` + props to client components (not Context); `businessHours`→`hours`/`zaloOA`→`zaloUrl`; `isZaloEnabled` per-render; operator edits via /admin; mock kept as seed source
- [0013 — lead-form client Zod validation](decisions/0013-lead-form-client-zod-validation.md) — lead forms validate inline with Zod reusing `leadInputSchema` field validators (no react-hook-form); `lib/leads/forms.ts` + `FieldError`; blur + submit-block, a11y wired, sends parsed/normalized values
- [0014 — projects gallery (M4-B)](decisions/0014-projects-gallery.md) — `/du-an` grid + `/du-an/[slug]` detail completing the scaffolded `Projects` collection (productId→productIds, images {url,alt}, `status` field); gradient fallback; seed status:published; lead CTA on every detail page
- [0015 — about page + Maps (M4-B)](decisions/0015-about-page-maps.md) — `/gioi-thieu` story+trust+showroom map+CTA; reuses `Settings` NAP/mapEmbed; `extractMapSrc` safe-iframe; `ProjectQuoteCta`→shared `LeadCtaSection`; map renders only when `mapEmbed` configured
- [0016 — blog from Articles (M4-B)](decisions/0016-blog-articles.md) — `/tin-tuc` list + `/tin-tuc/[slug]` detail from the `Articles` collection; `lib/data/articles.*`; lexical `body` via Payload `RichText`; tags display-only; seed 3 sample articles. Completes M4-B

## Conventions (conventions + gotchas, durable)
- [english-only-artifacts](conventions/english-only-artifacts.md) — all project files in English; only user-Claude chat is Vietnamese
- [mermaid-no-emoji](conventions/mermaid-no-emoji.md) — no emoji / « » in diagrams (tofu font issue)
- [git-commit-english](conventions/git-commit-english.md) — commit messages in English, Conventional Commits
- [stop-hook-loop-guard](conventions/stop-hook-loop-guard.md) — Stop hook nudging without a loop (stop_hook_active + per-session flag)
- [settings-permission-grant-needs-approval](conventions/settings-permission-grant-needs-approval.md) — adding permission allow-rules needs explicit user approval; merge, don't overwrite settings.json
- [git-flow-agent](conventions/git-flow-agent.md) — agent git workflow: branch-per-task, worktrees for parallel agents, separate review pass, squash-merge
- [where-to-codify-rules](conventions/where-to-codify-rules.md) — always-apply rules go in CLAUDE.md (reaches subagents); memory hook does NOT reach subagents
- [payload-next16-compat](conventions/payload-next16-compat.md) — Payload 3.85 supports Next 16, but tsx CLI breaks on Node 25 → pin Node 22; `--webpack` prod build; graphql `^16`
- [hook-paths-claude-project-dir](conventions/hook-paths-claude-project-dir.md) — settings.json hooks must use `$CLAUDE_PROJECT_DIR/...`, not relative paths (fail from non-root cwd)
- [review-pr-read-files-via-gh-api](conventions/review-pr-read-files-via-gh-api.md) — /review-pr reads PR-head files via `gh api contents?ref=SHA | base64 -d` (not `git show`) for accurate citation line numbers
- [vn-urls-via-next-rewrites](conventions/vn-urls-via-next-rewrites.md) — VN public URLs are next.config.ts rewrites onto English route folders (incl. `/cam-on → /thank-you`); already wired, don't rename folders
- [zod4-payload-no-conflict](conventions/zod4-payload-no-conflict.md) — keep zod@4; Payload isn't in the zod graph (zod@3 is shadcn-CLI tooling only); never passes a schema into Payload
- [vitest-exclude-e2e](conventions/vitest-exclude-e2e.md) — Vitest collects Playwright e2e specs unless `exclude: [...configDefaults.exclude, "e2e/**"]`; otherwise `pnpm test` goes RED
- [vitest4-vi-hoisted](conventions/vitest4-vi-hoisted.md) — Vitest 4 hoists `vi.mock` factories above imports; wrap mock `vi.fn()`s in `vi.hoisted()`
- [nextjs-after-for-background](conventions/nextjs-after-for-background.md) — post-response background work uses `after()` from `next/server` (not `@vercel/functions`); best-effort, not crash-safe; how to mock in Vitest
- [payload-typed-api-data-widening](conventions/payload-typed-api-data-widening.md) — typed Payload API rejects a widened `const data={…}` (status/select/relationship/id); cast `as const`/union, type id maps `number`, coerce rel ids; run `tsc` not just lint+test on Payload writes
- [payload-run-relative-imports](conventions/payload-run-relative-imports.md) — run seed via `tsx --env-file-if-exists` (NOT `payload run`, which silently no-ops the async script → empty DB, exit 0) + relative imports (no `@/` aliases)
- [nextjs-opengraph-no-deep-merge](conventions/nextjs-opengraph-no-deep-merge.md) — App Router REPLACES (not deep-merges) a page's nested `openGraph`/`twitter`/`robots`; spread shared defaults (`BASE_OPEN_GRAPH`) so an override doesn't silently drop og:image
- [playwright-mcp-screenshot-paths](conventions/playwright-mcp-screenshot-paths.md) — MCP screenshots save to the MCP server cwd, not the repo; pass an absolute path into a pre-created dir, then `git clean` them (don't commit)
- [leadformsheet-source-by-context](conventions/leadformsheet-source-by-context.md) — LeadFormSheet sets lead `source` from `context` presence (`context ? "calculator" : "quote"`); pass NO context for a non-calculator quote CTA
- [safe-embed-iframe-validation](conventions/safe-embed-iframe-validation.md) — operator-supplied embeds (mapEmbed) → host-allowlist URL validator → controlled `<iframe>`; never `dangerouslySetInnerHTML`; unit-test bypass vectors
- [payload-lexical-richtext-render](conventions/payload-lexical-richtext-render.md) — render a Payload lexical richText field with the official `RichText` from `@payloadcms/richtext-lexical/react` (JSX, no raw HTML, no typography dep); seed valid editor-state JSON

## Current
- [HANDOFF](HANDOFF.md) — latest WIP state (overwritten each session)
- [sessions/](sessions/) — progress log per day
