const { inspect } = require('util')


const debug = (data) => console.log(inspect(data, {
  colors: true,
  showHidden: true,
}))

module.exports = debug
