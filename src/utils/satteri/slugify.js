import { defineHastPlugin } from "satteri";

/**
 * @callback SlugifyFunction
 * @param {string} value - Raw text content of the heading
 * @returns {string} the slug to use for the heading's `id` attribute
 */

/**
 * @callback ResetFunction
 * @returns {void}
 */

/**
 * Configuration for {@link satteriSlugify}
 * 
 * @typedef {Object} SlugifyOptions
 * @property {SlugifyFunction} slugify
 *   Function that converts heading text to a slug
 * @property {ResetFunction} [reset]
 *   Called once before the tree is visited, allowing the slugify function to
 *   clear any internal state (such as, a seen-slugs counter)
 */

/**
 * Sätteri plugin to add `id`s to headings.
 *
 * @param {SlugifyOptions} [options]
 * @returns {() => import("satteri").HastPluginDefinition}
 */
export default function satteriSlugify(options) {
	const { slugify, reset } = options ?? {};

	return () => {
		if (typeof slugify !== "function") {
			return defineHastPlugin({ name: "satteri-slugify-noop" });
		}

		reset?.();

		return defineHastPlugin({
			name: "satteri-slugify",
			element: {
				filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
				visit(node, ctx) {
					if (node.properties && !node.properties.id) {
						const text = ctx.textContent(node);
						ctx.setProperty(node, "id", slugify(text));
					}
				}
			}
		});
	};
}
