import { unified, remarkParse, unistUtilVisit, hastscript } from '../../deps.ts'

const callouts = [
	{
		name: 'note',
		label: 'Note',
		value:
			'<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-sign"><use href="#ini-note"></use></svg>',
	},
	{
		name: 'commend',
		label: 'Success',
		value:
			'<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-sign"><use href="#ini-commend"></use></svg>',
	},
	{
		name: 'warn',
		label: 'Warning',
		value:
			'<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-sign"><use href="#ini-warn"></use></svg>',
	},
	{
		name: 'deter',
		label: 'Danger',
		value:
			'<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-sign"><use href="#ini-deter"></use></svg>',
	},
	{
		name: 'assert',
		label: 'Important',
		value:
			'<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-sign"><use href="#ini-assert"></use></svg>',
	},
]

const calloutTypes = callouts.map(callout => callout.name)

// @ts-ignore: Remark-provided types should fix the type conflict
const parser = unified.unified().use(remarkParse)

const createCallout = (callout, label, children) => {
	const value = `${callout.value}<div class="callout-label">${label}</div>`
	const indicator = {
		type: 'paragraph',
		data: {
			hName: 'div',
			hProperties: { className: ['callout-indicator'] }
		},
		children: parser.parse(value).children[0].children
	}

	const content = {
		type: 'paragraph',
		data: {
			hName: 'div',
			hProperties: { className: ['callout-content'] }
		},
		children: children
	}

	return [ indicator, content ]
}

export default function remarkCallout() {
	return (tree) => {
		unistUtilVisit.visit(tree, (node) => {
			if (node.type === 'containerDirective') {
				if (!calloutTypes.includes(node.name)) return

				const data = node.data || (node.data = {})
				const tagName = 'aside'
				const selectedCallout = callouts.find(callout => callout.name === node.name)

				node.attributes = {
					...node.attributes,
					class: `callout callout-${node.name}`
				}

				node.children = createCallout(selectedCallout, node.attributes.label || selectedCallout.label, node.children)

				data.hName = tagName
				data.hProperties = hastscript.h(tagName, node.attributes).properties
			}
		})
	}
}
