const { promisify } = require('util')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')


const execPromise = promisify(exec)

const { leave } = Stage



module.exports = new Scene('image-langs')

  .enter(async (ctx) => {
    ctx.reply(
      ctx.session.buffer.length,
      Markup.inlineKeyboard(getLangButtons()).resize().extra()
    )
  })

  .leave((ctx) => ctx.reply('Buy'))

  .hears(/hi/gi, leave())


  .action(/!lang=(\w+)/, async (ctx) => {
    debug(ctx.from)
    debug(ctx.match)
    const result = await recognize(ctx.session.buffer, {
      lang: [ctx.match[1]],
    })

    ctx.answerCbQuery()
    ctx.reply(result, { disable_web_page_preview: true })
  })
