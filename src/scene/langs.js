const Stage = require('telegraf/stage')
const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')

// const debug = require('../method/debug')
const getLangButtons = require('../method/get-lang-buttons')


const { leave } = Stage

module.exports = new Scene('langs')

  .enter(async (ctx) => {
    ctx.answerCbQuery()
    ctx.reply(
      'Enabled languages:',
      Markup.inlineKeyboard(await getLangButtons(ctx.session.langs))
        .resize()
        .extra()
    )
  })

  .action(/!lang=(\w+)/, async (ctx) => {
    ctx.session.langs.push(ctx.match[1])
    ctx.answerCbQuery()
    leave()
  })
