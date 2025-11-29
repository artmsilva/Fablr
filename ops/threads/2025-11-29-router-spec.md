# Thread: Router Spec

| Field | Value |
| ----- | ----- |
| **Status** | `Done` |
| **Owner** | `codex` |
| **Start Date** | `2025-11-29` |
| **Last Update** | `2025-11-29 00:40 EST` |
| **Related Work** | `docs/specs/router.md`, `src/router.js`, `src/app.js`, `src/utils/url-manager.js` |
| **Links** | `git rev-parse --short HEAD` |

## Objective

Review the existing router implementation against `docs/specs/router.md`, identify gaps (legacy query redirect, route coverage, polyfill, store integration), and propose a concrete implementation plan to land the new URLPattern-based router with backward compatibility.

## Deliverables

- [x] Findings on current router vs. spec coverage with risks.
- [x] Implementation plan with tasks, owners (if applicable), and testing approach.
- [x] Decision on legacy URL handling and copy-link updates (break legacy).

## Timeline

- `2025-11-29 00:07 EST` — **Kickoff**: Read router spec and current router (`src/router.js`, `src/app.js`); noted existing URLPattern usage but missing legacy query redirect and copy-link updates.
- `2025-11-29 00:12 EST` — **Direction change**: User wants no polyfill, no legacy bridge, KISS router, and break old patterns (no migration toggle). Plan needs to reflect clean slate URLs only.
- `2025-11-29 00:25 EST` — **Router updated**: Added playroom/tokens routes, trailing-slash normalization, 404 -> home redirect, removed legacy default-story fallback, and refreshed spec doc to drop polyfill/legacy language. Pending validation.
- `2025-11-29 00:35 EST` — **Validation**: Added pure `matchRoutePath` helper plus node tests (`tests/router.test.js`) using a lightweight test-only URLPattern stub; ran `node --test tests/router.test.js` (pass). Manual browser deep-link checks still pending.
- `2025-11-29 00:40 EST` — **Close-out**: Work merged locally; thread marked done. Manual deep-link smoke in browser still recommended when convenient.

## Current Risks / Blockers

- Potential broken links for legacy query-based URLs (intentional per user direction).

## Hand-off Notes

- Next: finalize review summary and plan tasks for implementation/testing. Validate whether `urlpattern-polyfill` is needed in this repo footprint.

## Outcome (fill in when Done)

- Path-only router shipped locally per spec (no legacy/polyfill), tests added (`tests/router.test.js`), spec updated (`docs/specs/router.md`). Manual deep-link QA still advised.
