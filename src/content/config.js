import { defineCollection } from "astro:content";
import { postSchema, pageSchema, profileSchema } from "~schema";

const postCollection = defineCollection({
	type: "content",
	schema: postSchema
});

const archiveCollection = defineCollection({
	type: "content",
	schema: postSchema
});

const profileCollection = defineCollection({
	type: "content",
	schema: profileSchema
});

const pageCollection = defineCollection({
	type: "content",
	schema: pageSchema
});

export const collections = {
	"post": postCollection,
	"archive": archiveCollection,
	"profile": profileCollection,
	"page": pageCollection,
};
