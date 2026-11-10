import { defineMdastPlugin } from "satteri";

/**
 * @typedef {Object} YoutubeDirectiveOptions
 * @property {boolean} [server] Render a plain `<iframe>` instead of `<lite-youtube>`.
 */

/** @type {YoutubeDirectiveOptions} */
const defaults = {
	server: false,
};

/**
 * Convert the `::youtube{id=...}` leaf directive to a `<figure>` element.
 *
 * @param {YoutubeDirectiveOptions} [options]
 */
export default function satteriYoutubeDirective(options = defaults) {
	return defineMdastPlugin({
		name: "satteri-youtube-directive",
		leafDirective(node, ctx) {
			if (node.name !== "youtube") return;

			const attributes = { ...node.attributes };
			const { id } = attributes;

			if (!id) {
				ctx.report({ message: "Missing youtube video id", node, severity: "warning" });
				return;
			}

			const title = ctx.textContent(node) || "Play video";

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
							className: ["directive-youtube-iframe-container"],
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
											className: ["lty-playbtn"],
										},
									},
									children: [
										{
											type: "paragraph",
											data: {
												hName: "span",
												hProperties: {
													className: ["lyt-visually-hidden"],
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

			ctx.setField(node, "children", [
				player,
				{
					type: "paragraph",
					data: { hName: "figcaption" },
					children: [{ type: "text", value: title }],
				},
			]);
			ctx.setField(node, "data", {
				...node.data,
				hName: "figure",
				hProperties: attributes,
			});
		},
	});
}
