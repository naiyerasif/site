const postcssPresetEnv = require("postcss-preset-env");

module.exports = {
	plugins: [
		postcssPresetEnv({
			preserve: true,
			enableClientSidePolyfills: true,
			features: {
				"focus-visible-pseudo-class": true,
				"focus-within-pseudo-class": true,
				"is-pseudo-class": true,
				"logical-overflow": true,
				"logical-overscroll-behavior": true,
				"logical-properties-and-values": true,
				"media-query-ranges": true,
			}
		}),
	]
};
