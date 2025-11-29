import { css, html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

class FableDocsPage extends LitElement {
  static properties = {
    section: { type: String },
    title: { type: String },
    description: { type: String },
    content: { type: String },
    toc: { type: Array },
  };

  constructor() {
    super();
    this.section = "";
    this.title = "";
    this.description = "";
    this.content = "";
    this.toc = [];
    this._handleHashChange = this._handleHashChange.bind(this);
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-stack, "Inter", system-ui);
      padding: var(--space-6, 32px);
      box-sizing: border-box;
    }

    .layout {
      width: 100%;
      margin: 0;
      line-height: 1.6;
      display: block;
    }

    .doc-body {
      width: 100%;
      max-width: none;
    }

    .eyebrow {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary);
      margin: 0 0 var(--space-2);
    }

    h1,
    h2,
    h3 {
      color: var(--text-heading, var(--text-primary));
      margin-top: var(--space-5, 24px);
      margin-bottom: var(--space-2, 8px);
    }

    pre {
      background: var(--bg-secondary);
      padding: var(--space-3, 16px);
      border-radius: var(--radius, 12px);
      overflow-x: auto;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("hashchange", this._handleHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("hashchange", this._handleHashChange);
  }

  firstUpdated() {
    this._scrollToHash();
  }

  updated(changedProps) {
    if (changedProps.has("content")) {
      this.updateComplete.then(() => this._scrollToHash());
    }
  }

  _handleHashChange() {
    this._scrollToHash({ smooth: false });
  }

  _scrollToHash({ smooth = true } = {}) {
    const hash = window.location.hash?.replace("#", "");
    if (!hash) return;
    this._scrollToId(hash, { smooth, syncHash: false });
  }

  _scrollToId(id, { smooth = true, syncHash = true } = {}) {
    if (!id) return;
    const target = this.renderRoot?.querySelector(`#${CSS.escape(id)}`);
    if (target) {
      target.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
      if (syncHash) {
        history.replaceState(null, "", `#${id}`);
      }
    }
  }

  _handleTocClick(event, entry) {
    event.preventDefault();
    this._scrollToId(entry.id, { smooth: true, syncHash: true });
  }

  render() {
    return html`
      <article class="layout">
        <div class="doc-body">
          <header>
            ${this.section ? html`<p class="eyebrow">${this.section}</p>` : null}
            ${this.title ? html`<h1>${this.title}</h1>` : null}
            ${this.description ? html`<p class="summary">${this.description}</p>` : null}
          </header>
          <section class="content">${unsafeHTML(this.content || "")}</section>
        </div>
      </article>
    `;
  }
}

customElements.define("fable-docs-page", FableDocsPage);
