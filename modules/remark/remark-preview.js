import { unified, remarkParse, unistUtilVisit, nlcstToString, hastscript } from '../../deps.ts'

// @ts-ignore: Remark-provided types should fix the type conflict
const parser = unified.unified().use(remarkParse)

const previews = [
	{
		type: 'youtube',
		generate: (id, caption) => {
			let template = `<div class="preview-iframe-container"><iframe class="preview-iframe" src="https://www.youtube.com/embed/${id}" allow="join-ad-interest-group 'none'; run-ad-auction 'none'; encrypted-media; picture-in-picture; fullscreen"></iframe></div>`
			if (caption) template += `<figcaption>${caption}</figcaption>`
			return parser.parse(template).children
		}
	}
]

const previewTypes = previews.map(preview => preview.type)

export default function remarkPreview() {
	return (tree) => {
		unistUtilVisit.visit(tree, (node) => {
			if (
				node.type === 'leafDirective' ||
				node.type === 'containerDirective'
			) {
				if (!previewTypes.includes(node.name)) return

				const data = node.data || (node.data = {})
				const attributes = node.attributes || {}

				if (!attributes.id) file.fail('Missing youtube video id', node)

				const tagName = 'figure'
				const selectedPreview = previews.find(preview => preview.type === node.name)

				node.attributes = {
					class: `preview preview-${selectedPreview.type}`
				}

				node.children = selectedPreview.generate(attributes.id, node.type === 'containerDirective' ? nlcstToString.toString(node.children) : null)

				data.hName = tagName
				data.hProperties = hastscript.h(tagName, node.attributes).properties
			}
		})
	}
}
