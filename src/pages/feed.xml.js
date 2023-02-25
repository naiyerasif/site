import { getCollection } from "astro:content"
import rss from "~astro-rss"
import { compare } from "~datetime"
import siteInfo, { canonical, postPathname } from "~universal"

const baseUrl = siteInfo.base
const author = siteInfo.author
const aboutUrl = canonical("/about")

const options = {
	id: baseUrl,
	title: siteInfo.title,
	link: baseUrl,
	description: siteInfo.description,
	copyright: `2018, ${author}`,
	feedLinks: {
		rss: canonical("/feed.xml")
	}
}

export async function get() {
	const posts = (await getCollection("post"))
		.filter(post => post.data.category !== "status")
		.sort((p1, p2) => compare(p1.data.date, p2.data.date))
		.slice(0, siteInfo.maxFeedItems)
		.map(post => {
			const pageUrl = canonical(postPathname(post.slug))
			return {
				title: post.data.title,
				date: new Date(post.data.date),
				author: [{
					name: author,
					email: author,
					link: aboutUrl
				}],
				content: post.body,
				link: pageUrl,
				id: pageUrl
			}
		})
	
	return rss(posts, options)
}
