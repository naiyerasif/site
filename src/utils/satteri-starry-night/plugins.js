/**
 * @typedef {import("satteri").HastNode} HastNode
 * @typedef {Extract<HastNode, { type: "element" }>} HastElement
 * @typedef {import("./index.js").HeaderPlugin} HeaderPlugin
 * @typedef {import("./index.js").LinePlugin} LinePlugin
 */

/**
 * @typedef {object} LineOptions
 * @property {Set<number>} marked
 * @property {Set<number>} inserted
 * @property {Set<number>} deleted
 * @property {Set<number>} output
 * @property {Set<number>} prompt
 * @property {boolean} diff
 */

const EMPTY_SET = new Set();

/**
 * @param {Iterable<number> | undefined} value
 * @returns {Set<number>}
 */
const toSet = value => (value ? new Set(value) : EMPTY_SET);

/**
 * @param {string} value
 * @returns {Readonly<HastElement>}
 */
const createDiffNode = value => Object.freeze({
	type: "element",
	tagName: "span",
	properties: { className: ["diff"] },
	children: [{ type: "text", value }]
});

const promptNode = Object.freeze({
	type: "element",
	tagName: "span",
	properties: { className: ["prompt"], ariaHidden: "true" }
});
const emptyDiffNode = createDiffNode("\t");
const insDiffNode = createDiffNode("+\t");
const delDiffNode = createDiffNode("-\t");

/** @type {HeaderPlugin} */
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

/** @type {LinePlugin} */
export const lineAnnotationPlugin = {
	type: "line",

	/**
	 * @param {Record<string, any>} meta
	 * @returns {LineOptions}
	 */
	opts: meta => {
		const inserted = toSet(meta["ins"]);
		const deleted = toSet(meta["del"]);

		return {
			marked: toSet(meta["*"]),
			inserted,
			deleted,
			output: toSet(meta["output"]),
			prompt: toSet(meta["prompt"]),
			diff: inserted.size > 0 || deleted.size > 0
		};
	},

	/**
	 * @param {LineOptions} opts
	 * @param {HastElement} node
	 * @returns {HastElement}
	 */
	apply: (opts, node) => {
		const { properties } = node;
		const lineNumber = properties.dataLineNumber;
		const isInserted = opts.inserted.has(lineNumber);
		const isDeleted = opts.deleted.has(lineNumber);

		if (opts.output.has(lineNumber)) properties.dataLineOutput = true;
		if (opts.marked.has(lineNumber)) properties.dataLineMarked = true;

		const lead = [];
		if (isDeleted) {
			properties.dataLineDeleted = true;
			lead.push(delDiffNode);
		}
		if (isInserted) {
			properties.dataLineInserted = true;
			lead.push(insDiffNode);
		}
		if (opts.diff && !isInserted && !isDeleted) lead.push(emptyDiffNode);
		if (opts.prompt.has(lineNumber)) lead.push(promptNode);

		if (lead.length > 0) node.children = lead.concat(node.children);

		return node;
	}
};
