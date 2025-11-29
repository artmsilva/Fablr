# Thread: Adopt Vite ADR

| Field | Value |
| ----- | ----- |
| **Status** | `Done` |
| **Owner** | `codex` |
| **Start Date** | `2025-11-29` |
| **Last Update** | `2025-11-29 04:30 EST` |
| **Related Work** | `docs/decisions/0003-adopt-vite.md`, `build.ts`, `server.ts` |
| **Links** | _tbd_ |

## Objective

Document an Architectural Decision to replace the bespoke Node build/dev server with Vite, including a plugin to preserve import-map driven resolution so the rest of the codebase can migrate incrementally without bundler churn.

## Deliverables

- [x] Create ADR describing the context, decision, and consequences of adopting Vite.
- [x] Capture follow-up tasks for implementing the plugin and migrating scripts.

## Timeline

- `2025-11-29 04:20 EST` &mdash; **Kickoff**: Opened thread to author ADR detailing the shift from custom build tooling to Vite with an import-map aware plugin.
- `2025-11-29 04:30 EST` &mdash; **ADR drafted**: Added `docs/decisions/0003-adopt-vite.md` documenting the rationale, plugin requirements, migration plan, and follow-up tasks.

## Current Risks / Blockers

- None.

## Hand-off Notes

- Pending ADR draft.

## Outcome (fill in when Done)

- ADR 0003 accepted: Fable will replace the custom dev/build scripts with Vite plus a bespoke import-map plugin; follow-up tasks captured in the decision document.
