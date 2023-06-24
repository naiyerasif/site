import { defineCollection } from "astro:content";
import { postSchema, profileSchema, pageSchema } from "~schema";

const postCollection = defineCollection({
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
	"profile": profileCollection,
	"page": pageCollection,
};
