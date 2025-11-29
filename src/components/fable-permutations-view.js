import { getSelectedPermutation, selectPermutation } from "@store";
import { html, LitElement } from "lit";
import "@design-system/card.js";
import "@design-system/stack.js";
import "@design-system/button.js";
import "@design-system/badge.js";
import "@design-system/checkbox.js";

export class FablePermutationsView extends LitElement {
  static properties = {
    blueprint: { type: Object },
    selection: { type: Object },
    _filters: { state: true },
    _lastCopiedId: { state: true },
  };

  constructor() {
    super();
    this.blueprint = null;
    this.selection = getSelectedPermutation();
    this._filters = new Map();
    this._lastCopiedId = null;
  }

  createRenderRoot() {
    return this;
  }

  willUpdate(changed) {
    if (changed.has("blueprint")) {
      this._filters = new Map();
    }
  }

  _toggleFilter(axisId, valueId) {
    const next = new Map(this._filters);
    const current = new Set(next.get(axisId) || []);
    if (current.has(valueId)) {
      current.delete(valueId);
    } else {
      current.add(valueId);
    }
    if (current.size) {
      next.set(axisId, current);
    } else {
      next.delete(axisId);
    }
    this._filters = next;
  }

  _filteredCases() {
    if (!this.blueprint?.cases?.length) return [];
    if (!this._filters.size) return this.blueprint.cases;
    return this.blueprint.cases.filter((entry) => {
      for (const [axisId, values] of this._filters.entries()) {
        if (!values.size) continue;
        if (!values.has(entry.selection[axisId])) {
          return false;
        }
      }
      return true;
    });
  }

  _isSelected(entry) {
    if (!this.selection) return false;
    return Object.entries(entry.selection).every(
      ([axisId, valueId]) => this.selection[axisId] === valueId
    );
  }

  _handleApply(entry) {
    selectPermutation(entry.selection);
  }

  async _handleCopy(entry) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entry.args, null, 2));
      this._lastCopiedId = entry.id;
      setTimeout(() => {
        if (this._lastCopiedId === entry.id) {
          this._lastCopiedId = null;
          this.requestUpdate();
        }
      }, 1500);
    } catch {
      // Ignore clipboard failures
    }
  }

  render() {
    if (!this.blueprint || !this.blueprint.axes?.length) {
      const warning =
        this.blueprint?.warnings?.[0] || "No permutations available for this component.";
      return html`<fable-card title="Permutations (Auto)">
        <p>${warning}</p>
      </fable-card>`;
    }

    const cases = this._filteredCases();
    const summary = `${this.blueprint.axes.length} axes · ${this.blueprint.cases.length} cases`;

    return html`
      <fable-card title="Permutations (Auto)">
        <fable-stack>
          <div><strong>${summary}</strong></div>
          ${this.blueprint.axes.map(
            (axis) => html`
              <div>
                <h4>${axis.label}</h4>
                <fable-stack align-items="start">
                  ${axis.values.map(
                    (value) => html`
                      <fable-checkbox
                        label=${value.label}
                        ?checked=${this._filters.get(axis.id)?.has(value.id) || false}
                        @change=${() => this._toggleFilter(axis.id, value.id)}
                      ></fable-checkbox>
                    `
                  )}
                </fable-stack>
              </div>
            `
          )}
          ${
            this.blueprint.warnings?.length ? html`<p>${this.blueprint.warnings.join(" ")}</p>` : ""
          }
          <fable-stack>
            ${
              cases.length
                ? cases.map(
                    (entry) => html`
                    <fable-card title=${entry.label || "Permutation"}>
                      <fable-stack>
                        <div>
                          Confidence ${Math.round(entry.confidence * 100)}%
                          ${
                            this._isSelected(entry)
                              ? html`<fable-badge variant="info"
                                >Selected</fable-badge
                              >`
                              : ""
                          }
                        </div>
                        <fable-button
                          variant="secondary"
                          @click=${() => this._handleApply(entry)}
                        >
                          Apply
                        </fable-button>
                        <fable-button
                          variant="secondary"
                          @click=${() => this._handleCopy(entry)}
                        >
                          ${this._lastCopiedId === entry.id ? "Copied!" : "Copy args"}
                        </fable-button>
                      </fable-stack>
                    </fable-card>
                  `
                  )
                : html`<p>No permutations match the current filters.</p>`
            }
          </fable-stack>
        </fable-stack>
      </fable-card>
    `;
  }
}

customElements.define("fable-permutations-view", FablePermutationsView);
