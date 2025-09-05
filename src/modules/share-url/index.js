// source: https://github.com/NigelOToole/share-url/blob/89309ed6de9a4e7ee284177f1291b7160c5a6d8d/src/scripts/share-url-wc.js#L1
export class ShareUrl extends HTMLElement {
	static register(tagName = "share-url") {
		if ("customElements" in window && !customElements.get(tagName)) {
			customElements.define(tagName, this);
		}
	}

	constructor() {
		super();

		this.options = {
			selector: ".share-url",
			activeClass: "is-active",
			action: "share",
			url: document.location.href,
			title: document.title,
			textSelector: null,
			textLabel: "",
			textSuccess: "Shared"
		};
	}

	connectedCallback() {
		for (const item of this.getAttributeNames()) {
			let prop = this._camelCase(item);
			let value = this._checkBoolean(this.getAttribute(item));
			this.options[prop] = value;
		}

		this.button = this.querySelector("button");
		this.textElement = this.querySelector(this.options.textSelector);
		if (this.textElement === null) this.textElement = this.button;
		if (this.options.textLabel) this.textElement.innerText = this.options.textLabel;

		if (navigator[this.options.action]) {
			const { signal } = this.abortController = new AbortController();
			this.button.addEventListener("click", () => this._shareEvent(), { signal });
		} else {
			this.hidden = true;
		}
	}

	disconnectedCallback() {
		if (this.abortController) {
			this.abortController.abort();
		}
	}

	async _shareEvent() {
		try {
			if (this.options.action === "share") {
				await navigator.share({ title: this.options.title, text: this.options.title, url: this.options.url });
			}

			if (this.options.action === "clipboard") {
				await navigator.clipboard.writeText(this.options.url);
			}

			this.button.classList.add(this.options.activeClass);
		} catch (error) {
			if (error.name !== "AbortError") console.error(error.name, error.message);
		}
	}

	_checkBoolean(string) {
		if (string.toLowerCase() === "true") return true;
		if (string.toLowerCase() === "false") return false;
		return string;
	}

	_camelCase(name, delim = "-") {
		const pattern = new RegExp((delim + "([a-z])"), "g");
		return name.replace(pattern, (match, capture) => capture.toUpperCase());
	}
}

ShareUrl.register();
