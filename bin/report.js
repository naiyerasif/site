const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
const { google } = require('googleapis')
const { writeToFile } = require('../app.server')
const { prefs, paths } = require('../app.config')

dotenv.config()

const verifyEnv = () => {
  if (process.env.CLIENT_EMAIL && process.env.PRIVATE_KEY && process.env.VIEW_ID) {
    console.log('Found env variables')
  }
}

const fetchToken = () => {
  verifyEnv()

  return new google.auth.JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(new RegExp("\\\\n", "\g"), "\n"),
    scopes: 'https://www.googleapis.com/auth/analytics.readonly'
  })
}

const analytics = () => {
  return google.analytics({
    version: 'v3',
    auth: fetchToken()
  })
}

const getReport = async (limit) => {
  return await analytics().data.ga.get({
    'ids': `ga:${process.env.VIEW_ID}`,
    'dimensions': 'ga:pageTitle,ga:pagePath',
    'metrics': 'ga:pageviews',
    'filters': 'ga:pagePathLevel1=@/blog/',
    'start-date': '30daysAgo',
    'end-date': 'today',
    'max-results': limit,
    'sort': '-ga:pageviews'
  })
}

const initReport = () => {
  const reportPath = path.resolve(process.cwd(), paths.report.dir, paths.report.name)
  const reportExists = fs.existsSync(reportPath)

  if (process.env.NODE_ENV === 'production' || !reportExists) {
    console.log('Create dataset for report')

    getReport(prefs.maxPopularPosts).then(res => {
      writeToFile('analytics report', paths.report, res.data.rows.map(entry => entry[1]))
    }).catch(err => console.error(err))
  } else {
    console.log('Report found')
  }
}

initReport()
