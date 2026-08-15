import { getCollection } from "astro:content";
import rss from "../modules/astro-rss/index.js";
import { compare } from "#utils/datetime.js";
import siteInfo, { fullLink } from "../modules/website/index.js";
import { getPosts } from "#utils/content.js";

const baseUrl = siteInfo.siteBase;
const authorName = siteInfo.author.name;
const aboutUrl = fullLink("/about");

const author = {
	name: authorName,
	link: aboutUrl
};

const options = {
	id: baseUrl,
	link: baseUrl,
	title: siteInfo.title,
	description: siteInfo.description,
	copyright: `${(new Date()).getFullYear()}, ${authorName}`,
	feedLinks: {
		rss: fullLink("/all.xml")
	},
	author
};

export async function GET() {
	const posts = (await getPosts())
		.slice(0, siteInfo.maxFeedItems)
		.map(post => {
			const pageUrl = fullLink(post.id);
			const showUpdate = compare(post.data.update, post.data.date) !== 0;
			return {
				title: showUpdate ? `[Updated] ${post.data.title}` : post.data.title,
				date: post.data.update,
				author: [author],
				content: post.body,
				link: pageUrl,
				id: pageUrl
			};
		});

	return rss(posts, options);
}
