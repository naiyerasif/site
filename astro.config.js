import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlugify from "@microflash/rehype-slugify";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStarryNight from "@microflash/rehype-starry-night";
import rehypeStarryNightHeaderCaptionExtension from "@microflash/rehype-starry-night/header-caption-extension";
import rehypeStarryNightHeaderLanguageExtension from "@microflash/rehype-starry-night/header-language-extension";
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
					tagName: "div",
					callouts: {
						setup: {
							title: "Setup",
							hint: `<svg aria-hidden="true" class="icon callout-hint" viewBox="0 0 24 24"><path d="M17.631 3.471 13.592 7.51l2.879 2.88 4.039-4.039a5.604 5.604 0 0 1-1.16 6.199 5.632 5.632 0 0 1-6.207 1.169l-6.002 6.516a2.37 2.37 0 0 1-3.422.068l-.001-.001a2.398 2.398 0 0 1 .066-3.448l6.478-6.017a5.634 5.634 0 0 1 1.17-6.206 5.603 5.603 0 0 1 6.199-1.16Z"/></svg>`
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
