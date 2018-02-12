const { recognize } = require('penteract')

// const Stage = require('telegraf/stage')
// const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')

// const debug = require('../method/debug')

module.exports = new Scene('recognize')

  .enter(async (ctx) => {
    const result = await recognize(ctx.session.buffer, {
      lang: [ctx.match[1]],
    })

    ctx.reply(result, { disable_web_page_preview: true })
  })
