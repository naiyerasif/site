import pkg from "../../../package.json" with { type: "json" };
import { join } from "path/posix";

const siteInfo = {
	version: pkg.version,
	author: {
		name: "Naiyer Asif",
		presence: {
			mastodon: {
				id: "@naiyer@mastodon.social",
				title: "Mastodon",
				url: "https://mastodon.social/@naiyer"
			},
			github: {
				id: "@naiyerasif",
				title: "GitHub",
				url: "https://github.com/naiyerasif"
			},
			linkedin: {
				id: "naiyerasif",
				title: "LinkedIn",
				url: "https://in.linkedin.com/in/naiyerasif"
			},
		},
	},
	siteBase: "https://naiyer.dev",
	repository: "https://github.com/naiyerasif/site",
	ogImage: "/images/opengraph/default.png",
	maxFeedItems: 20,
	maxPageItems: 20,
	maxTocDepth: 3,
	get title() {
		return this.author.name;
	},
	get description() {
		return `Personal space of ${this.author.name} on the web`;
	},
	get editBase() {
		return `${this.repository}/edit/main`;
	},
	get issueBase() {
		return `${this.repository}/issues/new`;
	}
}

function fullLink(path, base = siteInfo.siteBase) {
	return new URL(path, base).href;
}

const editUrl = new URL(siteInfo.editBase);
function editLink(path) {
	return fullLink(join(editUrl.pathname, path), editUrl.origin);
}

function postPathname(slug) {
	return `/post/${slug}/`;
}

function paginationPathname(base, pageNumber) {
	return pageNumber > 1 ? `/${base}/${pageNumber}/` : `/${base}/`;
}

export {
	siteInfo as default,
	fullLink,
	editLink,
	postPathname,
	paginationPathname
};
