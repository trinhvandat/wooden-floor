# HANDOFF — feat/design-review-agent — 2026-06-22

## Current goal
Ship an automated **design-review agent** for FUKIONE UI — **done, committed, PR #2 open into master.**

## Done (settled, do not redo)
- **Design-review agent shipped** (hybrid adoption of OneRedOak) — see [[0005-adopt-onredoak-design-review]]. Files: `.claude/agents/design-review.md`, `.claude/commands/design-review.md`, `.claude/context/design-principles.md` + `style-guide.md`; `CLAUDE.md` got a "Visual development" section.
- **Auto-cleanup wired:** `SubagentStop` hook `.claude/hooks/clean-design-review-artifacts.sh` removes throwaway Playwright screenshots; artifacts gitignored (`/*.png`, `.playwright-mcp/`). Tested: cleaned 37 artifacts, tracked files untouched.
- The agent **ran once** this session (user configured Playwright MCP) and produced a fix to `fukione-web/src/app/thank-you/page.tsx` (flex-1 centering + `/#du-an` anchor) — committed.
- **PR #2** opened: `feat/design-review-agent` → `master` — https://github.com/trinhvandat/wooden-floor/pull/2. Per user, the scaffold-ui + design-review lines are treated as **one delivery**, so the PR bundles all 21 commits (full Phase 1 UI build + the design-review tooling).

## In progress / Next steps
- **Review + merge PR #2** into master (squash, per [[0004-git-flow-trunk-based]]).
- **Delete the `/_scratch` route** (`fukione-web/src/app/_scratch/`) before prod — it is a component verification harness, not a shipped page.
- Consider configuring Playwright MCP with `--output-dir /tmp/...` so screenshots never hit the repo at all (optional; the cleanup hook already covers it).

## Settled decisions + rationale
- Design review needs to SEE rendered pages → Playwright MCP; reuse OneRedOak's engine, swap its SaaS-dashboard standards for FUKIONE-specific ones — [[0005-adopt-onredoak-design-review]].
- Earlier-settled: trunk-based git-flow [[0004-git-flow-trunk-based]]; stack = Next.js 14+ / Payload 3 / Postgres / Tailwind v4 / shadcn / Zod / Resend / Vercel; English-only artifacts; mermaid-no-emoji.

## Context to Load (paths only, do NOT paste contents)
- CLAUDE.md (§Visual development)
- .claude/context/design-principles.md
- .claude/context/style-guide.md
- .claude/agents/design-review.md
- .claude/hooks/clean-design-review-artifacts.sh

## Blocked / Needs user input
- None. (Note: `.claude/memory/` IS git-tracked — 15 files. The new `0005-*.md` + `sessions/2026-06-22.md` written this session are untracked-new until the next commit; `git add` them when committing.)
