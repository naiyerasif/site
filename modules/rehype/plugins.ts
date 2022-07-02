import { rehypeAutolinkHeadings, rehypeExternalLinks } from '../../deps.ts'

export default [
	[
		rehypeExternalLinks, {
			target: false,
			rel: ['nofollow', 'noopener', 'noreferrer']
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
