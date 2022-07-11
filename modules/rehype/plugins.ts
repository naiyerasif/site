import { rehypeAutolinkHeadings, rehypeExternalLinks, rehypeSlugify, hastscript } from '../../deps.ts'
import { slugifyWithCounter, defaults as defaultSlugifyOptions } from '../slugify/mod.ts'
import rehypeToc from './rehype-toc.js'

const slugify = slugifyWithCounter()

const { h, s } = hastscript

export default [
	[
		rehypeExternalLinks, {
			target: false,
			rel: ['nofollow', 'noopener', 'noreferrer']
		}
	],
	[
		rehypeSlugify, {
			reset() {
				slugify.reset()
			},
			slugify(text: string) {
				return slugify(text, defaultSlugifyOptions)
			}
		}
	],
	[
		rehypeToc, {
			tagName: 'section',
			properties: { id: 'table-of-contents', className: ['callout', 'callout-note', 'toc']},
			// @ts-ignore: headings type
			children(headings) {
				return [
					h('.callout-indicator', [
						s('svg', {'aria-hidden': 'true', role: 'img', className: ['icon', 'callout-sign']}, [
							s('use', {href: '#ini-table-of-contents'})
						]),
						h('.callout-label', 'Table of contents')
					]),
					h('.callout-content', [
						// @ts-ignore: headings type
						h('ul.toc-body', [...headings.map(heading => h(`li.toc-item-${heading.depth}`, [
							h('a', {href: `#${heading.id}`}, heading.title)
						]))])
					])
				]
			}
		}
	],
	[
		rehypeAutolinkHeadings, {
			behavior: 'append',
			content: {
				type: 'element',
				tagName: 'svg',
				properties: {
					'aria-hidden': 'true',
					role: 'img',
					className: ['icon']
				},
				children: [
					{
						type: 'element',
						tagName: 'use',
						properties: {
							href: '#ini-link'
						}
					}
				]
			}
		}
	]
]
