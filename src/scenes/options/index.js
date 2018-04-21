const Scene = require('telegraf/scenes/base')

const { optionsAllowedList } = require('../../helpers')
// const {  } = require('../../messages')
const { optionsInlineKeyboard, optionsRootInlineKeyboard } = require('../../keyboards')


const toggleLang = (options, lang) => {
  if (options.includes(lang)) {
    options.splice(options.findIndex((item) => item === lang), 1)
    return options
  }
  options.push(lang)
  return options
}

module.exports = new Scene('options')

  .enter(async (ctx) => {
    await ctx.replyWithMarkdown(
      '*Options:*',
      {
        ...optionsRootInlineKeyboard(),
        disable_web_page_preview: true,
        parse_mode: 'Markdown',
      }
    )

    return ctx.answerCbQuery()
    // await reply('', Markup.keyboard([Markup.callbackButton('Apply', '!apply')]).extra())
  })

  .action(
    /^\/cat\/(\w+)$/,
    async (ctx) => {
      await ctx.editMessageText(
        `*Options > ${ctx.match[1]}:*`,
        {
          ...optionsInlineKeyboard(ctx.match[1]),
          disable_web_page_preview: true,
          parse_mode: 'Markdown',
        }
      )

      return ctx.answerCbQuery()
    }
  )

  .action(
    /^\/opt\/(\w+)$/,
    async (ctx) => {
      await ctx.editMessageText(
        '*Options:*',
        {
          ...optionsInlineKeyboard(ctx.match[1]),
          disable_web_page_preview: true,
          parse_mode: 'Markdown',
        }
      )

      return ctx.answerCbQuery()
    }
  )

  // .action()
