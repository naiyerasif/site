import { visit } from "unist-util-visit";

const nodeNames = ["figure", "caption"];
const directiveTypes = ["containerDirective", "leafDirective"];
const conditions = nodeNames.flatMap(name => directiveTypes.map(type => ({ type, name })));

export default function remarkFigureDirective() {
	return (tree) => {
		visit(tree, conditions, (node) => {
			if (!node.children || node.children.length === 0) return;

			const data = (node.data ??= {});
			data.hName = node.name === "caption" ? "figcaption" : "figure";
			data.hProperties = node.attributes || {};
		});
	};
}
