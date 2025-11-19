import { html } from "lit";
import "../components/fablr-card.js";

const meta = {
  title: "Fablr Card",
  component: "fablr-card",
  args: { title: "Card Title", content: "This is a card content." },
};
const stories = {
  Default: (args) => html`<fablr-card title=${args.title}>${args.content}</fablr-card>`,
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
