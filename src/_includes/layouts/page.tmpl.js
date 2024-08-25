import base from '../layout.ts'
import icon from '../components/icon.ts'

export default function (data) {
	const backToTop = icon('arrow-circle-90-degree')

	return base({
		metaInfo: {
			title: data.title,
			description: data.description,
			url: data.url
		},
		slots: {
			hero: `<h1 class="hero-title">${data.title}</h1>`,
			main: `<article class="wrapper-content">${data.content}</article>
			<div class="action">
				<a href="#top" title="Back to top" class="button-icon">${backToTop}</a>
			</div>`
		},
		content: true
	})
}
