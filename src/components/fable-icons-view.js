import { getIconMetadata, getView } from "@store";
import { buildIconsPath } from "@utils";
import { html, LitElement } from "lit";
import "@design-system/icon-grid.js";
import { navigateTo } from "../router.js";

export class FableIconsView extends LitElement {
  static properties = {
    _icons: { state: true },
    _view: { state: true },
    _activeIconId: { state: true },
  };

  constructor() {
    super();
    this._icons = getIconMetadata();
    this._view = getView();
    this._activeIconId = null;
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

  _handleStateChange(e) {
    const { key } = e.detail;
    if (key === "view") {
      this._view = getView();
      this._activeIconId = this._view?.params?.iconId || null;
    }
    if (key === "metadata") {
      this._icons = getIconMetadata();
      if (!this._activeIconId && this._icons.length) {
        this._activeIconId = this._icons[0].id;
      }
    }
  }

  _handleIconSelect(icon) {
    if (!icon) return;
    this._activeIconId = icon.id;
    navigateTo(buildIconsPath(icon.id));
  }

  render() {
    if (this._view?.name !== "icons") {
      return html`<div class="container">Select an icon to preview.</div>`;
    }

    return html`
      <div class="icons-layout">
        <div class="grid-container">
          <h2>Icon Library</h2>
          <fable-icon-grid
            .icons=${this._icons}
            .activeId=${this._activeIconId}
            @icon-select=${(event) => this._handleIconSelect(event.detail.icon)}
          ></fable-icon-grid>
        </div>
      </div>
    `;
  }
}

customElements.define("fable-icons-view", FableIconsView);
