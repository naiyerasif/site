import { remarkDirective, remarkFigCaption, remarkSmartyPants } from '../../deps.ts'
export default [
	remarkSmartyPants,
	remarkDirective,
	[
		remarkFigCaption, {
			figureClassName: 'image-container'
		}
	]
]
