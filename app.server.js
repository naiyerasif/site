const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
const { google } = require('googleapis')

dotenv.config()

if (process.env.CLIENT_EMAIL && process.env.PRIVATE_KEY && process.env.VIEW_ID) {
  console.log('Found env variables')
}

const jwtAuth = new google.auth.JWT({
  email: process.env.CLIENT_EMAIL,
  key: process.env.PRIVATE_KEY.replace(new RegExp("\\\\n", "\g"), "\n"),
  scopes: 'https://www.googleapis.com/auth/analytics.readonly'
})

const analytics = google.analytics({
  version: 'v3',
  auth: jwtAuth
})

async function getReport() {
  return await analytics.data.ga.get({
    'ids': `ga:${process.env.VIEW_ID}`,
    'dimensions': 'ga:pageTitle,ga:pagePath',
    'metrics': 'ga:pageviews',
    'filters': 'ga:pagePathLevel1=@/blog/',
    'start-date': '30daysAgo',
    'end-date': 'today',
    'max-results': 9,
    'sort': '-ga:pageviews'
  })
}

function writeToFile(target, output, data) {
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
  getReport,
  writeToFile
}
