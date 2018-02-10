require('dotenv').load()
const https = require('https')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const { exec } = require('child_process')
const { recognize } = require('penteract')
const session = require('telegraf/session')
const { inspect, promisify } = require('util')


const execPromise = promisify(exec)
const { BOT_NAME, BOT_TOKEN } = process.env
const langsListWidth = 3

const getBuffer = (source) => new Promise((resolve, reject) => {
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

const getSupportedLangsButtons = (list) => list.split('\n').slice(1).sort()
  .map((lang) => Markup.callbackButton(lang, `!lang=${lang}`))
  .reduce((acc, cur) => {
    if (acc.length === 0 || acc[acc.length - 1].length >= langsListWidth) {
      acc.push([])
    }
    acc[acc.length - 1].push(cur)
    return acc
  }, [])

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
  console.log(inspect(ctx.message, { colors: true, showHidden: true }))
  const fileId = getFileId(ctx.message, ctx.updateSubTypes[0])
  const fileLink = fileId && await ctx.telegram.getFileLink(fileId)

  ctx.session.buffer = await getBuffer(fileLink)

  const { stderr } = await execPromise('/usr/bin/tesseract --list-langs')

  ctx.reply(
    ctx.session.buffer.length,
    Markup.inlineKeyboard(getSupportedLangsButtons(stderr)).resize().extra()
  )
})

bot.action(/\!lang=(\w+)/, async (ctx) => {
  const result = await recognize(ctx.session.buffer, {
    lang: [ctx.match[1]],
  })

  ctx.answerCbQuery()
  ctx.reply(result, { disable_web_page_preview: true })
})

bot.startPolling()
