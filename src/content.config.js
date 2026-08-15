import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { postSchema, pageSchema, profileSchema } from "./modules/schema/index.js";

export const collections = {
	"post": defineCollection({
		loader: glob({ pattern: "**/*.md", base: "./content/post" }),
		schema: postSchema
	}),
	"archive": defineCollection({
		loader: glob({ pattern: "**/*.md", base: "./content/archive" }),
		schema: postSchema
	}),
	"profile": defineCollection({
		loader: glob({ pattern: "**/*.md", base: "./content/profile" }),
		schema: profileSchema
	}),
	"page": defineCollection({
		loader: glob({ pattern: "**/*.md", base: "./content/page" }),
		schema: pageSchema
	}),
};
