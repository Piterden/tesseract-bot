const { promisify } = require('util')
const { exec } = require('child_process')
const Markup = require('telegraf/markup')


const execPromise = promisify(exec)
const { LANG_COLS } = process.env

const getLangButtons = async () => {
  const { stderr } = await execPromise('/usr/bin/tesseract --list-langs')

  return stderr.split('\n').slice(1).sort()
    .map((lang) => Markup.callbackButton(lang, `!lang=${lang}`))
    .reduce((acc, cur) => {
      if (acc.length === 0 || acc[acc.length - 1].length >= LANG_COLS) {
        acc.push([])
      }
      acc[acc.length - 1].push(cur)
      return acc
    }, [])
}

module.exports = getLangButtons
