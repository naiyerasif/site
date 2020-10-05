const dotenv = require('dotenv')
const { google } = require('googleapis')

dotenv.config()

const jwtAuth = new google.auth.JWT({
  email: process.env.CLIENT_EMAIL,
  key: process.env.PRIVATE_KEY,
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
    'max-results': 10,
    'sort': '-ga:pageviews'
  })
}

module.exports = {
  getReport
}
