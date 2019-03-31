const exec = require('promise-exec')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')

const debug = require('../method/debug')


const { leave } = Stage

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

module.exports = new Scene('options')
  .enter(async (ctx) => {
    const params = await exec('tesseract --print-parameters')
    const parsed = params[0].split('\n')
      .map((param, idx) => {
        const [key, value, desc] = param.split('\t')

        return idx > 0 ? { key, value, desc } : false
      })
      .filter(Boolean)
      .reduce((acc, { key, value, desc }) => {
        const [category, type, ...param] = key.split('_')
        const name = param.join('_')

        acc[category] = acc[category] || {}
        acc[category][type] = acc[category][type] || {}
        acc[category][type][name] = acc[category][type][name] || {}
        acc[category][type][name].desc = desc
        acc[category][type][name].value = value

        return acc
      }, {})

    await ctx.reply(
      'Categories',
      {
        ...Markup.inlineKeyboard(
          Object.keys(parsed)
            .map((category) => ({
              text: `${capitalize(category)} (${Object.keys(parsed[category]).length})`,
              callback_data: `!category=${category}`,
            }))
            .reduce((acc, cur, idx) => {
              const index = Math.ceil((idx + 1) / 3)

              acc[index - 1] = acc[index - 1] || []
              acc[index - 1].push(cur)

              return acc
            }, []))
          .extra(),
        disable_web_page_preview: true,
        parse_mode: 'Markdown',
      }
    )

    // debug()
    ctx.answerCbQuery()
  })
  .leave((ctx) => ctx.reply('Buy'))
  .hears(/hi/gi, leave())
  .on('message', (ctx) => ctx.reply('Send `hi`'))
