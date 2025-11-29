import { css, html, LitElement } from "lit";

class FableFilterChips extends LitElement {
  static properties = {
    chips: { type: Array },
    active: { type: String },
  };

  constructor() {
    super();
    this.chips = [];
    this.active = "all";
  }

  static styles = css`
    :host {
      display: block;
    }

    .chip-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      border: 1px solid var(--border-color);
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 0.85rem;
      background: var(--bg-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
    }

    .chip[aria-pressed="true"] {
      background: var(--primary-color);
      color: #fff;
      border-color: var(--primary-color);
    }

    .chip-count {
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 999px;
      background: color-mix(in srgb, #000 20%, transparent);
      color: inherit;
    }
  `;

  _handleClick(value) {
    this.active = value;
    this.dispatchEvent(
      new CustomEvent("chip-select", {
        detail: { value },
        bubbles: true,
        composed: true,
      })
    );
  }

  get totalCount() {
    return this.chips.reduce((acc, chip) => acc + (chip.count || 0), 0);
  }

  render() {
    const chips = [{ id: "all", label: "All", count: this.totalCount }, ...this.chips];
    return html`
      <div class="chip-group">
        ${chips.map(
          (chip) => html`
            <button
              class="chip"
              type="button"
              aria-pressed=${this.active === chip.id}
              @click=${() => this._handleClick(chip.id)}
            >
              <span>${chip.label}</span>
              <span class="chip-count">${chip.count}</span>
            </button>
          `
        )}
      </div>
    `;
  }
}

customElements.define("fable-filter-chips", FableFilterChips);
