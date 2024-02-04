import { getCollection } from "astro:content";
import { encode } from "html-entities";
import { postPathname } from "~website";

const defaults = [
	{
		"title": "Home",
		"tags": ["homepage", "index"],
		"path": "/",
		"icon": `<svg role="img" class="icon" aria-hidden="true"><path d="M7.455 4C4.442 4 2 6.436 2 9.441v8.745a1.82 1.82 0 0 0 3.294 1.059L8.9 14.243a.911.911 0 0 1 1.426-.063l4.192 4.839c.518.598 1.271.981 2.063.981h2.692c.723 0 1.417-.326 1.928-.836.512-.51.799-1.202.799-1.924v-4.71c0-1.107-.44-2.168-1.224-2.95l-4.374-4.363A4.17 4.17 0 0 0 13.459 4H7.455Z"/><polyline points="18 16.01 18 16"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Posts",
		"tags": ["articles", "guides", "tutorials", "posts"],
		"path": "/posts/",
		"icon": `<svg role="img" class="icon" aria-hidden="true"><path d="M13 8h4v4h-4V8ZM7 8h2m-2 4h2m-2 4h10"/><path d="M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6Z"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "About",
		"tags": ["about"],
		"path": "/about/",
		"icon": `<svg role="img" class="icon" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Work",
		"tags": ["work", "resume"],
		"path": "/work/",
		"icon": `<svg role="img" class="icon" aria-hidden="true"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Privacy",
		"tags": ["privacy policy"],
		"path": "/privacy/",
		"icon": `<svg role="img" class="icon" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Preferences",
		"tags": ["preferences", "theme-switcher"],
		"content": `<a class="command-item" onclick="document.dispatchEvent(new Event('toggletheme'))" part="link" tabindex="0"><svg role="img" class="icon" aria-hidden="true"><path d="M6 12h.01M8 8h.01M13 7h.01M17 10h.01M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>Switch theme</a>`,
		"section": "Preferences"
	}
];

export async function GET() {
	const posts = (await getCollection("post"))
		.map(post => ({ title: encode(post.data.title), tags: post.data.tags, path: postPathname(post.slug) }));
	return new Response(JSON.stringify([...defaults, ...posts]));
}
