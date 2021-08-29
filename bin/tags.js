#!/usr/bin/env node

const { readFile } = require('fs')
const { join, isAbsolute } = require('path')
const matter = require('gray-matter')
const { program } = require('commander')
const marked = require('marked')
const { extract } = require('keyword-extractor')
const { walkSync } = require('./files')

program
  .version('0.0.1')
  .requiredOption('-p, --path [path]', 'specify the path of the file (required)')
  .parse(process.argv)

const input = program.opts().path
const extractorOpts = {
  language: 'english',
  remove_digits: true,
  return_changed_case: true,
  remove_duplicates: true,
}
const absolutePath = isAbsolute(input) ? input : join(process.cwd(), input)
const extractTags = filePath => {
  readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err
    const frontmatter =
      Object.values(
        (({ title, tags, tagline, excerpt }) => ({ title, tags, tagline, excerpt }))(
          matter(data).data
        )
      ) // extract selected fields from frontmatter
        .filter(Boolean) // remove undefined or null values
        .flat() || []
    const headings =
      marked
        .lexer(data)
        .filter(token => token.type === 'heading') // consider only heading
        .flatMap(token => token.tokens)
        .filter(token => token.type !== 'codespan') // remove any code elements from heading
        .map(token => token.text)
        .filter(token => !token.includes('Reference')) || []
    const text = [...frontmatter, ...headings].join(' ')
    console.log(`Suggested tags for ${filePath} -\n`, extract(text, extractorOpts), '\n')
  })
}

walkSync(absolutePath, /\.md$/)
  .sort()
  .forEach(f => extractTags(f))
