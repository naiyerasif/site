import { getCollection } from "astro:content";
import { postPathname } from "~website";

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
	}
];

export async function get() {
	const posts = (await getCollection("post"))
		.map(post => ({ title: post.data.title, tags: post.data.tags, path: postPathname(post.slug) }));
	return {
		body: JSON.stringify([...defaults, ...posts]),
	};
}
