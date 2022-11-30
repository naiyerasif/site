export default {
	app: {
		version: '0.16.0',
		title: 'Microflash',
		description: 'Reflections on design and development by Naiyer Asif',
		author: 'Naiyer Asif',
		repository: 'https://github.com/Microflash/site.git',
		repositoryContext: `https://github.com/Microflash/site/edit/main`,
		url: 'https://mflash.dev',
		networks: [
			{ id: 'mastodon', url: 'https://mastodon.design/@naiyer', username: '@naiyer' },
			{ id: 'twitter', url: 'https://twitter.com/Microflash', username: '@Microflash' },
			{ id: 'github', url: 'https://github.com/naiyerasif', username: '@naiyerasif' },
			{ id: 'linkedin', url: 'https://in.linkedin.com/in/naiyerasif', username: 'naiyerasif' },
		],
		limits: {
			outdation: 1, // in years
			feedItems: 20
		}
	}
}
