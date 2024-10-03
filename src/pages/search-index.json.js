import { getCollection } from "astro:content";
import { encode } from "html-entities";
import { postPathname } from "../modules/website/index.js";

const defaults = [
	{
		"title": "Home",
		"path": "/",
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="M7.455 4C4.442 4 2 6.436 2 9.441v8.745a1.82 1.82 0 0 0 3.294 1.059L8.9 14.243a.911.911 0 0 1 1.426-.063l4.192 4.839c.518.598 1.271.981 2.063.981h2.692c.723 0 1.417-.326 1.928-.836.512-.51.799-1.202.799-1.924v-4.71c0-1.107-.44-2.168-1.224-2.95l-4.374-4.363A4.17 4.17 0 0 0 13.459 4H7.455Z"/><polyline points="18 16.01 18 16"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Posts",
		"path": "/posts/",
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="M13 8h4v4h-4V8ZM7 8h2m-2 4h2m-2 4h10"/><path d="M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6Z"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "About",
		"description": "About Naiyer Asif",
		"path": "/about/",
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Work",
		"description": "A timeline of professional and open-source work",
		"path": "/work/",
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="m2.576 16.484.14 1.823A4 4 0 0 0 6.704 22h10.592a4 4 0 0 0 3.988-3.693l.14-1.823M22 8.995A3 3 0 0 0 19.002 6H5a3.004 3.004 0 0 0-3.001 3H2c0 3.311 4.481 6 10 6s10-2.689 10-6zM12 15v3M8 6l.621-2.485A2 2 0 0 1 10.562 2h2.876c.918 0 1.718.625 1.941 1.515L16 6"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Privacy",
		"description": "Privacy statement about naiyerasif.com",
		"path": "/privacy/",
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><circle cx="12" cy="12" r="2.5"/><path d="M12 2s-2 2-4.5 3S3 6 3 6c0 12 9 16 9 16s9-4 9-16c0 0-2 0-4.5-1S12 2 12 2"/></svg>`,
		"section": "Navigation"
	},
	// `href='#'` is required for links acting as buttons to enable click semantics (such as receiving keyboard focus, press enter to click, etc)
	{
		"title": "Theme Switcher",
		"description": "Switch to your preferred theme",
		"content": `<theme-switcher><a role="switch" aria-live="polite" aria-checked="true" data-theme-switch class="command-item" href="#"><span data-theme-state="dark"><svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="M12.617 2.019C17.849 2.338 22 6.688 22 12c0 5.519-4.481 10-10 10-5.312 0-9.662-4.151-9.981-9.383A7.48 7.48 0 0 0 7.5 15c4.139 0 7.5-3.361 7.5-7.5a7.48 7.48 0 0 0-2.383-5.481"/></svg>Dark theme</span><span data-theme-state="light"><svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="m16.142 2-.889 2.146M8.747 19.854 7.858 22M2 7.858l2.146.889m15.708 6.506 2.146.889M7.858 2l.889 2.146m6.506 15.708L16.142 22M2 16.142l2.146-.889m15.708-6.506L22 7.858"/></svg>Light theme</span></a></theme-switcher>`,
		"section": "Preferences"
	}
];

export async function GET() {
	const posts = (await getCollection("post"))
		.filter(post => post.data.state !== "outdated")
		.map(post => ({ title: encode(post.data.title), description: post.data.description,  path: postPathname(post.slug) }));
	return new Response(JSON.stringify([...defaults, ...posts]));
}
