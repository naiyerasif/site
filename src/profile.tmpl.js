export const layout = 'layouts/profile.tmpl.js'

export default async function* (data, { mdAsync }) {
	for (const profile of Object.values(data.profiles)) {
		profile.content = await mdAsync(profile.content)
		yield {
			url: profile.canonical,
			type: 'profile',
			...profile
		}
	}
}
