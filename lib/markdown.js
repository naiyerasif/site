const unified = require('unified')
const markdown = require('remark-parse')
const html = require('remark-html')
const admonitions = require('remark-admonitions')
const prism = require('gridsome-plugin-remark-prismjs-all')
const figcaption = require('gridsome-remark-figure-caption')

const processor = unified()
  .use(markdown)
  .use(admonitions)
  .use(prism, {
    noInlineHighlight: true,
    aliases: { sh: 'shell', conf: 'properties', yml: 'yaml' },
  })
  .use(figcaption, {
    figureClassName: 'md-figure-block',
    imageClassName: 'md-figure-image',
    captionClassName: 'md-figure-caption',
  })
  .use(html)

const processMarkdown = content => processor.processSync(content).contents

module.exports = { processMarkdown }
