import { remarkDirective, remarkFigCaption, remarkSmartyPants } from '../../deps.ts'
import remarkPreview from './remark-preview.js'
export default [
	remarkSmartyPants,
	remarkDirective,
	remarkPreview,
	[
		remarkFigCaption, {
			figureClassName: 'image-container'
		}
	]
]
