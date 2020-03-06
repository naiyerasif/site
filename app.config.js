module.exports = {
  name: 'Microflash',
  description: 'Reflections on design and development by Naiyer Asif',
  url: 'https://mflash.dev',
  favicon: 'https://raw.githubusercontent.com/Microflash/microflash.github.io/release/src/favicon.png',
  maintainer: 'Naiyer Asif',
  copyright: `Copyright ${new Date().getFullYear()} ${this.name}`,
  prefs: {
    draftDir: 'archive/draft',
    excerptSize: 251,
    outdationPeriod: 365 // in days
  },
  slugifyConfig: {
    decamelize: false,
    customReplacements: [['.js', 'js']]
  },
  editConfig: {
    paths: [
      {
        collection: 'Post',
        basePath: 'https://github.com/Microflash/microflash.github.io/edit/release/content/',
        constructEditUrl: (ctx, path) => {
          const tokens = path.split('/')
          tokens[1] = tokens[1] + "/" + tokens[2]
          const slug = tokens.splice(1, 2).join('/') + tokens.join('-')
          return `${ctx + slug.substring(0, slug.length - 1)}.md`
        }
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
      threshold: 0.4,
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
