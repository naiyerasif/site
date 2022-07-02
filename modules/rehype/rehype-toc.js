import { hastUtilHasProperty, hastUtilHeadingRank, hastUtilToString, hastscript, unistUtilVisit } from '../../deps.ts'

const { h, s } = hastscript

// Apply this plugin after you've slugged the headings
export default function rehypeToc() {
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
			if (hastUtilToString.toString(node) === '[[toc]]') {
				// replace the placeholder with toc
				if (headings && headings.length > 0) {
					node.tagName = 'section'
					const toc = [
						h('.callout-indicator', [
							s('svg', {'aria-hidden': 'true', role: 'img', className: ['icon', 'callout-sign']}, [
								s('use', {href: '#ini-table-of-contents'})
							]),
							h('.callout-label', 'Table of contents')
						]),
						h('.callout-content', [
							h('ul.toc-body', [...headings.map(heading => h(`li.toc-item-${heading.depth}`, [
								h('a', {href: `#${heading.id}`}, heading.title)
							]))])
						])
					]
					node.properties = { id: 'table-of-contents', className: ['callout', 'callout-note', 'toc']}
					node.children = [...toc]
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
