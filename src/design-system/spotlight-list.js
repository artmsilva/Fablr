import { css, html, LitElement } from "lit";

class FableSpotlightList extends LitElement {
  static properties = {
    items: { type: Array },
    actionLabel: { type: String, attribute: "action-label" },
  };

  constructor() {
    super();
    this.items = [];
    this.actionLabel = "Open";
  }

  static styles = css`
    :host {
      display: block;
    }

    .spotlight-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 8px;
    }

    .spotlight-item {
      border: 1px dashed var(--border-color);
      border-radius: 12px;
      padding: var(--space-3, 12px) var(--space-4, 16px);
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: var(--bg-secondary);
    }

    .spotlight-title {
      font-size: 0.95rem;
      margin: 0;
    }

    .spotlight-description {
      margin: 0;
      color: var(--text-secondary);
    }

    .spotlight-link {
      align-self: flex-start;
      text-decoration: none;
      font-weight: 600;
      color: var(--primary-color);
    }
  `;

  render() {
    return html`
      <ul class="spotlight-list">
        ${this.items.map(
          (item) => html`
            <li class="spotlight-item">
              <strong class="spotlight-title">Search “${item.query}”</strong>
              <p class="spotlight-description">${item.description}</p>
              <a class="spotlight-link" href=${item.href || "#"}>${this.actionLabel}</a>
            </li>
          `
        )}
      </ul>
    `;
  }
}

customElements.define("fable-spotlight-list", FableSpotlightList);
