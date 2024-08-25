import { h } from "hastscript";
import { visit } from "unist-util-visit";
import format from "../datetime/index.js";

// :time{datetime="2011-11-18T14:54:39.929Z"}
export default function remarkTimeDirective() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.type === "textDirective") {
				if (node.name !== "time") return;

				const data = node.data || (node.data = {});
				const { datetime, ...attributes } = node.attributes || {};

				if (!datetime) return;

				node.children = [
					{
						type: "text",
						value: format(datetime)
					}
				];

				const { tagName, properties } = h(node.name, { datetime, ...attributes });
				data.hName = tagName;
				data.hProperties = properties;
			}
		});
	};
}
