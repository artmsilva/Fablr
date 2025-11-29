import { css, html, LitElement } from "lit";

class FableTokenDetail extends LitElement {
  static properties = {
    token: { type: Object },
    emptyLabel: { type: String, attribute: "empty-label" },
  };

  constructor() {
    super();
    this.token = null;
    this.emptyLabel = "Select a token to inspect.";
  }

  static styles = css`
    :host {
      display: block;
      border: 1px solid var(--border-color);
      border-radius: var(--radius, 12px);
      padding: var(--space-4);
      background: var(--bg-secondary);
      position: sticky;
      top: 24px;
      align-self: start;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      color: inherit;
      box-sizing: border-box;
    }

    .swatch {
      width: 100%;
      height: 64px;
      border-radius: var(--radius, 12px);
      border: 1px solid rgba(0, 0, 0, 0.05);
      background: var(--swatch-color, transparent);
    }

    .meta {
      font-size: 0.9rem;
      color: var(--text-secondary);
      display: grid;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 0.9rem;
    }

    .detail-row code {
      background: rgba(0, 0, 0, 0.08);
      padding: 2px 6px;
      border-radius: 6px;
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    button.copy-btn {
      font-size: 0.85rem;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      background: transparent;
      color: inherit;
    }
  `;

  _renderSwatch(token) {
    if (token?.tokenType !== "color") return null;
    return html`<div class="swatch" data-color=${token.value}></div>`;
  }

  async _copyToClipboard(value) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.warn("Clipboard write failed", error);
    }
  }

  render() {
    if (!this.token) {
      return html`<p>${this.emptyLabel}</p>`;
    }

    const swatchRule =
      this.token.tokenType === "color"
        ? `.token-detail-swatch { --swatch-color: ${this.token.value}; }`
        : "";

    return html`
      ${
        swatchRule
          ? html`<style>
            ${swatchRule}
          </style>`
          : null
      }
      <div
        class=${`swatch ${this.token.tokenType === "color" ? "token-detail-swatch" : ""}`}
      ></div>
      <h3>${this.token.title}</h3>
      <div class="meta">
        <div class="detail-row">
          <span>Value</span>
          <code>${this.token.value}</code>
        </div>
        <div class="detail-row">
          <span>Type</span>
          <code>${this.token.tokenType}</code>
        </div>
        ${
          this.token.attributes?.cssVar
            ? html`
              <div class="detail-row">
                <span>CSS Var</span>
                <code>${this.token.attributes.cssVar}</code>
              </div>
            `
            : null
        }
      </div>
      <p>${this.token.description || "No description"}</p>
      <div class="actions">
        <button
          class="copy-btn"
          @click=${() => this._copyToClipboard(this.token.value)}
        >
          Copy value
        </button>
        ${
          this.token.attributes?.cssVar
            ? html`
              <button
                class="copy-btn"
                @click=${() => this._copyToClipboard(this.token.attributes.cssVar)}
              >
                Copy CSS var
              </button>
            `
            : null
        }
      </div>
    `;
  }
}

customElements.define("fable-token-detail", FableTokenDetail);
