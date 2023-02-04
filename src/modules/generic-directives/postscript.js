export default {
	tagName: "div",
	attributes: { class: "directive-postscript" },
	filter(node) {
		return !!node.children
	},
	map(attributes, children) {
		return children
	}
}
