import { getCollection } from "astro:content";
import { encode } from "html-entities";
import { postPathname } from "~website";

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
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
		"section": "Navigation"
	},
	{
		"title": "Privacy",
		"description": "Privacy statement about naiyerasif.com",
		"path": "/privacy/",
		"icon": `<svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`,
		"section": "Navigation"
	},
	// `href='#'` is required for links acting as buttons to enable click semantics (such as receiving keyboard focus, press enter to click, etc)
	{
		"title": "Theme Switcher",
		"description": "Switch to your preferred theme",
		"content": `<theme-switcher><a role="switch" aria-live="polite" aria-checked="true" data-theme-switch class="command-item" href="#"><span data-theme-state="dark"><svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="M13.355 2C18.238 2.684 22 6.882 22 11.951 22 17.497 17.497 22 11.951 22 6.882 22 2.684 18.238 2 13.355a8.02 8.02 0 0 0 5.932 2.616 8.043 8.043 0 0 0 8.039-8.039A8.02 8.02 0 0 0 13.355 2"/></svg>Dark theme</span><span data-theme-state="light"><svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="m9.321 2 .535 2m4.288 16 .535 2M3.036 6.824l1.787 1.033m14.354 8.286 1.787 1.033M2 14.679l2-.535m16-4.288 2-.535M7.857 19.177l-1.033 1.787M17.176 3.036l-1.033 1.787"/><circle cx="12" cy="12" r="4"/></svg>Light theme</span></a></theme-switcher>`,
		"section": "Preferences"
	},
	{
		"title": "Data Saver",
		"description": "Toggle data saver mode",
		"content": `<data-saver><a role="switch" aria-live="polite" aria-checked="true" style="cursor:pointer" data-saver-switch class="command-item" href="#"><span data-saver-state="on"><svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="M8 12h8m-4-4v8m1.881-13.823C18.502 3.058 22 7.124 22 12a9.95 9.95 0 0 1-1.616 5.449m-2.806 2.85A9.95 9.95 0 0 1 12 22C6.481 22 2 17.519 2 12c0-4.804 3.394-8.821 7.913-9.782"/></svg>Data Saver on</span><span data-saver-state="off"><svg viewBox="0 0 24 24" role="img" class="icon" aria-hidden="true"><path d="M13.881 2.088C18.502 2.969 22 7.035 22 11.911a9.95 9.95 0 0 1-1.616 5.449m-2.806 2.85A9.95 9.95 0 0 1 12 21.911c-5.519 0-10-4.481-10-10C2 7.107 5.394 3.09 9.913 2.129"/></svg>Data Saver off</span></a></data-saver>`,
		"section": "Preferences"
	}
];

export async function GET() {
	const posts = (await getCollection("post"))
		.map(post => ({ title: encode(post.data.title), description: post.data.description,  path: postPathname(post.slug) }));
	return new Response(JSON.stringify([...defaults, ...posts]));
}
