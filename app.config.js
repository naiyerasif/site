const dayjs = require('dayjs')
const pkg = require('./package.json')

const capitalize = ([first, ...rest]) => [first.toUpperCase(), ...rest].join('')

const pkgName = capitalize(pkg.name)
const pkgAuthor = pkg.author
const pkgDescription = pkg.description

module.exports = {
  name: pkgName,
  description: pkgDescription,
  url: 'https://mflash.dev',
  favicon: 'https://raw.githubusercontent.com/Microflash/site/main/static/google-touch-icon.png',
  maintainer: pkgAuthor,
  copyright: `Copyright ${dayjs().year()} ${pkgAuthor}`,
  prefs: {
    maxTocDepth: 3,
  }
}
