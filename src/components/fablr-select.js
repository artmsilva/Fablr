import { css, html, LitElement } from "lit";

class FablrSelect extends LitElement {
  static status = "beta";

  static properties = {
    label: { type: String },
    value: { type: String },
    options: { type: Array },
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
    select {
      padding: var(--space-2) calc(var(--space-base) * 2.5);
      font-size: var(--font-body);
      font-family: var(--font-stack);
      border-radius: calc(var(--space-base) * 1.5);
      cursor: pointer;
    }
    select:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
  `;

  constructor() {
    super();
    this.label = "";
    this.value = "";
    this.options = [];
    this.disabled = false;
  }

  render() {
    const opts = Array.isArray(this.options) ? this.options : [];
    return html`
      <label>
        ${this.label ? html`<span>${this.label}</span>` : ""}
        <select
          .value=${this.value}
          ?disabled=${this.disabled}
          @change=${(e) => {
            this.value = e.target.value;
            this.dispatchEvent(
              new CustomEvent("change", { detail: this.value })
            );
          }}
        >
          ${opts.map(
            (opt) =>
              html`<option value=${opt} ?selected=${this.value === opt}>
                ${opt}
              </option>`
          )}
        </select>
      </label>
    `;
  }
}

customElements.define("fablr-select", FablrSelect);

// Stories
const meta = {
  component: "fablr-select",
  args: {
    label: "Choose option",
    value: "option1",
    options: ["option1", "option2", "option3"],
  },
};

const stories = {
  Default: (args) =>
    html`<fablr-select
      label=${args.label}
      .value=${args.value}
      .options=${args.options}
      ?disabled=${args.disabled}
    ></fablr-select>`,
  Disabled: {
    args: (baseArgs) => ({ ...baseArgs, disabled: true }),
    lockedArgs: { disabled: true },
    render: (args) =>
      html`<fablr-select
        label=${args.label}
        .value=${args.value}
        .options=${args.options}
        ?disabled=${args.disabled}
      ></fablr-select>`,
  },
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
