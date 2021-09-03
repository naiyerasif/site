const shiki = require('shiki')
const visit = require('unist-util-visit')

const FALLBACK_LANGUAGE = 'text'
const ERROR_MESSAGE = '<code>ERROR Rendering Code Block</code>'
const LANG_TEXT = ['text', 'txt', 'plaintext']

module.exports = options => {
  let theme = options.theme ? options.theme : 'nord'

  return async tree => {
    const highlighter = await shiki.getHighlighter({ theme })

    visit(tree, 'code', node => {
      node.type = 'html'
      try {
        node.value = highlight(node, highlighter)
      } catch (e) {
        node.value = ERROR_MESSAGE
        console.log(e)
      }
    })

    if (!options.skipInline) {
      visit(tree, 'inlineCode', node => {
        node.type = 'html'
        try {
          node.value = highlight(node, highlighter)
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

function highlight({ value, lang, meta }, highlighter) {
  const index = shiki.BUNDLED_LANGUAGES.findIndex(x => {
    return x.id === lang || (x.aliases && x.aliases.includes(lang))
  })

  if (index >= 0 || LANG_TEXT.includes(lang)) {
    return postProcess(highlighter.codeToHtml(value, lang), lang)
  } else {
    // fallback for unknown languages
    return postProcess(highlighter.codeToHtml(value, FALLBACK_LANGUAGE), lang)
  }
}
