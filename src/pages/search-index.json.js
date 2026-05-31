import { getCollection } from "astro:content";
import { encode } from "html-entities";
import { postPathname } from "../modules/website/index.js";
import { Status } from "../modules/schema/defs.js";

export async function GET() {
	const posts = (await getCollection("post"))
		.filter(post => post.data.state !== Status.outdated.id)
		.map(post => ({
			title: encode(post.data.title),
			path: postPathname(post.id)
		}));
	return new Response(JSON.stringify(posts));
}
