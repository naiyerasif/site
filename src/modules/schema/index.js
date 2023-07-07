import { z } from "astro:content";
import siteInfo, { fullLink, editLink } from "~website";

const title = z.string().max(64);
const contentTypes = z.enum(["website", "article", "profile"]);
const contentCategories = z.enum(["guide", "status", "opinion", "reference", "note"]);
const description = z.preprocess(val => val || siteInfo.description, z.string().max(200));
const date = z.date();
const update = z.date().optional();
const image = z.preprocess(
	val => fullLink(val || "/images/opengraph/default.png"), 
	z.string().url()
);
const tagline = z.string().optional();
const url = z.preprocess(val => val && fullLink(val), z.string().url());
const optionalUrl = z.preprocess(val => val && fullLink(val), z.string().url().optional());
const optionalEditUrl = z.preprocess(val => val && editLink(val), z.string().startsWith(siteInfo.editBase).url().optional());
const optionalInteger = z.preprocess(val => val > 0 ? val : undefined, z.number().int().optional());

const postSchema = z.object({
	title,
	description,
	type: contentTypes.default("article"),
	date,
	update,
	category: contentCategories.default("guide"),
	tags: z.array(z.string()).optional(),
	image,
	tagline,
	outdated: z.boolean().optional()
});

const profileSchema = z.object({
	title,
	description,
	type: contentTypes.default("profile"),
	date,
	update,
	image,
	tagline,
	avatar: z.string()
});

const pageSchema = z.object({
	title,
	description,
	type: contentTypes.default("website"),
	date,
	update,
	image,
	tagline
});

const pageInfoSchema = z.object({
	title,
	description,
	url,
	hint: z.string(),
	previous: optionalUrl,
	next: optionalUrl,
	source: optionalEditUrl,
	image,
	type: contentTypes.default("website"),
	published: z.string().optional(), // add yyyy-MM-dd format validation
	updated: z.string().optional(), // add yyyy-MM-dd format validation
	timeToRead: optionalInteger
});

export {
	contentTypes,
	contentCategories,
	postSchema,
	profileSchema,
	pageSchema,
	pageInfoSchema
};
