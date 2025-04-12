import { z } from "astro:content";
import siteInfo, { fullLink, editLink } from "../website/index.js";
import { PageType, PostType, Status } from "./defs.js";

const title = z.string().max(64);
const description = z.preprocess(
	val => val || siteInfo.description,
	z.string().max(200)
);
const date = z.date();
const update = z.date().optional();
const tagline = z.string().optional();
const status = z.enum(Object.keys(Status)).optional();
const postType = z.enum(Object.keys(PostType)).default(PostType.guide.id);
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
const ogTypes = z.enum(Object.keys(PageType));

const postSchema = z.object({
	title,
	description,
	tagline,
	date,
	update,
	type: postType,
	status,
	showToc: z.boolean().default(true),

	ogImage,
	ogType: ogTypes.default(PageType.article.id),
});

const profileSchema = ({ image }) => z.object({
	title,
	description,
	tagline,
	date,
	update,
	avatar: image(),

	ogImage,
	ogType: ogTypes.default(PageType.profile.id),
});

const pageSchema = z.object({
	title,
	description,
	tagline,
	date,
	update,
	status,
	showToc: z.boolean().default(false),

	ogImage,
	ogType: ogTypes.default(PageType.website.id),
});

const pageInfoSchema = z.object({
	title,
	description,
	url,
	image: ogImage,
	type: ogTypes.default(PageType.website.id),
	published: z.string().optional(), // add yyyy-MM-dd format validation
	updated: z.string().optional(), // add yyyy-MM-dd format validation
	previous: optionalUrl,
	next: optionalUrl,
	source: optionalEditUrl,
});

export {
	postSchema,
	profileSchema,
	pageSchema,
	pageInfoSchema
};
