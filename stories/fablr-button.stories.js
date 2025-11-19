import { html } from 'lit';
import '../components/fablr-button.js';

// Self-registering story pattern
const meta = { title: 'Fablr Button', component: 'fablr-button' };
const stories = {
  Primary: () => html`<fablr-button label="Primary Button"></fablr-button>`,
  Disabled: () => html`<fablr-button label="Disabled" ?disabled=${true}></fablr-button>`
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });