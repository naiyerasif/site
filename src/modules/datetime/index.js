import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formats = Object.freeze({
	iso: "ISO_STRING",
	date: "YYYY-MM-DD",
	compact: "MMM DD, YYYY"
});

export const timezone_gmt = "GMT";

export function compare(date1, date2, timezone = timezone_gmt, unit = "milliseconds", precise = true) {
	if (!date1 || !date2) return;

	const d1 = dayjs.tz(date1, timezone);
	const d2 = dayjs.tz(date2, timezone);

	if (!d1.isValid() || !d2.isValid()) return;

	return d2.diff(d1, unit, precise);
}

export default function (date, pattern = formats.compact, timezone = timezone_gmt) {
	if (!date) return;

	const parsed = dayjs.tz(date, timezone);

	if (!parsed.isValid()) return;

	return pattern === formats.iso ? parsed.toISOString() : parsed.format(pattern);
}
