import { h } from "hastscript";
import { visit } from "unist-util-visit";

const nodeNames = ["figure", "caption"];

// :::figure
// ![a short description of the information an image conveys](./image.png)
//
// ::caption[Captions are brief descriptions related to the image (for example commentary, attributions or quotations).]
// :::
export default function remarkFigureDirective() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "containerDirective" || node.type === "leafDirective") {
				if (!nodeNames.includes(node.name) || !node.children) return;
				const data = node.data || (node.data = {});
				const { tagName, properties } = h(
					node.name === "caption" ? "figcaption" : node.name,
					node.attributes || {}
				);
				data.hName = tagName;
				data.hProperties = properties;
			}
		});
	};
}
