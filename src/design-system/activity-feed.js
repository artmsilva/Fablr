import { css, html, LitElement } from "lit";

const formatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

class FableActivityFeed extends LitElement {
  static properties = {
    items: { type: Array },
    emptyLabel: { type: String, attribute: "empty-label" },
    actionLabel: { type: String, attribute: "action-label" },
  };

  constructor() {
    super();
    this.items = [];
    this.emptyLabel = "No recent activity yet.";
    this.actionLabel = "View story";
  }

  static styles = css`
    :host {
      display: block;
    }

    .activity-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-item {
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: var(--space-3, 12px) var(--space-4, 16px);
      display: flex;
      gap: 16px;
      align-items: center;
      background: var(--bg-secondary);
    }

    .activity-details {
      flex: 1;
    }

    .activity-title {
      margin: 0;
      font-size: 1rem;
    }

    .activity-meta {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .activity-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 6px;
    }

    .activity-tag {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
    }

    .activity-link {
      text-decoration: none;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      padding: 6px 12px;
      font-weight: 600;
      color: var(--primary-color);
      white-space: nowrap;
    }
  `;

  _formatDate(value) {
    if (!value) return "—";
    return formatter.format(new Date(value));
  }

  render() {
    if (!this.items.length) {
      return html`<p>${this.emptyLabel}</p>`;
    }

    return html`
      <ul class="activity-list">
        ${this.items.map(
          (item) => html`
            <li class="activity-item">
              <div class="activity-details">
                <h4 class="activity-title">${item.title}</h4>
                <div class="activity-meta">
                  Updated ${this._formatDate(item.updatedAt)} •
                  ${item.taxonomy?.status || "beta"}
                </div>
                <div class="activity-tags">
                  ${(item.taxonomy?.tags || []).map(
                    (tag) => html`<span class="activity-tag">${tag}</span>`
                  )}
                </div>
              </div>
              <a class="activity-link" href=${item.href || "#"}>${this.actionLabel}</a>
            </li>
          `
        )}
      </ul>
    `;
  }
}

customElements.define("fable-activity-feed", FableActivityFeed);
