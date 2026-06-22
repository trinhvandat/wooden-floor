---
name: 0005-adopt-onredoak-design-review
description: adopt OneRedOak's Playwright-MCP design-review agent via a HYBRID approach (reuse engine, replace standards with FUKIONE principles); auto-clean artifacts via a SubagentStop hook
metadata: { type: decision, date: 2026-06-22 }
---
Added an automated **design-review agent** that critiques rendered FUKIONE pages after Claude Code builds UI. Chose to **adopt the community OneRedOak `design-review` workflow** ([github.com/OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows)) rather than build one from scratch or use it unmodified — a **hybrid**: keep its engine, swap its standards for FUKIONE's. Files: `.claude/agents/design-review.md`, `.claude/commands/design-review.md` (the `/design-review` slash command), `.claude/context/design-principles.md` + `style-guide.md`. There is **no first-party Anthropic design-review subagent** — Anthropic only ships the Playwright MCP these workflows depend on.

**Why:** real design review must **see the rendered page** (screenshots at 375/768/1440), not read JSX — so a browser engine (Playwright MCP) is the hard part, and OneRedOak's is battle-tested (7 phases, triage matrix, WCAG 2.1 AA). Rewriting that is wasted effort. But its sample principles are an "S-Tier SaaS Dashboard" checklist — **wrong domain** for a lead-gen, mobile-first, Vietnamese retail site. Hybrid = ~1-2h, inherits the proven engine, and the standards actually fit FUKIONE. Using it unmodified would grade a flooring landing page by dashboard rules; building from scratch would re-derive Playwright orchestration for no gain.

**How to apply:**
- Run `/design-review` (reviews the branch diff vs `master` on the live site) or invoke the `design-review` subagent for a specific route. **Requires the Playwright MCP configured** (`claude mcp add playwright -- npx @playwright/mcp@latest`).
- Start the app first: `cd fukione-web && pnpm dev` (localhost:3000). Review **375px-first** (VN traffic is mobile).
- Standards are the source of truth: `.claude/context/design-principles.md` (conversion/trust/VN/a11y) + `style-guide.md` (tokens mirror `fukione-web/src/app/globals.css` — **globals.css wins** on conflict; never hardcode hex). Editing principles is a taste call the human owns.
- Screenshots are **throwaway**: gitignored (`/*.png` + `.playwright-mcp/`) and auto-removed by the `SubagentStop` hook `.claude/hooks/clean-design-review-artifacts.sh` (deletes only the playwright dir + git-ignored root PNGs; never tracked files).
- The always-apply "Visual development" rule was put in `CLAUDE.md` (not just memory) so it reaches subagents — see [[where-to-codify-rules]]. Related: [[0004-git-flow-trunk-based]], [[settings-permission-grant-needs-approval]] (the hook + permissions are config changes).
