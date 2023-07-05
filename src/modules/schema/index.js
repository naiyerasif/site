import { z } from "astro:content";
import siteInfo, { fullLink } from "~website";

const title = z.string().max(64);
const contentTypes = z.enum(["website", "article", "profile"]);
const contentCategories = z.enum(["guide", "status", "opinion", "reference"]);
const description = z.preprocess(val => val || siteInfo.description, z.string().max(200));
const date = z.date();
const update = z.date().optional();
const image = z.preprocess(
	val => fullLink(val || "/images/opengraph/default.png"), 
	z.string().url()
);
const tagline = z.string().optional();

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
	tagline
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

export {
	contentTypes,
	contentCategories,
	postSchema,
	profileSchema,
	pageSchema
};
