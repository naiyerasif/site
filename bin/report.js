const { getReport, writeToFile } = require('../app.server')
const { paths } = require('../app.config')

getReport().then(res => {
  const report = {
    popular: res.data.rows.map(entry => {
      return {
        title: entry[0].slice(0, -13),
        path: entry[1],
        views: entry[2]
      }
    })
  }

  writeToFile('analytics report', paths.report, report)
}).catch(err => console.error(err))
