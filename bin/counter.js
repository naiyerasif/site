const axios = require('axios')
const fs = require('fs')
const counterPath = require('../app.config').paths.counter

axios.get('https://gc.zgo.at/count.js', { responseType: 'arraybuffer' }).then(response => {
  fs.promises.writeFile(counterPath, response.data)
}).catch(error => {
  console.log(error)
})
