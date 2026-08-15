import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { Post, Profile, Page } from "#utils/schema.js";

export const collections = {
	"post": defineCollection({
		loader: glob({ pattern: "**/*.md", base: "./content/post" }),
		schema: Post
	}),
	"archive": defineCollection({
		loader: glob({ pattern: "**/*.md", base: "./content/archive" }),
		schema: Post
	}),
	"profile": defineCollection({
		loader: glob({ pattern: "**/*.md", base: "./content/profile" }),
		schema: Profile
	}),
	"page": defineCollection({
		loader: glob({ pattern: "**/*.md", base: "./content/page" }),
		schema: Page
	}),
};
