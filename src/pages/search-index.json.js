import { getCollection } from "astro:content"
import { postPathname } from "~universal"

const defaults = [
	{
		"title": "Home",
		"tags": ["homepage", "index"],
		"path": "/",
		"section": "Navigation"
	},
	{
		"title": "Posts",
		"tags": ["articles", "guides", "tutorials", "posts"],
		"path": "/posts/",
		"section": "Navigation"
	},
	{
		"title": "About",
		"tags": ["about"],
		"path": "/about/",
		"section": "Navigation"
	},
	{
		"title": "Preferences",
		"tags": ["preferences", "theme-switcher"],
		"content": `<theme-switcher></theme-switcher>`,
		"section": "Preferences"
	}
]

export async function get() {
	const posts = (await getCollection("post"))
		.map(post => ({ title: post.data.title, tags: post.data.tags, path: postPathname(post.slug) }))
	return {
		body: JSON.stringify([...defaults, ...posts]),
	}
}
