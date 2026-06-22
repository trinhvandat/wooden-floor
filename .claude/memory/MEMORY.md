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

## Current
- [HANDOFF](HANDOFF.md) — latest WIP state (overwritten each session)
- [sessions/](sessions/) — progress log per day
