const shiki = require('shiki')
const visit = require('unist-util-visit')

const FALLBACK_LANGUAGE = 'text'
const ERROR_MESSAGE = '<code>ERROR Rendering Code Block</code>'
const LANG_TEXT = ['text', 'txt', 'plaintext']

module.exports = options => {
  let theme = options.theme ? options.theme : 'nord'
  const aliases = options.aliases ? options.aliases : {}

  return async tree => {
    const highlighter = await shiki.getHighlighter({ theme })

    visit(tree, 'code', node => {
      node.type = 'html'
      try {
        node.value = highlight(node, highlighter, aliases)
      } catch (e) {
        node.value = ERROR_MESSAGE
        console.log(e)
      }
    })

    if (!options.skipInline) {
      visit(tree, 'inlineCode', node => {
        node.type = 'html'
        try {
          node.value = highlight(node, highlighter, aliases)
        } catch (e) {
          node.value = ERROR_MESSAGE
          console.log(e)
        }
      })
    }
  }
}

function postProcess(highlighted, lang, meta) {
  return highlighted
}

function highlight({ value, lang, meta }, highlighter, aliases) {
  const resolvedLang = aliases[lang] ? aliases[lang] : lang

  const index = shiki.BUNDLED_LANGUAGES.findIndex(x => {
    return x.id === resolvedLang || (x.aliases && x.aliases.includes(resolvedLang))
  })

  if (index >= 0 || LANG_TEXT.includes(resolvedLang)) {
    return postProcess(highlighter.codeToHtml(value, resolvedLang), resolvedLang, meta)
  } else {
    // fallback for unknown languages
    return postProcess(highlighter.codeToHtml(value, FALLBACK_LANGUAGE), resolvedLang, meta)
  }
}
