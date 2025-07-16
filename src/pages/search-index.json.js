import { getCollection } from "astro:content";
import { encode } from "html-entities";
import { postPathname } from "../modules/website/index.js";
import { Status } from "../modules/schema/defs.js";

const defaults = [
	{
		"title": "Home",
		"path": "/",
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><circle cx="12" cy="14" r="3"/><path d="m2 12 10-9 10 9"/><path d="M20 10.186v8.803a2.01 2.01 0 0 1-1.997 2l-12 .024-.003.001c-1.097 0-2-.903-2-2v-8.828"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Posts",
		"path": "/posts/",
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="M15 12.5h6m-6-6h6m-18 7 3.553-7.724a.5.5 0 0 1 .894 0L11 13.5m-8 5h18m-17.08-7h6.16"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "About",
		"description": "About Naiyer Asif",
		"path": "/about/",
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
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
		.filter(post => post.data.state !== Status.outdated.id)
		.map(post => ({
			title: encode(post.data.title),
			description: post.data.description,
			path: postPathname(post.id)
		}));
	return new Response(JSON.stringify([...defaults, ...posts]));
}
