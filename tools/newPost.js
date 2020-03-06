const fs = require('fs')
const moment = require('moment')
const slugify = require('@sindresorhus/slugify')
const appConfig = require('../app.config')

const now = moment()
const title = process.argv[2]
const tag = process.argv[3]
const date = now.format('YYYY-MM-DD HH:mm:ss')

if (!title || !tag) {
  console.log('Provide a title / tag')
  return
}

const fileName = `${now.format('YYYY-MM-DD')}-${slugify(title, appConfig.slugifyConfig)}`
const filePath = `./${appConfig.draftDir}/${fileName}.md`

const frontmatter = `---
title: '${title}'
date: ${date}
authors: [naiyer]
tags: ['${tag}']
---
`

fs.writeFile(filePath, frontmatter, () => console.log(`Created ${filePath}`))
