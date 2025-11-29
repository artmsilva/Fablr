import { getTokenMetadata, getView } from "@store";
import { buildTokensPath } from "@utils";
import { html, LitElement } from "lit";
import "@design-system/token-groups.js";
import { navigateTo } from "../router.js";

export class FableTokensView extends LitElement {
  static properties = {
    _tokens: { state: true },
    _view: { state: true },
    _activeTokenId: { state: true },
  };

  constructor() {
    super();
    this._tokens = getTokenMetadata();
    this._view = getView();
    this._activeTokenId = null;
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
      this._activeTokenId = this._view?.params?.tokenId || null;
    }
    if (key === "metadata") {
      this._tokens = getTokenMetadata();
      if (!this._activeTokenId && this._tokens.length) {
        this._activeTokenId = this._tokens[0].id;
      }
    }
  }

  _groupedTokens() {
    const groups = new Map();
    this._tokens.forEach((token) => {
      const key = token.taxonomy?.group || "Tokens";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(token);
    });
    return [...groups.entries()].map(([name, tokens]) => ({ name, tokens }));
  }

  _getActiveToken() {
    if (!this._tokens.length) return null;
    return this._tokens.find((token) => token.id === this._activeTokenId) || this._tokens[0];
  }

  _handleTokenSelect(token) {
    this._activeTokenId = token.id;
    navigateTo(buildTokensPath(token.id));
  }

  render() {
    if (this._view?.name !== "tokens") {
      return html`<div>Select a token category to explore.</div>`;
    }

    const groups = this._groupedTokens();
    return html`
      <div class="tokens-layout">
        <div class="token-list">
          <fable-token-groups
            .groups=${groups}
            .activeId=${this._activeTokenId}
            @token-select=${(event) => this._handleTokenSelect(event.detail.token)}
          ></fable-token-groups>
        </div>
      </div>
    `;
  }
}

customElements.define("fable-tokens-view", FableTokensView);
