import { css, html, LitElement } from "lit";

class FableTokenGroups extends LitElement {
  static properties = {
    groups: { type: Array },
    activeId: { type: String, attribute: "active-id" },
    emptyLabel: { type: String, attribute: "empty-label" },
  };

  constructor() {
    super();
    this.groups = [];
    this.activeId = null;
    this.emptyLabel = "No tokens available.";
  }

  static styles = css`
    :host {
      display: block;
    }

    .token-group {
      margin-bottom: var(--space-5, 24px);
    }

    .token-group h2 {
      margin: 0 0 var(--space-3, 12px);
      font-size: 1.1rem;
    }

    .token-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-4, 16px);
    }

    .token-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius, 12px);
      padding: var(--space-4, 16px);
      background: var(--bg-secondary);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: var(--space-2, 8px);
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    }

    .token-card.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--primary-color) 40%, transparent);
    }

    .swatch {
      width: 100%;
      height: 64px;
      border-radius: var(--radius, 12px);
      border: 1px solid rgba(0, 0, 0, 0.05);
      background: var(--swatch-color, transparent);
    }

    .token-card h3 {
      margin: 0;
      font-size: 1rem;
    }

    .value {
      font-size: 0.9rem;
      color: var(--text-secondary);
      word-break: break-all;
    }

    .meta {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
  `;

  _handleSelect(token) {
    this.dispatchEvent(
      new CustomEvent("token-select", {
        detail: { token },
        bubbles: true,
        composed: true,
      })
    );
  }

  _renderSwatch(token) {
    if (token.tokenType !== "color") return null;
    return html`<div class="swatch" data-color=${token.value}></div>`;
  }

  render() {
    if (!this.groups.length) {
      return html`<p>${this.emptyLabel}</p>`;
    }

    const swatchRules = this.groups
      .flatMap((group) => group.tokens)
      .filter((token) => token.tokenType === "color")
      .map((token) => `.token-swatch-${token.id} { --swatch-color: ${token.value}; }`)
      .join("\n");

    return html`
      ${
        swatchRules
          ? html`<style>
            ${swatchRules}
          </style>`
          : null
      }
      ${this.groups.map(
        (group) => html`
          <section class="token-group">
            <h2>${group.name}</h2>
            <div class="token-grid">
              ${group.tokens.map(
                (token) => html`
                  <article
                    class="token-card ${token.id === this.activeId ? "active" : ""}"
                    @click=${() => this._handleSelect(token)}
                  >
                    <div
                      class=${`swatch ${token.tokenType === "color" ? `token-swatch-${token.id}` : ""}`}
                    ></div>
                    <h3>${token.title}</h3>
                    <div class="value">${token.value}</div>
                    <div class="meta">
                      ${token.description || token.tokenType}
                    </div>
                  </article>
                `
              )}
            </div>
          </section>
        `
      )}
    `;
  }
}

customElements.define("fable-token-groups", FableTokenGroups);
