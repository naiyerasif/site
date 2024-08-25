export const layout = 'layouts/posts.tmpl.js'
export const renderOrder = 1

export default function* ({ search, paginate }) {
	const posts = search.pages('type=post', 'date=desc')
	const options = {
		url: (n) => n == 1 ? `/posts/` : `/posts/${n}/`,
		size: 10
	}

	for (const page of paginate(posts, options)) {
		page.type = 'posts'
		yield page
	}
}
