import { Feed } from "feed";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import { remarkFigureDirective } from "@naiyer/remark-directives";
import {
	remarkDescriptionListDirective,
	remarkTimeDirective,
	remarkYoutubeDirective
} from "#utils/remark/index.js";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { absoluteUrl } from "#utils/website.js";
import { calloutOptions } from "#utils/markdown.js";

function canonize(html) {
	const relativeRefs = /(href|src)=("|')((?=\.{1,2}\/|\/).+?)\2/gi;
	return html.replace(relativeRefs, (_, attribute, quote, relUrl) => {
		return [attribute, "=", quote, absoluteUrl(relUrl), quote].join("");
	});
}

async function process(markdown) {
	const file = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkSmartypants)
		.use(remarkDirective)
		.use(remarkTimeDirective)
		.use(remarkFigureDirective)
		.use(remarkDescriptionListDirective)
		.use(remarkYoutubeDirective, { server: true })
		.use(remarkCalloutDirectives, calloutOptions)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(markdown);
	
	return String(file);
}

export default async function(items, options) {
	const feedProcessor = new Feed(options);

	for (const item of items) {
		if (item.content) {
			const html = await process(item.content);
			item.content = canonize(html);
		}
		feedProcessor.addItem(item);
	}

	return new Response(feedProcessor.rss2());
}
