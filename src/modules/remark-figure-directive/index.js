import { h } from "hastscript";
import { visit } from "unist-util-visit";

// :::figure
// ![a short description of the information an image conveys](./image.png)
//
// Captions are brief descriptions related to the image (for example commentary, attributions or quotations).
// :::
export default function remarkFigureDirective() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "containerDirective") {
				if (node.name !== "figure" || !node.children) return;

				const data = node.data || (node.data = {});
				const [ media, ...caption ] = node.children;
				node.children = [
					...media.children,
					{
						type: "paragraph",
						data: {
							hName: "figcaption"
						},
						children: [
							...caption
						]
					}
				];

				const attributes = node.attributes || {};
				node.attributes = {
					...attributes,
					class: "class" in attributes ? `figure ${attributes.class}` : `figure`
				};

				const { tagName, properties } = h("figure", node.attributes);
				data.hName = tagName;
				data.hProperties = properties;
			}
		});
	};
}
