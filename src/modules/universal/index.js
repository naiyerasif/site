const siteInfo = {
	version: "3.0.0",
	title: "Naiyer Asif",
	description: "Musings on software engineering and other stuff from Naiyer Asif",
	author: "Naiyer Asif",
	repository: "https://github.com/naiyerasif/naiyer.dev.git",
	base: "https://naiyer.dev",
	editBase: "https://github.com/naiyerasif/naiyer.dev/edit/main",
	networks: {
		mastodon: { uri: "https://mastodon.design/@naiyer", username: "@naiyer" },
		github: { uri: "https://github.com/naiyerasif", username: "@naiyerasif" },
		twitter: { uri: "https://twitter.com/Microflash", username: "@Microflash" },
		linkedin: { uri: "https://in.linkedin.com/in/naiyerasif", username: "naiyerasif" }
	},
	outdateAfter: 1, // years
	maxFeedItems: 20,
	maxTocDepth: 3
}

function canonical(path, base = siteInfo.base) {
	return new URL(path, base).href
}

function source(path, base = siteInfo.editBase) {
	return new URL(path, base).href
}

function postPathname(slug) {
	return `/post/${slug}/`
}

function paginationPathname(base, pageNumber) {
	return pageNumber > 1 ? `/${base}/${pageNumber}/` : `/${base}/`
}

function capitalize([ first = "", ...rest ]) {
	return [ first.toUpperCase(), ...rest ].join("")
}

export {
	siteInfo as default,
	canonical,
	capitalize,
	source,
	postPathname,
	paginationPathname
}
