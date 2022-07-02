import { hastUtilHasProperty, hastUtilHeadingRank, hastUtilToString, unistUtilVisit } from '../../deps.ts'
import { slugifyWithCounter, defaults as defaultSlugifyOptions } from '../slugify/mod.ts'

const slugify = slugifyWithCounter()

export default function rehypeSlugify() {
	return (tree) => {
		slugify.reset()

		unistUtilVisit.visit(tree, 'element', (node) => {
			if (hastUtilHeadingRank.headingRank(node) && node.properties && !hastUtilHasProperty.hasProperty(node, 'id')) {
				node.properties.id = slugify(hastUtilToString.toString(node), defaultSlugifyOptions)
			}
		})
	}
}
