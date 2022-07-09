export const url = '/feed.xml'

export default function ({ search, app }, { feed }) {
	const author = app.author
	const baseUrl = app.url
	const profileUrl = new URL('/profile/naiyer/', baseUrl).href
	const feedItems = search.pages('type=post', 'date=desc', app.limits.feedItems)
		.map(page => page.data)
		.map(page => {
			const pageUrl = new URL(page.url, baseUrl).href
			return {
				title: page.title,
				date: page.date,
				author: [{
					name: author,
					email: author,
					link: profileUrl
				}],
				content: page.content,
				link: pageUrl,
				id: pageUrl
			}
		})
	const options = {
		feedOptions: {
			id: baseUrl,
			title: app.title,
			link: baseUrl,
			description: app.description,
			copyright: `2018, ${app.author}`,
			feedLinks: {
				rss: new URL(`/feed.xml`, baseUrl).href
			}
		},
		feedItems: feedItems,
		baseUrl: baseUrl
	}
	return feed(options).rss2
}
