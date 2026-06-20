# Project Memory — Index

> Auto-loaded at SessionStart. One line per memory; read the full file when relevant.
> This system lives in git — see [README](README.md) for how it works.

## Decisions (decision + rationale, durable)
- [0001 — connect actors directly](decisions/0001-connect-actors-directly.md) — link each actor straight to each use case; avoid the `&` grouping syntax that merges nodes
- [0002 — self-contained project memory](decisions/0002-project-memory-self-contained.md) — memory lives in the repo, not wrapped around OMC/ECC

## Conventions (conventions + gotchas, durable)
- [english-only-artifacts](conventions/english-only-artifacts.md) — all project files in English; only user-Claude chat is Vietnamese
- [mermaid-no-emoji](conventions/mermaid-no-emoji.md) — no emoji / « » in diagrams (tofu font issue)
- [git-commit-english](conventions/git-commit-english.md) — commit messages in English, Conventional Commits
- [stop-hook-loop-guard](conventions/stop-hook-loop-guard.md) — Stop hook nudging without a loop (stop_hook_active + per-session flag)

## Current
- [HANDOFF](HANDOFF.md) — latest WIP state (overwritten each session)
- [sessions/](sessions/) — progress log per day
