const { promisify } = require('util')
const { exec } = require('child_process')


const execPromise = promisify(exec)

module.exports = {
  optionsDefaults: async () => {
    const { stderr } = await execPromise('/usr/bin/tesseract --print-parameters')

    return stderr.split('\n').slice(1).sort().reduce((acc, cur) => {
      const parse = cur.match(/^([a-z]+)([a-z_]+)\t(.+)\t(.+)$/)

      acc[parse[1]] = acc[parse[1]] || {}
      acc[parse[1]][parse[2]] = {
        value: parse[3],
        description: parse[4],
      }

      return acc
    }, {})
  },
}
