import base from '../layout.ts'
import icon from '../components/icon.ts'
import time from '../components/time.js'
import callout from '../components/callout.js'
import tag from '../components/tag.ts'

export default function (data, filters) {
	const backToTop = icon('arrow-circle-90-degree')

	let dateInfo = time(data.date, filters)

	if (data.update.toString() !== data.date.toString()) {
		dateInfo += ` <mark>Updated on ${time(data.update, filters)}</mark>`
	}

	let navItems = ''
	if (data.prev || data.next) {
		navItems += `<div class="showcase">`
		
		if (data.prev) {
			navItems += `<div class="showcase-item prev" onclick="location.href='${data.prev.canonical}'">
				<div class="showcase-item-metadata">&xlarr; Previous</div>
				<a href="${data.prev.canonical}">${data.prev.title}</a>
			</div>`
		}

		if (data.next) {
			navItems += `<div class="showcase-item next" onclick="location.href='${data.next.canonical}'">
				<div class="showcase-item-metadata">&xrarr; Next</div>
				<a href="${data.next.canonical}">${data.next.title}</a>
			</div>`
		}

		navItems += `</div>`
	}

	const outdatedItem = data.outdated ? callout('Warning', 'This post is old. Some information may be out-of-date.', 'deter') : ''

	const tags = data.tags.map(t => tag(t)).join('')

	return base({
		metaInfo: {
			title: data.title,
			description: data.description,
			url: data.url,
			source: data.editUrl,
			type: 'article',
			published: filters.date(data.date, 'DATE'),
			updated: data.update.toString() !== data.date.toString() ? filters.date(data.update, 'DATE') : null,
			previous: data.prev ? data.prev.canonical : null,
			next: data.next ? data.next.canonical : null
		},
		slots: {
			hero: `<h1 class="hero-title">${data.title}</h1>
			<div class="hero-details">
				<div class="hero-details-item">${dateInfo}</div>
				<div class="hero-details-item">${data.timeToRead}</div>
				<div class="hero-details-item tags"><span>${filters.capitalize(data.category)} on </span>${tags}</div>
			</div>`,
			main: `<main class="article">
					${outdatedItem}
					<article>${data.content}</article>
				</main>
				<div class="navigation">${navItems}</div>
				<div class="action">
					<a href="${data.editUrl}" title="Edit the page" class="button-icon">${icon('edit-line')}</a>
					<a href="#table-of-contents" title="Jump to table of contents" class="button-icon">${icon('table-of-contents')}</a>
					<a href="#top" title="Back to top" class="button-icon">${backToTop}</a>
			</div>`
		}
	})
}
