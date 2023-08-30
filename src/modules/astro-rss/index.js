import { Feed } from "feed";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkDirective from "remark-directive";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import remarkCustomDirectives from "../remark-custom-directives/index.js";
import remarkRehype from "remark-rehype";
import rehypeFigure from "@microflash/rehype-figure";
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
		.use(remarkCustomDirectives)
		.use(remarkCalloutDirectives, {
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
		})
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeFigure)
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
