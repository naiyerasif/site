import { remarkDirective, remarkFigCaption, remarkSmartyPants } from '../../deps.ts'
import remarkPreview from './remark-preview.js'
import remarkCallout from './remark-callout.js'

export default [
	remarkSmartyPants,
	remarkDirective,
	remarkPreview,
	remarkCallout,
	[
		remarkFigCaption, {
			figureClassName: 'image-container'
		}
	]
]
