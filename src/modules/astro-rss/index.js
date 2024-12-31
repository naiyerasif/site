import { Feed } from "feed";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "../remark-callout-directives/index.js";
import remarkTimeDirective from "../remark-time-directive/index.js";
import remarkFigureDirective from "../remark-figure-directive/index.js";
import remarkYoutubeDirective from "../remark-youtube-directive/index.js";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { fullLink } from "../website/index.js";

function canonize(html) {
	const relativeRefs = /(href|src)=("|')((?=\.{1,2}\/|\/).+?)\2/gi;
	return html.replace(relativeRefs, (_, attribute, quote, relUrl) => {
		return [attribute, "=", quote, fullLink(relUrl), quote].join("");
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
		.use(remarkYoutubeDirective, { server: true })
		.use(remarkCalloutDirectives, { tagName: "div" })
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
