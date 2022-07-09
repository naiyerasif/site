export const layout = 'layouts/post.tmpl.js'

export default async function* (data, { mdAsync, dateCompare, readingTime, source }) {
	const posts = Object.entries(data.posts)
		.flatMap(([folder, nested]) => {
			const directory = `/src/_data/posts/${folder}/`
			return Object.entries(nested).map(([basename, post]) => {
				const fileInfo = {
					basename: basename,
					extension: '.md',
					directory: directory
				}
				post['file'] = fileInfo
				return post
			})
		})
		.sort((p1, p2) => dateCompare(p1.date, p2.date))
	for (const [index, post] of posts.entries()) {
		const timeToRead = readingTime(post.content)
		const editUrl = source(post.file.directory + post.file.basename + post.file.extension)
		post.content = await mdAsync('[[toc]]\r\n\r\n' + post.content)
		yield {
			url: post.canonical,
			type: 'post',
			...post,
			timeToRead: timeToRead,
			editUrl: editUrl,
			outdated: dateCompare(post.update, new Date()) > data.app.limits.outdation,
			prev: posts[index - 1],
			next: posts[index + 1]
		}
	}
}
