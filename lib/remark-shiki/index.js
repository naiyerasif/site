const shiki = require('shiki')
const visit = require('unist-util-visit')

const FALLBACK_LANGUAGE = 'text'
const ERROR_MESSAGE = '<code>ERROR Rendering Code Block</code>'
const LANG_TEXT = ['text', 'txt', 'plaintext']

module.exports = options => {
  let theme = options.theme ? options.theme : 'nord'
  options.aliases = options.aliases ? options.aliases : {}

  return async tree => {
    const highlighter = await shiki.getHighlighter({ theme })

    visit(tree, 'code', node => {
      node.type = 'html'
      try {
        node.value = highlight(node, highlighter, options)
      } catch (e) {
        node.value = ERROR_MESSAGE
        console.log(e)
      }
    })

    if (!options.skipInline) {
      visit(tree, 'inlineCode', node => {
        node.type = 'html'
        try {
          node.value = highlight(node, highlighter, options)
        } catch (e) {
          node.value = ERROR_MESSAGE
          console.log(e)
        }
      })
    }
  }
}

function postProcess(highlighted, lang, meta, options) {
  let metadata = ''

  if (options.showLanguage) {
    metadata = `<div class="shiki-metadata"><span class="shiki-language">${lang}</span></div>`
  }

  return metadata + highlighted
}

function highlight({ value, lang, meta }, highlighter, options) {
  const resolvedLang = options.aliases[lang] ? options.aliases[lang] : lang

  const index = shiki.BUNDLED_LANGUAGES.findIndex(x => {
    return x.id === resolvedLang || (x.aliases && x.aliases.includes(resolvedLang))
  })

  if (index >= 0 || LANG_TEXT.includes(resolvedLang)) {
    return postProcess(highlighter.codeToHtml(value, resolvedLang), resolvedLang, meta, options)
  } else {
    // fallback for unknown languages
    return postProcess(highlighter.codeToHtml(value, FALLBACK_LANGUAGE), resolvedLang, meta, options)
  }
}
