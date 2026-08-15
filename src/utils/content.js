import { getCollection } from "astro:content";
import { compare } from "#utils/datetime.js";

export async function getPosts() {
	const posts = await getCollection("post");
	return posts.sort((p1, p2) => compare(p1.data.date, p2.data.date));
}

export async function getArchives() {
	const posts = await getCollection("archive");
	return posts.sort((p1, p2) => compare(p1.data.date, p2.data.date));
}
