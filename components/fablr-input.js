import { LitElement, html, css } from 'lit';

class FablrInput extends LitElement {
  static properties = {
    label: { type: String },
    placeholder: { type: String },
    value: { type: String }
  };

  static styles = css`
    :host { display: block; }
    label { display: block; font-size: 0.9rem; margin-bottom: 6px; color: #333; }
    input { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
  `;

  constructor() {
    super();
    this.label = '';
    this.placeholder = '';
    this.value = '';
  }

  render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ''}
      <input
        .value=${this.value}
        placeholder=${this.placeholder}
        @input=${e => { this.value = e.target.value; this.dispatchEvent(new CustomEvent('input', { detail: this.value })); }}
      />
    `;
  }
}

customElements.define('fablr-input', FablrInput);