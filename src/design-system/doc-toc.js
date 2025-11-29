import { css, html, LitElement } from "lit";

class FableDocToc extends LitElement {
  static properties = {
    toc: { type: Array },
  };

  constructor() {
    super();
    this.toc = [];
  }

  static styles = css`
    :host {
      display: block;
      position: sticky;
      top: 24px;
      align-self: start;
      padding: var(--space-4);
      border: 1px solid var(--border-color);
      border-radius: var(--radius, 12px);
      background: var(--bg-secondary);
      box-sizing: border-box;
    }

    h4 {
      margin: 0 0 var(--space-2);
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    a {
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    a:hover {
      color: var(--text-primary);
    }

    a.level-1 {
      margin-left: 0;
    }
    a.level-2 {
      margin-left: 10px;
    }
    a.level-3 {
      margin-left: 20px;
    }
    a.level-4 {
      margin-left: 30px;
    }
    a.level-5 {
      margin-left: 40px;
    }
  `;

  _handleClick(event, entry) {
    event.preventDefault();
    const target = document.getElementById(entry.id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${entry.id}`);
    }
  }

  render() {
    if (!this.toc?.length) return html`<p>No headings found.</p>`;
    return html`
      <h4>On this page</h4>
      <ul>
        ${this.toc.map(
          (entry) => html`
            <li>
              <a
                href="#${entry.id}"
                class=${`level-${entry.level || 1}`}
                @click=${(event) => this._handleClick(event, entry)}
              >
                ${entry.text}
              </a>
            </li>
          `
        )}
      </ul>
    `;
  }
}

customElements.define("fable-doc-toc", FableDocToc);
