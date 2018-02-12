const getFileId = (message, type) => {
  switch (type) {
    case 'photo': return message[type][message.photo.length - 1].file_id
    case 'document': return message[type].file_id
    default: return false
  }
}

module.exports = getFileId
