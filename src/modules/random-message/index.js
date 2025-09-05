class RandomMessage extends HTMLElement {
	static register(tagName = "random-message") {
		if ("customElements" in window && !customElements.get(tagName)) {
			customElements.define(tagName, this);
		}
	}

	connectedCallback() {
		const selector = this.getAttribute("selector") || "[randomized]";
		const messageNodes = this.querySelectorAll(selector);
		// there should be atleast two nodes to randomize
		if (messageNodes.length > 1) {
			for (const messageNode of messageNodes) {
				messageNode.hidden = true;
			}
			const randomNode = messageNodes[Math.floor(Math.random() * messageNodes.length)];
			randomNode.hidden = false;
		}
	}
}

RandomMessage.register();
