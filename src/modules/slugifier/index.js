import slugify, { slugifyWithCounter } from "@sindresorhus/slugify";

export const defaults = {
	decamelize: false,
	customReplacements: [
		["+", "plus"],
		[".js", "js"]
	]
};

export class CountableSlugifier {
	#slugifier;

	constructor() {
		this.#slugifier = slugifyWithCounter();
	}

	reset() {
		this.#slugifier.reset();
	}

	slugify(text, options = defaults) {
		return this.#slugifier(text, options);
	}

	static slugifier() {
		return new CountableSlugifier();
	}
}

export default function (text, options = defaults) {
	return slugify(text, options);
}
