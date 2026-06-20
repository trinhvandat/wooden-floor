# Project Memory

A memory system that **lives in the repo** to: (1) help Claude/AI agents catch up on work
across sessions, and (2) help newcomers onboard quickly. Everything is plain markdown,
version-controlled.

> Note: all project artifacts are written in English (see
> `conventions/english-only-artifacts.md`). The user-Claude conversation may be in Vietnamese,
> but files are not.

## Structure

| Path | Lifetime | Purpose |
|---|---|---|
| `MEMORY.md` | Continuously updated | **Index** — one line per memory, auto-loaded at session start |
| `decisions/` | Durable, append-only | Architecture/design decisions + **rationale** (ADR-lite) |
| `conventions/` | Durable | Project conventions + gotchas encountered |
| `HANDOFF.md` | Ephemeral, overwritten | WIP state: what is in progress, the next step |
| `sessions/` | Append, per day | Per-session progress summaries |

## How it works

- **Session start:** the `.claude/hooks/load-memory.sh` (SessionStart) hook injects
  `MEMORY.md` + `HANDOFF.md`, then asks Claude to read the files listed under "Context to
  Load".
- **Session end:** the `.claude/hooks/remind-save.sh` (Stop) hook nudges once if there are
  unsaved changes → run the `/save-memory` skill to distill the four content types above.

## For newcomers

Read in order: `MEMORY.md` (overview) → `decisions/` (why things are the way they are) →
`conventions/` (rules to follow). Skip `HANDOFF.md` / `sessions/` if you only need to
understand the project.

## Writing rules
- 1 file = 1 fact. Small files, kebab-case names.
- `decisions/` is append-only — if a decision changes, add a new file; do not edit the old one.
- Every memory added/changed → update one line in `MEMORY.md`.
