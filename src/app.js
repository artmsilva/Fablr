import { css, html, LitElement } from "lit";
import { PROJECT_NAME, STORIES_KEY, THEME_STORAGE_KEY } from "./config.js";
import "./components/button.js";
import "./components/card.js";
import "./components/input.js";
import "./components/link.js";
import "./components/select.js";
import "./components/checkbox.js";
import "./components/textarea.js";
import "./components/badge.js";
import "./components/icon-button.js";
import "./components/nav-group.js";
import "./components/sidebar.js";
import "./components/stack.js";
import "./components/header.js";
import "./components/preview.js";
import "./components/drawer.js";

class FableApp extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    main {
      display: grid;
      grid-template-columns: 300px 1fr 300px;
      height: 100vh;
      gap: 0;
    }
    main > fable-preview {
      border-right: 1px solid var(--border-color);
    }
    main > fable-nav-group fable-badge {
      margin-left: var(--space-2);
    }
    .theme-toggle {
      position: absolute;
      top: 20px;
      right: 20px;
    }
  `;

  static properties = {
    stories: { type: Array },
    selected: { type: Object },
    currentArgs: { type: Object },
    currentSlots: { type: Object },
    lockedArgs: { type: Object },
    sourceDrawerOpen: { type: Boolean },
  };

  constructor() {
    super();
    this.stories = window[STORIES_KEY] || [];
    this.currentSlots = {};
    this.lockedArgs = {};
    this.sourceDrawerOpen = false;
    this._processStories();
    this._initializeFromURL();
    this._setupPopStateListener();
    this._initializeTheme();
  }

  _initializeTheme() {
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }

  _toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    this.requestUpdate();
  }

  _getDefaultArgs(componentName) {
    const componentClass = customElements.get(componentName);
    if (!componentClass) return {};
    const instance = new componentClass();
    const props = componentClass.properties || {};
    const args = {};
    for (const key in props) {
      if (instance[key] !== undefined) {
        args[key] = instance[key];
      }
    }
    return args;
  }

  _toTitleCase(str) {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  _processStories() {
    // Auto-merge default args from component with meta args
    // Auto-generate title from component name if not provided
    // Auto-extract status from component class
    this.stories.forEach((story) => {
      if (story.meta?.component) {
        const componentClass = customElements.get(story.meta.component);
        const defaultArgs = this._getDefaultArgs(story.meta.component);
        story.meta.args = { ...defaultArgs, ...story.meta.args };

        // Auto-generate title from component name if not specified
        if (!story.meta.title) {
          story.meta.title = this._toTitleCase(story.meta.component);
        }

        // Auto-extract status from component class if not specified
        if (!story.meta.status && componentClass?.status) {
          story.meta.status = componentClass.status;
        }
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._boundPopStateHandler = this._handlePopState.bind(this);
    window.addEventListener("popstate", this._boundPopStateHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this._boundPopStateHandler);
  }

  _setupPopStateListener() {
    // Initial setup for handling browser back/forward
    this._boundPopStateHandler = this._handlePopState.bind(this);
  }

  _handlePopState(_event) {
    this._initializeFromURL();
  }

  _initializeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const storyParam = params.get("story");

    if (storyParam && this.stories.length) {
      // Parse story param: "component-slug/story-slug"
      const [componentSlug, storySlug] = storyParam.split("/");

      if (componentSlug && storySlug) {
        // Find the matching story
        let found = false;
        for (let gi = 0; gi < this.stories.length; gi++) {
          const group = this.stories[gi];
          const titleSlug = this._slugify(group.meta.title);

          if (titleSlug === componentSlug) {
            const storyNames = Object.keys(group.stories);
            for (const name of storyNames) {
              if (this._slugify(name) === storySlug) {
                this.selected = { groupIndex: gi, name };

                // Load args from URL params or defaults
                this.currentArgs = { ...(group.meta?.args || {}) };

                // Override with URL params (excluding 'story' param)
                params.forEach((value, key) => {
                  if (key !== "story") {
                    // Parse boolean values
                    if (value === "true") {
                      this.currentArgs[key] = true;
                    } else if (value === "false") {
                      this.currentArgs[key] = false;
                    } else {
                      this.currentArgs[key] = value;
                    }
                  }
                });

                found = true;
                break;
              }
            }
          }
          if (found) break;
        }

        if (!found) {
          this._setDefaultStory();
        }
      } else {
        this._setDefaultStory();
      }
    } else if (this.stories.length) {
      this._setDefaultStory();
    } else {
      this.selected = null;
      this.currentArgs = {};
    }
  }

  _setDefaultStory() {
    const firstGroup = this.stories[0];
    const firstName = Object.keys(firstGroup.stories)[0];
    this.selected = { groupIndex: 0, name: firstName };
    this.currentArgs = { ...(firstGroup.meta?.args || {}) };
    this.currentSlots = { ...(firstGroup.meta?.slots || {}) };
    this._updateURL(false); // Update URL without pushing to history
  }

  _slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  _updateURL(pushState = true) {
    if (!this.selected) return;

    const group = this.stories[this.selected.groupIndex];
    const componentSlug = this._slugify(group.meta.title);
    const storySlug = this._slugify(this.selected.name);

    // Build query string with story param and all args
    const params = new URLSearchParams();
    params.set("story", `${componentSlug}/${storySlug}`);

    Object.entries(this.currentArgs).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    const url = `?${params.toString()}`;

    if (pushState) {
      window.history.pushState(
        {
          groupIndex: this.selected.groupIndex,
          name: this.selected.name,
          args: this.currentArgs,
        },
        "",
        url
      );
    } else {
      window.history.replaceState(
        {
          groupIndex: this.selected.groupIndex,
          name: this.selected.name,
          args: this.currentArgs,
        },
        "",
        url
      );
    }
  }

  selectStory(groupIndex, name) {
    this.selected = { groupIndex, name };
    const group = this.stories[groupIndex];
    const story = group.stories[name];
    const baseArgs = { ...(group.meta?.args || {}) };

    // If story is an object with args function, compute the args
    if (typeof story === "object" && story.args) {
      this.currentArgs = story.args(baseArgs);
    } else {
      this.currentArgs = baseArgs;
    }

    this.currentSlots = { ...(group.meta?.slots || {}) };

    // Merge meta-level and story-level locked args
    this.lockedArgs = {
      ...(group.meta?.lockedArgs || {}),
      ...(typeof story === "object" ? story.lockedArgs || {} : {}),
    };

    this._updateURL(true);
  }

  onArgChange(key, value) {
    this.currentArgs = { ...this.currentArgs, [key]: value };
    this._updateURL(true);
  }

  onSlotChange(key, value) {
    // Store as string, will be used as-is since slots should be HTML strings
    this.currentSlots = { ...this.currentSlots, [key]: value };
  }

  _slotToString(slotValue) {
    // Convert template result to string for textarea display
    if (typeof slotValue === "string") return slotValue;
    if (slotValue?.strings) {
      // It's a template result - render to string
      const div = document.createElement("div");
      const rendered =
        typeof slotValue._$litType$ !== "undefined"
          ? slotValue
          : html`${slotValue}`;
      import("lit").then(({ render }) => {
        render(rendered, div);
      });
      return div.innerHTML || "";
    }
    return String(slotValue || "");
  }

  _getProcessedSlots() {
    if (!this.selected) return {};
    const group = this.stories[this.selected.groupIndex];
    const slotDefs = group?.meta?.slots || {};
    const processed = {};

    for (const key in slotDefs) {
      processed[key] = this.currentSlots[key] ?? slotDefs[key];
    }

    return processed;
  }

  unlockArg(key) {
    this.lockedArgs = { ...this.lockedArgs, [key]: false };
  }

  toggleSourceDrawer() {
    this.sourceDrawerOpen = !this.sourceDrawerOpen;
  }

  _getStorySource() {
    if (!this.selected) return "";

    const group = this.stories[this.selected.groupIndex];
    const story = group.stories[this.selected.name];
    const storyFn = typeof story === "function" ? story : story.render;

    // Get the function source code
    const source = storyFn.toString();

    // Format it nicely - remove arrow function wrapper
    let formatted = source
      .replace(/^[^(]*\([^)]*\)\s*=>\s*/, "") // Remove arrow function signature
      .trim();

    // Remove outer braces if it's a block
    if (formatted.startsWith("{") && formatted.endsWith("}")) {
      formatted = formatted.slice(1, -1).trim();
    }

    return formatted;
  }

  _copySourceToClipboard() {
    const source = this._getStorySource();
    navigator.clipboard.writeText(source).then(() => {
      // Could show a toast notification here
      console.log("Source code copied to clipboard!");
    });
  }

  renderControlsSidebar() {
    if (!this.selected)
      return html`<fable-sidebar position="right">
        <p>Select a story to see controls</p>
      </fable-sidebar>`;
    const group = this.stories[this.selected.groupIndex];
    const argDefs = group.meta?.args || {};
    const slotDefs = group.meta?.slots || {};
    const argKeys = Object.keys(argDefs);
    const slotKeys = Object.keys(slotDefs);
    if (!argKeys.length && !slotKeys.length)
      return html`<fable-sidebar position="right">
        <p>No controls available</p>
      </fable-sidebar>`;

    // Get component class to check for enum definitions
    const componentName = group.meta?.component;
    const componentClass = componentName
      ? customElements.get(componentName)
      : null;

    return html`
      <fable-sidebar position="right">
        <h3>Controls</h3>
        <fable-stack>
          ${argKeys.map((k) => {
            const val = this.currentArgs[k];
            const isLocked = this.lockedArgs[k] === true;
            const argType = group.meta?.argTypes?.[k];

            // Check for enum in component's static properties
            const propEnum = componentClass?.properties?.[k]?.enum;
            const enumOptions = propEnum || argType?.options;

            // Select/dropdown control (from argTypes or property enum)
            if ((argType?.control === "select" || propEnum) && enumOptions) {
              return html`
                <fable-stack align-items="start">
                  ${isLocked
                    ? html`<fable-button
                        variant="secondary"
                        @click=${() => this.unlockArg(k)}
                      >
                        🔓 Unlock ${k}
                      </fable-button>`
                    : ""}
                  <fable-select
                    label=${k}
                    .value=${val}
                    ?disabled=${isLocked}
                    @change=${(e) => this.onArgChange(k, e.detail)}
                  >
                    ${enumOptions.map(
                      (opt) =>
                        html`<fable-select-option value=${opt}
                          >${opt}</fable-select-option
                        >`
                    )}
                  </fable-select>
                </fable-stack>
              `;
            }

            // Boolean checkbox
            if (typeof argDefs[k] === "boolean" || typeof val === "boolean") {
              return html`
                <fable-stack align-items="start">
                  ${isLocked
                    ? html`<fable-button
                        variant="secondary"
                        @click=${() => this.unlockArg(k)}
                      >
                        🔓 Unlock ${k}
                      </fable-button>`
                    : ""}
                  <fable-checkbox
                    label=${k}
                    ?checked=${!!val}
                    ?disabled=${isLocked}
                    @change=${(e) => this.onArgChange(k, e.detail)}
                  ></fable-checkbox>
                </fable-stack>
              `;
            }

            // Text input (default)
            return html`
              <fable-stack align-items="start">
                ${isLocked
                  ? html`<fable-button
                      variant="secondary"
                      @click=${() => this.unlockArg(k)}
                    >
                      🔓 Unlock ${k}
                    </fable-button>`
                  : ""}
                <fable-input
                  label=${k}
                  .value=${val ?? ""}
                  ?disabled=${isLocked}
                  @input=${(e) => this.onArgChange(k, e.detail)}
                ></fable-input>
              </fable-stack>
            `;
          })}
          ${slotKeys.map((k) => {
            const val = this.currentSlots[k] ?? slotDefs[k];
            // Display template result as readable text
            const displayVal =
              typeof val === "string" ? val : "[HTML Template]";
            return html`
              <fable-textarea
                label=${k}
                .value=${displayVal}
                rows="3"
                ?disabled=${typeof val !== "string"}
                @input=${(e) => this.onSlotChange(k, e.detail)}
              ></fable-textarea>
            `;
          })}
        </fable-stack>
      </fable-sidebar>
    `;
  }

  _getStoryURL(groupIndex, storyName) {
    const group = this.stories[groupIndex];
    const componentSlug = this._slugify(group.meta.title);
    const storySlug = this._slugify(storyName);

    // Get default args for this story
    const defaultArgs = group.meta?.args || {};
    const params = new URLSearchParams();
    params.set("story", `${componentSlug}/${storySlug}`);

    // Add default args to URL
    Object.entries(defaultArgs).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    return `?${params.toString()}`;
  }

  _isActiveStory(groupIndex, storyName) {
    return (
      this.selected &&
      this.selected.groupIndex === groupIndex &&
      this.selected.name === storyName
    );
  }

  _getStatusTooltip(status) {
    const tooltips = {
      alpha: "Early development - APIs may change",
      beta: "Testing phase - Ready for feedback",
      stable: "Production ready - Stable API",
      deprecated: "Being phased out - Use alternatives",
    };
    return tooltips[status] || status;
  }

  renderSidebar() {
    return html`
      <fable-sidebar>
        <h2>Components</h2>
        ${this.stories.map(
          (g, gi) => html`
            <fable-nav-group title=${g.meta.title}>
              ${g.meta.status
                ? html`<fable-badge
                    slot="title"
                    variant=${g.meta.status}
                    size="condensed"
                    tooltip="${this._getStatusTooltip(g.meta.status)}"
                    >${g.meta.status}</fable-badge
                  >`
                : ""}
              ${Object.keys(g.stories).map(
                (name) => html`
                  <fable-link
                    href=${this._getStoryURL(gi, name)}
                    ?active=${this._isActiveStory(gi, name)}
                    @click=${() => this.selectStory(gi, name)}
                  >
                    ${name}
                  </fable-link>
                `
              )}
            </fable-nav-group>
          `
        )}
      </fable-sidebar>
    `;
  }

  renderPreview() {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";

    if (!this.selected) {
      return html`<fable-preview>
        <h1>Welcome to ${PROJECT_NAME}</h1>
        <p>
          No stories found — add components with stories in the components/
          folder.
        </p>
      </fable-preview>`;
    }
    const group = this.stories[this.selected.groupIndex];
    const story = group.stories[this.selected.name];
    const status = group.meta?.status;

    // Support both function and object format
    const storyFn = typeof story === "function" ? story : story.render;

    return html`
      <div>
        <fable-header>
          <h3>${group.meta.title} — ${this.selected.name}</h3>
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            ${status
              ? html`<fable-badge
                  variant=${status}
                  tooltip="${this._getStatusTooltip(status)}"
                  >${status}</fable-badge
                >`
              : ""}
            <fable-icon-button
              aria-label="View source code"
              @click=${() => this.toggleSourceDrawer()}
            >
              🧑‍💻
            </fable-icon-button>
          </div>
        </fable-header>
        <fable-preview>
          <div class="story-area">
            ${storyFn(this.currentArgs, this._getProcessedSlots())}
          </div>
        </fable-preview>
      </div>
    `;
  }

  render() {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    return html`
      <main>
        ${this.renderSidebar()} ${this.renderPreview()}
        ${this.renderControlsSidebar()}

        <fable-icon-button
          class="theme-toggle"
          aria-label="Toggle theme"
          @click=${() => this._toggleTheme()}
        >
          ${isDark ? "☀️" : "🌙"}
        </fable-icon-button>

        <fable-drawer
          ?open=${this.sourceDrawerOpen}
          position="bottom"
          width="50vh"
          @close=${() => (this.sourceDrawerOpen = false)}
        >
          <div slot="title">
            📄 Story Source Code
            <fable-icon-button
              aria-label="Copy source code"
              @click=${() => this._copySourceToClipboard()}
              style="margin-left: var(--space-2);"
            >
              📋
            </fable-icon-button>
          </div>
          <div style="position: relative;">
            <pre
              style="
                background: var(--bg-primary);
                padding: var(--space-4);
                border-radius: var(--radius);
                overflow-x: auto;
                margin: 0;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 0.875rem;
                line-height: 1.5;
                color: var(--text-primary);
                border: 1px solid var(--border-color);
              "
              "><code>${this._getStorySource()}</code></pre>
          </div>
        </fable-drawer>
      </main>
    `;
  }
}

customElements.define("fable-app", FableApp);

const root = document.getElementById("root");
if (root) root.innerHTML = "<fable-app></fable-app>";
