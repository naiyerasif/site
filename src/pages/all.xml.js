import { getCollection } from "astro:content";
import rss from "../modules/astro-rss/index.js";
import { compare } from "../modules/datetime/index.js";
import siteInfo, { fullLink, postPathname } from "../modules/website/index.js";

const baseUrl = siteInfo.siteBase;
const authorName = siteInfo.author.name;
const aboutUrl = fullLink("/about");

const author = {
	name: authorName,
	email: siteInfo.author.networks.mastodon.id,
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
	const posts = (await getCollection("post"))
		.sort((p1, p2) => compare(p1.data.update, p2.data.update))
		.slice(0, siteInfo.maxFeedItems)
		.map(post => {
			const pageUrl = fullLink(postPathname(post.slug));
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
