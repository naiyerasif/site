import { remarkDirective, remarkFigCaption, remarkSmartyPants, remarkStarryNight } from '../../deps.ts'
import remarkPreview from './remark-preview.js'
import remarkCallout from './remark-callout.js'

export default [
	remarkSmartyPants,
	[
		remarkStarryNight, {
			aliases: {
				conf: 'ini',
				json: 'jsonc',
				log: 'sh'
			}
		}
	],
	remarkDirective,
	remarkPreview,
	remarkCallout,
	[
		remarkFigCaption, {
			figureClassName: 'image-container'
		}
	]
]
