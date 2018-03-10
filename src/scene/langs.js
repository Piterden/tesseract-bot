const Stage = require('telegraf/stage')
const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')

// const debug = require('../method/debug')
const getLangButtons = require('../method/get-lang-buttons')
const messageEnabledLangs = require('../message/enabled-langs')


module.exports = new Scene('langs')

  .enter(async ({
    session: { langs = ['eng', 'osd'] },
    answerCbQuery,
    reply,
  }) => {
    await reply(
      messageEnabledLangs(langs.sort()),
      {
        ...Markup.inlineKeyboard(await getLangButtons()).extra(),
        disable_web_page_preview: true,
        parse_mode: 'Markdown',
      }
    )
    answerCbQuery()
    // await reply('', Markup.keyboard([Markup.callbackButton('Apply', '!apply')]).extra())
  })

  .action(
    /!lang=(\w+)/,
    async ({ answerCbQuery, editMessageText,
      session: { langs },
      match: [, lang],
    }) => {
      if (langs.includes(lang)) {
        langs.splice(langs.findIndex((item) => item === lang), 1)
      }
      else {
        langs.push(lang)
      }

      await editMessageText(
        messageEnabledLangs(langs.sort()),
        {
          ...Markup.inlineKeyboard(await getLangButtons()).extra(),
          disable_web_page_preview: true,
          parse_mode: 'Markdown',
        }
      )
      await answerCbQuery()
    }
  )

  // .action()
