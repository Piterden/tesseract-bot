const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')


const { leave } = Stage

module.exports = new Scene('image-options')
  .enter((ctx) => ctx.reply('Hi'))
  .leave((ctx) => ctx.reply('Buy'))
  .hears(/hi/gi, leave())
  .on('message', (ctx) => ctx.reply('Send `hi`'))
