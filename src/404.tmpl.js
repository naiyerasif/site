import base from './_includes/layout.ts'
import search from './_includes/components/search.ts'

export const title = `404 Not found`
export const description = `This link is broken.`
export const url = `/404.html`

export default function () {
	return base({
		metaInfo: {
			title: title,
			description: description,
			url: url
		},
		slots: {
			hero: `<h1 x-data="{ messages: ['This page is missing.', 'There is nothing here.', 'This link is broken.'], getMessage() { return this.messages[Math.floor(Math.random() * this.messages.length)] } }" x-text="getMessage()" class="hero-title"></h1>
			<div class="hero-details">
				<div class="hero-details-item">${search()}</div>
				<div class="hero-details-item"><a href="/posts/" class="button">Browse other posts</a></div>
				<div class="hero-details-item"><a href="/" class="button">Return to Home</a></div>
			</div>`,
			main: '<img src="/404.svg" alt="Page not found" style="max-width: calc(15rem + 20vw)">'
		}
	})
}
