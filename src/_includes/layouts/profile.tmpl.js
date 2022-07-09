import base from '../layout.ts'
import icon from '../components/icon.ts'

export default function (data, filters) {
	const backToTop = icon('arrow-circle-90-degree')

	return base({
		metaInfo: {
			title: data.title,
			description: data.description,
			url: data.url
		},
		slots: {
			hero: `<div class="hero-media-inline">
				<section class="image">
					<img src="/images/profile/${data.id}.png">
				</section>
				<section class="description">
					<h1 class="hero-title"><span class="hero-title-muted">Hi, I’m</span> ${filters.capitalize(data.id)}</h1>
				</section>
			</div>`,
			main: `<main class="article">
				<article>${data.content}</article>
			</main>
			<div class="action">
				<a href="#top" title="Back to top" class="button-icon">${backToTop}</a>
			</div>`
		}
	})
}
