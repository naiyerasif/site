import { toString } from "mdast-util-to-string";
import { defu } from "defu";

export default function process(node) {
	if (node.type === "leafDirective") {
		const data = node.data || (node.data = {});
		const attributes = node.attributes || {};
		const id = attributes.id;

		if (!id) {
			console.warn("Missing youtube video id");
		} else {
			let frameProperties = {
				className: ["directive-youtube-iframe"],
				videoid: attributes.id,
			};

			let title;

			if (node.children) {
				title = toString(node.children);
				frameProperties.playlabel = title;
			}

			const children = [
				{
					type: "paragraph",
					data: {
						hName: "div",
						hProperties: {
							className: ["directive-youtube-iframe-container"]
						}
					},
					children: [
						{
							type: "paragraph",
							data: {
								hName: "lite-youtube",
								hProperties: frameProperties
							}
						}
					]
				}
			];

			if (title) {
				children.push({
					type: "paragraph",
					data: {
						hName: "figcaption"
					},
					children: [
						{
							type: "text",
							value: title
						}
					]
				});
			}

			node.children = children;

			data.hName = "figure";
			data.hProperties = defu({ className: ["directive-youtube"] }, attributes);
		}
	}
}
