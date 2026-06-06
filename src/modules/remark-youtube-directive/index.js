import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";

const defaults = {
	server: false
};

export default function remarkYoutubeDirective(options = defaults) {
	return (tree) => {
		visit(tree, { type: "leafDirective", name: "youtube" }, (node) => {
			const data = (node.data ??= {});
			const attributes = (node.attributes ??= {});
			const { id } = attributes;

			if (!id) {
				console.warn("Missing youtube video id");
				return;
			}

			const title = toString(node) || "Play video";

			let player;

			if (options.server) {
				player = {
					type: "paragraph",
					data: {
						hName: "iframe",
						hProperties: {
							src: `https://www.youtube-nocookie.com/embed/${id}`,
							allow: "join-ad-interest-group 'none'; run-ad-auction 'none'; encrypted-media; picture-in-picture; fullscreen",
							loading: "lazy",
							title,
						},
					},
				};
			} else {
				player = {
					type: "paragraph",
					data: {
						hName: "div",
						hProperties: {
							className: ["directive-youtube-iframe-container"]
						},
					},
					children: [
						{
							type: "paragraph",
							data: {
								hName: "lite-youtube",
								hProperties: {
									className: ["directive-youtube-iframe"],
									videoid: id,
									playlabel: title,
								},
							},
							children: [
								{
									type: "link",
									url: `https://youtu.be/${id}`,
									title: "Play video",
									data: {
										hProperties: {
											className: ["lty-playbtn"]
										},
									},
									children: [
										{
											type: "paragraph",
											data: {
												hName: "span",
												hProperties: {
													className: ["lyt-visually-hidden"]
												},
											},
											children: [{ type: "text", value: title }],
										},
									],
								},
							],
						},
					],
				};

				attributes["class"] = `directive-youtube ${attributes["class"]}`;
			}

			node.children = [
				player,
				{
					type: "paragraph",
					data: { hName: "figcaption" },
					children: [{ type: "text", value: title }],
				}
			];

			data.hName = "figure";
			data.hProperties = attributes;
		});
	};
}
