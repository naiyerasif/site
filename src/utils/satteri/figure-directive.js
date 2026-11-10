import { defineMdastPlugin } from "satteri";

/**
 * Sätteri plugin to add figure and caption using directives
 *
 * @returns {() => import("satteri").MdastPluginDefinition}
 */
export default function satteriFigureDirective() {
	return defineMdastPlugin({
		name: "satteri-figure-directive",

		containerDirective(node, ctx) {
			if (node.name !== "figure") {
				return;
			}

			const children = node.children || [];
			if (children.length < 2) {
				return;
			}

			const captionIndex = children.findIndex(child => child.name === "caption" && (child.type === "containerDirective" || child.type === "leafDirective"));

			if (captionIndex === -1) {
				return;
			}

			const captionNode = children[captionIndex];

			ctx.setProperty(captionNode, "data", {
				...(captionNode.data || {}),
				hName: "figcaption",
				hProperties: captionNode.attributes || {}
			});

			ctx.setProperty(node, "data", {
				...(node.data || {}),
				hName: "figure",
				hProperties: node.attributes || {}
			});
		}
	});
}
