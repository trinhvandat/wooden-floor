---
name: playwright-mcp-screenshot-paths
description: Playwright MCP screenshots save relative to the MCP server cwd (not the repo) — pass an absolute path into a pre-created dir, then clean up
metadata: { type: convention, date: 2026-06-25 }
---
`mcp__playwright__browser_take_screenshot` with a bare/relative `filename` (e.g. `shot.png`) writes
to the **MCP server's own working directory**, which is NOT the repo — the file is then unreadable
via `Read` and `find` won't locate it under the project.

**How to apply** for the CLAUDE.md "quick check after any UI change":
1. `mkdir -p <repo>/fukione-web/tmp-shots` first (the MCP won't create missing dirs — it ENOENTs).
2. Pass an **absolute** `filename` under that dir, e.g.
   `/Users/.../fukione-web/tmp-shots/bao-gia-1440.png`.
3. `Read` the absolute path to view it.
4. Clean up before committing: `git clean -fdx fukione-web/tmp-shots` (screenshots are throwaway;
   never commit them). The `design-review` subagent has its own SubagentStop cleanup hook — see
   [[0005-adopt-onredoak-design-review]]; this note is for ad-hoc inline checks done in the main loop.

Also: start `pnpm dev` detached (`(pnpm dev > /tmp/x.log 2>&1 &)`) and poll
`curl -sf localhost:3000` until ready before navigating; stop it afterward via the PID printed in
the dev log.
