#!/usr/bin/env node

const fs = require('fs')
const moment = require('moment')
const slugify = require('@sindresorhus/slugify')
const program = require('commander')

const appConfig = require('../app.config')
const slugifyConfig = require('../gridsome.config').permalinks.slugify.options

program
  .version('0.0.1')
  .option('-c, --content [content]', 'specify the type of content (default: post)')
  .requiredOption('-t, --title [title]', 'specify the title of the content (required)')
  .requiredOption('-m, --meta [meta]', 'specify the meta of the content (required)')
  .parse(process.argv)

const CONTENT = program.content || 'post'
const TITLE = program.title
const META = program.meta
const now = moment()
const date = now.format('YYYY-MM-DD HH:mm:ss')

let fileName, filePath, frontmatter

if (CONTENT === 'status') {
  fileName = `${now.format('YYYY-MM-DD-HH-mm')}-${slugify(TITLE, slugifyConfig)}`
  filePath = `./${appConfig.prefs.statusDir}/${fileName}.md`
  frontmatter = `---\ntitle: '${TITLE}'\ndate: ${date}\ntopics: [${META}]\n---\n`
} else {
  fileName = `${now.format('YYYY-MM-DD')}-${slugify(TITLE, slugifyConfig)}`
  filePath = `./${appConfig.prefs.draftDir}/${fileName}.md`
  frontmatter = `---\ntitle: '${TITLE}'\ndate: ${date}\nauthors: [naiyer]\ntopics: [${META}]\n---\n`
}

fs.writeFile(filePath, frontmatter, () => console.log(`Created ${filePath}`))
