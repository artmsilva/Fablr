import { html } from "lit";
import "../components/fablr-button.js";

const meta = {
  title: "Fablr Button",
  component: "fablr-button",
  args: { label: "Primary Button", disabled: false },
};
const stories = {
  Primary: (args) =>
    html`<fablr-button
      label=${args.label}
      ?disabled=${args.disabled}
    ></fablr-button>`,
  Disabled: (_args) =>
    html`<fablr-button
      label="Disabled Button"
      ?disabled=${true}
    ></fablr-button>`,
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
