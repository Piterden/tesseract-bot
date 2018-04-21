const Markup = require('telegraf/markup')

const { langsAllowedList } = require('../helpers/langs')
const { optionsDefaults } = require('../helpers/options')


const { LANG_COLS } = process.env

const makeButtons = (buttons) => buttons
  .map((text) => Markup.callbackButton(text, `/menu/${text.toLowerCase()}`))

const langsButtons = async (prepend) => {
  const langs = await langsAllowedList()
    .reduce((acc, cur) => {
      if (acc.length === 0 || acc[acc.length - 1].length >= LANG_COLS) {
        acc.push([])
      }
      acc[acc.length - 1].push(Markup.callbackButton(cur, `/lang/${cur}`))
      return acc
    }, [])

  return prepend ? [prepend, ...langs] : langs
}

const optionsButtons = (category) => Object.keys(optionsDefaults[category])
  .map((option) => Markup.callbackButton(option, `/opt/${option}`))

const optionsRootButtons = () => Object.keys(optionsDefaults)
  .map((category) => Markup.callbackButton(category, `/cat/${category}`))

const langsInlineKeyboard = async (prepend) => Markup.inlineKeyboard(await langsButtons(prepend))
  .extra()

const optionsInlineKeyboard = (category) => Markup.inlineKeyboard(optionsButtons(category))
  .extra()

const optionsRootInlineKeyboard = () => Markup.inlineKeyboard(optionsRootButtons())
  .extra()

const mainInlineKeyboard = () => Markup.inlineKeyboard([
  makeButtons(['Langs', 'Options', 'Recognize']),
]).extra()

module.exports = {
  optionsRootInlineKeyboard,
  optionsInlineKeyboard,
  langsInlineKeyboard,
  mainInlineKeyboard,
}
