const { basename, dirname, extname, isAbsolute, join } = require('path')
const { existsSync, mkdirSync, writeFileSync } = require('fs')

const createSearchIndex = (index, location) => {
  const filePath = isAbsolute(location) ? location : join(process.cwd(), location)
  const directory = dirname(filePath)
  const fileName = basename(filePath, extname(filePath))

  if (!existsSync(directory)) {
    mkdirSync(directory)
  }

  writeFileSync(join(directory, `${fileName}.json`), JSON.stringify(index))

  console.log('Generate search index')
}

module.exports = { createSearchIndex }
