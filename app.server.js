const path = require('path')
const fs = require('fs')

const writeToFile = (target, output, data) => {
  const outputPath = path.resolve(process.cwd(), output.dir)
  const outputPathExists = fs.existsSync(outputPath)
  const fileName = output.name.endsWith('.json') ? output.name : `${output.name}.json`

  if (!outputPathExists) {
    fs.mkdirSync(outputPath)
  }

  if (outputPathExists && data && target) {
    console.log(`Generate ${target}`)
  }

  fs.writeFileSync(path.resolve(process.cwd(), output.dir, fileName), JSON.stringify(data))
}

module.exports = {
  writeToFile
}
