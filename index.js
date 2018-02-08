require('dotenv').load()
const fs = require('fs')
const path = require('path')
const https = require('https')
// const express = require('express')
const ocr = require('tesseract.js')
// const colors = require('colors/safe')
const Telegraf = require('telegraf')


const { BOT_NAME, BOT_TOKEN } = process.env

// WEBHOOK_DOMAIN, WEBHOOK_PATH, WEBHOOK_PORT, IMAGES_DIR, WEBHOOK_CERT, WEBHOOK_KEY,

// const url = `https://${WEBHOOK_DOMAIN}:${WEBHOOK_PORT}/`
// const tlsOptions = {
//   key: fs.readFileSync(path.resolve(WEBHOOK_KEY)),
//   cert: fs.readFileSync(path.resolve(WEBHOOK_CERT)),
// }

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

// const server = express()
// server.use(bot.webhookCallback(`/${WEBHOOK_PATH}`))
// server.use(`/${IMAGES_DIR}`, express.static(IMAGES_DIR))
// bot.telegram.setWebhook(`${url}${WEBHOOK_PATH}`, tlsOptions.cert)
// https.createServer(tlsOptions, server).listen(WEBHOOK_PORT, WEBHOOK_DOMAIN)

/**
 * Log middleware
 */
// bot.use(async ({ message, from }, next) => {
//   const start = Date.now()

//   await next()

//   console.log(`
// ${colors.white.bgBlue('=========================================')}
// ${JSON.stringify(message, null, '  ')}
// ${colors.yellow('-----------------------------------------')}
// ${JSON.stringify(from, null, '  ')}
// ${colors.yellow('-----------------------------------------')}
// Response time: ${colors.white.bgRed.bold(Date.now() - start)} ms
// ${colors.white.bgBlue('=========================================')}
// `)
// })

const download = (source, destination) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(destination)
  let done = false

  https
    .get(source, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close(() => {
          if (done) return
          done = true
          resolve()
        })
      })
    })
    .on('error', (err) => {
      if (done) return
      done = true
      reject(err)
    })
})

const getFileId = (message, type) => {
  switch (type) {
    case 'photo': return message[type][message.photo.length - 1].file_id
    case 'document': return message[type].file_id
    default: return false
  }
}

bot.start(async ({ replyWithMarkdown, from }) => replyWithMarkdown(`
Hi ${from.first_name}, I am the Tesseract OCR bot.
Please send me an image like a photo, which contains English text...
`))

bot.on(['photo', 'document'], async (ctx) => {
  const fileId = getFileId(ctx.message, ctx.updateSubTypes[0])
  const fileLink = fileId && await ctx.telegram.getFileLink(fileId)
  const filePath = fileLink && `files/${fileLink.split('/').slice(-1)[0]}`
  const fileFullPath = path.resolve(filePath)

  await download(fileLink, fileFullPath)

  ocr
    .recognize(fileFullPath, { lang: 'eng' })
    .progress((message) => {
      console.log(message)
    })
    .catch((error) => console.error(error))
    // .then((result) => console.log(result))
    .finally((res) => {
      ctx.reply(res.text, { disable_web_page_preview: true })
    })
})

bot.startPolling()
