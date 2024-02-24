import { visit } from "unist-util-visit";
import { h } from "hastscript";
import { defu } from "defu";

const defaults = {
	chips: ["default", "commend", "warn", "deter", "assert"]
};

export default function remarkChipDirectives(userOptions = {}) {
	const chips = defu(userOptions, defaults).chips.reduce((a, v) => ({ ...a, [v]: v}), {});
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
					class: classes ? `chip chip-${chip} ${classes}` : `chip chip-${chip}`
				};

				const { tagName, properties } = h("span", node.attributes);
				data.hName = tagName;
				data.hProperties = properties;
			}
		});
	};
}
