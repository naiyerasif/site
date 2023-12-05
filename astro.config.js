import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import rehypeExternalLinks from "rehype-external-links";
import rehypeFigure from "@microflash/rehype-figure";
import rehypeSlugify from "@microflash/rehype-slugify";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStarryNight from "@microflash/rehype-starry-night";
import rehypeStarryNightHeaderCaptionExtension from "@microflash/rehype-starry-night/header-caption-extension";
import rehypeStarryNightHeaderLanguageExtension from "@microflash/rehype-starry-night/header-language-extension";
import remarkCustomDirectives from "./src/modules/remark-custom-directives/index.js";
import siteInfo from "./src/modules/website/index.js";
import { CountableSlugifier } from "./src/modules/slugifier/index.js";

const slugifier = CountableSlugifier.slugifier();

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
		remarkPlugins: [
			remarkDirective,
			remarkCustomDirectives,
			[
				remarkCalloutDirectives,
				{
					callouts: {
						note: { tagName: "div" },
						commend: { tagName: "div" },
						warn: { tagName: "div" },
						deter: { tagName: "div" },
						assert: { tagName: "div" },
						setup: {
							title: "Setup",
							hint: `<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-hint"><path d="M17.665 3.473 13.626 7.5l2.879 2.871 4.039-4.027a5.556 5.556 0 0 1-1.16 6.181 5.626 5.626 0 0 1-6.207 1.166l-6.742 6.736A2.04 2.04 0 0 1 5.018 21a2.042 2.042 0 0 1-2.036-2.03c0-.527.206-1.035.574-1.413l6.74-6.74a5.585 5.585 0 0 1 1.17-6.187 5.595 5.595 0 0 1 6.199-1.157Z"/></svg>`,
							tagName: "div"
						}
					}
				}
			]
		],
		rehypePlugins: [
			[rehypeFigure, { className: "figure" }],
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
									href: "#link"
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
						conf: "ini",
						json: "jsonc",
						log: "sh"
					},
					headerExtensions: [
						rehypeStarryNightHeaderLanguageExtension,
						rehypeStarryNightHeaderCaptionExtension,
						(headerOptions, children) => {
							children.push({
								type: "element",
								tagName: "clipboard-copy",
								properties: { className: ["highlight-copy"], for: headerOptions.id },
								children: [
									{
										type: "text",
										value: "Copy"
									}
								]
							})
						}
					]
				}
			]
		]
	}
});
