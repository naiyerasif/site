#!/usr/bin/env node

const { writeFile } = require('fs')
const { join } = require('path')
const dayjs = require('dayjs')
const { program } = require('commander')
const { createSlug } = require('../lib/slugify')

const draftPath = '.gitlab/drafts'

program
  .version('0.0.1')
  .option('-c, --category [category]', 'specify the category of post (default: guide)')
  .requiredOption('-t, --title [title]', 'specify the title of the post (required)')
  .requiredOption('-g, --tags [tags]', 'specify the tags of the post (required)')
  .parse(process.argv)

const opts = program.opts()
const category = opts.category || 'guide'
const title = opts.title
const tags = opts.tags
  .split(',')
  .map(tag => tag.trim())
  .map(tag => `'${tag}'`)
  .join(', ')
const date = dayjs()
const dateFormats = {
  default: date.format('YYYY-MM-DD'),
  shortFormContent: date.format('YYYY-MM-DD HH:mm:ss'),
  shortFormFile: date.format('YYYY-MM-DD-HH-mm')
}
const slug = createSlug(title)
const shortform = ['note', 'commentary']
let frontmatter, filePath

if (category !== 'guide') {
  if (shortform.includes(category)) {
    frontmatter = `---\ntitle: '${title}'\ndate: ${dateFormats.shortFormContent}\ncategory: '${category}'\ntags: [${tags}]\n---\n`
    filePath = join(process.cwd(), draftPath, `${dateFormats.shortFormFile}-${slug}.md`)
  } else {
    frontmatter = `---\ntitle: '${title}'\ndate: ${dateFormats.default}\ncategory: '${category}'\ntags: [${tags}]\n---\n`
    filePath = join(process.cwd(), draftPath, `${dateFormats.default}-${slug}.md`)
  }
} else {
  frontmatter = `---\ntitle: '${title}'\ndate: ${dateFormats.default}\ntags: [${tags}]\n---\n`
  filePath = join(process.cwd(), draftPath, `${dateFormats.default}-${slug}.md`)
}

writeFile(filePath, frontmatter, () => console.log(`Created ${filePath}`))
