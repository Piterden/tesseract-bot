require('dotenv').load()

const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')
const { recognize } = require('penteract')

const { url2Buffer, debug, tgFileId } = require('./helpers')
const { langsScene, optionsScene } = require('./scenes')
const { mainInlineKeyboard } = require('./keyboards')
const { mainMessage } = require('./messages')


const { session, Markup } = Telegraf
const { BOT_NAME, BOT_TOKEN } = process.env

const stage = new Stage([langsScene, optionsScene], { ttl: 120 })

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

bot.use(session())
bot.use(stage.middleware())

bot.start(async ({ replyWithMarkdown, from }) => replyWithMarkdown(
  `Hi ${from.first_name || 'stranger'}, I am the Tesseract OCR bot.
Please send me an image like a photo, which contains English text...`,
  Markup.removeKeyboard().extra()
))

bot.on(
  ['photo', 'document'],
  async (ctx) => {
    debug(ctx.message)
    Stage.leave()

    const fileId = tgFileId(ctx.message, ctx.updateSubTypes[0])
    const fileLink = fileId && await ctx.telegram.getFileLink(fileId)

    ctx.session.buffer = await url2Buffer(fileLink)
    ctx.session.langs = ctx.session.langs || ['eng', 'osd']
    ctx.session.options = ctx.session.options || {}

    ctx.replyWithChatAction('upload_photo')

    ctx.session.message = await ctx.replyWithPhoto(
      { source: ctx.session.buffer },
      {
        reply_to_message_id: ctx.message.message_id,
        caption: mainMessage(ctx.session.langs),
        ...mainInlineKeyboard(),
      }
    )
  }
)

bot.action(
  /^\/menu\/([-\w]+)$/,
  async ({ session: { buffer, langs, options }, reply, scene, match: [, slug] }) => {
    if (slug !== 'recognize') {
      return scene.enter(slug)
    }
    let result = await recognize(buffer, { langs, ...options })

    if (!result) {
      result = '/**** Not found! ****/'
    }

    return reply(result, {
      ...mainInlineKeyboard(),
      disable_web_page_preview: true,
    })
  }
)

bot.startPolling()
