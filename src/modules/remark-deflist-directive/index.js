import { visit } from "unist-util-visit";

export default function remarkDefinitionListDirective() {
  return (tree) => {
    visit(tree, "containerDirective", (node) => {
			if (node.type === "containerDirective" && node.name === "dl") {
				const list = node.children.find((child) => child.type === "list");
				if (!list) return;

				const children = [];

				for (const item of list.children) {
					const [term, ...definition] = item.children;
					children.push({ type: "paragraph", data: { hName: "dt" }, children: [term] });
					children.push({ type: "paragraph", data: { hName: "dd" }, children: definition || [] });
				}

				node.children = children;

				const data = node.data || (node.data = {});
				data.hName = node.name;
				data.hProperties = node.attributes || {};
			}
    })
  }
}
