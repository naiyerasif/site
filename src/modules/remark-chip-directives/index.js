import { visit } from "unist-util-visit";
import { h } from "hastscript";
import { defu } from "defu";

const defaults = {
	default: { tagName: "span" },
	commend: { tagName: "span" },
	warn: { tagName: "span" },
	deter: { tagName: "span" },
	assert: { tagName: "span" },
};

function resolve(userOptions) {
	const chips = defu(userOptions, defaults);

	for (const key of Object.keys(chips)) {
		if (!chips[key].alias) {
			chips[key].alias = key;
		}

		if (!chips[key].tagName) {
			chips[key].tagName = chips[chips[key].alias].tagName;
		}
	}

	return chips;
}

export default function remarkChipDirectives(userOptions = {}) {
	const chips = resolve(userOptions);
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "textDirective") {
				if (!chips[node.name]) {
					return;
				}

				const chip = chips[node.name];
				const data = node.data || (node.data = {});
				const { "class": classes, ...attributes } = node.attributes;

				node.attributes = {
					...attributes,
					class: classes ? `chip chip-${chip.alias} ${classes}` : `chip chip-${chip.alias}`
				};

				const { tagName, properties } = h(chip.tagName || "span", node.attributes);
				data.hName = tagName;
				data.hProperties = properties;
			}
		});
	};
}
