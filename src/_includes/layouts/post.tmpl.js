import base from '../layout.ts'
import icon from '../components/icon.ts'
import time from '../components/time.js'
import callout from '../components/callout.js'
import tag from '../components/tag.ts'

export default function (data, filters) {
	const backToTop = icon('arrow-circle-90-degree')

	const shareableTitle = encodeURI(data.title)
	const shareableHashtags = data.tags.join(',')
	const shareableLink = new URL(data.url, data.app.url).href

	let shareLinks = `<span>Share</span>`
	shareLinks += `<a href="mailto:?subject=${data.title}&body=Checkout this article I read! ${shareableLink}" title="Share through mail" rel="noopener noreferrer" class="button-icon">${icon('mail')}</a>`
	shareLinks += `<a href="https://twitter.com/intent/tweet?text=${shareableTitle}%20${shareableLink}&hashtags=${shareableHashtags}&via=Microflash" title="Share with a tweet" target="_blank" rel="noopener noreferrer" class="button-icon">${icon('twitter')}</a>`
	shareLinks += `<a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareableLink}" title="Post on LinkedIn" target="_blank" rel="noopener noreferrer" class="button-icon">${icon('linkedin')}</a>`
	shareLinks += `<a href="https://news.ycombinator.com/submitlink?u=${shareableLink}&t=${shareableTitle}" title="Submit to Hacker News" target="_blank" rel="noopener noreferrer" class="button-icon">${icon('hacker-news')}</a>`
	shareLinks += `<a href="http://www.reddit.com/submit?url=${shareableLink}&title=${shareableTitle}" title="Post on Reddit" target="_blank" rel="noopener noreferrer" class="button-icon">${icon('reddit')}</a>`

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

	let toc = ''

	if (data.toc && data.toc.length) {
		const tocItems = data.toc
			.map(heading => `<li class="toc-item-${heading.depth}"><a href="#${heading.id}">${heading.value}</a></li>`)
			.join('')
		toc += `<section id="table-of-contents" class="callout callout-note toc">
			<div class="callout-indicator"><svg aria-hidden="true" role="img" class="icon callout-sign"><use href="#ini-table-of-contents"/></svg>
				<div class="callout-label">Table of contents</div>
			</div>
			<div class="callout-content">
				<ul class="toc-body">${tocItems}</ul>
			</div>
		</section>`
	}

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
			next: data.next ? data.next.canonical : null,
			readingTime: data.timeToRead ? data.timeToRead : null
		},
		slots: {
			hero: `<h1 class="hero-title">${data.title}</h1>
			<div class="hero-details">
				<div class="hero-details-item">${dateInfo}</div>
				<div class="hero-details-item">${data.timeToRead}</div>
				<div class="hero-details-item tags"><span>${filters.capitalize(data.category)} on </span>${tags}</div>
			</div>`,
			main: `<article class="wrapper-content">${outdatedItem}${toc}${data.content}</article>
				<div class="share">${shareLinks}</div>
				<div class="navigation">${navItems}</div>
				<div class="action">
					<a href="${data.editUrl}" title="Edit the page" class="button-icon">${icon('edit-line')}</a>
					<a href="#table-of-contents" title="Jump to table of contents" class="button-icon">${icon('table-of-contents')}</a>
					<a href="#top" title="Back to top" class="button-icon">${backToTop}</a>
			</div>`
		},
		content: true
	})
}
