#!/usr/bin/env node

const fs = require('fs')
const dayjs = require('dayjs')
const chrono = require('chrono-node')
const slugify = require('@sindresorhus/slugify')
const program = require('commander')

const { paths } = require('../app.config')
const slugifyConfig = require('../gridsome.config').permalinks.slugify.options

program
  .version('0.0.1')
  .option('-c, --content [content]', 'specify the type of content (default: post)')
  .option('-d, --date [date]', 'specify the relative date (default: now)')
  .requiredOption('-t, --title [title]', 'specify the title of the content (required)')
  .requiredOption('-m, --meta [meta]', 'specify the meta of the content (required)')
  .parse(process.argv)

const CONTENT = program.content || 'post'
const TITLE = program.title
const SLUG = slugify(TITLE, slugifyConfig)
const META = program.meta
const DATE = program.date ? dayjs(chrono.parseDate(program.date)) : dayjs()
const DATE_FMT_META = DATE.format('YYYY-MM-DD HH:mm:ss')

let fileName, frontmatter

if (CONTENT === 'note') {
  fileName = `${DATE.format('YYYY-MM-DD-HH-mm')}-${SLUG}`
  frontmatter = `---\ntitle: '${TITLE}'\ndate: ${DATE_FMT_META}\ntopics: [${META}]\n---\n`
} else {
  fileName = `${DATE.format('YYYY-MM-DD')}-${SLUG}`
  frontmatter = `---\ntitle: '${TITLE}'\ndate: ${DATE_FMT_META}\nauthors: [naiyer]\ntopics: [${META}]\n---\n`
}

const filePath = `./${paths.draft}/${fileName}.md`

fs.writeFile(filePath, frontmatter, () => console.log(`Created ${filePath}`))
