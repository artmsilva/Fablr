import { css, html, LitElement, svg } from "lit";

class FableIconGrid extends LitElement {
  static properties = {
    icons: { type: Array },
    activeId: { type: String, attribute: "active-id" },
    emptyLabel: { type: String, attribute: "empty-label" },
  };

  constructor() {
    super();
    this.icons = [];
    this.activeId = null;
    this.emptyLabel = "No icons available.";
  }

  static styles = css`
    :host {
      display: block;
      color: inherit;
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: var(--space-3, 12px);
    }

    .icon-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius, 12px);
      padding: var(--space-3, 12px);
      background: var(--bg-secondary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2, 8px);
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      color: inherit;
      font: inherit;
    }

    .icon-card.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary-color) 40%, transparent);
    }

    .icon-card svg {
      width: 32px;
      height: 32px;
      fill: currentColor;
    }

    .icon-card strong {
      font-size: 0.9rem;
    }

    button.icon-card {
      border: none;
      background: none;
    }
  `;

  _renderIcon(icon) {
    return svg`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d=${icon.svgPath || ""}></path>
    </svg>`;
  }

  _handleSelect(icon) {
    this.dispatchEvent(
      new CustomEvent("icon-select", {
        detail: { icon },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.icons.length) {
      return html`<p>${this.emptyLabel}</p>`;
    }

    return html`
      <div class="icon-grid">
        ${this.icons.map(
          (icon) => html`
            <button
              type="button"
              class="icon-card ${icon.id === this.activeId ? "active" : ""}"
              @click=${() => this._handleSelect(icon)}
            >
              ${this._renderIcon(icon)}
              <strong>${icon.title}</strong>
            </button>
          `
        )}
      </div>
    `;
  }
}

customElements.define("fable-icon-grid", FableIconGrid);
