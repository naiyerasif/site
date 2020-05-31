const fs = require('fs')
const moment = require('moment')
const slugify = require('@sindresorhus/slugify')
const appConfig = require('../app.config')
const slugifyConfig = require('../gridsome.config').permalinks.slugify.options

const now = moment()
const title = process.argv[2]
const topics = process.argv[3]
const date = now.format('YYYY-MM-DD HH:mm:ss')

if (!title || !topics) {
  console.log('Provide a title / topic(s)')
  return
}

const fileName = `${now.format('YYYY-MM-DD-HH-mm')}-${slugify(title, slugifyConfig)}`
const filePath = `./${appConfig.prefs.statusDir}/${fileName}.md`

const frontmatter = `---
title: '${title}'
date: ${date}
topics: [${topics}]
---
`

fs.writeFile(filePath, frontmatter, () => console.log(`Created ${filePath}`))
