const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')

const walkSync = (location, filter, fileList = []) => {
  if (lstatSync(location).isDirectory()) {
    const files = readdirSync(location)
    files.forEach(file => {
      const filePath = join(location, file)
      const fileStat = lstatSync(filePath)

      if (fileStat.isDirectory()) {
        walkSync(filePath, filter, fileList)
      } else if (filter.test(filePath)) {
        fileList.push(filePath)
      }
    })
  } else if (filter.test(location)) {
    fileList.push(location)
  }

  return fileList
}

module.exports = { walkSync }
