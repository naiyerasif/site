const shiki = require('shiki')
const visit = require('unist-util-visit')
const rangeParser = require('parse-numeric-range')
const { renderToHtml } = require('./renderer')

const FALLBACK_LANGUAGE = 'text'
const LANG_TEXT = ['text', 'txt', 'plaintext']

const resolveLanguage = (lang, aliases) => (aliases && aliases[lang] ? aliases[lang] : lang)

const textBetween = (text, starter, terminator = starter) => text.substring(text.indexOf(starter) + 1, text.lastIndexOf(terminator))

const isRange = text => /^\d/.test(text) && /\d$/.test(text)

const extractCaption = text => textBetween(text.split('=')[1], "'")

const parseMeta = meta => {
  const opts = textBetween(meta, '{', '}').split(',').map(token => token.trim())
  const rangeTokens = opts.filter(token => isRange(token)).join(",")
  const linesToHighlight = rangeParser(rangeTokens)
  const captionToken = opts.filter(token => token.startsWith('caption='))[0]
  const caption = captionToken ? extractCaption(captionToken) : null

  return {
    linesToHighlight: linesToHighlight && linesToHighlight.length > 0 ? linesToHighlight : null,
    caption
  }
}

const resolveNodeInfo = (lang, meta, aliases) => {
  let language = lang
  let parsedMeta = meta
  let metadata = null

  const langHasMeta = !meta && lang.includes('{') && lang.endsWith('}')
  if (langHasMeta) {
    const nodeInfoTokens = lang.split(/(?={)/)
    language = nodeInfoTokens[0]
    parsedMeta = nodeInfoTokens[1]
  }

  if (parsedMeta) {
    metadata = parseMeta(parsedMeta)
  }

  language = resolveLanguage(language, aliases)

  return { language, metadata }
}

const highlight = ({ value, lang, meta }, highlighter, options) => {
  const htmlRendererOptions = options.htmlRendererOptions || {}
  const { language, metadata } = resolveNodeInfo(lang, meta, options.aliases)
  const index = shiki.BUNDLED_LANGUAGES.findIndex(
    x => x.id === language || (x.aliases && x.aliases.includes(language))
  )

  if (options.showLanguage) {
    htmlRendererOptions.langId = language
  }

  htmlRendererOptions.caption = options.showCaptions && metadata && metadata.caption ? metadata.caption : null

  const lines =
    index >= 0 || LANG_TEXT.includes(language)
      ? highlighter.codeToThemedTokens(value, language)
      : highlighter.codeToThemedTokens(value, FALLBACK_LANGUAGE)

  if (lines.length > 1) {

    if (options.showLineNumbers) {
      const maxWidth = `${lines.length}`.length
      htmlRendererOptions.showLineNumbers = true
      htmlRendererOptions.lineNumberFormatter = lineNumber => `${lineNumber}`.padStart(maxWidth)
    }

    htmlRendererOptions.linesToHighlight =
      options.highlightLines && metadata && metadata.linesToHighlight
        ? metadata.linesToHighlight
        : null
  } else {
    htmlRendererOptions.showLineNumbers = false
  }

  return renderToHtml(lines, htmlRendererOptions)
}

const traverse = (tree, tokenType, highlighter, options) => {
  visit(tree, tokenType, node => {
    node.type = 'html'
    try {
      node.value = highlight(node, highlighter, options)
    } catch (e) {
      node.value = '<code>ERROR Rendering Code Block</code>'
    }
  })
}

module.exports = options => {
  let theme = options.theme ? options.theme : 'nord'
  options.aliases = options.aliases ? options.aliases : {}

  return async tree => {
    const highlighter = await shiki.getHighlighter({ theme })

    try {
      const { fg, bg } = highlighter.getTheme()
      options.htmlRendererOptions = { fg, bg }

      traverse(tree, 'code', highlighter, options)

      if (!options.skipInline) {
        traverse(tree, 'inlineCode', highlighter, options)
      }
    } catch (e) {
      console.error(`Failed to load Shiki theme ${theme}`)
    }
  }
}
