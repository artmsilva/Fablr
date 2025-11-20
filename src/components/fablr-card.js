import { css, html, LitElement } from "lit";

class FablrCard extends LitElement {
  static status = "stable";

  static properties = {
    title: { type: String },
  };

  static styles = css`
    :host {
      display: inline-grid;
      margin-bottom: var(--space-4);
      border: 1px solid var(--border-color);
      padding: var(--space-4);
      border-radius: var(--space-2);
      background: var(--bg-primary);
      box-shadow: 0 1px 2px var(--shadow-color);
      font-family: var(--font-stack);
    }
    .title {
      font-weight: 600;
      margin-bottom: var(--space-2);
      font-size: var(--font-body);
      color: var(--text-primary);
    }
    .content {
      color: var(--text-secondary);
      font-size: var(--font-body);
    }
  `;

  constructor() {
    super();
    this.title = "";
  }

  render() {
    return html`
      ${this.title ? html`<div class="title">${this.title}</div>` : ""}
      <div class="content"><slot></slot></div>
    `;
  }
}

customElements.define("fablr-card", FablrCard);

// Stories
const meta = {
  component: "fablr-card",
  args: { title: "Card Title" },
  slots: {
    default: "This is a card content.",
  },
};
const stories = {
  Default: (args, slots) =>
    html`<fablr-card title=${args.title}
      >${slots?.default ?? "This is a card content."}</fablr-card
    >`,
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
