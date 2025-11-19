import { LitElement, html, css } from 'lit';

class FablrApp extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
    `;

    render() {
        return html`
            <div id="sidebar">
                <h2>Components</h2>
                <!-- Component list will go here -->
            </div>
            <div id="preview">
                <h1>Welcome to Fablr</h1>
                <p>Select a component from the sidebar to view it here.</p>
            </div>
        `;
    }
}

customElements.define('fablr-app', FablrApp);

// Render the main app component into the #root div
const root = document.getElementById('root');
if (root) {
    root.innerHTML = '<fablr-app></fablr-app>';
}