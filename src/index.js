require('dotenv').load()

const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')
const { recognize } = require('penteract')
const uploader = require('imgur-uploader')

const debug = require('./method/debug')
const getBuffer = require('./method/get-buffer')
const getFileId = require('./method/get-file-id')
const getImageButtons = require('./method/get-image-buttons')
const langsScene = require('./scene/langs')
const optionsScene = require('./scene/options')


const { leave } = Stage
const { session, Markup } = Telegraf
const { BOT_NAME, BOT_TOKEN } = process.env

const stage = new Stage([langsScene, optionsScene])

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

bot.use(session())
bot.use(stage.middleware())

bot.start(async ({ replyWithMarkdown, from }) => {
  await replyWithMarkdown(
    `Hi ${from.first_name || 'stranger'}, I am the Tesseract OCR bot.
Please send me an image like a photo, which contains English text...`,
    Markup.removeKeyboard().extra()
  ).catch(console.log)
})

bot.on(
  ['photo', 'document'],
  async (ctx) => {
    debug(ctx.message)
    leave()

    const fileId = getFileId(ctx.message, ctx.updateSubTypes[0])
    const fileLink = fileId && await ctx.telegram.getFileLink(fileId)

    ctx.session.buffer = await getBuffer(fileLink)
    ctx.session.langs = ctx.session.langs || ['eng', 'osd']

    ctx.replyWithChatAction('upload_photo')

    ctx.replyWithPhoto(
      { source: ctx.session.buffer },
      {
        reply_to_message_id: ctx.message.message_id,
        caption: `Enabled languages: \`${ctx.session.langs.join(',')}\``,
        ...Markup.inlineKeyboard([getImageButtons()]).extra(),
      },
    )
  }
)

bot.action(
  /!menu=([-\w]+)/,
  async ({ session: { buffer, langs }, reply, scene, match: [, slug] }) => {
    if (slug !== 'recognize') {
      return scene.enter(slug)
    }
    let result = await recognize(buffer, { langs })

    if (!result) {
      result = 'Ok'
    }

    return reply(result, {
      ...Markup.inlineKeyboard([
        Markup.callbackButton('Change options', '!menu=options'),
        Markup.callbackButton('Change languages', '!menu=langs'),
      ]).oneTime().resize().extra(),
      disable_web_page_preview: true,
    })
  }
)

bot.startPolling()
