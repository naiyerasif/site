import { Feed } from "feed";
import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";
import { absoluteUrl } from "#utils/website.js";
import { satteriServerOptions } from "#utils/markdown.js";

function canonize(html) {
	const relativeRefs = /(href|src)=("|')((?=\.{1,2}\/|\/).+?)\2/gi;
	return html.replace(relativeRefs, (_, attribute, quote, relUrl) => {
		return [attribute, "=", quote, absoluteUrl(relUrl), quote].join("");
	});
}

const processor = await createSatteriMarkdownProcessor(satteriServerOptions);

async function process(markdown) {
	const { code } = await processor.render(markdown);
	return code;
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
