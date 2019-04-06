const exec = require('promise-exec')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const Markup = require('telegraf/markup')

// const debug = require('../method/debug')


const { leave } = Stage

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

const humanize = (str) =>
  str.split('_').map(capitalize).join(' ')

module.exports = new Scene('options')

  .enter(async (ctx) => {
    const stdout = await exec('tesseract --print-parameters')

    ctx.session.parsed = stdout[0].split('\n')
      .map((param, idx) => {
        const [key, value, desc] = param.split('\t')

        return idx > 0 ? { key, value, desc } : false
      })
      .filter(Boolean)
      .reduce((acc, { key, value, desc }) => {
        const segments = key.split('_')
        const [category, type, ...param] = segments.length === 2
          ? ['root', ...segments]
          : segments
        const name = param.join('_')

        acc[category] = acc[category] || {}
        acc[category][type] = acc[category][type] || {}
        acc[category][type][name] = acc[category][type][name] || {}

        acc[category][type][name].key = key
        acc[category][type][name].desc = desc
        acc[category][type][name].value = value

        return acc
      }, {})

    ctx.session.optionsMessage = await ctx.reply(
      `*Options*
_Categories_`,
      {
        ...Markup.inlineKeyboard(Object.keys(ctx.session.parsed)
          .map((category) => ({
            text: `${capitalize(category)} (${
              Object.keys(ctx.session.parsed[category]).length
            })`,
            callback_data: `!category=${category}`,
          }))
          .reduce((acc, cur, idx) => {
            const index = Math.ceil((idx + 1) / 3) - 1

            acc[index] = acc[index] || []
            acc[index].push(cur)

            return acc
          }, []),
        ).extra(),
        disable_web_page_preview: true,
        parse_mode: 'Markdown',
      }
    )

    ctx.answerCbQuery()
  })

  .action(/^!reenter$/, async (ctx) => ctx.scene.reenter())

  .action(
    /^!category=(\w+)$/,
    async (ctx) => {
      const category = ctx.match[1]

      await ctx.deleteMessage(ctx.session.optionsMessage.message_id)

      ctx.session.optionsMessage = await ctx.reply(
        `*Options*
_Category:_ *${capitalize(category)}*`,
        {
          ...Markup.inlineKeyboard([
            ...Object.keys(ctx.session.parsed[category])
              .map((type) => ({
                text: `${capitalize(type)} (${
                  Object.keys(ctx.session.parsed[category][type]).length
                })`,
                callback_data: `!category=${category}&type=${type}`,
              }))
              .reduce((acc, cur, idx) => {
                const index = Math.ceil((idx + 1) / 3)

                acc[index] = acc[index] || []
                acc[index].push(cur)

                return acc
              }, []),
            {
              text: 'Level Up',
              callback_data: '!reenter',
            },
          ]).extra(),
          disable_web_page_preview: true,
          parse_mode: 'Markdown',
        }
      )
    }
  )

  .action(
    /^!category=(\w+)&type=(\w+)$/,
    async (ctx) => {
      const [, category, type] = ctx.match

      await ctx.deleteMessage(ctx.session.optionsMessage.message_id)

      ctx.session.optionsMessage = await ctx.reply(
        `*Options*
_Category:_ *${capitalize(category)}*
_Type:_ *${capitalize(type)}*`,
        {
          ...Markup.inlineKeyboard(
            [
              [{
                text: 'Level Up',
                callback_data: `!category=${category}`,
              }],
              ...Object.keys(ctx.session.parsed[category][type])
                .map((param) => [{
                  text: `${humanize(param)} = ${
                    ctx.session.parsed[category][type][param].value
                  }`,
                  callback_data: `!category=${category}&type=${type}&param=${param}`,
                }]),
            ]
          ).extra(),
          disable_web_page_preview: true,
          parse_mode: 'Markdown',
        }
      )
    }
  )

  .action(
    /^!category=(\w+)&type=(\w+)&param=(\w+)$/,
    async (ctx) => {
      const [, category, type, param] = ctx.match

      await ctx.deleteMessage(ctx.session.optionsMessage.message_id)

      ctx.session.optionsMessage = await ctx.reply(
        `*Options*
_Category:_ *${capitalize(category)}*
_Type:_ *${capitalize(type)}*
_Param:_ *${category}\_${type}\_${param}*

_Description:_ ${ctx.session.parsed[category][type][param].desc}

_Value:_ *${ctx.session.parsed[category][type][param].value}*`,
        {
          ...Markup.inlineKeyboard([
            [
              {
                text: 'Level Up',
                callback_data: `!category=${category}&type=${type}`,
              },
              {
                text: 'Change',
                callback_data: `!change=${category}_${type}_${param}`,
              },
            ],
          ]).extra(),
          parse_mode: 'Markdown',
        }
      )
    }
  )
  // debug()
  .leave((ctx) => ctx.reply('Buy'))
  .hears(/hi/gi, leave())
  .on('message', (ctx) => ctx.reply('Send `hi`'))
