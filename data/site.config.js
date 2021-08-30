const dayjs = require('dayjs')

module.exports = {
  name: 'Microflash',
  description: 'Reflections on design and development by Naiyer Asif',
  maintainer: 'Naiyer Asif',
  repository: 'https://github.com/Microflash/site.git',
  url: 'https://mflash.dev/',
  copyright: `Copyright ${dayjs().year()} ${this.maintainer}`,
  favicon: 'https://raw.githubusercontent.com/Microflash/site/main/static/google-touch-icon.png',
  editContext: 'https://github.com/Microflash/site/edit/main',
  expiry: 365, // in days
  tocDepth: 3
}
