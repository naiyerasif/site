import { z } from "astro/zod";
import { freeze } from "#utils/appliances.js";
import siteInfo, { absoluteUrl } from "#utils/website.js";
import format, { formats } from "#utils/datetime.js";

/**
 * @typedef {{ id: string }} ObjectRef
 * @typedef {{ id: string, label: string, showFull: boolean }} PostTypeRef
 */

/** @type {Record<string, PostTypeRef>} */
const PostType = freeze({
	note: { id: "note", label: "Note", showFull: true },
	guide: { id: "guide", label: "Guide", showFull: false },
	explainer: { id: "explainer", label: "Explainer", showFull: false },
	reference: { id: "reference", label: "Reference", showFull: false },
	opinion: { id: "opinion", label: "Opinion", showFull: false },
});

/** @type {Record<string, ObjectRef>} */
const PageType = freeze({
	website: { id: "website" },
	article: { id: "article" },
	profile: { id: "profile" },
});

const title = z.string().max(64);
const tagline = z.string().optional();
const date = z.coerce.date();
const update = date.optional();
const postTypes = z.enum(Object.keys(PostType));
const pageTypes = z.enum(Object.keys(PageType));
const url = z.preprocess(v => v && absoluteUrl(v), z.url());
const optionalUrl = z.preprocess(v => v && absoluteUrl(v), z.url().optional());
const cover = z.preprocess(v => absoluteUrl(v || siteInfo.cover), z.url());
const optionalDate = z.coerce.date().transform(v => format(v, formats.iso8601)).optional();

const Post = z.object({
	title,
	tagline,
	date,
	update,
	category: postTypes.default(PostType.guide.id),
	cover,
	showToc: z.boolean().default(true),
	type: pageTypes.default(PageType.article.id),
});

const Profile = ({ image }) => z.object({
	title,
	tagline,
	date,
	update,
	avatar: image(),
	cover,
	type: pageTypes.default(PageType.profile.id),
});

const Page = z.object({
	title,
	tagline,
	date,
	update,
	cover,
	showToc: z.boolean().default(false),
	type: pageTypes.default(PageType.website.id),
});

const PageInfo = z.object({
	title,
	url,
	cover,
	type: pageTypes.default(PageType.website.id),
	published: optionalDate,
	updated: optionalDate,
	previous: optionalUrl,
	next: optionalUrl
});

export { Post, Profile, Page, PageInfo, PageType, PostType };
