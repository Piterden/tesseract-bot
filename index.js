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

const download = (url, dest) => {
  const file = fs.createWriteStream(dest)

  return new Promise((resolve, reject) => {
    let responseSent = false

    https
      .get(url, (response) => {
        response.pipe(file)
        file.on('finish', () => {
          file.close(() => {
            if (responseSent) return
            responseSent = true
            resolve()
          })
        })
      })
      .on('error', (err) => {
        if (responseSent) return
        responseSent = true
        reject(err)
      })
  })
}

bot.start(async (ctx) => {
  await ctx.reply(ctx.message)
})

bot.on('photo', async (ctx) => {
  const fileId = await ctx.message.photo[ctx.message.photo.length - 1].file_id
  const link = await ctx.telegram.getFileLink(fileId)
  const filePath = await path.resolve(link.split('/').slice(-2).join('/')) // eslint-disable-line no-magic-numbers

  await download(link, filePath)

  ocr
    .create({ langPath: 'eng.traineddata' })
    .recognize(filePath, { lang: 'eng' })
    .progress((message) => console.log(message))
    .catch((error) => console.error(error))
    .then((result) => console.log(result))
    .finally((resultOrError) => {
      ctx.reply(resultOrError.text, { disable_web_page_preview: true })
    })
})

bot.startPolling()
