import { getPosts } from "#utils/content.js";

export async function GET() {
	const posts = (await getPosts())
		.map(post => ({
			title: post.data.title,
			path: `/${post.id}`
		}));
	return new Response(JSON.stringify(posts));
}
