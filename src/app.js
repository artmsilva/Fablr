import { css, html, LitElement } from "lit";
import "./components/fablr-button.js";
import "./components/fablr-card.js";
import "./components/fablr-input.js";
import "./components/fablr-link.js";
import "./components/fablr-select.js";
import "./components/fablr-checkbox.js";
import "./components/fablr-textarea.js";
import "./components/fablr-badge.js";
import "./components/fablr-icon-button.js";

class FablrApp extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    main {
      display: grid;
      grid-template-columns: 250px 1fr 300px;
      height: 100vh;
      gap: 0;
    }
    #sidebar {
      border-right: 1px solid var(--border-color);
      padding: 20px;
      background-color: var(--bg-secondary);
      overflow-y: auto;
    }
    #preview {
      padding: 20px;
      border-right: 1px solid var(--border-color);
      background-color: var(--bg-primary);
    }
    .theme-toggle {
      position: absolute;
      top: 20px;
      right: 20px;
    }
    .preview-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .preview-header h3 {
      margin: 0;
    }

    #controls-sidebar {
      padding: 20px;
      overflow-y: auto;
      background-color: var(--bg-secondary);
    }
    .story-group {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .story-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    fablr-link {
      display: block;
    }
    .controls {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .control {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .control fablr-button {
      align-self: flex-start;
    }
  `;

  static properties = {
    stories: { type: Array },
    selected: { type: Object },
    currentArgs: { type: Object },
    currentSlots: { type: Object },
    lockedArgs: { type: Object },
  };

  constructor() {
    super();
    this.stories = window.__FABLR_STORIES__ || [];
    this.currentSlots = {};
    this.lockedArgs = {};
    this._processStories();
    this._initializeFromURL();
    this._setupPopStateListener();
    this._initializeTheme();
  }

  _initializeTheme() {
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem("fablr-theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }

  _toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("fablr-theme", newTheme);
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
    this.currentSlots = { ...this.currentSlots, [key]: value };
  }

  unlockArg(key) {
    this.lockedArgs = { ...this.lockedArgs, [key]: false };
  }

  renderControlsSidebar() {
    if (!this.selected)
      return html`<div id="controls-sidebar">
        <p>Select a story to see controls</p>
      </div>`;
    const group = this.stories[this.selected.groupIndex];
    const argDefs = group.meta?.args || {};
    const slotDefs = group.meta?.slots || {};
    const argKeys = Object.keys(argDefs);
    const slotKeys = Object.keys(slotDefs);
    if (!argKeys.length && !slotKeys.length)
      return html`<div id="controls-sidebar">
        <p>No controls available</p>
      </div>`;

    // Get component class to check for enum definitions
    const componentName = group.meta?.component;
    const componentClass = componentName
      ? customElements.get(componentName)
      : null;

    return html`
      <div id="controls-sidebar">
        <h3>Controls</h3>
        <div class="controls">
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
                <div class="control">
                  ${isLocked
                    ? html`<fablr-button
                        variant="secondary"
                        @click=${() => this.unlockArg(k)}
                        style="font-size: 0.8em; margin-bottom: 4px;"
                      >
                        🔓 Unlock ${k}
                      </fablr-button>`
                    : ""}
                  <fablr-select
                    label=${k}
                    .value=${val}
                    .options=${enumOptions}
                    ?disabled=${isLocked}
                    @change=${(e) => this.onArgChange(k, e.detail)}
                  ></fablr-select>
                </div>
              `;
            }

            // Boolean checkbox
            if (typeof argDefs[k] === "boolean" || typeof val === "boolean") {
              return html`
                <div class="control">
                  ${isLocked
                    ? html`<fablr-button
                        variant="secondary"
                        @click=${() => this.unlockArg(k)}
                        style="font-size: 0.8em; margin-bottom: 4px;"
                      >
                        🔓 Unlock ${k}
                      </fablr-button>`
                    : ""}
                  <fablr-checkbox
                    label=${k}
                    ?checked=${!!val}
                    ?disabled=${isLocked}
                    @change=${(e) => this.onArgChange(k, e.detail)}
                  ></fablr-checkbox>
                </div>
              `;
            }

            // Text input (default)
            return html`
              <div class="control">
                ${isLocked
                  ? html`<fablr-button
                      variant="secondary"
                      @click=${() => this.unlockArg(k)}
                      style="font-size: 0.8em; margin-bottom: 4px;"
                    >
                      🔓 Unlock ${k}
                    </fablr-button>`
                  : ""}
                <fablr-input
                  label=${k}
                  .value=${val ?? ""}
                  ?disabled=${isLocked}
                  @input=${(e) => this.onArgChange(k, e.detail)}
                ></fablr-input>
              </div>
            `;
          })}
          ${slotKeys.map((k) => {
            const val = this.currentSlots[k] ?? slotDefs[k];
            return html`
              <div class="control">
                <fablr-textarea
                  label=${k}
                  .value=${val}
                  rows="3"
                  @input=${(e) => this.onSlotChange(k, e.detail)}
                ></fablr-textarea>
              </div>
            `;
          })}
        </div>
      </div>
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

  renderSidebar() {
    return html`
      <div id="sidebar">
        <h2>Components</h2>
        ${this.stories.map(
          (g, gi) => html`
            <div class="story-group">
              <div class="story-title">${g.meta.title}</div>
              ${Object.keys(g.stories).map(
                (name) => html`
                  <fablr-link
                    href=${this._getStoryURL(gi, name)}
                    ?active=${this._isActiveStory(gi, name)}
                    @click=${() => this.selectStory(gi, name)}
                  >
                    ${name}
                  </fablr-link>
                `
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  renderPreview() {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";

    if (!this.selected) {
      return html`<div id="preview">
        <fablr-icon-button
          class="theme-toggle"
          aria-label="Toggle theme"
          @click=${() => this._toggleTheme()}
        >
          ${isDark ? "☀️" : "🌙"}
        </fablr-icon-button>
        <h1>Welcome to Fablr</h1>
        <p>
          No stories found — add components with stories in the components/
          folder.
        </p>
      </div>`;
    }
    const group = this.stories[this.selected.groupIndex];
    const story = group.stories[this.selected.name];
    const status = group.meta?.status;

    // Support both function and object format
    const storyFn = typeof story === "function" ? story : story.render;

    const statusTooltips = {
      alpha: "Early development - APIs may change",
      beta: "Testing phase - Ready for feedback",
      stable: "Production ready - Stable API",
      deprecated: "Being phased out - Use alternatives",
    };

    return html`
      <div id="preview">
        <fablr-icon-button
          class="theme-toggle"
          aria-label="Toggle theme"
          @click=${() => this._toggleTheme()}
        >
          ${isDark ? "☀️" : "🌙"}
        </fablr-icon-button>
        <div class="preview-header">
          <h3>${group.meta.title} — ${this.selected.name}</h3>
          ${status
            ? html`<fablr-badge
                variant=${status}
                tooltip="${statusTooltips[status] || status}"
                >${status}</fablr-badge
              >`
            : ""}
        </div>
        <div class="story-area">
          ${storyFn(this.currentArgs, this.currentSlots)}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <main>
        ${this.renderSidebar()} ${this.renderPreview()}
        ${this.renderControlsSidebar()}
      </main>
    `;
  }
}

customElements.define("fablr-app", FablrApp);

const root = document.getElementById("root");
if (root) root.innerHTML = "<fablr-app></fablr-app>";
