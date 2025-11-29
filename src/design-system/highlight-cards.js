import { css, html, LitElement } from "lit";

class FableHighlightCards extends LitElement {
  static properties = {
    cards: { type: Array },
  };

  constructor() {
    super();
    this.cards = [];
  }

  static styles = css`
    :host {
      display: block;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--space-3, 12px);
    }

    .card {
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: var(--space-4, 16px);
      background: var(--bg-secondary);
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 160px;
    }

    .card-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
    }

    .card-title {
      margin: 0;
      font-size: 1.1rem;
    }

    .card-description {
      margin: 0;
      flex: 1;
      color: var(--text-secondary);
    }

    .card-link {
      align-self: flex-start;
      text-decoration: none;
      font-weight: 600;
      color: var(--primary-color);
    }
  `;

  render() {
    return html`
      <div class="cards-grid">
        ${this.cards.map(
          (card) => html`
            <article class="card">
              <span class="card-label">${card.accent}</span>
              <h3 class="card-title">${card.title}</h3>
              <p class="card-description">${card.description}</p>
              <a class="card-link" href=${card.href || "#"}>Open</a>
            </article>
          `
        )}
      </div>
    `;
  }
}

customElements.define("fable-highlight-cards", FableHighlightCards);
