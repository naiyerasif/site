import { h } from "hastscript";
import { visit } from "unist-util-visit";

// :sprite{href="#viking"}
export default function remarkSpriteDirective() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "textDirective") {
				if (node.name !== "sprite") return;

				const data = node.data || (node.data = {});
				const { href, ...attributes } = node.attributes || {};

				if (!href) return;

				node.children = [
					{
						type: "paragraph",
						data: {
							hName: "use",
							hProperties: { href: `#${href}` }
						}
					}
				];

				const { tagName, properties } = h("svg", { role: "img", ariaHidden: "true", ...attributes });
				data.hName = tagName;
				data.hProperties = properties;
			}
		});
	};
}
