const Scene = require('telegraf/scenes/base')

const { langsAllowedList } = require('../../helpers')
const { enabledLanguages } = require('../../messages')
const { langsInlineKeyboard } = require('../../keyboards')


const toggleLang = (langs, lang) => {
  if (langs.includes(lang)) {
    langs.splice(langs.findIndex((item) => item === lang), 1)
    return langs
  }
  langs.push(lang)
  return langs
}

module.exports = new Scene('langs')

  .enter(async (ctx) => {
    await ctx.replyWithMarkdown(
      enabledLanguages(ctx.session.langs.sort()),
      {
        ...langsInlineKeyboard(),
        disable_web_page_preview: true,
        parse_mode: 'Markdown',
      }
    )

    return ctx.answerCbQuery()
    // await reply('', Markup.keyboard([Markup.callbackButton('Apply', '!apply')]).extra())
  })

  .action(
    /^\/lang\/(\w+)$/,
    async (ctx) => {
      if (!await langsAllowedList().includes(ctx.match[1])) {
        return ctx.answerCbQuery()
      }

      ctx.session.langs = toggleLang(ctx.session.langs, ctx.match[1])

      await ctx.editMessageText(
        enabledLanguages(ctx.session.langs.sort()),
        {
          ...langsInlineKeyboard(),
          disable_web_page_preview: true,
          parse_mode: 'Markdown',
        }
      )

      return ctx.answerCbQuery()
    }
  )

  // .action()
