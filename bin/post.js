#!/usr/bin/env node

const { writeFile } = require('fs')
const { join } = require('path')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const { program } = require('commander')
const { createSlug } = require('../lib/slugify')

dayjs.extend(customParseFormat)

const draftPath = '.gitlab/drafts'

program
  .version('0.0.1')
  .option('-c, --category [category]', 'specify the category of post (default: guide)')
  .option('-d, --date [date]', 'specify the date of post (default: current date)')
  .requiredOption('-t, --title [title]', 'specify the title of the post (required)')
  .requiredOption('-g, --tags [tags]', 'specify the tags of the post (required)')
  .parse(process.argv)

const opts = program.opts()
const category = opts.category || 'guide'
const date = opts.date ? dayjs(opts.date, 'YYYY-MM-DD HH:mm:ss') : dayjs()
const title = opts.title
const tags = opts.tags
  .split(',')
  .map(tag => tag.trim())
  .map(tag => `'${tag}'`)
  .join(', ')
const postDateFormat = date.format('YYYY-MM-DD HH:mm:ss')
const fileDateFormat = date.format('YYYY-MM-DD-HH-mm-ss')
const slug = createSlug(title)
const filePath = join(process.cwd(), draftPath, `${fileDateFormat}-${slug}.md`)
let frontmatter

if (category !== 'guide') {
  frontmatter = `---\ntitle: '${title}'\ndate: ${postDateFormat}\ncategory: '${category}'\ntags: [${tags}]\n---\n`
} else {
  frontmatter = `---\ntitle: '${title}'\ndate: ${postDateFormat}\ntags: [${tags}]\n---\n`
}

writeFile(filePath, frontmatter, () => console.log(`Created ${filePath}`))
