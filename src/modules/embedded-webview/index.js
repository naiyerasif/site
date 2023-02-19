export default class EmbeddedWebview extends HTMLElement {
	static tagName = "embedded-webview"

	connectedCallback() {
		fetch(this.getAttribute("src"))
			.then((response) => response.text())
			.then((html) => {
				this.innerHTML = html
			})
	}
}

customElements.define(EmbeddedWebview.tagName, EmbeddedWebview)
