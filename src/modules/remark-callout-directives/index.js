import { visit } from "unist-util-visit";
import { h } from "hastscript";
import { defu } from "defu";

function generate(title, children, hint) {
	return [
		{
			type: "paragraph",
			data: {
				hName: "div",
				hProperties: { className: ["callout-hint"] }
			},
			children: [
				{
					type: "html",
					value: hint
				}
			]
		},
		{
			type: "paragraph",
			data: {
				hName: "div",
				hProperties: { className: ["callout-body"] }
			},
			children: [
				{
					type: "strong",
					children: [
						{
							type: "text",
							value: `${title} `
						}
					]
				},
				...children
			]
		}
	]
}

const defaults = {
	aliases: {},
	callouts: {
		note: {
			label: "Note",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-note"/></svg>`
		},
		commend: {
			label: "Tip",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-commend"/></svg>`
		},
		warn: {
			label: "Warning",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-warn"/></svg>`
		},
		deter: {
			label: "Caution",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-deter"/></svg>`
		},
		assert: {
			label: "Important",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-assert"/></svg>`
		}
	}
};

export default function remarkCalloutDirectives(userOptions = {}) {
	const options = defu(userOptions, defaults);
	const { callouts } = options;
	const aliases = defu(options.aliases, Object.keys(callouts).reduce((a, v) => ({ ...a, [v]: v }), {}));
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "containerDirective") {
				if (!aliases[node.name]) {
					return;
				}

				const calloutType = aliases[node.name];
				const callout = callouts[calloutType];
				const data = node.data || (node.data = {});
				const { title, ...attributes } = node.attributes;

				node.attributes = {
					...attributes,
					class: "class" in attributes ? `callout ${attributes.class}` : `callout`,
					dataCallout: calloutType
				};

				node.children = generate(title || callout.label, node.children, callout.hint);

				const tagName = callout.tagName || options.tagName || "aside";
				const hast = h(tagName, node.attributes);
				data.hName = hast.tagName;
				data.hProperties = hast.properties;
			}
		});
	};
}
