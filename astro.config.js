import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlugify from "@microflash/rehype-slugify";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStarryNight, { defaultPluginPack } from "@microflash/rehype-starry-night";
import remarkTimeDirective from "./src/modules/remark-time-directive/index.js";
import remarkFigureDirective from "./src/modules/remark-figure-directive/index.js";
import remarkYoutubeDirective from "./src/modules/remark-youtube-directive/index.js";
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
			remarkTimeDirective,
			remarkFigureDirective,
			remarkYoutubeDirective,
			[
				remarkCalloutDirectives,
				{
					tagName: "div"
				}
			]
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
									href: "#x2-link"
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
						log: "sh",
						psql: "sql"
					},
					plugins: [
						...defaultPluginPack,
						{
							type: "header",
							plugin: (globalOptions, nodes) => {
								nodes.push({
									type: "element",
									tagName: "clipboard-copy",
									properties: {
										className: [`${globalOptions.classNamePrefix}-copy`],
										for: globalOptions.id
									},
									children: [
										{ type: "text", value: "Copy" }
									]
								});
							}
						}
					]
				}
			]
		]
	}
});
