import { unified, remarkParse, unistUtilVisit, nlcstToString, hastscript } from '../../deps.ts'

const parser = unified.unified().use(remarkParse)

const previews = {
	youtube: {
		check(attributes) {
			let validated = true
			if (!attributes.id) {
				console.warn('Missing youtube video id', attributes)
				validated = false
			}
			return validated
		},
		template(attributes, caption) {
			let template = `<div class="preview-iframe-container"><iframe class="preview-iframe" src="https://www.youtube.com/embed/${attributes.id}" allow="join-ad-interest-group 'none'; run-ad-auction 'none'; encrypted-media; picture-in-picture; fullscreen"></iframe></div>`
			if (caption) template += `<figcaption>${caption}</figcaption>`
			return parser.parse(template).children
		}
	}
}

export default function remarkPreview() {
	return (tree) => {
		unistUtilVisit.visit(tree, (node) => {
			if (
				node.type === 'leafDirective' ||
				node.type === 'containerDirective'
			) {
				if (!previews[node.name]) return

				const data = node.data || (node.data = {})
				const attributes = node.attributes || {}
				const selected = previews[node.name]

				if (!selected.check(attributes)) return

				node.attributes = {
					class: `preview preview-${node.name}`
				}

				node.children = selected.template(attributes, node.type === 'containerDirective' ? nlcstToString.toString(node.children) : null)

				const tagName = selected.tagName || 'figure'
				data.hName = tagName
				data.hProperties = hastscript.h(tagName, node.attributes).properties
			}
		})
	}
}
