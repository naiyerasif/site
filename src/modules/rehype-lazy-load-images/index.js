import { visit } from "unist-util-visit";

export default function rehypeLazyLoadImages() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (node.tagName !== "img") return;
			node.properties = {
				...node.properties,
				loading: "lazy"
			};
		});
	};
}
