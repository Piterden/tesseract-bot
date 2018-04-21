module.exports = {
  enabledLanguages: (langs) => `Enabled languages are:\n\`\`\`
${JSON.stringify(langs || ['eng', 'osd'], null, '  ')}
\`\`\`\nTap to toggle a language:`,

  mainMessage: (langs) => `Enabled languages: \`${langs.join(',')}\``,
}
