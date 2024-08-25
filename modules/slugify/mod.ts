import { slugify } from '../../deps.ts'

import type { SlugifyOptions } from '../../deps.ts'

export const defaults: SlugifyOptions = {
	decamelize: false,
	customReplacements: [['.js', 'js']]
}

export function slugifyWithCounter() {
	return slugify.slugifyWithCounter()
}

export default function (content: string, options = defaults) {
	return slugify.default(content, options)
}
