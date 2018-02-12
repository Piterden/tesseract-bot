require('dotenv').load()

const Telegraf = require('telegraf')
const Stage = require('telegraf/stage')
const session = require('telegraf/session')

const mainScene = require('./scene/main')


const { BOT_NAME, BOT_TOKEN, LANG_COLS } = process.env

const stage = new Stage([mainScene])

const bot = new Telegraf(BOT_TOKEN, {
  telegram: { webhookReply: false },
  username: BOT_NAME,
})

bot.use(session())
bot.use(stage.middleware())

bot.start(async ({ scene }) => scene.enter('main'))

bot.startPolling()
