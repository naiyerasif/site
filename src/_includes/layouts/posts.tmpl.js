import base from '../layout.ts'
import time from '../components/time.js'

export default function (data, filters) {
	let posts = ''
	data.results
		.forEach(post => {
			posts += `<div class="showcase-item" onclick="location.href='${post.data.url}'">`
			posts += `<div class="showcase-item-metadata">`
			posts += filters.capitalize(post.data.category)
			posts += ' &mdash; '
			posts += time(post.data.date, filters)
			posts += `</div>`
			posts += `<a href="${post.data.url}">${post.data.title}</a>`
			posts += `<div class="showcase-item-details">${post.data.description}</div>`
			posts += `</div>`
		})

	let pagination = ''

	if (data.pagination.previous) {
		pagination += `<a href="${data.pagination.previous}" aria-label="Previous page" class="button">&xlarr;</a>`
	}

	const current = data.pagination.page
	const total = data.pagination.totalPages
	const pageUrl = (pageNumber) => pageNumber === 1 ? `/posts/` : `/posts/${pageNumber}/`
	const page = (pageNumber) => pageNumber === current ? `<a href="${pageUrl(pageNumber)}" aria-current="page" aria-label="Page ${pageNumber}" class="button active"><strong>${pageNumber}</strong></a>` : `<a href="${pageUrl(pageNumber)}" aria-label="Page ${pageNumber}" class="button">${pageNumber}</a>`

	if (total < 6) {
		Array.from({ length: total }, (v, i) => i + 1).forEach(pageNumber => {
			pagination += page(pageNumber)
		})
	} else {
		const previousRange = current < 3 ? [1, 2, 3] : [1]
		const nextRange = total > 5 && (total - current) < 2 ? [(total - 2), (total - 1), total] : [total]
		const midRange = current > 2 && (total - current) > 1 ? [(current - 1), current, (current + 1)] : []
		const showPreviousSeparator = total > 5 && ((midRange.length / 2) - 1) > 2
		const showNextSeparator = total - midRange.length > 2

		previousRange.forEach(pageNumber => { pagination += page(pageNumber) })

		if (showPreviousSeparator) {
			pagination += '<span>...</span>'
		}

		midRange.forEach(pageNumber => { pagination += page(pageNumber) })

		if (showNextSeparator) {
			pagination += '<span>...</span>'
		}

		nextRange.forEach(pageNumber => { pagination += page(pageNumber) })
	}

	if (data.pagination.next) {
		pagination += `<a href="${data.pagination.next}" aria-label="Next page" class="button">&xrarr;</a>`
	}

	const fromPost = ((current - 1) * data.results.length) + 1
	const toPost = fromPost + data.results.length - 1
	const totalPosts = data.pagination.totalResults

	return base({
		metaInfo: {
			title: `Posts (Page ${current})`,
			description: 'Posts from the past, in chronological order',
			url: data.url
		},
		slots: {
			hero: `<h1 class="hero-title">Posts <span class="hero-title-muted">from the past, in chronological order</span></h1>
			<div class="hero-details">
				<div class="hero-details-item">Posts &mdash;&mdash; ${fromPost}&hellip;${toPost} of ${totalPosts}</div>
			</div>`,
			main: `<div class="showcase">${posts}</div>
			<div class="pagination">${pagination}</div>`
		}
	})
}
