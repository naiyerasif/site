const marked = require('marked')

const whitespace = ' '
const emptyspace = ''
const defaultRenderer = new marked.Renderer()

const stripTocRenderer = new marked.Renderer()
stripTocRenderer.heading = (text, level, raw, slugger) => (level === 3 && text === 'Table of Contents') ? emptyspace : defaultRenderer.heading(text, level, raw, slugger)

const plainTextRenderer = new marked.Renderer()
plainTextRenderer.code = (code, infostring, escaped) => code + whitespace
plainTextRenderer.blockquote = (quote) => quote + whitespace
plainTextRenderer.heading = (text, level, raw, slugger) => text
plainTextRenderer.hr = () => whitespace
plainTextRenderer.list = (body, ordered, start) => body
plainTextRenderer.listitem = (text) => text + whitespace
plainTextRenderer.checkbox = (checked) => whitespace
plainTextRenderer.paragraph = (text) => text + whitespace
plainTextRenderer.table = (header, body) => header + whitespace + body + whitespace
plainTextRenderer.tablerow = (content) => content + whitespace
plainTextRenderer.tablecell = (content, flags) => content + whitespace
plainTextRenderer.strong = (text) => text
plainTextRenderer.em = (text) => text
plainTextRenderer.codespan = (code) => code
plainTextRenderer.br = () => whitespace
plainTextRenderer.del = (text) => text
plainTextRenderer.link = (href, title, text) => text
plainTextRenderer.image = (href, title, text) => whitespace
plainTextRenderer.text = (text) => text

module.exports = {
  stripTocRenderer,
  plainTextRenderer
}
