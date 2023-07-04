const authorInfo = {
	name: "Naiyer Asif",
	networks: [
		{ platform: "mastodon", id: "@naiyer", link: "https://mastodon.design/@naiyer" },
		{ platform: "github", id: "@naiyerasif", link: "https://github.com/naiyerasif" },
		{ platform: "linkedin", id: "naiyerasif", link: "https://in.linkedin.com/in/naiyerasif" },
	]
};

const siteInfo = {
	version: "4.0.0",
	title: authorInfo.name,
	description: `Personal space of ${authorInfo.name} on the web`,
	author: authorInfo,
	repository: "https://github.com/naiyerasif/site.git",
	siteBase: "https://naiyerasif.com",
	editBase: "https://github.com/naiyerasif/site/edit/main",
	issueBase: "https://github.com/naiyerasif/naiyer.dev/issues/new",
	maxFeedItems: 20,
	maxTocDepth: 3
};

function fullLink(path, base = siteInfo.siteBase) {
	return new URL(path, base).href;
}

function editLink(path) {
	return fullLink(path, siteInfo.editBase);
}

export {
	siteInfo as default,
	fullLink,
	editLink
};
