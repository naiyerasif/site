import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"
import rehypeStarryNight from "@microflash/rehype-starry-night"
import remarkDirective from "remark-directive"
import rehypeExternalLinks from "rehype-external-links"
import rehypeSlugify from "@microflash/rehype-slugify"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import remarkFigCaption from "@microflash/remark-figure-caption"
import remarkCalloutDirectives from "@microflash/remark-callout-directives"
import remarkEmbedDirective from "./src/modules/generic-directives/remark-embed-directive.js"
import remarkYoutubeDirective from "./src/modules/generic-directives/remark-youtube-directive.js"
import siteInfo from "./src/modules/universal/index.js"
import { CountableSlugifier } from "./src/modules/slugifier/index.js"
const slugifier = CountableSlugifier.slugifier()

// https://astro.build/config
export default defineConfig({
	site: siteInfo.base,
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
				remarkFigCaption,
				{
					figureClassName: "feature"
				}
			],
			remarkDirective,
			remarkEmbedDirective,
			remarkYoutubeDirective,
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
})
