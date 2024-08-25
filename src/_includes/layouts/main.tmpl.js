import base from '../layout.ts'

export default function (data) {
	return base({
		metaInfo: {
			title: data.title,
			description: data.app.description,
			url: data.url
		},
		slots: {
			hero: `<h1 class="hero-title">Reflections on design and development by <a href="/profile/naiyer/">Naiyer Asif</a></h1>`,
			main: data.content
		}
	})
}
