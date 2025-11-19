import { html } from 'lit';
import '../components/fablr-input.js';

const meta = { title: 'Fablr Input', component: 'fablr-input', args: { label: 'Name', placeholder: 'Enter name', value: '' } };
const stories = {
  Default: (args) => html`<fablr-input label=${args.label} placeholder=${args.placeholder} .value=${args.value}></fablr-input>`
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });