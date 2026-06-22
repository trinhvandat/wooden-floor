#!/usr/bin/env bash
# SubagentStop hook — remove throwaway design-review artifacts so they never
# pollute the repo or need manual cleanup. Fires whenever any subagent finishes;
# it is a no-op unless design-review artifacts are actually present.
#
# Safe by construction: it only ever deletes
#   1. the .playwright-mcp/ output+log directory, and
#   2. root-level *.png that git ALREADY treats as ignored (our /*.png rule).
# It never touches tracked files or assets under fukione-web/.
set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
[ -n "$ROOT" ] || exit 0
cd "$ROOT" || exit 0

removed=0

# 1) Playwright MCP output/trace directory
if [ -d ".playwright-mcp" ]; then
  rm -rf ".playwright-mcp" && removed=$((removed + 1))
fi

# 2) Root-level PNG screenshots that git considers ignored (throwaway only)
for f in *.png; do
  [ -e "$f" ] || continue                 # skip the literal glob when no match
  if git check-ignore -q -- "$f"; then    # delete only if git already ignores it
    rm -f "$f" && removed=$((removed + 1))
  fi
done

[ "$removed" -gt 0 ] && echo "[design-review] cleaned $removed throwaway artifact(s)."
exit 0
