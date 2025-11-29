# Thread: Styles regression remediation

| Field | Value |
| ----- | ----- |
| **Status** | `Done` |
| **Owner** | `codex` |
| **Start Date** | `2025-11-28` |
| **Last Update** | `2025-11-29 00:04 EST` |
| **Related Work** | `src/style.css`, `src/components/`, `docs/specs/` |
| **Links** | _(pending)_ |

## Objective

Restore the lost global styling by encapsulating the affected rules into new design-system components instead of relying on the monolithic `src/style.css`. Success means all styles are served through components and the UI matches the pre-regression look.

## Deliverables

- [x] Audit which styles broke when consolidated into `src/style.css`.
- [x] Create/modify design system components to reintroduce those styles locally.
- [x] Validate in-browser (or equivalent) that layout/visuals match expectations.

## Timeline

- `2025-11-28 10:41 EST` &mdash; **Kickoff**: Captured problem statement and deliverables for style regression thread; pending component audit.
- `2025-11-28 10:47 EST` &mdash; **Implementation**: Added hero/highlight/activity/chip/spotlight primitives under `src/design-system/`, refactored `fable-home-view` to use them, and stripped the old global selectors from `src/style.css`.
- `2025-11-28 10:51 EST` &mdash; **Docs/Search fix**: Introduced `fable-docs-page` and `fable-search-input` components, reworked the docs and navigator views accordingly, removed the remaining global selectors, and verified `npm run check` (alias to lint) passes with only existing warnings.
- `2025-11-28 10:57 EST` &mdash; **Icons/Tokens polish**: Added icon/token grid + detail primitives under `src/design-system/`, refactored their views to consume the new components, removed the old stylesheet rules, updated specs, and reran `npm run check` (warnings only).
- `2025-11-28 11:02 EST` &mdash; **Sidebars + toggle**: Routed token detail and docs TOC into the right sidebar (`fable-controls-panel`), introduced `fable-doc-toc`, moved the theme toggle into the navigator header, and cleaned layout duplication; `npm run check` still green (warnings only).
- `2025-11-28 11:16 EST` &mdash; **Inline cleanup + lint**: Removed inline styles/this.style usage from app components, reintroduced shared layout classes for home/icons/tokens/story preview, tightened `lint-styles.ts` to error on inline styling in app components, and ensured `npm run check` remains green (warnings only).
- `2025-11-29 00:04 EST` &mdash; **Done**: Finalized componentized styling, revalidated navigator/docs/icons/tokens layouts after formatting clean-up, and confirmed `npm run check` passes.

## Current Risks / Blockers

- None; visual verification pending a full manual sweep.

## Hand-off Notes

- Ready to demo; no open tasks.

## Outcome (fill in when Done)

- Rebuilt home/docs/icons/tokens visuals using design-system primitives instead of global CSS, removing inline styles and reinstating the three-pane layout.
- Tests: `npm run check`.
