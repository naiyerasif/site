import { getCollection } from "astro:content";

export async function GET() {
	const posts = (await getCollection("post"))
		.map(post => ({
			title: post.data.title,
			path: `/${post.id}`
		}));
	return new Response(JSON.stringify(posts));
}
