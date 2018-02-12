require('dotenv').load()

const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')

const debug = require('./method/debug')
const getBuffer = require('./method/get-buffer')
const getFileId = require('./method/get-file-id')
const getImageButtons = require('./method/get-image-buttons')
const langsScene = require('./scene/langs')
const optionsScene = require('./scene/options')
const recognizeScene = require('./scene/recognize')


const { session, Markup } = Telegraf
const { BOT_NAME, BOT_TOKEN, LANG_COLS } = process.env

const stage = new Stage([langsScene, optionsScene, recognizeScene])

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

bot.use(session())
bot.use(stage.middleware())

bot.start(async ({ replyWithMarkdown, from }) => replyWithMarkdown(`
Hi ${from.first_name}, I am the Tesseract OCR bot.
Please send me an image like a photo, which contains English text...
`))

bot.on(['photo', 'document'], async (ctx) => {
  debug(ctx.message)
  const fileId = getFileId(ctx.message, ctx.updateSubTypes[0])
  const fileLink = fileId && await ctx.telegram.getFileLink(fileId)

  ctx.session.buffer = await getBuffer(fileLink)
  ctx.session.langs = ctx.session.langs || ['eng', 'osd']

  ctx.replyWithChatAction('upload_photo')
  ctx.replyWithPhoto(
    {
      source: ctx.session.buffer,
    },
    Markup.inlineKeyboard([getImageButtons()]).oneTime().resize().extra()
  )
})

bot.action(
  /!menu=([-\w]+)/,
  async ({ scene, match: [, firstMatch] }) => scene.enter(firstMatch)
)

bot.startPolling()
