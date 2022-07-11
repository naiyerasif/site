import { hastUtilHasProperty, hastUtilHeadingRank, hastUtilToString, hastscript, unistUtilVisit } from '../../deps.ts'

const { h } = hastscript

const defaults = {
	replacementCondition(nodeString) {
		return nodeString === '[[toc]]'
	},
	tagName: 'details',
	properties: { id: 'table-of-contents' },
	children(headings) {
		return [
			h('summary', 'Table of contents'),
			h('ul.toc-items', [...headings.map(heading => h(`li.toc-item-${heading.depth}`, [
				h('a', {href: `#${heading.id}`}, heading.title)
			]))])
		]
	}
}

// Apply this plugin after you've slugged the headings
export default function rehypeToc(userOptions) {
	const options = Object.assign({}, defaults, userOptions)

	return (tree) => {
		// collect all headings
		const headings = []
		unistUtilVisit.visit(tree, 'element', (node) => {
			const headingRank = hastUtilHeadingRank.headingRank(node)
			if (headingRank && node.properties && hastUtilHasProperty.hasProperty(node, 'id')) {
				headings.push({
					depth: headingRank,
					id: node.properties.id,
					title: hastUtilToString.toString(node)
				})
			}
		})

		unistUtilVisit.visit(tree, 'element', (node, index, parent) => {
			// visit the node that matches the placeholder pattern
			if (options.replacementCondition(hastUtilToString.toString(node))) {
				// replace the placeholder with toc
				if (headings && headings.length > 0) {
					node.tagName = options.tagName
					node.properties = options.properties
					node.children = [...options.children(headings)]
				} else {
					// if no headings are present, remove the node with the placeholder 
					// and continue with the node that is now at the position where the removed node was
					parent.children.splice(index, 1)
					return [unistUtilVisit.SKIP, index]
				}
			}
		})
	}
}
