import { Feed } from "feed";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import remarkTimeDirective from "../remark-time-directive/index.js";
import remarkFigureDirective from "../remark-figure-directive/index.js";
import remarkYoutubeDirective from "../remark-youtube-directive/index.js";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { fullLink } from "~website";

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
		.use(remarkCalloutDirectives, {
			tagName: "div",
			callouts: {
				setup: {
					title: "Setup",
					hint: `<svg aria-hidden="true" class="icon callout-hint" viewBox="0 0 24 24"><path d="M17.631 3.471 13.592 7.51l2.879 2.88 4.039-4.039a5.604 5.604 0 0 1-1.16 6.199 5.632 5.632 0 0 1-6.207 1.169l-6.002 6.516a2.37 2.37 0 0 1-3.422.068l-.001-.001a2.398 2.398 0 0 1 .066-3.448l6.478-6.017a5.634 5.634 0 0 1 1.17-6.206 5.603 5.603 0 0 1 6.199-1.16Z"/></svg>`
				}
			}
		})
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
