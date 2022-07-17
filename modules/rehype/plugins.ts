import { rehypeAutolinkHeadings, rehypeExternalLinks, rehypeExtractToc, rehypeSlugify } from '../../deps.ts'
import { slugifyWithCounter, defaults as defaultSlugifyOptions } from '../slugify/mod.ts'

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
	rehypeExtractToc,
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
