#!/usr/bin/env node

const fs = require('fs')
const dayjs = require('dayjs')
const chrono = require('chrono-node')
const slugify = require('@sindresorhus/slugify')
const { program } = require('commander')

const { paths } = require('../app.config')
const slugifyConfig = require('../gridsome.config').permalinks.slugify.options

program
  .version('0.0.1')
  .option('-p, --post [post]', 'specify the type of post (default: guide)')
  .option('-d, --date [date]', 'specify the relative date (default: now)')
  .requiredOption('-h, --headline [headline]', 'specify the headline of the post (required)')
  .requiredOption('-t, --topics [topics]', 'specify the topics of the post (required)')
  .parse(process.argv)

const opts = program.opts()

const POST_TYPE = opts.post || 'guide'
const POST_HEADLINE = opts.headline
const POST_TOPICS = opts.topics
const POST_DATE = opts.date ? dayjs(chrono.parseDate(opts.date)) : dayjs()

const fields = []
fields.push(
  { title: `'${POST_HEADLINE}'` },
  { date: POST_DATE.format('YYYY-MM-DD HH:mm:ss') }
)

if (POST_TYPE !== 'guide') {
  fields.push({ category: `'${POST_TYPE}'` })
}

fields.push(
  { authors: `[naiyer]` },
  { topics: `[${POST_TOPICS}]` }
)

const FRONTMATTER_ENTRIES = fields.map(entry => Object.entries(entry).map(([k, v]) => `${k}: ${v}\n`)).join('')
const frontMatter = `---\n${FRONTMATTER_ENTRIES}---\n`

const SHORT_POST_TYPES = ['note', 'redirect']
const fileName = `${SHORT_POST_TYPES.includes(POST_TYPE) ? POST_DATE.format('YYYY-MM-DD-HH-mm') : POST_DATE.format('YYYY-MM-DD')}-${slugify(POST_HEADLINE, slugifyConfig)}`
const filePath = `./${paths.draft}/${fileName}.md`

fs.writeFile(filePath, frontMatter, () => console.log(`Created ${filePath}`))
