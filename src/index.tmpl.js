import time from './_includes/components/time.js'

export const title = `Home`
export const layout = `layouts/main.tmpl.js`

export default function ({ search }, filters) {
	let recent = `<div class="showcase">`

	search.pages('type=post', 'date=desc', 10)
		.forEach((post, index) => {
			recent += index === 0 ? `<div class="showcase-item cover" onclick="location.href='${post.data.url}'">` : `<div class="showcase-item" onclick="location.href='${post.data.url}'">`
			recent += `<div class="showcase-item-metadata">`
			recent += time(post.data.date, filters)
			recent += `</div>`
			recent += `<a href="${post.data.url}">${post.data.title}</a>`
			recent += `</div>`
		})

	recent += `</div>`

	return `<main class="main">${recent}</main>
		<div class="action">
		<a href="/posts/2/" class="button">Browse more &xrarr;</a>
	</div>`
}
