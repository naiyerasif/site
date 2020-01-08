const siteConfig = require('./data/site.json')

module.exports = {
  copyright: `Copyright ${new Date().getFullYear()} ${this.name}`,
  blogDir: 'content/blog/',
  editConfig: {
    paths: [
      {
        collection: 'Post',
        basePath: `https://github.com/Microflash/microflash.github.io/edit/release/content/`,
        constructEditUrl: (ctx, path) => {
          const tokens = path.split('/')
          tokens[1] = tokens[1] + "/" + tokens[2]
          const slug = tokens.splice(1, 2).join('/') + tokens.join('-')
          return `${ctx + slug.substring(0, slug.length - 1)}.md`
        }
      }
    ]
  },
  ...siteConfig
}
