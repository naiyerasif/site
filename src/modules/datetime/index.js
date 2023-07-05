import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const format_iso = "ISO_STRING";
export const format_date = "YYYY-MM-DD";
export const format_compact = "MMM DD, YYYY";
export const timezone_gmt = "GMT";

export function compare (date1, date2, timezone = timezone_gmt, unit = "milliseconds", precise = true) {
	if (!date1 || !date2) {
		return;
	}

	const d1 = dayjs.tz(date1, timezone);
	const d2 = dayjs.tz(date2, timezone);

	return precise ? d2.diff(d1, unit, precise) : d2.diff(d1, unit);
}

export default function (date, pattern = format_compact, timezone = timezone_gmt) {
	const parsed = dayjs.tz(date, timezone);
	return pattern === format_iso ? parsed.toISOString() : parsed.format(pattern);
}
