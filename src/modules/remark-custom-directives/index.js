import { visit } from "unist-util-visit";
import { defu } from "defu";
import timeDirective from "./directive-time.js";
import youtubeDirective from "./directive-youtube.js";
import youtubeDirectiveServer from "./directive-youtube-server.js";

const directiveRegistryClient = {
	time: (node) => timeDirective(node),
	youtube: (node) => youtubeDirective(node),
}

const directiveRegistryServer = {
	time: (node) => timeDirective(node),
	youtube: (node) => youtubeDirectiveServer(node),
}

const defaults = {
	server: false
}

export default function remarkCustomDirectives(userOptions = {}) {
	const { server } = defu(userOptions, defaults);
	const registry = server ? directiveRegistryServer : directiveRegistryClient;
	return (tree) => {
		visit(tree, (node) => isDirective(node), (node) => {
			const directive = registry[node.name];

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
