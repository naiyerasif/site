import { toString } from "mdast-util-to-string";
import format, { format_iso } from "../datetime/index.js";

export default function process(node) {
	if (node.type === "textDirective") {
		const data = node.data || (node.data = {});
		const attributes = node.attributes || {};
		const value = toString(node.children);

		attributes.datetime = format(value, format_iso);

		node.children = [
			{
				type: "text",
				value: format(value)
			}
		];

		data.hName = "time";
		data.hProperties = attributes;
	}
}
