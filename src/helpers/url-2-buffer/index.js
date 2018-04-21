const https = require('https')


module.exports = (url) => new Promise((resolve, reject) => {
  https.get(url, (response) => {
    const data = []

    response
      .on('data', (chunk) => {
        data.push(chunk)
      })
      .on('end', () => {
        resolve(Buffer.concat(data))
      })
      .on('error', (err) => {
        reject(err)
      })
  })
})
