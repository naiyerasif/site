module.exports = {
  content: [
    'content/**/*.md',
    'src/assets/**/*.scss',
    'src/**/*.vue',
    'src/**/*.js'
  ],
  whitelist: [
    'html',
    'body',
    'img',
    'a',
    'pre',
    'code',
    'citation'
  ],
  whitelistPatterns: [
    /^g-/
  ],
  whitelistPatternsChildren: [
    /^gridsome-highlight/
  ]
}
