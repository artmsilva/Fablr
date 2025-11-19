import { html } from "lit";
import "../components/fablr-link.js";

const meta = {
  title: "Fablr Link",
  component: "fablr-link",
  args: {
    href: "?story=fablr-button/primary",
    text: "Click me",
    active: false,
  },
};

const stories = {
  Default: (args) =>
    html`<fablr-link href=${args.href}>${args.text}</fablr-link>`,
  Active: (args) =>
    html`<fablr-link href=${args.href} ?active=${true}
      >Active Link</fablr-link
    >`,
  Multiple: (_args) => html`
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <fablr-link href="?story=fablr-button/primary"
        >Button - Primary</fablr-link
      >
      <fablr-link href="?story=fablr-button/disabled"
        >Button - Disabled</fablr-link
      >
      <fablr-link href="?story=fablr-input/default">Input - Default</fablr-link>
      <fablr-link href="?story=fablr-card/default">Card - Default</fablr-link>
    </div>
  `,
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
