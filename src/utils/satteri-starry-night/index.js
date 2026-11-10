import defu from "defu";
import { defineHastPlugin } from "satteri";
import { createStarryNight } from "@wooorm/starry-night";
import parse from "@microflash/fenceparser";
import { customGrammars } from "./grammars/index.js";

const listFormatUnit = new Intl.ListFormat("en", { type: "unit" });
const newLineRegex = /\r?\n|\r/g;
const prefix = "language-";
const defaults = {
	namespace: "hl",
	aliases: {},
	plainText: [],
	plugins: []
};

const isLinePlugin = plugin => plugin.type === "line" && typeof plugin.apply === "function";
const isHeaderPlugin = plugin => plugin.type === "header" && typeof plugin.apply === "function";

export default function satteriStarryNight(options = {}) {
	const {
		namespace,
		grammars = customGrammars,
		aliases,
		plainText,
		plugins,
		allowMissingScopes
	} = defu(options, defaults);

	const headerPlugins = plugins.filter(isHeaderPlugin);
	const linePlugins = plugins.filter(isLinePlugin);

	const hasPlugins = plugins.length > 0;
	const hasHeaderPlugins = headerPlugins.length > 0;
	const hasLinePlugins = linePlugins.length > 0;

	const starryNightPromise = createStarryNight(grammars);
	let starryNight;
	let checked = false;

	return () => {
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
				visit(container, ctx) {
					const [node] = container.children;

					if (!node || node.type !== "element" || node.tagName !== "code") {
						return;
					}

					const language = extractLanguage(node);
					if (!language || plainText.includes(language)) {
						return;
					}

					const resolvedLanguage = aliases[language] || language;
					const scope = starryNight.flagToScope(resolvedLanguage);

					if (!scope) {
						console.warn(
							`[satteri-starry-night] Unexpected unknown language \`${language}\` defined with \`${prefix}\` class, expected a known name`
						);
						return;
					}

					const blockNodes = [];
					const sectionOpts = { namespace, language };
					const meta = hasPlugins ? parseMeta(node) : {};

					// Apply header
					if (hasHeaderPlugins) {
						const headerNodes = mapSection(headerPlugins, sectionOpts, meta);
						if (headerNodes.length > 0) {
							blockNodes.push({
								type: "element",
								tagName: "div",
								properties: { className: [`${namespace}-header`] },
								children: headerNodes
							});
						}
					}

					// Highlight with Starry Night
					const fragment = starryNight.highlight(ctx.textContent(node), scope);

					// Apply line decorations
					let codeChildren = fragment.children;
					const codeProperties = {
						tabIndex: 0,
						...node.properties
					};

					if (hasLinePlugins) {
						const lineOpts = Object.assign(
							{},
							...linePlugins
								.filter(plugin => Boolean(plugin.opts))
								.map(plugin => plugin.opts(meta))
						);

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
						const gutter = `${totalLines}`.length;
						codeProperties.style = `--hl-line-gutter: ${gutter}`;
					}

					const newCodeNode = {
						type: "element",
						tagName: "code",
						properties: codeProperties,
						children: codeChildren,
						...(node.data ? { data: { ...node.data } } : {})
					};

					const newPreNode = {
						type: "element",
						tagName: "pre",
						properties: { ...container.properties },
						children: [newCodeNode],
						...(container.data ? { data: { ...container.data } } : {})
					};

					blockNodes.push(newPreNode);

					// Replace <pre> with the wrapper <div class={namespace}>
					ctx.replaceNode(container, {
						type: "element",
						tagName: "div",
						properties: { className: [namespace] },
						children: blockNodes
					});
				}
			}
		});
	};
}

function extractLanguage(node) {
	if (typeof node.data?.lang === "string" && node.data.lang.length > 0) {
		return node.data.lang;
	}

	const classes = node.properties?.className;
	if (Array.isArray(classes)) {
		const languageClass = classes.find(
			d => typeof d === "string" && d.startsWith(prefix)
		);
		if (languageClass) {
			return languageClass.slice(prefix.length);
		}
	}

	return undefined;
}

function parseMeta(node) {
	try {
		const meta = node?.data?.meta;
		return meta ? parse(meta) : {};
	} catch {
		return {};
	}
}

function mapSection(plugins, opts, meta) {
	const pluginOpts = Object.assign(
		{ ...opts },
		...plugins
			.filter(plugin => Boolean(plugin.opts))
			.map(plugin => plugin.opts(meta))
	);

	return plugins.flatMap(plugin => {
		const result = plugin?.apply(pluginOpts);
		if (!result) return [];
		return Array.isArray(result) ? result : [result];
	});
}

function mapLines(children, createLine) {
	const replacement = [];
	let index = -1;
	let start = 0;
	let startTextRemainder = "";
	let lineNumber = 0;

	while (++index < children.length) {
		const child = children[index];

		if (child.type === "text") {
			let textStart = 0;
			let match = newLineRegex.exec(child.value);

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
				match = newLineRegex.exec(child.value);
			}

			if (start === index + 1) {
				startTextRemainder = child.value.slice(textStart);
			}
		}
	}

	const line = children.slice(start);
	if (startTextRemainder) {
		line.unshift({ type: "text", value: startTextRemainder });
		startTextRemainder = "";
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
