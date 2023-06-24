import { z } from "astro:content";

const contentTypes = ["website", "article", "profile"];
const contentCategories = ["guide", "status", "opinion", "reference"];

const title = z.string().max(64);
const description = z.string().max(200);
const date = z.date();
const update = z.date().optional();
const image = z.string().optional();
const tagline = z.string().optional();

const postSchema = z.object({
	title,
	description,
	type: z.enum(contentTypes).default("article"),
	date,
	update,
	category: z.enum(contentCategories).default("guide"),
	tags: z.array(z.string()),
	image,
	tagline,
	outdated: z.boolean().optional()
});

const profileSchema = z.object({
	title,
	description,
	type: z.enum(contentTypes).default("profile"),
	date,
	update,
	image,
	tagline
});

const pageSchema = z.object({
	title,
	description,
	type: z.enum(contentTypes).default("website"),
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
