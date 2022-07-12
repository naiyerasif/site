export const url = '/sitemap.xml'
export const renderOrder = 2

export default function ({ search, app }, { sitemap }) {
	const baseUrl = app.url
	const urls = search.pages()
		.map(page => new URL(page.data.url, baseUrl).href)

	return sitemap(urls)
}
