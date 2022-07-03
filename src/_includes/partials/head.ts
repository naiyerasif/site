import appInfo from '../../_data.ts'
import { MetaInfo } from '../types.ts'

function addHost(context: string, baseUrl: string) {
	return new URL(context, baseUrl).href
}

function resolveUrls(metaInfo: MetaInfo, baseUrl: string) {
	if (metaInfo.url) {
		metaInfo.url = addHost(metaInfo.url, baseUrl)
	}

	if (metaInfo.previous) {
		metaInfo.previous = addHost(metaInfo.previous, baseUrl)
	}

	if (metaInfo.next) {
		metaInfo.next = addHost(metaInfo.next, baseUrl)
	}

	if (metaInfo.source) {
		metaInfo.source = addHost(metaInfo.source, baseUrl)
	}
}

export default function (metaInfo: MetaInfo) {
	const { app } = appInfo
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

	html += `<meta property="og:type" content="${metaInfo.type || 'website'}">`
	html += `<meta property="og:site_name" content="${app.title}">`
	html += `<meta property="og:locale" content="en">`
	html += `<meta property="og:title" content="${metaInfo.title}">`

	if (metaInfo.description) {
		html += `<meta property="og:description" content="${metaInfo.description}">`
	}

	if (metaInfo.url) {
		html += `<meta property="og:url" content="${metaInfo.url}">`
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

	const twitter = app.networks.find(network => network.id === 'twitter')

	html += `<meta name="twitter:site" content="${twitter?.username}">`
	html += `<meta name="twitter:creator" content="${twitter?.username}">`

	html += `<meta itemprop="name" content="${metaInfo.title}">`

	if (metaInfo.description) {
		html += `<meta itemprop="description" content="${metaInfo.description}">`
	}

	// inline styles
	html += `<style>
	.icon {
		--icon-size: 1.5rem;
		stroke: currentColor;
		stroke-width: 2;
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
		width: var(--icon-size);
		height: var(--icon-size);
		min-width: var(--icon-size);
	}
	@media (hover: none) {
		.icon {
			--icon-size: 24px;
		}
	}
	a#skiplink {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		background-color: var(--sugar-bg-deter);
		border: 1px solid var(--sugar-bg-deter);
		color: var(--sugar-fg-deter);
		margin: 5px;
		width: calc(100% - 10px);
		padding: 0.5ch;
		font-weight: var(--sugar-font-bold);
		font-size: 0.8em;
		clip-path: initial;
		z-index: 5;
	}
	a#skiplink:not(:focus):not(:focus-within) {
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
	</style>`

	return html
}
