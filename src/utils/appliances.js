/**
 * Deeply freezes an object and all of its nested fields, including circular references
 * 
 * @template T
 * @param {T} value - The value to freeze. Primitives are safely ignored and returned as-is.
 * @returns {T} The frozen value
 */
export function freeze(value) {
	const stack = [value];
	const seen = new WeakSet();

	while (stack.length > 0) {
		const current = stack.pop();

		if (current === null || typeof current !== 'object') continue;
		if (seen.has(current)) continue;

		seen.add(current);

		if (Object.isFrozen(current)) continue;

		Object.freeze(current);

		for (const key in current) {
			if (Object.prototype.hasOwnProperty.call(current, key)) {
				stack.push(current[key]);
			}
		}
	}

	return value;
}
