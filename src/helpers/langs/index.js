const { promisify } = require('util')
const { exec } = require('child_process')


const execPromise = promisify(exec)

module.exports = {
  langsAllowedList: async () => {
    const { stderr } = await execPromise('/usr/bin/tesseract --list-langs')

    return stderr.split('\n').slice(1).sort()
  },
}
