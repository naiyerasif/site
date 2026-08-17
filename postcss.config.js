import postcssPresetEnv from "postcss-preset-env";

export default {
	plugins: [
		postcssPresetEnv({
			stage: 2,
			preserve: true,
			browsers: "> 0.2% and not dead"
		}),
	]
}
