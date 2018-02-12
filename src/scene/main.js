const Stage = require('telegraf/stage')
const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')

const debug = require('../method/debug')
const getBuffer = require('../method/get-buffer')
const getFileId = require('../method/get-file-id')
const getImageButtons = require('../method/get-image-buttons')


module.exports = new Scene('main')

  .enter(async ({ replyWithMarkdown, from }) => replyWithMarkdown(`
Hi ${from.first_name}, I am the Tesseract OCR bot.
Please send me an image like a photo, which contains English text...
  `))

  .on(['photo', 'document'], async (ctx, next) => {
    debug(ctx.message)
    const fileId = getFileId(ctx.message, ctx.updateSubTypes[0])
    const fileLink = fileId && await ctx.telegram.getFileLink(fileId)

    ctx.session.buffer = await getBuffer(fileLink)

    ctx.replyWithChatAction('upload_photo')
    ctx.replyWithPhoto(
      {
        source: ctx.session.buffer,
      },
      Markup.inlineKeyboard([getImageButtons()]).oneTime().resize().extra()
    )
  })
