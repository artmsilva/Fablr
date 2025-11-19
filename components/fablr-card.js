import { LitElement, html, css } from 'lit';

class FablrCard extends LitElement {
  static properties = {
    title: { type: String }
  };

  static styles = css`
    :host { display: block; }
    .card { border: 1px solid #e6e6e6; padding: 16px; border-radius: 8px; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
    .title { font-weight: 600; margin-bottom: 8px; }
    .content { color: #444; }
  `;

  constructor() {
    super();
    this.title = '';
  }

  render() {
    return html`
      <div class="card">
        ${this.title ? html`<div class="title">${this.title}</div>` : ''}
        <div class="content"><slot></slot></div>
      </div>
    `;
  }
}

customElements.define('fablr-card', FablrCard);