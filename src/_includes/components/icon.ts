import { attributes } from 'lume/plugins/attributes.ts'
import slugify from '../../../modules/slugify/mod.ts'

export default function (symbol: string, attribs = { class: ['icon'] }, label?: string) {
	const href = `#ini-${symbol}`

	let html = ''

	if (label) {
		const ariaLabel = slugify(label)
		html += `<svg aria-labelledby="${ariaLabel}" role="img" ${attributes(attribs)}>`
		html += `<title id="${ariaLabel}">${label}</title>`
	} else {
		html += `<svg aria-hidden="true" role="img" ${attributes(attribs)}>`
	}

	html += `<use href="${href}"/></svg>`
	return html
}
