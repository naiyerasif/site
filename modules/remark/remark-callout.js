import { unified, remarkParse, unistUtilVisit, hastscript } from '../../deps.ts'

const parser = unified.unified().use(remarkParse)

function callout(calloutLabel, calloutHint, calloutContent) {
	const indicator = {
		type: 'paragraph',
		data: {
			hName: 'div',
			hProperties: { className: ['callout-indicator'] }
		},
		children: [
			{
				type: 'html',
				value: calloutHint
			},
			{
				type: 'paragraph',
				data: {
					hName: 'div',
					hProperties: { className: ['callout-label'] }
				},
				children: parser.parse(calloutLabel).children[0].children
			}
		]
	}

	const content = {
		type: 'paragraph',
		data: {
			hName: 'div',
			hProperties: { className: ['callout-content'] }
		},
		children: calloutContent
	}
	return [ indicator, content ]
}

const callouts = {
	note: {
		label: 'Note',
		hint: '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-hint"><use href="#ini-note"></use></svg>'
	},
	commend: {
		label: 'Success',
		hint: '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-hint"><use href="#ini-commend"></use></svg>'
	},
	warn: {
		label: 'Warning',
		hint: '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-hint"><use href="#ini-warn"></use></svg>'
	},
	deter: {
		label: 'Danger',
		hint: '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-hint"><use href="#ini-deter"></use></svg>'
	},
	assert: {
		label: 'Important',
		hint: '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-hint"><use href="#ini-assert"></use></svg>'
	},
	setup: {
		label: 'Setup',
		hint: '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-hint"><use href="#ini-setup"></use></svg>'
	},
	footnote: {
		label: 'References',
		tagName: 'section',
		hint: '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-hint"><use href="#ini-footnote"></use></svg>'
	}
}

export default function remarkCallout() {
	return (tree) => {
		unistUtilVisit.visit(tree, (node) => {
			if (node.type === 'containerDirective') {
				if (!callouts[node.name]) return

				const data = node.data || (node.data = {})
				const selected = callouts[node.name]
				const { label, ...attributes } = node.attributes

				node.attributes = {
					...attributes,
					class: `callout callout-${node.name}`
				}

				node.children = callout(label || selected.label, selected.hint, node.children)

				const tagName = selected.tagName || 'aside'
				data.hName = tagName
				data.hProperties = hastscript.h(tagName, node.attributes).properties
			}
		})
	}
}
