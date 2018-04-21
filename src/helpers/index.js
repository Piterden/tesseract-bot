const debug = require('./debug')
const langsAllowedList = require('./langs')
const url2Buffer = require('./url-2-buffer')
const optionsDefault = require('./url-2-buffer')


module.exports = {
  debug,
  url2Buffer,
  optionsDefault,
  langsAllowedList,
  tgFileId: (message, type) => {
    switch (type) {
      case 'photo': return message[type][message.photo.length - 1].file_id
      case 'document': return message[type].file_id
      default: return false
    }
  },
}
