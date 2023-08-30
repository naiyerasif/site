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
		rss: fullLink("/all.xml")
	}
};

export async function GET() {
	const posts = (await getCollection("post"))
		.sort((p1, p2) => compare(p1.data.date, p2.data.date))
		.slice(0, siteInfo.maxFeedItems)
		.map(post => {
			const pageUrl = fullLink(postPathname(post.slug));
			return {
				title: post.data.title,
				date: post.data.date,
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
