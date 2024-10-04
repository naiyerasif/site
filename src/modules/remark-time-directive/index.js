import { h } from "hastscript";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import format, { format_iso } from "../datetime/index.js";

// :time[2011-11-18T14:54:39.929Z]
// :time[2011-11-18T14:54:39]
// :time[2011-11-18]
export default function remarkTimeDirective() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "textDirective") {
				if (node.name !== "time") return;

				const data = node.data || (node.data = {});
				const content = toString(node.children || []).trim();

				if (content.length < 1) return;

				node.children = [
					{
						type: "text",
						value: format(content)
					}
				];
				const datetime = format(content, format_iso);
				const attributes = node.attributes || {};

				const { tagName, properties } = h(node.name, { ...attributes, datetime });
				data.hName = tagName;
				data.hProperties = properties;
			}
		});
	};
}
