---
allowed-tools: Grep, LS, Read, Edit, MultiEdit, Write, NotebookEdit, WebFetch, TodoWrite, WebSearch, BashOutput, KillBash, ListMcpResourcesTool, ReadMcpResourceTool, mcp__context7__resolve-library-id, mcp__context7__get-library-docs, mcp__playwright__browser_close, mcp__playwright__browser_resize, mcp__playwright__browser_console_messages, mcp__playwright__browser_handle_dialog, mcp__playwright__browser_evaluate, mcp__playwright__browser_file_upload, mcp__playwright__browser_install, mcp__playwright__browser_press_key, mcp__playwright__browser_type, mcp__playwright__browser_navigate, mcp__playwright__browser_navigate_back, mcp__playwright__browser_navigate_forward, mcp__playwright__browser_network_requests, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_drag, mcp__playwright__browser_hover, mcp__playwright__browser_select_option, mcp__playwright__browser_tab_list, mcp__playwright__browser_tab_new, mcp__playwright__browser_tab_select, mcp__playwright__browser_tab_close, mcp__playwright__browser_wait_for, Bash, Glob
description: Run a FUKIONE design review of the pending UI changes on the current branch (vs master)
---

You are running a **FUKIONE design review** of the changes on the current branch. FUKIONE is a lead-gen-first wooden-flooring retail site (Hà Nội, Phase 1). Review against the project's own design system, mobile-first.

GIT STATUS:

```
!`git status`
```

FILES MODIFIED (vs master):

```
!`git diff --name-only master... 2>/dev/null || git diff --name-only HEAD`
```

COMMITS ON THIS BRANCH:

```
!`git log --no-decorate master.. 2>/dev/null | head -50`
```

DIFF CONTENT:

```
!`git diff --merge-base master 2>/dev/null || git diff HEAD`
```

OBJECTIVE:
1. Read `.claude/context/design-principles.md` and `.claude/context/style-guide.md` — these define what "good" means for FUKIONE.
2. Make sure a dev server is reachable. The app lives in `fukione-web/`; start it with `cd fukione-web && pnpm dev` (`http://localhost:3000`) if needed.
3. Invoke the `design-review` subagent to comprehensively review the diff above on the **live** site (Playwright MCP), covering: conversion/lead-gen clarity, the cost-calculator disclaimer, the two golden flows, responsiveness at 375/768/1440px, WCAG 2.1 AA, Vietnamese localization, and robustness/edge cases.

If the diff is empty (e.g. you are on master, or changes are uncommitted), review the routes the user names, or the routes implied by uncommitted/working-tree changes.

Your final reply must contain the markdown design review report and nothing else.
