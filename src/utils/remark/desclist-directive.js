import { visit } from "unist-util-visit";

export default function remarkDescriptionListDirective() {
	return (tree) => {
		visit(tree, { type: "containerDirective", name: "dl" }, (node) => {
			const list = node.children.find((child) => child.type === "list");
			if (!list) return;

			const children = [];

			for (const item of list.children) {
				if (!item.children || item.children.length < 2) continue;

				const [title, ...description] = item.children;
				children.push({
					type: "paragraph",
					data: { hName: "dt" },
					children: title.type === "paragraph" ? title.children : [title]
				});
				children.push({ type: "paragraph", data: { hName: "dd" }, children: description || [] });
			}

			node.children = children;

			const data = (node.data ??= {});
			data.hName = node.name;
			data.hProperties = node.attributes || {};
		});
	};
}
