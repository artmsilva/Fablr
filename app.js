import { LitElement, html, css } from 'lit';
import './stories/index.js'; // ensure stories register

class FablrApp extends LitElement {
  static styles = css`
    :host { display: contents; }
    #sidebar { width: 300px; border-right: 1px solid #e0e0e0; padding: 20px; box-sizing: border-box; }
    #preview { flex-grow: 1; padding: 20px; }
    .story-group { margin-bottom: 16px; }
    .story-title { font-weight: 600; margin-bottom: 8px; }
    .story-item { display: block; background: none; border: none; padding: 6px 0; cursor: pointer; color: #0366d6; text-align: left; }
    .controls { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #eee; }
    .control { margin-bottom: 8px; }
    .control label { display:block; font-size: 0.9rem; margin-bottom: 4px; }
    .control input[type="text"]{ width:100%; padding:6px 8px; }
  `;

  static properties = {
    stories: { type: Array },
    selected: { type: Object },
    currentArgs: { type: Object }
  };

  constructor() {
    super();
    this.stories = window.__FABLR_STORIES__ || [];
    if (this.stories.length) {
      const firstGroup = this.stories[0];
      const firstName = Object.keys(firstGroup.stories)[0];
      this.selected = { groupIndex: 0, name: firstName };
      this.currentArgs = { ...(firstGroup.meta?.args || {}) };
    } else {
      this.selected = null;
      this.currentArgs = {};
    }
  }

  selectStory(groupIndex, name) {
    this.selected = { groupIndex, name };
    const group = this.stories[groupIndex];
    this.currentArgs = { ...(group.meta?.args || {}) };
  }

  onArgChange(key, value) {
    this.currentArgs = { ...this.currentArgs, [key]: value };
  }

  renderControls() {
    if (!this.selected) return html``;
    const group = this.stories[this.selected.groupIndex];
    const argDefs = group.meta?.args || {};
    const keys = Object.keys(argDefs);
    if (!keys.length) return html``;
    return html`
      <div class="controls">
        <h4>Controls</h4>
        ${keys.map(k => {
          const val = this.currentArgs[k];
          if (typeof argDefs[k] === 'boolean' || typeof val === 'boolean') {
            return html`
              <div class="control">
                <label>${k}</label>
                <input type="checkbox" .checked=${!!val} @change=${e => this.onArgChange(k, e.target.checked)} />
              </div>
            `;
          }
          return html`
            <div class="control">
              <label>${k}</label>
              <input type="text" .value=${val ?? ''} @input=${e => this.onArgChange(k, e.target.value)} />
            </div>
          `;
        })}
      </div>
    `;
  }

  renderSidebar() {
    return html`
      <div id="sidebar">
        <h2>Components</h2>
        ${this.stories.map((g, gi) => html`
          <div class="story-group">
            <div class="story-title">${g.meta.title}</div>
            ${Object.keys(g.stories).map(name => html`
              <button class="story-item" @click=${() => this.selectStory(gi, name)}>
                ${name}
              </button>
            `)}
          </div>
        `)}
        ${this.renderControls()}
      </div>
    `;
  }

  renderPreview() {
    if (!this.selected) {
      return html`<div id="preview"><h1>Welcome to Fablr</h1><p>No stories found — add stories in the stories/ folder.</p></div>`;
    }
    const group = this.stories[this.selected.groupIndex];
    const storyFn = group.stories[this.selected.name];
    return html`
      <div id="preview">
        <h3>${group.meta.title} — ${this.selected.name}</h3>
        <div class="story-area">
          ${storyFn(this.currentArgs)}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      ${this.renderSidebar()}
      ${this.renderPreview()}
    `;
  }
}

customElements.define('fablr-app', FablrApp);

const root = document.getElementById('root');
if (root) root.innerHTML = '<fablr-app></fablr-app>';