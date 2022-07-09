import { Page } from 'lume/core/filesystem.ts'
import { minify } from '../../deps.ts'

import type { Site } from 'lume/core.ts'

/** A plugin to minify all CSS files */
export default function () {
	return (site: Site) => {
		const options = {
			extensions: ['.css']
		}

		site.loadAssets(options.extensions)
		site.process(options.extensions, minifyContent)

		function minifyContent(file: Page) {
			if (typeof file.content === 'string') {
				file.content = minify(file.content).css
			}
		}
	}
}
