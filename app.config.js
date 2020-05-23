const pkg = require('./package.json')

const capitalize = ([ first, ...rest ]) => [ first.toUpperCase(), ...rest ].join('')

const pkgName = capitalize(pkg.name)
const pkgAuthor = pkg.author
const pkgDescription = pkg.description
const pkgRepo = pkg.repository

module.exports = {
  name: pkgName,
  description: pkgDescription,
  url: 'https://mflash.dev',
  favicon: 'https://raw.githubusercontent.com/Microflash/microflash.github.io/release/static/google-touch-icon.png',
  maintainer: pkgAuthor,
  copyright: `Copyright ${new Date().getFullYear()} ${pkgAuthor}`,
  prefs: {
    draftDir: '.archive/backlog',
    editContext: `${pkgRepo.replace(/.git$/g, '')}/edit/release`,
    spriteDir: '/assets/images',
    excerptSize: 251,
    maxTocDepth: 3,
    outdationPeriod: 365 // in days
  },
  headConfig: {
    meta: [
      {
        name: 'author',
        content: pkgAuthor
      },
      {
        name: 'description',
        content: pkgDescription
      },
      {
        name: 'theme-color',
        content: '#101015'
      }
    ],
    link: [
      {
        rel: 'icon',
        href: '/favicon.svg'
      },
      {
        rel: 'mask-icon',
        href: '/mask-icon.svg',
        color: '#db0b2f'
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png'
      },
      {
        rel: 'manifest',
        href: '/manifest.json'
      },
      {
        rel: 'preload',
        href: '/assets/images/icons.svg',
        type: 'image/svg+xml',
        as: 'image'
      }
    ]
  },
  searchConfig: {
    file: {
      dir: 'static',
      name: 'search.json'
    },
    options: {
      shouldSort: true,
      includeMatches: true,
      tokenize: true,
      matchAllTokens: true,
      threshold: 0.3,
      location: 0,
      distance: 600,
      maxPatternLength: 32,
      minMatchCharLength: 3,
      keys: [
        'title',
        'excerpt'
      ]
    }
  }
}
