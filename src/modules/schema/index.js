import { z } from "astro:content";
import siteInfo, { fullLink, editLink } from "~website";

const title = z.string().max(64);
const description = z.preprocess(val => val || siteInfo.description, z.string().max(200));
const image = z.preprocess(
	val => fullLink(val || siteInfo.ogImage),
	z.string().url()
);
const date = z.date();
const update = z.date().optional();

const states = z.enum(["working draft", "archived", "outdated"]);
const postTypes = z.enum(["website", "article", "profile"]);
const postCategories = z.enum(["guide", "tutorial", "reference", "explanation", "opinion", "status", "note"]);
const tagline = z.string().optional();

const url = z.preprocess(val => val && fullLink(val), z.string().url());
const optionalUrl = z.preprocess(val => val && fullLink(val), z.string().url().optional());
const optionalEditUrl = z.preprocess(val => val && editLink(val), z.string().startsWith(siteInfo.editBase).url().optional());
const timeToRead = z.preprocess(val => val > 0 ? val : undefined, z.number().int().optional());

const postSchema = z.object({
	title,
	description,
	image,
	date,
	update,

	type: postTypes.default("article"),
	state: states.optional(),
	category: postCategories.default("guide"),
	tagline,

	showToc: z.boolean().default(true),
});

const profileSchema = z.object({
	title,
	description,
	image,
	date,
	update,

	type: postTypes.default("profile"),
	state: states.optional(),
	tagline,

	showToc: z.boolean().default(false),
	avatar: z.string(),
});

const pageSchema = z.object({
	title,
	description,
	image,
	date,
	update,

	type: postTypes.default("website"),
	state: states.optional(),
	tagline,

	showToc: z.boolean().default(false),
});

const pageInfoSchema = z.object({
	title,
	description,
	image,
	published: z.string().optional(), // add yyyy-MM-dd format validation
	updated: z.string().optional(), // add yyyy-MM-dd format validation

	type: postTypes.default("website"),
	state: states.optional(),

	url,
	previous: optionalUrl,
	next: optionalUrl,
	source: optionalEditUrl,
	timeToRead,
});

export {
	postSchema,
	profileSchema,
	pageSchema,
	pageInfoSchema
};
