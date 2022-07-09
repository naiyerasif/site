export const layout = 'layouts/page.tmpl.js'

export default async function* (data, { mdAsync }) {
	for (const page of Object.values(data.pages)) {
		page.content = await mdAsync(page.content)
		yield {
			url: page.canonical,
			type: 'page',
			...page
		}
	}
}
