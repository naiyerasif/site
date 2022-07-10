import { rehypeAutolinkHeadings, rehypeExternalLinks, rehypeSlugify } from '../../deps.ts'
import { slugifyWithCounter, defaults as defaultSlugifyOptions } from '../slugify/mod.ts'
import rehypeToc from './rehype-toc.js'

const slugify = slugifyWithCounter()

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
	rehypeToc,
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
