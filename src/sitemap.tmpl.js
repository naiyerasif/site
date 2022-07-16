export const url = '/sitemap.xml'
export const renderOrder = 2

const exclusions = [
	'https://mflash.dev/404.html'
]

export default function ({ search, app }, { sitemap }) {
	const baseUrl = app.url
	const urls = search.pages()
		.map(page => new URL(page.data.url, baseUrl).href)
		.filter(page => !exclusions.includes(page))

	return sitemap(urls)
}
