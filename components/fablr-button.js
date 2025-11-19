import { LitElement, html, css } from 'lit';

class FablrButton extends LitElement {
  static properties = {
    label: { type: String },
    disabled: { type: Boolean },
  };

  static styles = css`
    button {
      border: 1px solid #ccc;
      background-color: #f0f0f0;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    button:hover {
      background-color: #e0e0e0;
    }
    button:disabled {
      background-color: #f5f5f5;
      color: #aaa;
      cursor: not-allowed;
    }
  `;

  constructor() {
    super();
    this.label = 'Button';
    this.disabled = false;
  }

  render() {
    return html` <button ?disabled=${this.disabled}>${this.label}</button> `;
  }
}

customElements.define('fablr-button', FablrButton);