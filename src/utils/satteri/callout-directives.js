import { defineMdastPlugin, markdownToMdast } from "satteri";
import defu from "defu";

/**
 * @typedef {import("satteri").MdastPluginDefinition} MdastPluginDefinition
 * @typedef {import("satteri").MdastNode} MdastNode
 */

/**
 * Definition of one callout type.
 *
 * @typedef {object} CalloutDefinition
 * @property {string} title Default title text. Markdown is permitted.
 * @property {string} hint The hint icon.
 * @property {string} [tagName] HTML tag for this callout type. Overrides the global `tagName`.
 */

/**
 * Values that the `generate` function receives.
 *
 * @typedef {object} CalloutPreferences
 * @property {string} title Title text. Markdown is permitted.
 * @property {string} hint The hint icon.
 * @property {boolean} showHint `true` to render the hint icon.
 * @property {boolean} collapsible `true` when the callout tag is `details`.
 */

/**
 * Function that makes the child nodes of a callout.
 *
 * @callback CalloutGenerator
 * @param {CalloutPreferences} prefs Settings for the callout.
 * @param {MdastNode[]} children Child nodes of the directive.
 * @returns {MdastNode[]} Children with indicator and content nodes.
 */

/**
 * Options for the plugin.
 *
 * @typedef {object} CalloutDirectiveOptions
 * @property {Record<string, string>} [aliases] Map of alias directive names to callout type names.
 * @property {Record<string, CalloutDefinition>} [callouts] Map of callout type names to definitions. Merged with the default callouts.
 * @property {string} [tagName] Default HTML tag for callouts. The default value is `aside`.
 * @property {CalloutGenerator} [generate] Function that replaces the default callout structure.
 */

/** @type {Required<Pick<CalloutDirectiveOptions, "aliases" | "callouts" | "generate">>} */
const defaults = {
	aliases: {},
	callouts: {
		assert: {
			title: "Info",
			hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true"><circle cx="19" cy="5" r="3"/><path d="M20 11.929V15c0 1.656-1.344 3-3 3h-3l-6 4v-4H5c-1.656 0-3-1.344-3-3V7c0-1.656 1.344-3 3-3h7.071"/></svg>`
		},
		commend: {
			title: "Success",
			hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true"><path d="m8 12 2.7 2.7L16 9.3"/><circle cx="12" cy="12" r="10"/></svg>`
		},
		deter: {
			title: "Danger",
			hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true"><path d="M12 12s-5.6 4.6-3.6 8c1.6 2.6 5.7 2.7 7.2 0 2-3.7-3.6-8-3.6-8Z"/><path d="M13.004 2 8.5 9 6.001 6s-4.268 7.206-1.629 11.8c3.016 5.5 11.964 5.7 15.08 0C23.876 10 13.004 2 13.004 2Z"/></svg>`
		},
		note: {
			title: "Note",
			hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true"><path d="M12 8h.01M12 12v4"/><circle cx="12" cy="12" r="10"/></svg>`
		},
		warn: {
			title: "Warning",
			hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></svg>`
		}
	},
	/** @type {CalloutGenerator} */
	generate(prefs, children) {
		const indicators = [];

		if (prefs.showHint && prefs.hint) {
			indicators.push({
				type: "paragraph",
				data: {
					hName: "div",
					hProperties: { className: ["callout-hint"] }
				},
				children: [
					{
						type: "html",
						value: prefs.hint
					}
				]
			});
		}

		indicators.push({
			type: "strong",
			data: { hProperties: { className: ["callout-title"] } },
			children: markdownToMdast(prefs.title).children[0].children,
		});

		const indicator = {
			type: "paragraph",
			data: { hName: "div", hProperties: { className: ["callout-indicator"] } },
			children: indicators,
		};

		return [
			prefs.collapsible ? {
				type: "paragraph",
				data: { hName: "summary" },
				children: [indicator]
			} : indicator,
			{
				type: "paragraph",
				data: {
					hName: "div",
					hProperties: {
						className: ["callout-content"]
					}
				},
				children
			}
		]
	}
}

/**
 * Sätteri plugin to add callouts using directives
 *
 * @param {CalloutDirectiveOptions} [options] Plugin options. They are merged with the defaults.
 * @returns {MdastPluginDefinition} The Sätteri mdast plugin.
 */
export default function satteriCalloutDirectives(options = {}) {
	const settings = defu(options, defaults);
	const { callouts, generate } = settings;
	const aliases = defu(settings.aliases, Object.keys(callouts).reduce((a, v) => ({ ...a, [v]: v}), {}));
	return defineMdastPlugin({
		name: "satteri-callout-directives",

		containerDirective(node, ctx) {
			if (!aliases[node.name]) {
				return;
			}

			const calloutType = aliases[node.name];
			const callout = callouts[calloutType];
			const { title, showHint = "true", is, class: clazz, ...attributes } = node.attributes;
			const tagName = is || callout.tagName || settings.tagName || "aside";

			ctx.replaceNode(node, {
				type: node.type,
				data: {
					...(node.data || {}),
					hName: tagName,
					hProperties: {
						...attributes,
						className: ["callout", `callout-${calloutType}`, clazz]
					}
				},
				children: generate({
					title: title || callout.title,
					hint: callout.hint,
					showHint: showHint.toLowerCase() === "true",
					collapsible: tagName === "details"
				}, node.children)
			})
		}
	});
}
