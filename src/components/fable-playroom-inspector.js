import { LitElement, html, css } from "lit";
import { getComponentMetadataByComponent } from "@metadata";

export class FablePlayroomInspector extends LitElement {
  static properties = {
    node: { type: Object },
    _entries: { state: true },
    _warnings: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .inspector {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: var(--space-3);
      gap: var(--space-3);
      overflow: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: var(--font-size-sm);
    }

    .tag {
      font-family: monospace;
      color: var(--color-text-secondary);
    }

    .props {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    input {
      width: 100%;
      padding: var(--space-2);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
    }

    .field button.remove {
      align-self: flex-start;
      padding: var(--space-1) var(--space-2);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      background: var(--color-background-secondary);
      cursor: pointer;
      font-size: var(--font-size-xs);
    }

    button.toolbar {
      padding: var(--space-2);
      border: 1px dashed var(--border-color);
      border-radius: var(--border-radius-sm);
      background: var(--color-background);
      cursor: pointer;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .warnings {
      padding: var(--space-2);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      background: var(--color-warning-background);
      color: var(--color-warning-text);
      font-size: var(--font-size-xs);
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-size-sm);
    }

    .empty {
      color: var(--color-text-secondary);
      text-align: center;
      margin-top: var(--space-6);
      font-size: var(--font-size-sm);
    }
  `;

  constructor() {
    super();
    this.node = null;
    this._entries = [];
    this._warnings = [];
  }

  willUpdate(changedProps) {
    super.willUpdate(changedProps);
    if (changedProps.has("node")) {
      const props = this.node?.props || {};
      this._entries = Object.entries(props).map(([key, value]) => ({ key, value }));
      this._warnings = this._buildWarnings();
    }
  }

  _emitProps() {
    if (!this.node) return;
    const props = {};
    this._entries.forEach(({ key, value }) => {
      const trimmedKey = (key || "").trim();
      if (trimmedKey) {
        props[trimmedKey] = value ?? "";
      }
    });
    this.dispatchEvent(
      new CustomEvent("prop-change", {
        detail: { nodeId: this.node.id, props },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleInputChange(index, field, event) {
    const value = event.target.value;
    const next = [...this._entries];
    next[index] = { ...next[index], [field]: value };
    this._entries = next;
    this._emitProps();
  }

  _removeEntry(index) {
    const next = [...this._entries];
    next.splice(index, 1);
    this._entries = next;
    this._emitProps();
  }

  _addEntry() {
    this._entries = [...this._entries, { key: "", value: "" }];
  }

  _buildWarnings() {
    if (!this.node?.tagName) return [];
    const meta = getComponentMetadataByComponent(this.node.tagName);
    if (!meta) return [`Unknown component: ${this.node.tagName}`];
    const knownProps = new Set(Object.keys(meta.args || {}));
    const warnings = [];
    this._entries.forEach(({ key }) => {
      if (key && !knownProps.has(key)) {
        warnings.push(`Prop "${key}" not in metadata`);
      }
    });
    return warnings;
  }

  _renderField(key, value, index) {
    const isBoolean = value === "true" || value === "false";
    if (isBoolean) {
      return html`
        <label class="toggle">
          <input
            type="checkbox"
            .checked=${value === "true"}
            @change=${(e) =>
              this._handleInputChange(index, "value", {
                target: { value: e.target.checked ? "true" : "false" },
              })}
          />
          <span>${key}</span>
        </label>
      `;
    }
    return html`
      <input
        id=${`prop-${index}`}
        name=${key}
        placeholder="value"
        .value=${value ?? ""}
        @input=${(e) => this._handleInputChange(index, "value", e)}
      />
    `;
  }

  render() {
    if (!this.node) {
      return html`<div class="empty">
        Select an element in the preview to edit its properties.
      </div>`;
    }

    const entries = this._entries;

    return html`
      <div class="inspector">
        <div class="header">
          <div>Properties</div>
          <div class="tag">&lt;${this.node.tagName}&gt;</div>
        </div>

        ${this._warnings.length
          ? html`<div class="warnings">
              ${this._warnings.map((w) => html`<div class="warning">${w}</div>`)}
            </div>`
          : ""}

        <div class="props">
          ${entries.length === 0
            ? html`<div class="empty">No props available.</div>`
            : entries.map(
                ({ key, value }, index) => html`
                  <div class="field">
                    <label for=${`prop-${index}`}>${key || "name"}</label>
                    <input
                      id=${`prop-key-${index}`}
                      name="key"
                      placeholder="prop name"
                      .value=${key}
                      @input=${(e) => this._handleInputChange(index, "key", e)}
                    />
                    ${this._renderField(key, value, index)}
                    <button class="remove" @click=${() => this._removeEntry(index)}>
                      Remove
                    </button>
                  </div>
                `,
              )}
          <button class="toolbar" @click=${this._addEntry}>Add prop</button>
        </div>
      </div>
    `;
  }
}

customElements.define("fable-playroom-inspector", FablePlayroomInspector);
