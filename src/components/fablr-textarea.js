import { css, html, LitElement } from "lit";

class FablrTextarea extends LitElement {
  static status = "beta";

  static properties = {
    label: { type: String },
    placeholder: { type: String },
    value: { type: String },
    rows: { type: Number },
    disabled: { type: Boolean },
  };

  static styles = css`
    :host {
      display: contents;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    span {
      font-size: var(--font-label);
      color: var(--text-primary);
      font-family: var(--font-stack);
    }
    textarea {
      padding: var(--space-2) calc(var(--space-base) * 2.5);
      font-size: var(--font-body);
      font-family: var(--font-stack);
      border-radius: calc(var(--space-base) * 1.5);
      resize: vertical;
    }
    textarea:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
  `;

  constructor() {
    super();
    this.label = "";
    this.placeholder = "";
    this.value = "";
    this.rows = 3;
    this.disabled = false;
  }

  render() {
    return html`
      <label>
        ${this.label ? html`<span>${this.label}</span>` : ""}
        <textarea
          .value=${this.value}
          placeholder=${this.placeholder}
          rows=${this.rows}
          ?disabled=${this.disabled}
          @input=${(e) => {
            this.value = e.target.value;
            this.dispatchEvent(
              new CustomEvent("input", { detail: this.value })
            );
          }}
        ></textarea>
      </label>
    `;
  }
}

customElements.define("fablr-textarea", FablrTextarea);

// Stories
const meta = {
  component: "fablr-textarea",
  args: {
    label: "Description",
    placeholder: "Enter description",
    rows: 3,
  },
};

const stories = {
  Default: (args) =>
    html`<fablr-textarea
      label=${args.label}
      placeholder=${args.placeholder}
      .value=${args.value}
      rows=${args.rows}
      ?disabled=${args.disabled}
    ></fablr-textarea>`,
  WithContent: {
    args: (baseArgs) => ({
      ...baseArgs,
      value: "This is some example content\nthat spans multiple lines.",
    }),
    render: (args) =>
      html`<fablr-textarea
        label=${args.label}
        placeholder=${args.placeholder}
        .value=${args.value}
        rows=${args.rows}
        ?disabled=${args.disabled}
      ></fablr-textarea>`,
  },
  Disabled: {
    args: (baseArgs) => ({ ...baseArgs, disabled: true }),
    lockedArgs: { disabled: true },
    render: (args) =>
      html`<fablr-textarea
        label=${args.label}
        placeholder=${args.placeholder}
        .value=${args.value}
        rows=${args.rows}
        ?disabled=${args.disabled}
      ></fablr-textarea>`,
  },
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
