const axios = require('axios')
const fs = require('fs').promises
const path = require('path')
const counterPath = require('../app.config').paths.counter

fs.mkdir(path.dirname(counterPath), { recursive: true }).then(response => {
  axios.get('https://gc.zgo.at/count.js', { responseType: 'arraybuffer' }).then(response => {
    fs.writeFile(counterPath, response.data)
    console.log('Analytics script downloaded')
  }).catch(error => {
    console.log(error)
  })
}).catch(error => {
  console.log(error)
})
