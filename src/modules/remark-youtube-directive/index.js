import { visit } from "unist-util-visit";
import { defu } from "defu";
import { toString } from "mdast-util-to-string";

const defaults = {
	server: false
}

function youtube(node) {
	const data = node.data || (node.data = {});
	const attributes = node.attributes || {};
	const id = attributes.id;

	if (!id) {
		console.warn("Missing youtube video id");
	} else {
		let frameProperties = {
			src: `https://www.youtube-nocookie.com/embed/${attributes.id}`,
			allow: "join-ad-interest-group 'none'; run-ad-auction 'none'; encrypted-media; picture-in-picture; fullscreen",
			loading: "lazy"
		};

		let title;

		if (node.children) {
			title = toString(node.children);
			frameProperties.title = title;
		}

		const children = [
			{
				type: "paragraph",
				data: {
					hName: "iframe",
					hProperties: frameProperties
				}
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
		data.hProperties = attributes;
	}
}

function youtubeLiteEmbed(node) {
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

export default function remarkYoutubeDirective(userOptions = {}) {
	const { server } = defu(userOptions, defaults);
	return (tree) => {
		visit(tree, (node) => node.type === "leafDirective", (node) => {
			if (server) {
				youtube(node);
			} else {
				youtubeLiteEmbed(node);
			}
		});
	};
}
