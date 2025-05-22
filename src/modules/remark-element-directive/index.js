import { h } from "hastscript";
import { SKIP, visit } from "unist-util-visit";
import { defu } from "defu";

const defaults = {
	name: "elx"
}

export default function remarkElementDirective(userOptions = {}) {
	const { name } = defu(userOptions, defaults);
	return (tree) => {
		visit(tree, (node, index, parent) => {
			if (typeof index !== "number" || !parent) return;

			if (
				node.type === "textDirective" ||
				node.type === "leafDirective" ||
				node.type === "containerDirective"
			) {
				if (node.name !== name || !node.children?.length) return;

				const { "data-element": is = "", ...attribs } = node.attributes || {};

				if (is) {
					const data = node.data || (node.data = {});
					const { tagName, properties } = h(is, { ...attribs });
					data.hName = tagName;
					data.hProperties = properties;
				} else {
					const [ first, ...rest ] = node.children;
					if (!("data" in first)) first["data"] = {};
					first.data["hProperties"] = defu({ ...attribs }, first.data["hProperties"] || {});
					parent.children.splice(index, 1, first, ...rest);

					return [SKIP, index];
				}
			}
		});
	};
}
