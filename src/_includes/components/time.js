export default function (date, filters, attribs = {}) {
	const props = Object.entries(attribs)
		.map(([key, value]) => `${key}="${value}"`)
		.join(' ')
	const formattedDate = filters.date(date)
	const isoDate = filters.date(date, 'ISO_STRING')
	return `<time ${props} datetime="${isoDate}">${formattedDate}</time>`
}
