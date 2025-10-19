import { getCollection } from "astro:content";
import { encode } from "html-entities";
import { postPathname } from "../modules/website/index.js";
import { Status } from "../modules/schema/defs.js";

const defaults = [
	{
		"title": "Home",
		"path": "/",
		"icon": `<svg role="img" class="icon" aria-hidden="true"><use href="#x4-home"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Posts",
		"path": "/posts/",
		"icon": `<svg role="img" class="icon" aria-hidden="true"><use href="#x4-posts"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "About",
		"description": "About Naiyer Asif",
		"path": "/about/",
		"icon": `<svg role="img" class="icon" aria-hidden="true"><use href="#x4-callout-note"/></svg>`,
		"section": "Navigation"
	},
];

export async function GET() {
	const posts = (await getCollection("post"))
		.filter(post => post.data.state !== Status.outdated.id)
		.map(post => ({
			title: encode(post.data.title),
			description: post.data.description,
			path: postPathname(post.id)
		}));
	return new Response(JSON.stringify([...defaults, ...posts]));
}
