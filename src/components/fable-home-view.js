import {
  getHomepageHeroContent,
  getHomepageHighlightCards,
  getHomepageRecentComponents,
  getHomepageSearchSpotlights,
  getHomepageTaxonomyGroups,
  getView,
} from "@store";
import { html, LitElement } from "lit";
import "@design-system/hero-banner.js";
import "@design-system/highlight-cards.js";
import "@design-system/activity-feed.js";
import "@design-system/filter-chips.js";
import "@design-system/spotlight-list.js";

export class FableHomeView extends LitElement {
  static properties = {
    _view: { state: true },
    _hero: { state: true },
    _cards: { state: true },
    _recent: { state: true },
    _chips: { state: true },
    _selectedChip: { state: true },
    _spotlights: { state: true },
  };

  constructor() {
    super();
    this._view = getView();
    this._selectedChip = "all";
    this._hydrateData();
    this._handleStateChange = this._handleStateChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("state-changed", this._handleStateChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("state-changed", this._handleStateChange);
  }

  _hydrateData() {
    this._hero = getHomepageHeroContent();
    this._cards = getHomepageHighlightCards();
    this._recent = getHomepageRecentComponents(8);
    this._chips = getHomepageTaxonomyGroups();
    this._spotlights = getHomepageSearchSpotlights();
  }

  _handleStateChange(e) {
    const { key } = e.detail;
    if (key === "view") {
      this._view = getView();
    }
    if (key === "metadata" || key === "stories") {
      this._hydrateData();
    }
  }

  _handleChipSelect(event) {
    this._selectedChip = event.detail.value;
  }

  _filteredActivity() {
    if (this._selectedChip === "all") return this._recent;
    return this._recent.filter((item) => item.taxonomy?.group === this._selectedChip);
  }

  render() {
    if (this._view?.name !== "home") {
      return html`<div class="home-view"><p>Loading home...</p></div>`;
    }

    return html`
      <div class="home-view">
        <div class="home-grid">
          <fable-hero-banner
            .eyebrow=${this._hero?.eyebrow || ""}
            .title=${this._hero?.title || ""}
            .description=${this._hero?.description || ""}
            .ctas=${this._hero?.ctas || []}
            .stats=${this._hero?.stats || []}
          ></fable-hero-banner>

          <section class="section">
            <header class="section-header">
              <h2 class="section-title">Highlights</h2>
            </header>
            <fable-highlight-cards
              .cards=${this._cards}
            ></fable-highlight-cards>
          </section>

          <section class="section" @chip-select=${this._handleChipSelect}>
            <header class="section-header">
              <h2 class="section-title">Recent activity</h2>
            </header>
            <fable-filter-chips
              .chips=${this._chips}
              .active=${this._selectedChip}
            ></fable-filter-chips>
            <div class="two-column">
              <fable-activity-feed
                .items=${this._filteredActivity()}
              ></fable-activity-feed>
              <div class="spotlight-card">
                <h3 class="section-title">Search spotlight</h3>
                <fable-spotlight-list
                  .items=${this._spotlights}
                ></fable-spotlight-list>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }
}

customElements.define("fable-home-view", FableHomeView);
