import { visit } from "unist-util-visit";
import timeDirective from "./directive-time.js";
import youtubeDirective from "./directive-youtube.js";

const directiveRegistry = {
	time: (node) => timeDirective(node),
	youtube: (node) => youtubeDirective(node),
}

export default function remarkCustomDirectives() {
	return (tree) => {
		visit(tree, (node) => isDirective(node), (node) => {
			const directive = directiveRegistry[node.name];

			if (directive === undefined) {
				return;
			}

			directive(node);
		});
	};
}

function isDirective({ type }) {
	return type === "textDirective" ||
		type === "leafDirective" ||
		type === "containerDirective";
}
