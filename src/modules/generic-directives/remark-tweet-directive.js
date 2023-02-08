import { visit } from "unist-util-visit"
import { toString } from "mdast-util-to-string"

export default function remarkTweetDirective(options = {}) {
	const { noscript = false } = options
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "leafDirective") {
				if (node.name !== "tweet") {
					return
				}

				const data = node.data || (node.data = {})

				if (!node.children) {
					console.warn("Missing tweet source")
				} else {
					const url = toString(node.children)
					const id = url.split("/").slice(-1)

					node.children = [
						{
							type: "html",
							value: noscript ? `<a href="${url}">${url}</a>` : `<embedded-webview src="/data/tweets/${id}.html"></embedded-webview><noscript><a href="${url}" rel="nofollow noopener noreferrer">${url}</a></noscript>`
						}
					]

					data.hName = "div"
					data.hProperties = {
						id: id
					}
				}
			}
		})
	}
}
