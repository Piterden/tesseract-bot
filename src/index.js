require('dotenv').load()
const https = require('https')
const { recognize } = require('penteract')
const Telegraf = require('telegraf')
const session = require('telegraf/session')


const { BOT_NAME, BOT_TOKEN } = process.env

const download = (source/* , destination */) => new Promise((resolve, reject) => {
  https.get(source, (response) => {
    const data = []

    response
      .on('data', (chunk) => {
        data.push(chunk)
      })
      .on('end', () => {
        resolve(Buffer.concat(data))
      })
      .on('error', (err) => {
        reject(err)
      })
  })
})

const getFileId = (message, type) => {
  switch (type) {
    case 'photo': return message[type][message.photo.length - 1].file_id
    case 'document': return message[type].file_id
    default: return false
  }
}

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

bot.use(session())

bot.start(async ({ replyWithMarkdown, from }) => replyWithMarkdown(`
Hi ${from.first_name}, I am the Tesseract OCR bot.
Please send me an image like a photo, which contains English text...
`))

bot.on(['photo', 'document'], async (ctx) => {
  const fileId = getFileId(ctx.message, ctx.updateSubTypes[0])
  const fileLink = fileId && await ctx.telegram.getFileLink(fileId)

  const buffer = await download(fileLink)
  const result = await recognize(buffer, {
    lang: [
      'eng',
      'rus',
      'osd',
      'equ',
    ]
  })

  ctx.reply(result, { disable_web_page_preview: true })
})

bot.startPolling()
