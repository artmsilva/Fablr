import { LitElement, html, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { DSLParser } from "../playroom/dsl-parser.js";
import { TokenResolver } from "../playroom/token-resolver.js";
import { getComponentMetadataByComponent } from "@metadata";

export class FablePlayroomPreview extends LitElement {
  static properties = {
    code: { type: String },
    theme: { type: String },
    tokens: { type: Object },
    args: { type: Object },
    selectedNode: { type: Object },
    _renderedHTML: { state: true },
    isLoading: { state: true },
    hasError: { state: true },
    errorMessage: { state: true },
    _warnings: { state: true },
    _overlay: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      position: relative;
    }

    .preview-container {
      height: 100%;
      position: relative;
      overflow: auto;
    }

    .preview-content {
      min-height: 100%;
      padding: var(--space-4);
      background: var(--color-background);
      color: var(--color-text);
      overflow: auto;
    }

    .preview-content [data-playroom-id]:hover {
      outline: 1px dashed var(--color-primary);
      outline-offset: 2px;
    }

    .error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(220, 53, 69, 0.1);
      border: 2px solid var(--color-error);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
    }

    .error-content {
      background: var(--color-background);
      padding: var(--space-4);
      border-radius: var(--border-radius-sm);
      max-width: 80%;
      max-height: 80%;
      overflow: auto;
    }

    .error-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-error);
      margin-bottom: var(--space-2);
    }

    .error-message {
      font-family: monospace;
      font-size: var(--font-size-sm);
      color: var(--color-text);
      white-space: pre-wrap;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--color-background);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      z-index: 5;
    }

    .preview-toolbar {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      display: flex;
      gap: var(--space-1);
      z-index: 15;
    }

    .toolbar-button {
      padding: var(--space-1) var(--space-2);
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      cursor: pointer;
      opacity: 0.8;
      transition: all 0.2s;
    }

    .toolbar-button:hover {
      opacity: 1;
      background: var(--color-primary);
      color: var(--color-primary-text);
      border-color: var(--color-primary);
    }

    .node-highlight {
      position: absolute;
      pointer-events: none;
      border: 2px solid var(--color-primary);
      background: rgba(0, 123, 255, 0.12);
      z-index: 8;
      transition: all 0.2s;
    }

    .preview-content [data-playroom-id].playroom-selected {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      border-radius: var(--border-radius-sm);
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
    }

    .warnings {
      position: absolute;
      bottom: var(--space-2);
      right: var(--space-2);
      max-width: 60%;
      padding: var(--space-2);
      border: 1px solid var(--color-warning-text);
      border-radius: var(--border-radius-sm);
      background: var(--color-warning-background);
      color: var(--color-warning-text);
      font-size: var(--font-size-xs);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }

    .warning + .warning {
      margin-top: var(--space-1);
    }
  `;

  constructor() {
    super();
    this.code = "";
    this.theme = "light";
    this.tokens = {};
    this.args = {};
    this.selectedNode = null;
    this._renderedHTML = "";

    this.parser = new DSLParser();
    this.tokenResolver = new TokenResolver();
    this.isLoading = false;
    this.hasError = false;
    this.errorMessage = "";
    this._nodeIndex = {};
    this._selectedId = null;
    this._lastHighlighted = null;
    this._warnings = [];
    this._overlay = null;
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);

    if (
      changedProperties.has("code") ||
      changedProperties.has("tokens") ||
      changedProperties.has("args")
    ) {
      this._updatePreview();
    }
  }

  async _updatePreview() {
    if (!this.code) {
      this._renderedHTML = "";
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    try {
      // Parse DSL code
      const ast = this.parser.parse(this.code);

      // Build node index for inspector (path -> props/tag)
      this._nodeIndex = {};
       this._warnings = [];
      const indexNode = (node, path) => {
        if (!node || node.type !== "component") return;
        const meta = getComponentMetadataByComponent(node.tagName);
        if (!meta) {
          this._warnings.push(`Unknown component: ${node.tagName}`);
        }
        this._nodeIndex[path] = {
          id: path,
          tagName: node.tagName,
          props: node.props,
          meta,
        };
        if (meta?.args) {
          Object.keys(node.props || {}).forEach((propKey) => {
            if (!meta.args[propKey]) {
              this._warnings.push(
                `Unknown prop "${propKey}" on <${node.tagName}>`
              );
            }
          });
        }
        (node.slots || []).forEach((child, idx) => indexNode(child, `${path}.${idx}`));
      };
      if (Array.isArray(ast)) {
        ast.forEach((node, idx) => indexNode(node, `root.${idx}`));
      }

      // Generate HTML with resolved tokens and args
      const context = {
        tokens: this.tokenResolver.buildTokenObject(),
        args: this.args,
      };

      const html = this.parser.generateHTML(ast, context, "root", true);

      this._renderedHTML = html;

      this.isLoading = false;
      this.hasError = false;
    } catch (error) {
      console.error("Preview update error:", error);
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = error.stack || error.message;
      this._renderedHTML = "";
    }
  }

  _handleRefresh() {
    this._updatePreview();
  }

  _handleCopyHTML() {
    if (this._renderedHTML) {
      navigator.clipboard.writeText(this._renderedHTML);
    }
  }

  _handleClick(event) {
    const target = event.composedPath().find(
      (el) => el instanceof HTMLElement && el.dataset?.playroomId,
    );
    if (!target) {
      this._selectedId = null;
      this._overlay = null;
      this.dispatchEvent(
        new CustomEvent("node-selected", {
          detail: null,
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    const nodeId = target.dataset.playroomId;
    this._selectedId = nodeId;
    this._overlay = this._computeOverlay(target);
    const node = this._nodeIndex[nodeId];
    if (node) {
      this.dispatchEvent(
        new CustomEvent("node-selected", {
          detail: { id: nodeId, tagName: node.tagName, props: this._stringifyProps(node.props) },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  _stringifyProps(props = {}) {
    const toString = (value) => {
      if (typeof value === "string") return value;
      if (value && value.type === "interpolation") {
        return value.parts
          .map((part) => {
            if (part.type === "literal") return part.value;
            if (part.type === "token") return `{token.${part.path}}`;
            if (part.type === "args") return `{args.${part.path}}`;
            if (part.type === "expression") return `{${part.code}}`;
            return "";
          })
          .join("");
      }
      return value == null ? "" : String(value);
    };

    return Object.fromEntries(Object.entries(props).map(([k, v]) => [k, toString(v)]));
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("_selectedId") || changedProps.has("_renderedHTML")) {
      this._applySelectionHighlight();
    }
    if (changedProps.has("_overlay")) {
      this.requestUpdate();
    }
  }

  _applySelectionHighlight() {
    const content = this.shadowRoot.querySelector(".preview-content");
    if (!content) return;
    if (this._lastHighlighted) {
      this._lastHighlighted.classList.remove("playroom-selected");
      this._lastHighlighted = null;
    }
    if (!this._selectedId) return;
    const el = content.querySelector(`[data-playroom-id="${this._selectedId}"]`);
    if (el) {
      el.classList.add("playroom-selected");
      this._lastHighlighted = el;
    }
  }

  _computeOverlay(target) {
    const content = this.shadowRoot.querySelector(".preview-content");
    if (!content || !target) return null;
    const contentRect = content.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    return {
      top: rect.top - contentRect.top + content.scrollTop,
      left: rect.left - contentRect.left + content.scrollLeft,
      width: rect.width,
      height: rect.height,
    };
  }

  render() {
    return html`
      <div class="preview-container" @click=${this._handleClick}>
        <div class="preview-content theme-${this.theme}">
          ${this._renderedHTML
            ? unsafeHTML(this._renderedHTML)
            : html`<div class="placeholder">
                Compose in the editor to see a preview.
              </div>`}
        </div>

      ${this.isLoading
        ? html` <div class="loading-overlay">Loading preview...</div> `
        : ""}
        ${this.hasError
          ? html`
              <div class="error-overlay">
                <div class="error-content">
                  <div class="error-title">Preview Error</div>
                  <div class="error-message">${this.errorMessage}</div>
                </div>
              </div>
            `
          : ""}

        ${this._overlay
          ? html`<div
              class="node-highlight"
              style=${`top:${this._overlay.top}px;left:${this._overlay.left}px;width:${this._overlay.width}px;height:${this._overlay.height}px;`}
            ></div>`
          : ""}

        <div class="preview-toolbar">
          <button class="toolbar-button" @click=${() => this._handleClick({ composedPath: () => [] })}>
            ✖ Clear
          </button>
          <button class="toolbar-button" @click=${this._handleRefresh}>
            🔄 Refresh
          </button>
          <button class="toolbar-button" @click=${this._handleCopyHTML}>
            📋 Copy HTML
          </button>
        </div>

        ${this._warnings.length
          ? html`
              <div class="warnings">
                ${this._warnings.map((w) => html`<div class="warning">${w}</div>`)}
              </div>
            `
          : ""}
      </div>
    `;
  }
}

customElements.define("fable-playroom-preview", FablePlayroomPreview);
