import { css, html, LitElement } from "lit";

class FableHeroBanner extends LitElement {
  static properties = {
    eyebrow: { type: String },
    title: { type: String },
    description: { type: String },
    ctas: { type: Array },
    stats: { type: Array },
  };

  constructor() {
    super();
    this.eyebrow = "";
    this.title = "";
    this.description = "";
    this.ctas = [];
    this.stats = [];
  }

  static styles = css`
    :host {
      display: block;
    }

    .hero {
      border-radius: 18px;
      padding: var(--space-6, 32px);
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--primary-color, #5b4efc) 80%, transparent),
        var(--bg-secondary, #131322)
      );
      color: var(--text-on-primary, #fff);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, rgba(255, 255, 255, 0.35) 50%, transparent);
    }

    .hero-eyebrow {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: var(--space-2, 8px);
      color: color-mix(in srgb, #fff 70%, transparent);
    }

    .hero-title {
      margin: 0 0 var(--space-3, 12px);
      font-size: clamp(1.8rem, 3vw, 2.7rem);
    }

    .hero-description {
      margin: 0;
      font-size: 1rem;
      max-width: 62ch;
      color: color-mix(in srgb, #fff 85%, transparent);
    }

    .hero-ctas {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: var(--space-4, 16px);
    }

    .hero-cta {
      text-decoration: none;
      border-radius: 999px;
      padding: 10px 18px;
      font-weight: 600;
      border: 1px solid color-mix(in srgb, #fff 35%, transparent);
      color: inherit;
    }

    .hero-cta.is-primary {
      background: #fff;
      color: #0b0b1f;
    }

    .hero-stats {
      display: flex;
      gap: 24px;
      margin-top: var(--space-5, 20px);
      flex-wrap: wrap;
      border-top: 1px solid color-mix(in srgb, #fff 25%, transparent);
      padding-top: var(--space-4, 16px);
    }

    .hero-stat-value {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .hero-stat-label {
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.8;
    }
  `;

  render() {
    return html`
      <section class="hero">
        ${this.eyebrow ? html`<p class="hero-eyebrow">${this.eyebrow}</p>` : null}
        ${this.title ? html`<h1 class="hero-title">${this.title}</h1>` : null}
        ${this.description ? html`<p class="hero-description">${this.description}</p>` : null}
        ${
          this.ctas?.length
            ? html`
              <div class="hero-ctas">
                ${this.ctas.map(
                  (cta) => html`
                    <a
                      class=${`hero-cta ${cta.variant === "primary" ? "is-primary" : ""}`}
                      href=${cta.href || "#"}
                    >
                      ${cta.label}
                    </a>
                  `
                )}
              </div>
            `
            : null
        }
        ${
          this.stats?.length
            ? html`
              <div class="hero-stats">
                ${this.stats.map(
                  (stat) => html`
                    <div>
                      <div class="hero-stat-value">${stat.value}</div>
                      <div class="hero-stat-label">${stat.label}</div>
                    </div>
                  `
                )}
              </div>
            `
            : null
        }
      </section>
    `;
  }
}

customElements.define("fable-hero-banner", FableHeroBanner);
