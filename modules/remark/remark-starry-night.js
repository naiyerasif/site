import { merge } from 'lume/core/utils.ts'
import { starryNight, unistUtilVisit, fenceparser, hastUtilToHtml } from '../../deps.ts'

const defaults = {
	showLanguage: true,
	showLineNumbers: true,
	highlightLines: true,
	showCaption: true,
	aliases: {}
}

export default function remarkStarryNight(userOptions = {}) {
	const options = merge(defaults, userOptions)
	const { aliases } = options

	const grammars = options.grammars || starryNight.all
	const starryNightPromise = starryNight.createStarryNight(grammars)

	return async function (tree) {
		const starryNight = await starryNightPromise

		unistUtilVisit.visit(tree, 'code', function (node) {
			const { value, lang = 'text', meta } = node

			if (!value) {
				return
			}

			const metadata = meta ? fenceparser(meta).metadata : null
			const langId = aliases && aliases[lang] ? aliases[lang] : lang
			const scope = starryNight.flagToScope(langId)

			let code = value

			if (scope) {
				const highlighted = starryNight.highlight(value, scope)
				code = hastUtilToHtml.toHtml(highlighted)
					.replace(/[\r\n|\r|\n]*$/, '')	// remove the last newline character
			} else {
				console.warn(`Grammar unavailable for ${langId}; rendering the code fence as text`)
			}

			const lines = code.split(/\r\n|\r|\n/)

			if (options.showLineNumbers && lines && lines.length > 1) {
				const maxWidth = `${lines.length}`.length
				const highlightLines = options.highlightLines && metadata && metadata.highlight && metadata.highlight.length
				code = lines.map((line, index) => {
						const lineClasses = highlightLines && metadata.highlight.includes(index + 1) ? `line line-highlighted` : 'line'
						const lineNumber = `${index + 1}`.padStart(maxWidth)
						const lineNumberSlot = `<span class="line-number" aria-hidden="true">${lineNumber}</span>`
						return `<span class="${lineClasses}">${lineNumberSlot}${line}</span>`
					})
					.join('\r\n')
			} else {
				code = `<span class="line line-standalone">${code}</span>`
			}

			const langToken = scope ? scope.replace(/^source\./, '').replace(/\./g, '-') : lang
			let template = ''
			template += `<div class="highlight highlight-${langToken}">`

			const showCaption = options.showCaption && metadata && metadata.caption
			const showHeader = options.showLanguage || showCaption

			if (showHeader) {
				template += `<div class="highlight-header">`

				if (options.showLanguage && lang) {
					template += `<div class="highlight-language">${lang}</div>`
				}

				if (showCaption) {
					template += `<div class="highlight-caption">${metadata.caption}</div>`
				}

				template += `</div>`
			}

			template += `<pre><code tabindex="0">${code}</code></pre>`

			template += `</div>`

			node.type = 'html'
			node.value = template
		})
	}
}
