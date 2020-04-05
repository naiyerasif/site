const fs = require('fs')
const moment = require('moment')
const slugify = require('@sindresorhus/slugify')
const appConfig = require('../app.config')
const slugifyConfig = require('../gridsome.config').permalinks.slugify.options

const now = moment()
const title = process.argv[2]
const labels = process.argv[3]
const date = now.format('YYYY-MM-DD HH:mm:ss')

if (!title || !labels) {
  console.log('Provide a title / labels')
  return
}

const fileName = `${now.format('YYYY-MM-DD')}-${slugify(title, slugifyConfig)}`
const filePath = `./${appConfig.prefs.draftDir}/${fileName}.md`

const frontmatter = `---
title: '${title}'
date: ${date}
authors: [naiyer]
labels: [${labels}]
---
`

fs.writeFile(filePath, frontmatter, () => console.log(`Created ${filePath}`))
