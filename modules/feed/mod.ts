import { merge } from 'lume/core/utils.ts'
import { feed } from '../../deps.ts'

import type { FeedOptions, FeedItem } from '../../deps.ts'

/** Available formats for feed generation */
export enum FeedFormat {
	ATOM_1,
	RSS_2,
	JSON_1
}

export interface Options {
	/** Feed options with the details about site, author, etc */
	feedOptions: FeedOptions,

	/** List of feed items */
	feedItems: FeedItem[],

	/** List of feed formats to generate the output */
	outputs: FeedFormat[],

	/** Base url to convert all the relative urls to absolute urls */
	baseUrl?: string,
}

export const defaults: Options = {
	// @ts-ignore: ignore the missing required properties; they should be provided by user
	feedOptions: {
		generator: 'Feed 4.2.2',
	},
	feedItems: [],
	outputs: [FeedFormat.RSS_2],
}

function convertToSiteUrls(html: string, baseUrl: string) {
	// Currently playing it conservative and only modifying things that are explicitly relative URLs
	const relativeRefs = /(href|src)=("|')((?=\.{1,2}\/|\/).+?)\2/gi
	return html.replace(relativeRefs, (_, attribute, quote, relUrl) => {
		return [attribute, '=', quote, new URL(relUrl, baseUrl).href, quote].join('')
	})
}

export default function createFeed(userOptions?: Partial<Options>): string[] {
	const options = merge(defaults, userOptions)

	const feedProcessor = new feed.Feed(options.feedOptions)

	for (const feedItem of options.feedItems) {
		if (options.baseUrl && feedItem.content) {
			feedItem.content = convertToSiteUrls(feedItem.content, options.baseUrl)
		}
		feedProcessor.addItem(feedItem)
	}

	const outputs = []

	if (options.outputs.includes(FeedFormat.ATOM_1)) {
		outputs.push(feedProcessor.atom1())
	}

	if (options.outputs.includes(FeedFormat.RSS_2)) {
		outputs.push(feedProcessor.rss2())
	}

	if (options.outputs.includes(FeedFormat.JSON_1)) {
		outputs.push(feedProcessor.json1())
	}

	return outputs
}
