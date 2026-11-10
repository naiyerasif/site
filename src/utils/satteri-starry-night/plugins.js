const createPromptNode = () => ({
	type: "element",
	tagName: "span",
	properties: { className: ["prompt"], ariaHidden: "true" },
	children: []
});

const promptNode = Object.freeze({
	type: "element",
	tagName: "span",
	properties: { className: ["prompt"], ariaHidden: "true" },
});
const emptyDiffNode = Object.freeze({
	type: "element",
	tagName: "span",
	properties: { className: ["diff"] },
	children: [{ type: "text", value: "\t" }]
});
const insDiffNode = Object.freeze({
	type: "element",
	tagName: "span",
	properties: { className: ["diff"] },
	children: [{ type: "text", value: "+\t" }]
});
const delDiffNode = Object.freeze({
	type: "element",
	tagName: "span",
	properties: { className: ["diff"] },
	children: [{ type: "text", value: "-\t" }]
});

export const titlePlugin = {
	type: "header",
	opts: meta => ({ title: meta?.title }),
	apply: opts => {
		if (opts.title) {
			return {
				type: "element",
				tagName: "div",
				properties: { className: [`${opts.namespace}-title`] },
				children: [{ type: "text", value: String(opts.title) }]
			};
		}
	}
};

export const lineAnnotationPlugin = {
	type: "line",
	opts: meta => {
		const marked = new Set(meta["*"]);
		const inserted = new Set(meta["ins"]);
		const deleted = new Set(meta["del"]);
		const output = new Set(meta["output"]);
		const prompt = new Set(meta["prompt"]);

		return {
			marked,
			inserted,
			deleted,
			output,
			prompt,
			diff: inserted.size > 0 || deleted.size > 0
		};
	},
	apply: (opts, node) => {
		const lineNumber = node.properties.dataLineNumber;
		const line = { ...node };

		if (opts.output.has(lineNumber)) line.properties["dataLineOutput"] = true;
		if (opts.prompt.has(lineNumber)) line.children = [promptNode, ...line.children];
		if (opts.marked.has(lineNumber)) line.properties["dataLineMarked"] = true;
		let diffMarked = false;
		if (opts.inserted.has(lineNumber)) {
			line.properties["dataLineInserted"] = true;
			line.children = [insDiffNode, ...line.children];
			diffMarked = true;
		}
		if (opts.deleted.has(lineNumber)) {
			line.properties["dataLineDeleted"] = true;
			line.children = [delDiffNode, ...line.children];
			diffMarked = true;
		}
		if (opts.diff && !diffMarked) {
			line.children = [emptyDiffNode, ...line.children];
		}

		return line;
	}
};
