export const url = '/search-index.json'
export const renderOrder = 2

export default function ({ search }) {
	const indexItems = search.pages('type=post')
		.map(page => page.data)
		.map(page => ({
			title: page.title,
			tags: page.tags,
			path: page.canonical
		}))
	return JSON.stringify(indexItems)
}
