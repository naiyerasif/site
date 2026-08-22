const siteInfo = {
	author: {
		name: "Naiyer Asif",
		presence: {
			mastodon: { id: "@naiyer@mastodon.social", title: "Mastodon", url: "https://mastodon.social/@naiyer" },
			codeberg: { id: "@naiyer", title: "Codeberg", url: "https://codeberg.org/naiyer" },
			github: { id: "@naiyerasif", title: "GitHub", url: "https://github.com/naiyerasif" },
			linkedin: { id: "naiyerasif", title: "LinkedIn", url: "https://in.linkedin.com/in/naiyerasif" },
		},
	},
	siteBase: "https://naiyerasif.com",
	repository: "https://github.com/naiyerasif/site",
	cover: "/images/opengraph/default.png",
	limits: { feed: 20, page: 20, toc: 3 },
	get title() {
		return this.author.name;
	},
	get description() {
		return `Personal site of ${this.author.name}`;
	},
	get issueBase() {
		return `${this.repository}/issues/new`;
	}
};

function absoluteUrl(path, base = siteInfo.siteBase) {
	return new URL(path, base).href;
}

function paginationPathname(base, pageNumber) {
	return pageNumber > 1 ? `/${base}/${pageNumber}/` : `/${base}/`;
}

export {
	siteInfo as default,
	absoluteUrl,
	paginationPathname
};
