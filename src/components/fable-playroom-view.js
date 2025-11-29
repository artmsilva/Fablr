import { LitElement, html, css } from "lit";
import "./fable-playroom-inspector.js";
import { DSLParser } from "../playroom/dsl-parser.js";
import "./fable-playroom-inspector.js";

export class FablePlayroomView extends LitElement {
  static properties = {
    _code: { state: true },
    _theme: { state: true },
    _tokens: { state: true },
    _args: { state: true },
    _selectedNode: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      background: var(--color-background);
    }

    .playroom-layout {
      display: grid;
      grid-template-columns: 280px 1fr 320px;
      grid-template-rows: 1fr;
      height: 100vh;
      min-height: 0;
      gap: var(--space-2);
      padding: var(--space-2);
      align-items: stretch;
    }

    .palette-panel {
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      min-height: 0;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .editor-preview-panel {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      height: 100%;
      min-height: 0;
    }

    .editor-container {
      flex: 1;
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .preview-container {
      flex: 1;
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .inspector-panel {
      background: var(--color-background);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      height: 100%;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      padding: var(--space-3);
      background: var(--color-background-secondary);
      border-bottom: 1px solid var(--border-color);
      font-size: var(--font-size-sm);
      font-weight: 600;
    }

    .panel-content {
      flex: 1;
      overflow: hidden;
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .placeholder-icon {
      font-size: 2rem;
      margin-bottom: var(--space-2);
      opacity: 0.5;
    }
  `;

  constructor() {
    super();
    this._code = `<!-- Start composing your UI -->
<fable-card title="Playroom Sample">
  <fable-stack>
    <fable-input label="Name" placeholder="Ada Lovelace"></fable-input>
    <fable-textarea label="Notes" placeholder="Add details"></fable-textarea>
    <fable-select label="Role" value="designer">
      <fable-select-option value="designer">Designer</fable-select-option>
      <fable-select-option value="engineer">Engineer</fable-select-option>
      <fable-select-option value="pm">Product</fable-select-option>
    </fable-select>
    <fable-checkbox label="Subscribe to updates"></fable-checkbox>
    <div style="display: flex; align-items: center; gap: var(--space-2);">
      <fable-button variant="primary">Save</fable-button>
      <fable-icon-button aria-label="Edit">✏️</fable-icon-button>
    </div>
  </fable-stack>
</fable-card>`;
    this._theme = "light";
    this._tokens = {};
    this._args = {};
    this._selectedNode = null;
    this._parser = new DSLParser();
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleStateChange = this._handleStateChange.bind(this);
    window.addEventListener("state-changed", this._handleStateChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("state-changed", this._handleStateChange);
  }

  _handleStateChange(event) {
    // Handle global state changes if needed
  }

  _handleCodeChange(event) {
    this._code = event.detail.value;
  }

  _handleInsertText(event) {
    const detail = event?.detail || {};
    const snippet = detail.snippet || detail.text;
    if (!snippet) return;

    const insertion = snippet.endsWith("\n") ? snippet : `${snippet}\n`;
    const needsNewline = this._code && !this._code.endsWith("\n") ? "\n" : "";
    this._code = `${this._code || ""}${needsNewline}${insertion}`;
  }

  _handleNodeSelected(event) {
    this._selectedNode = event.detail;
  }

  _handleInspectorUpdate(event) {
    const { nodeId, props } = event.detail || {};
    if (!nodeId || !props) return;

    const ast = this._parser.parse(this._code);

    const updateNode = (node, path) => {
      if (!node || node.type !== "component") return;
      if (path === nodeId) {
        node.props = this._normalizeProps(props);
      }
      (node.slots || []).forEach((child, idx) => updateNode(child, `${path}.${idx}`));
    };

    if (Array.isArray(ast)) {
      ast.forEach((node, idx) => updateNode(node, `root.${idx}`));
    }

    this._code = this._parser.generateHTML(ast, {}, "root", false);
  }

  _normalizeProps(props) {
    const normalized = {};
    for (const [key, value] of Object.entries(props)) {
      normalized[key] = this._parser.processInterpolation(value);
    }
    return normalized;
  }

  render() {
    return html`
      <div class="playroom-layout">
        <!-- Component Palette -->
        <div class="palette-panel">
          <fable-playroom-palette
            @component-insert=${this._handleInsertText}
          ></fable-playroom-palette>
        </div>

        <!-- Editor and Preview -->
        <div class="editor-preview-panel">
          <!-- Code Editor -->
          <div class="editor-container">
            <fable-playroom-editor
              .value=${this._code}
              .theme=${this._theme}
              .readOnly=${false}
              @editor-change=${this._handleCodeChange}
              @insert-text=${this._handleInsertText}
            ></fable-playroom-editor>
          </div>

          <!-- Live Preview -->
          <div class="preview-container">
            <fable-playroom-preview
              .code=${this._code}
              .theme=${this._theme}
              .tokens=${this._tokens}
              .args=${this._args}
              @node-selected=${this._handleNodeSelected}
            ></fable-playroom-preview>
          </div>
        </div>

        <!-- Properties Inspector -->
        <div class="inspector-panel">
          <div class="panel-header">Properties</div>
          <div class="panel-content">
            <fable-playroom-inspector
              .node=${this._selectedNode}
              @prop-change=${this._handleInspectorUpdate}
            ></fable-playroom-inspector>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("fable-playroom-view", FablePlayroomView);
