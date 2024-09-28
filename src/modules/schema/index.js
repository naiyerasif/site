import { z } from "astro:content";
import siteInfo, { fullLink, editLink } from "../website/index.js";
import types from "./types.js";
import statesAsList from "./states.js";

const title = z.string().max(64);
const description = z.preprocess(
	val => val || siteInfo.description,
	z.string().max(200)
);
const date = z.date();
const update = z.date().optional();
const tagline = z.string().optional();
const state = z.enum([...statesAsList]).optional();
const contentTypes = z.enum([...types]).default("guide");
const url = z.preprocess(
	val => val && fullLink(val),
	z.string().url()
);
const optionalUrl = z.preprocess(
	val => val && fullLink(val),
	z.string().url().optional()
);
const optionalEditUrl = z.preprocess(
	val => val && editLink(val),
	z.string().startsWith(siteInfo.editBase).url().optional()
);
const timeToRead = z.preprocess(
	val => val > 0 ? val : undefined,
	z.number().int().optional()
);

const ogImage = z.preprocess(
	val => fullLink(val || siteInfo.ogImage),
	z.string().url()
);
const ogTypes = z.enum(["website", "article", "profile"]);

const postSchema = z.object({
	title,
	description,
	tagline,
	date,
	update,
	type: contentTypes,
	state,
	showToc: z.boolean().default(true),

	ogImage,
	ogType: ogTypes.default("article"),
});

const profileSchema = ({ image }) => z.object({
	title,
	description,
	tagline,
	date,
	update,
	avatar: image(),

	ogImage,
	ogType: ogTypes.default("profile"),
});

const pageSchema = z.object({
	title,
	description,
	tagline,
	date,
	update,
	state,
	showToc: z.boolean().default(false),

	ogImage,
	ogType: ogTypes.default("website"),
});

const pageInfoSchema = z.object({
	title,
	description,
	url,
	image: ogImage,
	type: ogTypes.default("website"),
	published: z.string().optional(), // add yyyy-MM-dd format validation
	updated: z.string().optional(), // add yyyy-MM-dd format validation
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
