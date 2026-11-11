import defu from "defu";
import { defineHastPlugin } from "satteri";
import { createStarryNight } from "@wooorm/starry-night";
import parse from "@microflash/fenceparser";
import { customGrammars } from "./grammars/index.js";

/**
 * @typedef {import("satteri").HastNode} HastNode
 * @typedef {import("satteri").HastVisitorContext} HastVisitorContext
 * @typedef {Extract<HastNode, { type: "element" }>} HastElement
 * @typedef {Extract<HastNode, { type: "text" }>} HastText
 */

/**
 * @typedef {Record<string, any>} FenceMeta
 */

/**
 * @typedef {object} SectionOptions
 * @property {string} namespace
 * @property {string} language
 */

/**
 * @typedef {object} HeaderPlugin
 * @property {"header"} type
 * @property {(meta: FenceMeta) => Record<string, any>} [opts]
 * @property {(opts: SectionOptions & Record<string, any>) => HastNode | HastNode[] | undefined | null | void} apply
 */

/**
 * @typedef {object} LinePlugin
 * @property {"line"} type
 * @property {(meta: FenceMeta) => Record<string, any>} [opts]
 * @property {(opts: Record<string, any>, node: HastElement) => HastElement | undefined | null | void} apply
 */

/**
 * @typedef {object} Options
 * @property {string} [namespace]
 * @property {Parameters<typeof createStarryNight>[0]} [grammars]
 * @property {Record<string, string>} [aliases]
 * @property {string[]} [plainText]
 * @property {Array<HeaderPlugin | LinePlugin>} [plugins]
 * @property {boolean} [allowMissingScopes]
 */

/**
 * @typedef {object} MappedLines
 * @property {HastNode[]} children
 * @property {number} totalLines
 */

const listFormatUnit = new Intl.ListFormat("en", { type: "unit" });
const prefix = "language-";
const defaults = {
	namespace: "hl",
	aliases: {},
	plainText: [],
	plugins: []
};

/**
 * @param {HeaderPlugin | LinePlugin} plugin
 * @returns {plugin is LinePlugin}
 */
const isLinePlugin = plugin => plugin.type === "line" && typeof plugin.apply === "function";

/**
 * @param {HeaderPlugin | LinePlugin} plugin
 * @returns {plugin is HeaderPlugin}
 */
const isHeaderPlugin = plugin => plugin.type === "header" && typeof plugin.apply === "function";

/**
 * Create a Satteri HAST plugin that highlights fenced code with Starry Night.
 *
 * @param {Options} [options]
 * @returns {ReturnType<typeof defineHastPlugin>}
 */
