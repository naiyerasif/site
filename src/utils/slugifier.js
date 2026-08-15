import slugify, { slugifyWithCounter } from "@sindresorhus/slugify";

const defaults = {
	decamelize: false,
	customReplacements: [
		["+", "plus"],
		[".js", "js"]
	]
};

export function createCountableSlugifier() {
	const counter = slugifyWithCounter();

	return {
		reset: function () {
			counter.reset();
		},
		slugify: function (text, options = defaults) {
			return counter(text, options);
		}
	};
}

export default function (text, options = defaults) {
	return slugify(text, options);
}
