import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkFigureCaption from "@microflash/remark-figure-caption";
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlugify from "@microflash/rehype-slugify";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStarryNight from "@microflash/rehype-starry-night";
import remarkYoutubeDirective from "./src/modules/remark-youtube-directive/index.js";
import remarkTimeDirective from "./src/modules/remark-time-directive/index.js";
import siteInfo from "./src/modules/website/index.js";
import { CountableSlugifier } from "./src/modules/slugifier/index.js";

const slugifier = CountableSlugifier.slugifier();

// https://astro.build/config
export default defineConfig({
	site: siteInfo.siteBase,
	server: {
		port: 8080
	},
	scopedStyleStrategy: "class",
	integrations: [sitemap()],
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
			[
				remarkFigureCaption,
				{
					figureClassName: "figure"
				}
			],
			remarkDirective,
			remarkYoutubeDirective,
			remarkTimeDirective,
			[
				remarkCalloutDirectives,
				{
					callouts: {
						setup: {
							title: "Setup",
							hint: `<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-hint"><use href="#setup"/></svg>`,
							tagName: "div"
						}
					}
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
					}
				}
			]
		]
	}
});
