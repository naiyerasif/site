export default {
	tagName: "div",
	attributes: { class: "directive-tweet-container" },
	filter(node) {
		if (node.type !== "leafDirective") {
			console.log("Not a leaf tweet directive")
			return false
		}

		if (!node.attributes.id) {
			console.log("Missing tweet id")
			return false
		}

		return true
	},
	map(attributes, children) {
		return [
			{
				type: "html",
				value: `<embedded-webview src="/data/tweets/${attributes.id}.html"></embedded-webview>`
			}
		]
	}
}
