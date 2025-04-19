import { SKIP, visit } from "unist-util-visit";
import { defu } from "defu";

export default function remarkAttributesDirective() {
	return (tree) => {
		visit(tree, (node, index, parent) => {
			if (typeof index !== "number" || !parent) return;
			
			if (
				node.type === "textDirective" ||
				node.type === "leafDirective" ||
				node.type === "containerDirective"
			) {
				if (node.name !== "attrib" || !node.children?.length) return;

				const [ first, ...rest ] = node.children;
				if (!("data" in first)) first["data"] = {};
				first.data["hProperties"] = defu(node.attributes || {}, first.data["hProperties"] || {});
				parent.children.splice(index, 1, first, ...rest);

				return [SKIP, index];
			}
		});
	};
}
