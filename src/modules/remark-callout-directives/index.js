import { visit } from "unist-util-visit";
import { fromMarkdown } from "mdast-util-from-markdown";
import { h } from "hastscript";
import { defu } from "defu";

function getFirstParagraph(children) {
	const node = children[0];

	if (
		node &&
		node.type === "paragraph" &&
		(
			!node.data ||
			!node.data.hName ||
			node.data.hName === "p"
		)
	) {
		return node;
	}

	return null;
}

function generate(label, children, hint, title) {
	const hintChildren = [];

	if (hint) {
		hintChildren.push({
			type: "html",
			value: hint
		});
	}

	hintChildren.push({
		type: "text",
		value: `${label} `
	});

	const hintNode = {
		type: "strong",
		data: {
			hProperties: { className: ["callout-hint"] },
		},
		children: hintChildren
	};

	const nodes = [];

	if (title) {
		nodes.push(hintNode);
		const [titleNode] = fromMarkdown(title).children;
		nodes.push({
			type: "strong",
			data: {
				hProperties: { className: ["callout-title"] },
			},
			children: titleNode.children,
		});
		nodes.push({
			type: "paragraph",
			data: {
				hName: "div",
				hProperties: { className: ["callout-content"] },
			},
			children: children,
		});
	} else {
		const firstParagraph = getFirstParagraph(children);
		if (firstParagraph) {
			firstParagraph.children = [
				hintNode,
				...firstParagraph.children
			];
			nodes.push(...children);
		} else {
			nodes.push(hintNode);
			nodes.push({
				type: "paragraph",
				data: {
					hName: "div",
					hProperties: { className: ["callout-content"] },
				},
				children: children,
			});
		}
	}
	
	return nodes;
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
				const { title, label = callout.label, ...attributes } = node.attributes;

				node.attributes = {
					...attributes,
					class: "class" in attributes ? `callout ${attributes.class}` : `callout`,
					dataCallout: calloutType
				};

				node.children = generate(label, node.children, callout.hint, title);

				const tagName = callout.tagName || options.tagName || "aside";
				const hast = h(tagName, node.attributes);
				data.hName = hast.tagName;
				data.hProperties = hast.properties;
			}
		});
	};
}
