import { postcssPresetEnv } from '../../deps.ts'

export default [
	postcssPresetEnv({
		stage: 0,
		preserve: true,
		features: {
			'focus-visible-pseudo-class': true,
			'focus-within-pseudo-class': true,
			'logical-properties-and-values': true,
			// @ts-ignore: is-pseudo-class is being loaded but not declared as a feature in the typings
			'is-pseudo-class': true
		},
		browsers: 'defaults, not IE > 0'
	})
]
