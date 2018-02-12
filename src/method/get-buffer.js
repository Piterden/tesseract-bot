const https = require('https')


const getBuffer = (source) => new Promise((resolve, reject) => {
  https.get(source, (response) => {
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

module.exports = getBuffer
