# Docs Story Type Spec

## Overview

Introduce a documentation-first story mode so teams can ship narrative content (overview, guidance, live examples) alongside component stories without leaving Fable.

## Goals

1. Allow authors to create docs entries with Markdown/MDX-like content.
2. Embed live stories within docs for interactive samples.
3. Provide navigable structure (headings, outline, hero).
4. Support rich components (callouts, token tables, props tables).

### Non-Goals

- Full MDX compiler; start with Markdown + custom shortcodes.
- External CMS integration.

## User Journeys

- *Designer*: Reads “Button Guidelines” doc with rationale, anatomy, and interactive stories inline.
- *Engineer*: Jumps from docs to implementation details and copies sample usage.
- *Writer*: Updates docs text without touching component code (optional `.md` files).

## UX Breakdown

- Navigator gets a “Docs” grouping with subsections (Foundations, Components, Patterns).
- Docs page layout: hero (title, summary, status pill), sticky outline, main content column, contextual TOC.
- Embedded story blocks show live component plus code snippet toggle.

```mermaid
flowchart LR
    subgraph Nav[Navigator]
        DocsNode[Docs Section]
        DocEntry[Button Guidelines]
    end
    subgraph Page[Docs Page Layout]
        Hero[Hero Header]
        subgraph Main[Content Column]
            Section1[Intro Copy]
            LiveStory1[Live Story Embed]
            Callout[Do/Don't Callouts]
            Section2[Accessibility Guidance]
        end
        Outline[Sticky Outline]
    end
    Nav --> Page
    Hero --> Main
    Main --> Outline
    LiveStory1 --> ControlsPanel[Controls Drawer (optional)]
```

## Content Pipeline

- Support two authoring modes:
  1. **Inline Template**: `meta.type = "docs"` + `meta.content = markdown` string.
  2. **External Markdown**: `meta.contentUrl = "./docs/button.md"`, fetched at runtime (dev server handles CORS).
- Markdown parser: Markdown-it with plugins for anchors, table of contents, custom containers.
- Shortcodes: `:::story button--primary :::` to embed story canvas; `:::token color.background :::` to render token tables.

## Technical Design

- **Components**
  - `<fable-docs-page>`: orchestrates hero, outline, markdown rendering.
  - `<fable-docs-outline>`: builds TOC from headings.
  - `<fable-docs-callout>`: custom callout block for warnings/info.
- **Rendering Flow**
  1. Navigator selects docs entry.
  2. App loads markdown (if remote) and caches by URL hash.
  3. Markdown parsed to HTML; custom renderer intercepts `story` shortcode and mounts `<fable-story-canvas story-id="">`.
  4. Outline component scans headings and sets up scrollspy.
- **Theming**
  - Docs page inherits system theme; callouts and code blocks use design tokens.
- **Performance**
  - Lazy-load Markdown parser + Prism only on docs routes.
  - Use `IntersectionObserver` to defer mounting of live stories until scrolled into view.

## Dependencies

- Router updates (docs route paths).
- Story registry to map `storyId` string to actual render function.
- Prism.js for syntax highlighting (import via CDN).

## Risks

- **Parsing complexity**: MDX-level syntax may be requested later → keep parser modular for upgrade.
- **Bundle size**: Markdown + Prism may add weight → lazy-load modules and leverage HTTP caching.
- **Authorship**: Writers editing `.md` need preview workflow → provide `npm run docs:preview` linking to dev server route.

## Milestones

1. Metadata schema + parser integration.
2. Docs page components (hero, outline, markdown renderer).
3. Story embed + shortcode system.
4. Content authoring tooling (linting, preview).
