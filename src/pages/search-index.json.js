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
		"content": `<theme-switcher><svg role="img" class="icon" slot="theme-dark" aria-hidden="true"><use href="#moon"/></svg><svg role="img" class="icon" slot="theme-light" aria-hidden="true"><use href="#sun"/></svg></theme-switcher>`,
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
