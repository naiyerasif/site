import { Feed } from "feed"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkSmartypants from "remark-smartypants"
import remarkDirective from "remark-directive"
import remarkCalloutDirectives from "@microflash/remark-callout-directives"
import remarkTweetDirective from "../generic-directives/remark-tweet-directive.js"
import remarkYoutubeDirective from "../generic-directives/remark-youtube-directive.js"
import remarkFigCaption from "@microflash/remark-figure-caption"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import { canonical } from "~universal"

function canonize(html) {
	const relativeRefs = /(href|src)=("|')((?=\.{1,2}\/|\/).+?)\2/gi
	return html.replace(relativeRefs, (_, attribute, quote, relUrl) => {
		return [attribute, "=", quote, canonical(relUrl), quote].join("")
	})
}

async function process(markdown) {
	const file = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkSmartypants)
		.use(remarkFigCaption)
		.use(remarkDirective)
		.use(remarkTweetDirective, { noscript: true })
		.use(remarkYoutubeDirective)
		.use(remarkCalloutDirectives)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(markdown)
	
	return String(file)
}

export default async function(items, options) {
	const feedProcessor = new Feed(options)

	for (const item of items) {
		if (item.content) {
			const html = await process(item.content)
			item.content = canonize(html)
		}
		feedProcessor.addItem(item)
	}

	return {
		body: feedProcessor.rss2(),
	}
}
