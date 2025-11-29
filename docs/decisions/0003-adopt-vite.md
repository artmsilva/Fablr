# ADR 0003: Adopt Vite with Import-Map Plugin

- **Date**: 2025-11-29
- **Status**: Proposed
- **Driver**: Codex

## Context

We currently ship a bespoke toolchain:

- `server.ts` implements a homegrown static server with SSE for reloads.
- `build.ts` fingerprints modules manually, rewrites import maps, and copies assets in multiple ad-hoc passes.
- The front-end relies on native import maps defined inside `src/index.html`.

This stack has become fragile. Recent GH Pages deployments failed because the custom build forgot to emit non-JS assets (`router.js`, metadata/config folders, CSS, fonts), resulting in blank pages. The homegrown pipeline now duplicates much of what established bundlers already solve (dev server with HMR, asset graph, relative base paths, hashing, etc.), and every new resource requires touching `build.ts`.

We need a supported toolchain that:

1. Provides a fast dev server with HMR and modern DX.
2. Produces predictable production builds with hashed assets, base-path awareness, and automatic asset inclusion.
3. Preserves our current module specifiers/import-map ergonomics so we can migrate incrementally without rewriting every import.

## Decision

Adopt [Vite](https://vitejs.dev/) as the canonical dev server and build pipeline. We will:

1. Replace `npm run dev` / `npm run build` scripts with `vite` equivalents.
2. Introduce a custom Vite plugin (`vite-plugin-import-map`) that reads our import map (initially from `src/import-map.json` or extracted from `src/index.html`) and registers aliases so both dev and build respect the same specifiers (`@design-system/...`, `@store`, etc.).
3. Configure Vite's `base` option to honor the deployed subdirectory (e.g., `/fable/`), eliminating the need for manual `<base>` management.
4. Remove `build.ts`, `server.ts`, and other bespoke pipeline scripts once Vite parity is verified.

### Plugin Requirements

- Parse a canonical import map file (new `config/import-map.json`).
- For each `imports` entry:
  - If the value is relative (`./`), resolve it relative to project root and register a Vite alias.
  - Support path prefixes ending in `/` by mapping them to directories (e.g., `"@design-system/": "./src/design-system/"`).
- During build, ensure emitted chunks keep deterministic names or hashed equivalents when desired.

### Migration Steps

1. Extract the current `<script type="importmap">` from `src/index.html` into `config/import-map.json`.
2. Create `vite.config.ts` that:
   - Imports the plugin.
   - Sets `base` to `process.env.FABLE_BASE_PATH ?? "/fable/"`.
   - Configures `build.rollupOptions.input` to point at `src/index.html`.
3. Update `package.json` scripts:
   - `"dev": "vite"`
   - `"build": "vite build"`
   - `"preview": "vite preview"`
4. Remove custom Node scripts once Vite parity is confirmed.
5. Document the plugin behavior and base-path env var in `README.md` / `AGENTS.md`.

## Consequences

### Positive

- Removes brittle custom build logic; Vite handles asset graph, CSS, fonts, and static folders automatically.
- Faster dev experience (native ESM dev server with HMR) without maintaining SSE reload logic.
- Consistent base-path handling for GH Pages and future deployments.
- Import-map plugin centralizes alias definitions instead of scattered string replacements.

### Negative / Mitigations

- Initial migration effort: rewriting build/dev scripts and adjusting any non-standard module resolution. Mitigation: keep the plugin backward compatible with existing specifiers so components remain untouched.
- Vite introduces a dependency on Node 18+ (already satisfied) and Rollup under the hood. Mitigation: document requirements in `README`.
- Some Node-only modules (if any) may need browser-friendly shims. Mitigation: audit usage during migration.

## Alternatives Considered

- **Keep custom tooling**: Rejected due to maintenance cost and recurring production regressions (missing assets, base-path bugs).
- **Adopt another bundler (e.g., webpack, Parcel)**: Vite offers faster dev iteration and simpler configuration aligned with modern ESM, matching the project's lightweight philosophy.

## Follow-Up Actions

1. Implement `vite-plugin-import-map` and land `vite.config.ts`.
2. Update deployment workflow to run `vite build`.
3. Delete superseded scripts (`build.ts`, `server.ts`) after verifying parity.
4. Update documentation (`README.md`, `AGENTS.md`) to describe the new workflow and plugin usage.
