import { getCollection } from "astro:content";
import { compare } from "#utils/datetime.js";

export async function getPosts(filter) {
	const posts = await getCollection("post", filter);
	return posts.sort((p1, p2) => compare(p1.data.date, p2.data.date));
}

export async function getSeries(id) {
	let posts = [];
	if (id) {
		posts = await getPosts(p => p.data.series === id);
		posts.sort((p1, p2) => compare(p2.data.date, p1.data.date));
	}
	return posts;
}

export async function getArchives() {
	const posts = await getCollection("archive");
	return posts.sort((p1, p2) => compare(p1.data.date, p2.data.date));
}
