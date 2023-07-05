const authorInfo = {
	name: "Naiyer Asif",
	networks: {
		mastodon: {
			platform: "Mastodon",
			id: "@naiyer",
			link: "https://mastodon.design/@naiyer"
		},
		github: {
			platform: "GitHub",
			id: "@naiyerasif",
			link: "https://github.com/naiyerasif"
		},
		linkedin: {
			platform: "LinkedIn",
			id: "naiyerasif",
			link: "https://in.linkedin.com/in/naiyerasif"
		},
		twitter: {
			platform: "Twitter",
			id: "@Microflash",
			link: "https://twitter.com/Microflash"
		}
	}
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
