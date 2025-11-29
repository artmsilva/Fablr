import { css, html, LitElement, svg } from "lit";

class FableIconDetail extends LitElement {
  static properties = {
    icon: { type: Object },
    emptyLabel: { type: String, attribute: "empty-label" },
  };

  constructor() {
    super();
    this.icon = null;
    this.emptyLabel = "Select an icon to view details.";
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
      box-sizing: border-box;
      min-height: 200px;
      color: inherit;
    }

    .icon-preview {
      font-size: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2);
      border-radius: var(--radius, 12px);
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      width: 64px;
      height: 64px;
    }

    .icon-preview svg {
      width: 32px;
      height: 32px;
      fill: currentColor;
    }

    .meta {
      display: grid;
      gap: 6px;
      margin: var(--space-3, 12px) 0;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    button.copy-btn {
      font-size: 0.8rem;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: transparent;
      cursor: pointer;
      color: inherit;
    }
  `;

  _renderIcon(icon) {
    return svg`<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d=${icon?.svgPath || ""}></path>
    </svg>`;
  }

  async _copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.warn("Clipboard write failed", error);
    }
  }

  render() {
    if (!this.icon) {
      return html`<p>${this.emptyLabel}</p>`;
    }

    const svgMarkup = `<svg viewBox="0 0 24 24"><path d="${this.icon.svgPath}"></path></svg>`;
    return html`
      <div class="icon-preview">${this._renderIcon(this.icon)}</div>
      <h3>${this.icon.title}</h3>
      ${this.icon.description ? html`<p>${this.icon.description}</p>` : null}
      <div class="meta">
        <div><strong>Style:</strong> ${this.icon.style || "default"}</div>
        ${this.icon.tags?.length ? html`<div><strong>Tags:</strong> ${this.icon.tags.join(", ")}</div>` : null}
      </div>
      <div class="actions">
        <button class="copy-btn" @click=${() => this._copyToClipboard(this.icon.svgPath)}>
          Copy path
        </button>
        <button class="copy-btn" @click=${() => this._copyToClipboard(svgMarkup)}>Copy SVG</button>
      </div>
    `;
  }
}

customElements.define("fable-icon-detail", FableIconDetail);
