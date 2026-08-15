import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlugify from "@microflash/rehype-slugify";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStarryNight from "@microflash/rehype-starry-night";
import {
	titlePlugin,
	languageIndicatorPlugin,
	lineAnnotationPlugin
} from "@microflash/rehype-starry-night/plugins";
import { remarkFigureDirective } from "@naiyer/remark-directives";
import {
	remarkDescriptionListDirective,
	remarkTimeDirective,
	remarkYoutubeDirective
} from "#utils/remark/index.js";
import siteInfo from "#utils/website.js";
import { calloutOptions } from "#utils/markdown.js";
import { createCountableSlugifier } from "#utils/slugifier.js";
import { customGrammars } from "#utils/textmate/index.js";

const slugifier = createCountableSlugifier();

// https://astro.build/config
export default defineConfig({
	site: siteInfo.siteBase,
	server: {
		port: 8080
	},
	integrations: [sitemap({
		filter: page =>
			page !== `${siteInfo.siteBase}/search-index.json/` &&
			page !== `${siteInfo.siteBase}/all.xml/` &&
			page !== `${siteInfo.siteBase}/feed.xml/`
	})],
	vite: {
		server: {
			watch: {
				ignored: [
					"**/.git/**",
					"**/.unlighthouse/**",
					"**/.workspace/**",
					"**/node_modules/**",
				],
			},
		},
	},
	markdown: {
		syntaxHighlight: false,
		processor: unified({
			remarkPlugins: [
				remarkDirective,
				remarkTimeDirective,
				remarkFigureDirective,
				remarkYoutubeDirective,
				[remarkCalloutDirectives, calloutOptions],
				remarkDescriptionListDirective
			],
			rehypePlugins: [
				[
					rehypeExternalLinks,
					{
						target: false,
						rel: ["nofollow", "noopener", "noreferrer"]
					}
				],
				[
					rehypeSlugify,
					{
						reset() {
							slugifier.reset()
						},
						slugify(text) {
							return slugifier.slugify(text)
						}
					}
				],
				[
					rehypeAutolinkHeadings,
					{
						behavior: "append",
						content: {
							type: "element",
							tagName: "svg",
							properties: {
								"aria-hidden": "true",
								role: "img",
								className: ["icon"]
							},
							children: [
								{
									type: "element",
									tagName: "use",
									properties: {
										href: "#x4-link"
									}
								}
							]
						}
					}
				],
				[
					rehypeStarryNight,
					{
						aliases: {
							brewfile: "shell",
							conf: "ini",
							json: "jsonc",
						},
						grammars: customGrammars,
						plugins: [
							titlePlugin,
							lineAnnotationPlugin,
							languageIndicatorPlugin,
							{
								type: "footer",
								apply: (opts, nodes) => {
									if (opts.id) {
										nodes.push({
											type: "element",
											tagName: "clipboard-copy",
											properties: {
												className: [`${opts.namespace}-copy`],
												for: opts.id
											},
											children: [
												{ type: "text", value: "Copy" }
											]
										});
									}
								}
							}
						]
					}
				]
			]
		})
	}
});
