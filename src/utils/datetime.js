import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { freeze } from "#utils/appliances.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Date formatting patterns.
 * @constant @type {Readonly<{iso: string, iso8601: string, american: string}>}
 */
export const formats = freeze({
	iso: "ISO_STRING",
	iso8601: "YYYY-MM-DD",
	american: "MMM DD, YYYY"
});

/**
 * Default GMT timezone.
 * @constant @type {string}
 */
export const timezone_gmt = "GMT";

/**
 * Parses a date with a specific timezone and ensures it is valid.
 * @private
 * @param {string|number|Date|dayjs.Dayjs} date - date to parse
 * @param {string} tz - timezone
 * @returns {dayjs.Dayjs|null} A valid day.js object or null
 */
function parse(date, tz) {
	if (!date) return null;
	const parsed = dayjs.tz(date, tz);
	return parsed.isValid() ? parsed : null;
}

/**
 * Compares two dates and returns the difference.
 * @param {string|number|Date|dayjs.Dayjs} date1 - starting date
 * @param {string|number|Date|dayjs.Dayjs} date2 - ending date
 * @param {string} [tz=timezone_gmt] - timezone to use for parsing
 * @param {string} [unit="milliseconds"] - unit of time to measure the difference 
 * @param {boolean} [precise=true] - whether to return floating-point value or truncate it 
 * @returns {number|undefined} - difference between dates or undefined if either date is invalid
 */
export function compare(date1, date2, tz = timezone_gmt, unit = "milliseconds", precise = true) {
	const d1 = parse(date1, tz);
	const d2 = parse(date2, tz);

	if (!d1 || !d2) return;

	return d2.diff(d1, unit, precise);
}

/**
 * Formats a given date according to a pattern and timezone.
 * @param {string|number|Date|dayjs.Dayjs} date - date to format
 * @param {string} [pattern=formats.american] - formatting string
 * @param {string} [tz=timezone_gmt] - timezone to format the date in
 * @returns {string|undefined} - formatted date string or undefined if date is invalid
 */
export default function (date, pattern = formats.american, timezone = timezone_gmt) {
	const d = parse(date, timezone);

	if (!d) return;

	return pattern === formats.iso ? d.toISOString() : d.format(pattern);
}
