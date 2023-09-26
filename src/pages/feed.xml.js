import { getCollection } from "astro:content";
import rss from "~astro-rss";
import { compare } from "~datetime";
import siteInfo, { fullLink, postPathname } from "~website";

const baseUrl = siteInfo.siteBase;
const author = siteInfo.author.name;
const aboutUrl = fullLink("/about");

const options = {
	id: baseUrl,
	title: siteInfo.title,
	link: baseUrl,
	description: siteInfo.description,
	copyright: `2018, ${author}`,
	feedLinks: {
		rss: fullLink("/feed.xml")
	}
};

export async function GET() {
	const posts = (await getCollection("post"))
		.filter(post => post.data.category !== "status")
		.sort((p1, p2) => compare(p1.data.update, p2.data.update))
		.slice(0, siteInfo.maxFeedItems)
		.map(post => {
			const pageUrl = fullLink(postPathname(post.slug));
			const showUpdate = compare(post.data.update, post.data.date) !== 0;
			return {
				title: showUpdate ? `[Updated] ${post.data.title}` : post.data.title,
				date: new Date(post.data.update),
				author: [{
					name: author,
					email: author,
					link: aboutUrl
				}],
				content: post.body,
				link: pageUrl,
				id: pageUrl
			}
		});
	
	return rss(posts, options);
}
