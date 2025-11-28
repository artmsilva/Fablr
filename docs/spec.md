# Fable Feature Specification

## Product Vision

- Expand Fable into a full design system workbench where teams can discover components, browse documentation, and prototype compositions collaboratively.
- Prioritize richer stories, powerful discovery/navigation, improved authoring/dev workflows, and first-class surfacing of system primitives (tokens, icons).

## Feature Specifications

### Permutations Engine

- **Goal**: Allow authors to mark stories as permutable so visitors can preview a grid of variant combinations (size × tone × state, etc.).
- **User Experience**:
  - “Permutations” tab beside existing controls.
  - Facet selectors for each axis; render matrix in preview panel with sticky headers.
  - Respect locked args and display derived code snippet per cell.
- **Technical Approach**:
  - Extend story meta with `permutations` definition (axes + allowed values, optional `maxCases` cap).
  - Update story processor to validate and store permutation metadata.
  - New virtualized grid component to render combinations efficiently.
- **Dependencies**: Schema validation (JSON schema or TS types) and tooling to enforce metadata completeness.

### Docs Story Type

- **Goal**: Support MDX-like documentation stories mixing prose, code, and live examples.
- **User Experience**:
  - Navigator shows “Docs” section entries with hero content, outlines, and embedded live canvases.
  - Docs pages can embed existing stories via helper like `renderStory(storyId)`.
- **Technical Approach**:
  - Accept `meta.type = "docs"` referencing Markdown/MDX content.
  - Implement `<fable-docs-page>` to render Markdown (Markdown-it) with Prism.js highlighting and live story embeds.
  - Allow content to be fetched lazily or bundled as template strings.
- **Dependencies**: Content pipeline, syntax highlighting assets, navigator layout tweaks.

### Homepage / Discovery Page

- **Goal**: Provide a landing experience summarizing components, featured docs, and quick filters.
- **User Experience**:
  - Default route (no story) shows discovery grid: hero, “Recently Added/Updated,” taxonomy chips, search spotlight, quick links to tokens/icons.
- **Technical Approach**:
  - Add router state `view=home`.
  - Store metadata like `meta.updatedAt` in app store to power lists.
  - Home view component consumes taxonomy and search data.
- **Dependencies**: Requires taxonomy data and router updates.

### Search & Taxonomy

- **Goal**: Enable scalable discovery by component, tag, platform, status.
- **User Experience**:
  - Persistent search box with instant results (title/type/tags).
  - Sidebar filter drawer for taxonomy facets (component family, status, platform, accessibility).
- **Technical Approach**:
  - Build in-memory index (Fuse.js or custom) seeded from story metadata.
  - Extend meta with `tags`, `status`, `platforms`; define taxonomy in `src/config.js`.
  - Store selectors filter navigator lists based on active facets.
- **Dependencies**: Navigator UI overhaul, lint/tooling to ensure metadata presence.

### Hot Module Reload

- **Goal**: Preserve controls state while reloading only changed modules during development.
- **User Experience**:
  - On save, app re-renders affected component without losing selected story or controls.
- **Technical Approach**:
  - Enhance dev server SSE to emit `module-update` events with changed paths.
  - Browser client dynamically re-imports modules with cache-busting query.
  - Track module graph to know dependents; fallback to full reload on failure.
- **Dependencies**: Module tracking, runtime patch hooks (guarded `customElements.define`), robust error overlay.

### URL Router with URLPattern

- **Goal**: Replace manual query parsing with declarative router supporting nested paths (`/docs/components/button`).
- **User Experience**:
  - Human-friendly URLs, reliable back/forward navigation, shareable permutation URLs (`/components/button/primary?size=large`).
- **Technical Approach**:
  - Introduce router module using `URLPattern`; map patterns to Home, Docs, Story, Playroom views.
  - Update URL manager utilities and ensure history synchronization.
  - Provide migration for legacy query params (detect and redirect).
- **Dependencies**: Store integration, tests ensuring canonical URL generation.

### Playroom-Style Composer

- **Goal**: Integrated playground to compose multiple components and share prototypes.
- **User Experience**:
  - “Playroom” view with split editor/preview, drag palette or type DSL (HTML-like) with autocomplete.
  - Share links serialize layout; “Save as Story” pushes generated code snippet to clipboard or local storage.
- **Technical Approach**:
  - Monaco Editor via CDN for syntax highlighting and IntelliSense backed by component metadata.
  - DSL parser (HTML + limited JS expressions) rendered inside sandboxed iframe.
  - Palette metadata derived from story/component schema; tokens available for suggestions.
- **Dependencies**: Component schema registry, router route (`/playroom`), storage for saved layouts.

### Design Tokens Support

- **Goal**: Surface colors, typography, spacing as first-class citizens with documentation and live inspection.
- **User Experience**:
  - “Tokens” docs page with swatches, copy buttons, usage guidance.
  - Controls and Playroom auto-complete token names; permutations can reference token sets.
- **Technical Approach**:
  - Store tokens in JSON (e.g., `design-system/tokens.json`) and sync to CSS variables.
  - Build `<fable-token-table>` to render token categories and live previews; read computed styles to stay in sync.
  - Expose tokens to Playroom/autocomplete via shared data module.
- **Dependencies**: Token source of truth, build script to regenerate CSS + docs.

### Icons Documentation

- **Goal**: Gallery of system icons with names, usage guidance, downloadable SVGs.
- **User Experience**:
  - Grid view with search, size/background toggles, copy-to-clipboard, per-icon detail linking to docs story.
- **Technical Approach**:
  - Import icons from `design-system/icons/*.svg`; auto-generate manifest with metadata.
  - Build `<fable-icon-gallery>` with virtualization for large sets.
  - Provide `npm run icons:sync` script to rebuild manifest from source SVGs.
- **Dependencies**: Integrates with taxonomy (Foundations > Icons) and search index.

## Cross-Cutting Considerations

- **Shared Metadata Schema (ADR 0001)**: Adopt the schema defined in `docs/decisions/0001-shared-metadata-schema.md`, covering component stories, docs entries, tokens, and icons. All features consume the centralized registry, and dev-time validation (JSON Schema + TypeScript types) ensures required fields (`id`, `title`, taxonomy info, timestamps, permutations config) are always present.
- **Persistence (Greenfield)**: Manage URL/localStorage formats for the current iteration only—breaking older links/schemas is acceptable per ADR 0002, but document material changes.
- **Performance**: Virtualization for large grids (permutations, icons). Debounce search queries.
- **Accessibility**: Keyboard/focus management, semantic headings for new views (home, docs, playroom).
- **Rollout Strategy**: Phase delivery—foundation (schema/router), discovery/search, rich stories (permutations/docs), primitives (tokens/icons), then Playroom.
