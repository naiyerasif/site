import { merge } from 'lume/core/utils.ts'

export interface Options {
	/** Reading speed in words per minute */
	wpm: number
}

export const defaults: Options = {
	wpm: 250
}

/** Returns an estimate of reading time in minutes */
export default function readingTime(text: string, userOptions?: Partial<Options>): number {
	const options = merge(defaults, userOptions)

	const wordCount = text.trim().split(/\s+/g).length
	const minutes = wordCount / options.wpm

	if (minutes < 1) return 1

	const readingTime = Math.ceil(parseFloat(minutes.toFixed(2)))
	return readingTime
}
