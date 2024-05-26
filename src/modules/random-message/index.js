class RandomMessage extends HTMLElement {
	static register(tagName = "random-message") {
		if ("customElements" in window) {
			customElements.define(tagName, RandomMessage);
		}
	}

	connectedCallback() {
		const selector = this.getAttribute("selector") || "[data-random-message]";
		const messageNodes = this.querySelectorAll(selector);
		const randomNode = messageNodes[Math.floor(Math.random() * messageNodes.length)];
		for (const messageNode of messageNodes) {
			messageNode.setAttribute("hidden", "");
		}
		randomNode.removeAttribute("hidden");
	}
}

RandomMessage.register();
