import { dayjs, timezone, utc } from '../../deps.ts'
import { merge } from 'lume/core/utils.ts'

import type { Helper, Site } from 'lume/core.ts'

dayjs.extend(utc)
dayjs.extend(timezone)

// see: https://day.js.org/docs/en/parse/string-format
const formats = new Map([
	['DATE', 'YYYY-MM-DD'],
	['DATETIME', 'YYYY-MM-DD HH:mm:ss'],
	['TIME', 'HH:mm:ss'],
	['COMPACT', 'MMM DD, YYYY']
])

export interface Options {
	/** Name of the helper */
	name: string,

	/** Default timezone */
	timezone: string,

	/** Unit used for diff function */
	unit?: string,

	/** Precision mode for diff */
	precisionMode?: boolean,

	/** Custom date formats */
	formats: Record<string, string>
}

/** Default options */
export const defaults: Options = {
	name: 'date',
	timezone: 'GMT',
	unit: 'milliseconds',
	precisionMode: false,
	formats: {}
}

/** A plugin to format Date values */
export default function (userOptions?: Partial<Options>) {
	const options = merge(defaults, userOptions)

	return (site: Site) => {
		site.addEventListener('beforeBuild', () => {
			site.filter(options.name, filter as Helper)
			site.filter(`${options.name}Compare`, comparisonFilter as Helper)
		
			function filter(date: string | Date, pattern = 'COMPACT', timezone: string = options.timezone) {
				if (!date) {
					return
				}
		
				const formatPattern = options.formats[pattern] || formats.get(pattern) || pattern
		
				// @ts-ignore: timezone extensions are not typed
				const parsedDate = dayjs.tz(date, timezone)
		
				return formatPattern === 'ISO_STRING' ? parsedDate.toISOString() : parsedDate.format(formatPattern)
			}

			function comparisonFilter(date1: string | Date, date2: string | Date, timezone: string = options.timezone, unit = options.unit, precisionMode = options.precisionMode) {
				if (!date1 || !date2) {
					return
				}

				// @ts-ignore: timezone extensions are not typed
				const d1 = dayjs.tz(date1, timezone)
				// @ts-ignore: timezone extensions are not typed
				const d2 = dayjs.tz(date2, timezone)

				let diff

				if (unit) {
					diff = precisionMode ? d2.diff(d1, unit, precisionMode) : d2.diff(d1, unit)
				} else {
					diff = d2.diff(d1)
				}

				return diff
			}
		})
	}
}
