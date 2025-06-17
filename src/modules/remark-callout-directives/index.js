import { visit } from "unist-util-visit";
import { fromMarkdown } from "mdast-util-from-markdown";
import { h } from "hastscript";
import { defu } from "defu";

function generate(title, children, hint) {
	const nodes = [];

	if (hint) {
		nodes.push({
			type: "html",
			value: hint
		});
	}

	if (title) {
		const [titleNode] = fromMarkdown(title).children;
		nodes.push({
			type: "paragraph",
			data: {
				hName: "div",
				hProperties: { className: ["callout-title"] },
			},
			children: [
				{
					type: "strong",
					children: titleNode.children,
				}
			]
		})
	}

	nodes.push({
		type: "paragraph",
		data: {
			hName: "div",
			hProperties: { className: ["callout-content"] },
		},
		children: children,
	});

	return nodes;
}

const defaults = {
	aliases: {},
	callouts: {
		note: {
			hint: `<svg role="img" class="icon"><title>Note</title><use href="#x4-callout-note"/></svg>`
		},
		commend: {
			hint: `<svg role="img" class="icon"><title>Success</title><use href="#x4-callout-commend"/></svg>`
		},
		warn: {
			hint: `<svg role="img" class="icon"><title>Warning</title><use href="#x4-callout-warn"/></svg>`
		},
		deter: {
			hint: `<svg role="img" class="icon"><title>Danger</title><use href="#x4-callout-deter"/></svg>`
		},
		assert: {
			hint: `<svg role="img" class="icon"><title>Info</title><use href="#x4-callout-assert"/></svg>`
		}
	}
};

export default function remarkCalloutDirectives(userOptions = {}) {
	const options = defu(userOptions, defaults);
	const { callouts } = options;
	const aliases = defu(options.aliases, Object.keys(callouts).reduce((a, v) => ({ ...a, [v]: v}), {}));
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
					class: "class" in attributes ? `callout callout-${calloutType} ${attributes.class}` : `callout callout-${calloutType}`
				};

				node.children = generate(title, node.children, callout.hint);

				const tagName = callout.tagName || options.tagName || "aside";
				const hast = h(tagName, node.attributes);
				data.hName = hast.tagName;
				data.hProperties = hast.properties;
			}
		});
	};
}
