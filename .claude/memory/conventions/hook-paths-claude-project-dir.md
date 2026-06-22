---
name: hook-paths-claude-project-dir
description: settings.json hook commands must use "$CLAUDE_PROJECT_DIR/.claude/hooks/..." not relative paths, or they fail when a hook runs from a non-root cwd
metadata: { type: convention, date: 2026-06-22 }
---
Hook commands in `.claude/settings.json` must reference scripts via the
`$CLAUDE_PROJECT_DIR` env var, not a repo-relative path.

**Why:** the four hooks used `bash .claude/hooks/<name>.sh` (relative). When a hook fires with
a working directory other than the repo root — e.g. after Claude `cd`s into a subdir like
`fukione-web/` during a session — bash can't find the script and the Stop hook dies with
`bash: .claude/hooks/remind-save.sh: No such file or directory`. The file was never missing;
the cwd was wrong.

**How to apply:** write hook commands as
`bash "$CLAUDE_PROJECT_DIR/.claude/hooks/<name>.sh"`. Claude Code sets `CLAUDE_PROJECT_DIR`
to the repo root for every hook, so the path resolves regardless of cwd. Fixed for all four
hooks (PreToolUse / SessionStart / Stop / SubagentStop). Verify by running the script from a
subdir with `CLAUDE_PROJECT_DIR` exported.
