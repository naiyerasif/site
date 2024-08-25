const postcssPresetEnv = require("postcss-preset-env")
const postcssCombineDuplicatedSelectors = require("postcss-combine-duplicated-selectors")

module.exports = {
	plugins: [
		postcssPresetEnv({
			preserve: true,
			enableClientSidePolyfills: true,
			features: {
				"focus-visible-pseudo-class": true,
				"focus-within-pseudo-class": true,
				"is-pseudo-class": true,
				"logical-properties-and-values": true,
			}
		}),
		postcssCombineDuplicatedSelectors(),
	]
}
