import { css, html, LitElement } from "lit";

class FablrBadge extends LitElement {
  static status = "stable";

  static properties = {
    variant: {
      type: String,
      reflect: true,
      enum: ["alpha", "beta", "stable", "deprecated", "info"],
    },
    tooltip: { type: String },
  };

  static styles = css`
    :host {
      display: inline-block;
    }
    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: help;
      position: relative;
      font-family: var(--font-stack);
      display: inline-block;
    }
    :host([variant="alpha"]) .badge {
      background: #ff4444;
      color: white;
    }
    :host([variant="beta"]) .badge {
      background: #ff9800;
      color: white;
    }
    :host([variant="stable"]) .badge {
      background: #4caf50;
      color: white;
    }
    :host([variant="deprecated"]) .badge {
      background: #9e9e9e;
      color: white;
    }
    :host([variant="info"]) .badge {
      background: var(--primary-color);
      color: white;
    }
    .badge::after {
      content: attr(data-tooltip);
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: normal;
      text-transform: none;
      letter-spacing: normal;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 1000;
    }
    .badge::before {
      content: "";
      position: absolute;
      top: calc(100% + 2px);
      left: 12px;
      border: 6px solid transparent;
      border-bottom-color: rgba(0, 0, 0, 0.9);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 1000;
    }
    .badge:hover::after,
    .badge:hover::before {
      opacity: 1;
    }
  `;

  constructor() {
    super();
    this.variant = "info";
    this.tooltip = "";
  }

  render() {
    return html`
      <span class="badge" data-tooltip=${this.tooltip}>
        <slot></slot>
      </span>
    `;
  }
}

customElements.define("fablr-badge", FablrBadge);

// Stories
const meta = {
  component: "fablr-badge",
  args: {
    variant: "stable",
    tooltip: "This is a tooltip",
  },
  slots: {
    default: "Badge",
  },
};

const stories = {
  Alpha: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "alpha",
      tooltip: "Early development - APIs may change",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fablr-badge variant=${args.variant} tooltip=${args.tooltip}
        >${slots?.default ?? "alpha"}</fablr-badge
      >`,
  },
  Beta: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "beta",
      tooltip: "Testing phase - Ready for feedback",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fablr-badge variant=${args.variant} tooltip=${args.tooltip}
        >${slots?.default ?? "beta"}</fablr-badge
      >`,
  },
  Stable: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "stable",
      tooltip: "Production ready - Stable API",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fablr-badge variant=${args.variant} tooltip=${args.tooltip}
        >${slots?.default ?? "stable"}</fablr-badge
      >`,
  },
  Deprecated: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "deprecated",
      tooltip: "Being phased out - Use alternatives",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fablr-badge variant=${args.variant} tooltip=${args.tooltip}
        >${slots?.default ?? "deprecated"}</fablr-badge
      >`,
  },
  Info: {
    args: (baseArgs) => ({
      ...baseArgs,
      variant: "info",
      tooltip: "Additional information",
    }),
    lockedArgs: { variant: true },
    render: (args, slots) =>
      html`<fablr-badge variant=${args.variant} tooltip=${args.tooltip}
        >${slots?.default ?? "info"}</fablr-badge
      >`,
  },
};

window.__FABLR_STORIES__ = window.__FABLR_STORIES__ || [];
window.__FABLR_STORIES__.push({ meta, stories });
