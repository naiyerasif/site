import { visit } from "unist-util-visit"
import format, { format_iso } from "../datetime/index.js"

export default function remarkEmbedDirective() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "containerDirective") {
				if (node.name !== "embed") {
					return
				}

				if (!node.children) {
					console.warn("Missing embed content")
					return
				}

				const { author, src, published } = node.attributes || {}

				if (!(author && src && published)) {
					console.warn("Missing embed metadata")
					return
				}

				const data = node.data || (node.data = {})

				if (!node.children) {
					console.warn("Missing embed content")
					return
				} else {
					const displayDate = format(published)
					const isoDate = format(published, format_iso)

					node.children = [
						...node.children,
						{
							type: "html",
							value: `<figcaption>&mdash; <a href="${src}" rel="nofollow noopener noreferrer">${author}</a> (published: <time datetime="${isoDate}">${displayDate}</time>)</figcaption>`
						}
					]

					data.hName = "figure"
					data.hProperties = {
						className: ["directive-embed"]
					}
				}
			}
		})
	}
}
