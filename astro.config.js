import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import sitemap from "@astrojs/sitemap";
import siteInfo from "#utils/website.js";
import { satteriClientOptions } from "#utils/markdown.js";

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
		processor: satteri(satteriClientOptions),
	}
});
