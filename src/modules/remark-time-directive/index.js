import { h } from "hastscript";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import format, { formats } from "#mods/datetime/index.js";

export default function remarkTimeDirective() {
	return (tree) => {
		visit(tree, { type: "textDirective", name: "time" }, (node) => {
			const content = toString(node).trim();
			if (!content) return;

			const datetime = format(content, formats.iso);
			const hast = h(node.name, { ...node.attributes, datetime }, format(content));

			const data = (node.data ??= {});
			data.hName = hast.tagName;
			data.hProperties = hast.properties;
			data.hChildren = hast.children;
		});
	};
}
