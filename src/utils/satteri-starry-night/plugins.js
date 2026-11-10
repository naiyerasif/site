const createPromptNode = () => ({
	type: "element",
	tagName: "span",
	properties: { className: ["prompt"], ariaHidden: "true" },
	children: []
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
		const inserted = new Set(meta["+"]);
		const deleted = new Set(meta["-"]);
		const output = new Set(meta[">"]);
		const prompt = new Set(meta["$"]);

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

		let tagName = node.tagName;
		if (opts.output.has(lineNumber)) tagName = "samp";
		if (opts.marked.has(lineNumber)) tagName = "mark";
		if (opts.inserted.has(lineNumber)) tagName = "ins";
		if (opts.deleted.has(lineNumber)) tagName = "del";

		const children = opts.prompt.has(lineNumber)
			? [createPromptNode(), ...node.children]
			: node.children;

		const properties = opts.diff
			? { ...node.properties, dataDiff: true }
			: node.properties;

		return {
			...node,
			tagName,
			properties,
			children
		};
	}
};
