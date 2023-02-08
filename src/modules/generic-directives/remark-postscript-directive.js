import { visit } from "unist-util-visit"
import { defu } from "defu"

export default function remarkPostscriptDirective() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "containerDirective") {
				if (node.name !== "postscript") {
					return
				}

				const data = node.data || (node.data = {})
				const attributes = node.attributes || {}

				data.hName = "div"
				data.hProperties = defu({ className: ["directive-postscript"] }, attributes)
			}
		})
	}
}