export default function satteriStarryNight(options = {}) {
	const {
		namespace,
		grammars = customGrammars,
		aliases,
		plainText,
		plugins,
		allowMissingScopes
	} = defu(options, defaults);

	/** @type {HeaderPlugin[]} */
	const headerPlugins = [];
	/** @type {LinePlugin[]} */
	const linePlugins = [];

	for (const plugin of plugins) {
		if (isHeaderPlugin(plugin)) headerPlugins.push(plugin);
		else if (isLinePlugin(plugin)) linePlugins.push(plugin);
	}

	const headerOptPlugins = headerPlugins.filter(plugin => Boolean(plugin.opts));
	const lineOptPlugins = linePlugins.filter(plugin => Boolean(plugin.opts));

	const hasPlugins = plugins.length > 0;
	const hasHeaderPlugins = headerPlugins.length > 0;
	const hasLinePlugins = linePlugins.length > 0;

	const plainTextSet = new Set(plainText);
	const headerClass = [`${namespace}-header`];
	const wrapperClass = [namespace];

	/** @type {Map<string, string | null>} */
	const scopeCache = new Map();

	const starryNightPromise = createStarryNight(grammars);
	let starryNight;
	let checked = false;

	/**
	 * @param {string} language
	 * @returns {string | null}
	 */
	const resolveScope = language => {
		let scope = scopeCache.get(language);
		if (scope === undefined) {
			scope = starryNight.flagToScope(aliases[language] || language) ?? null;
			scopeCache.set(language, scope);
		}
		return scope;
	};

	/**
	 * @param {FenceMeta} meta
	 * @param {string} language
	 * @returns {HastNode[]}
	 */
	const buildHeader = (meta, language) => {
		const sectionOpts = Object.assign({ namespace, language }, ...headerOptPlugins.map(plugin => plugin.opts(meta)));
		const nodes = [];

		for (const plugin of headerPlugins) {
			const result = plugin.apply(sectionOpts);
			if (!result) continue;
			if (Array.isArray(result)) nodes.push(...result);
			else nodes.push(result);
		}

		return nodes;
	};

	return defineHastPlugin({
		name: "satteri-starry-night",

		async before() {
			starryNight = await starryNightPromise;

			if (!allowMissingScopes && !checked) {
				const missingScopes = starryNight.missingScopes();

				if (missingScopes.length > 0) {
					console.warn(
						"[satteri-starry-night] Unexpected missing scope" +
						(missingScopes.length === 1 ? "" : "s") +
						" likely needed for highlighting to work: " +
						listFormatUnit.format(missingScopes.map(d => "`" + d + "`"))
					);
				}

				checked = true;
			}
		},

		element: {
			filter: ["pre"],

			/**
			 * @param {Readonly<HastElement>} container
			 * @param {HastVisitorContext} ctx
			 */
			visit(container, ctx) {
				const node = container.children[0];

				if (!node || node.type !== "element" || node.tagName !== "code") {
					return;
				}

				const language = extractLanguage(node);
				if (!language || plainTextSet.has(language)) {
					return;
				}

				const scope = resolveScope(language);

				if (!scope) {
					console.warn(
						`[satteri-starry-night] Unexpected unknown language \`${language}\` defined with \`${prefix}\` class, expected a known name`
					);
					return;
				}

				const meta = hasPlugins ? parseMeta(node) : {};
				const blockNodes = [];

				if (hasHeaderPlugins) {
					const headerNodes = buildHeader(meta, language);
					if (headerNodes.length > 0) {
						blockNodes.push({
							type: "element",
							tagName: "div",
							properties: { className: headerClass },
							children: headerNodes
						});
					}
				}

				const fragment = starryNight.highlight(ctx.textContent(node), scope);

				let codeChildren = fragment.children;
				const codeProperties = {
					tabIndex: 0,
					...node.properties
				};
				let dataDiff = false;

				if (hasLinePlugins) {
					const lineOpts = Object.assign({}, ...lineOptPlugins.map(plugin => plugin.opts(meta)));
					dataDiff = Boolean(lineOpts.diff);

					const { children: lineChildren, totalLines } = mapLines(
						fragment.children,
						(children, lineNumber) => {
							let line = {
								type: "element",
								tagName: "span",
								properties: { dataLineNumber: lineNumber },
								children
							};
							for (const plugin of linePlugins) {
								line = plugin.apply(lineOpts, line) ?? line;
							}
							return line;
						}
					);

					codeChildren = lineChildren;
					codeProperties.style = `--hl-line-gutter: ${String(totalLines).length}`;
				}

				blockNodes.push({
					type: "element",
					tagName: "pre",
					properties: { ...container.properties, dataDiff },
					children: [
						{
							type: "element",
							tagName: "code",
							properties: codeProperties,
							children: codeChildren,
							...(node.data ? { data: { ...node.data } } : {})
						}
					],
					...(container.data ? { data: { ...container.data } } : {})
				});

				ctx.replaceNode(container, {
					type: "element",
					tagName: "div",
					properties: { className: wrapperClass },
					children: blockNodes
				});
			}
		}
	});
}

/**
 * Read the language from `data.lang` or from a `language-*` class.
 *
 * @param {HastElement} node
 * @returns {string | undefined}
 */
function extractLanguage(node) {
	if (typeof node.data?.lang === "string" && node.data.lang.length > 0) {
		return node.data.lang;
	}

	const classes = node.properties?.className;
	if (Array.isArray(classes)) {
		for (const name of classes) {
			if (typeof name === "string" && name.startsWith(prefix)) {
				return name.slice(prefix.length);
			}
		}
	}

	return undefined;
}

/**
 * Parse the fence meta string. Return an empty object on failure.
 *
 * @param {HastElement} node
 * @returns {FenceMeta}
 */
function parseMeta(node) {
	try {
		const meta = node?.data?.meta;
		return meta ? parse(meta) : {};
	} catch {
		return {};
	}
}

/**
 * Split highlighted nodes into lines and wrap each line with `createLine`.
 *
 * @param {HastNode[]} children
 * @param {(children: HastNode[], lineNumber: number) => HastElement} createLine
 * @returns {MappedLines}
 */
function mapLines(children, createLine) {
	const newLine = /\r?\n|\r/g;
	const replacement = [];
	let index = -1;
	let start = 0;
	let startTextRemainder = "";
	let lineNumber = 0;

	while (++index < children.length) {
		const child = children[index];

		if (child.type === "text") {
			let textStart = 0;
			newLine.lastIndex = 0;
			let match = newLine.exec(child.value);

			while (match) {
				const line = children.slice(start, index);

				if (startTextRemainder) {
					line.unshift({ type: "text", value: startTextRemainder });
					startTextRemainder = "";
				}

				if (match.index > textStart) {
					line.push({
						type: "text",
						value: child.value.slice(textStart, match.index)
					});
				}

				lineNumber += 1;
				replacement.push(createLine(line, lineNumber), {
					type: "text",
					value: match[0]
				});

				start = index + 1;
				textStart = match.index + match[0].length;
				match = newLine.exec(child.value);
			}

			if (start === index + 1) {
				startTextRemainder = child.value.slice(textStart);
			}
		}
	}

	const line = children.slice(start);
	if (startTextRemainder) {
		line.unshift({ type: "text", value: startTextRemainder });
	}

	if (line.length > 0) {
		lineNumber += 1;
		replacement.push(createLine(line, lineNumber));
	}

	return {
		children: replacement,
		totalLines: lineNumber
	};
}
