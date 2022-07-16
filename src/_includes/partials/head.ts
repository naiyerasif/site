import { getLumeVersion } from 'lume/core/utils.ts'
import appInfo from '../../_data.ts'
import { ContentType, MetaInfo } from '../types.ts'

const generator = `Lume ${getLumeVersion()}`

function resolveHost(context: string, baseUrl: string) {
	return new URL(context, baseUrl).href
}

function resolveUrls(metaInfo: MetaInfo, baseUrl: string) {
	if (metaInfo.url) {
		metaInfo.url = resolveHost(metaInfo.url, baseUrl)
	}

	if (metaInfo.previous) {
		metaInfo.previous = resolveHost(metaInfo.previous, baseUrl)
	}

	if (metaInfo.next) {
		metaInfo.next = resolveHost(metaInfo.next, baseUrl)
	}

	if (metaInfo.source) {
		metaInfo.source = resolveHost(metaInfo.source, baseUrl)
	}

	if (metaInfo.image) {
		metaInfo.image = resolveHost(metaInfo.image, baseUrl)
	}
}

export default function (metaInfo: MetaInfo) {
	const { app } = appInfo
	metaInfo.image = metaInfo.image || '/images/opengraph/default.png'
	resolveUrls(metaInfo, app.url)

	let html = `<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${metaInfo.title} &mdash; ${app.title}</title>
	<link rel="stylesheet" href="/styles.css">
	<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any">
	<link rel="icon" type="image/svg+xml" href="/favicon.svg">
	<meta name="color-scheme" content="dark light">
	<meta name="author" content="${app.author}">
	<meta name="theme-color" content="#101015" media="(prefers-color-scheme: dark)">
	<meta name="theme-color" content="#fcfcfd" media="(prefers-color-scheme: light)">
	<link rel="mask-icon" href="/mask-icon.svg" color="#db0b2f">
	<link rel="apple-touch-icon" href="/apple-touch-icon.png">
	<link rel="manifest" href="/site.webmanifest">
	<link rel="sitemap" href="/sitemap.xml">
	<link rel="alternate" type="application/rss+xml" href="/feed.xml">`

	if (metaInfo.url) {
		html += `<link rel="canonical" href="${metaInfo.url}">`
	}

	if (metaInfo.source) {
		html += `<link rel="source" href="${metaInfo.source}">`
	}

	if (metaInfo.previous) {
		html += `<link rel="prev" aria-label="Previous post" href="${metaInfo.previous}">`
	}

	if (metaInfo.next) {
		html += `<link rel="next" aria-label="Next post" href="${metaInfo.next}">`
	}

	if (metaInfo.description) {
		html += `<meta name="description" content="${metaInfo.description}">`
	}

	html += `<meta property="og:type" content="${metaInfo.type || ContentType[ContentType.website]}">`
	html += `<meta property="og:site_name" content="${app.title}">`
	html += `<meta property="og:locale" content="en">`
	html += `<meta property="og:title" content="${metaInfo.title}">`

	if (metaInfo.description) {
		html += `<meta property="og:description" content="${metaInfo.description}">`
	}

	if (metaInfo.url) {
		html += `<meta property="og:url" content="${metaInfo.url}">`
	}

	html += `<meta property="og:image" content="${metaInfo.image}">`

	if (metaInfo.description) {
		html += `<meta property="og:image:alt" content="${metaInfo.description}">`
	}

	if (metaInfo.published) {
		html += `<meta property="article:published_time" content="${metaInfo.published}">`
	}

	if (metaInfo.updated) {
		html += `<meta property="article:modified_time" content="${metaInfo.updated}">`
	}

	html += `<meta name="twitter:card" content="summary">`
	html += `<meta property="twitter:title" content="${metaInfo.title}">`

	if (metaInfo.description) {
		html += `<meta property="twitter:description" content="${metaInfo.description}">`
	}

	html += `<meta name="twitter:image:src" content="${metaInfo.image}">`

	const twitter = app.networks.find(network => network.id === 'twitter')

	html += `<meta name="twitter:site" content="${twitter?.username}">`
	html += `<meta name="twitter:creator" content="${twitter?.username}">`

	html += `<meta itemprop="name" content="${metaInfo.title}">`

	if (metaInfo.description) {
		html += `<meta itemprop="description" content="${metaInfo.description}">`
	}

	html += `<meta name="generator" content="${generator}">`

	// inline styles
	html += `<link rel="stylesheet" href="/inline.css" inline>`

	return html
}
