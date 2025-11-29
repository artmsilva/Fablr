import { css, html, LitElement } from "lit";

class FableSearchInput extends LitElement {
  static properties = {
    value: { type: String },
    placeholder: { type: String },
  };

  constructor() {
    super();
    this.value = "";
    this.placeholder = "Search";
    this._handleInput = this._handleInput.bind(this);
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .search-input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid var(--border-color, #e0e0e0);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #111);
      font-size: 0.9rem;
      box-sizing: border-box;
      outline: none;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 20%, transparent);
    }
  `;

  _handleInput(event) {
    this.value = event.target.value;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <input
        class="search-input"
        type="search"
        .value=${this.value}
        placeholder=${this.placeholder}
        @input=${this._handleInput}
      />
    `;
  }
}

customElements.define("fable-search-input", FableSearchInput);
