import { css, html, LitElement } from "lit";

class FablrLink extends LitElement {
  static properties = {
    href: { type: String },
    active: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: contents;
    }
    a {
      color: #0366d6;
      text-decoration: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
      display: inline-block;
    }
    a:hover {
      background-color: #f6f8fa;
      text-decoration: underline;
    }
    :host([active]) a {
      background-color: #e1f0ff;
      color: #0366d6;
      font-weight: 600;
    }
  `;

  constructor() {
    super();
    this.href = "";
    this.active = false;
  }

  _handleClick(e) {
    e.preventDefault();

    if (this.href) {
      // Dispatch custom navigation event that the router can listen to
      this.dispatchEvent(
        new CustomEvent("navigate", {
          detail: { href: this.href },
          bubbles: true,
          composed: true,
        })
      );

      // Also update browser history directly
      window.history.pushState({}, "", this.href);

      // Dispatch popstate to trigger router update
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  render() {
    return html`
      <a href=${this.href} @click=${this._handleClick}>
        <slot></slot>
      </a>
    `;
  }
}

customElements.define("fablr-link", FablrLink);
