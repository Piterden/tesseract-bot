const messageEnabledLangs = (langs) => `Enabled languages are:
\`\`\`
${JSON.stringify(langs || ['eng', 'osd'], null, '  ')}
\`\`\`
Tap to toggle a language:`

module.exports = messageEnabledLangs
