const path = require('path')
const autoprefixer = require('autoprefixer')
const purgecss = require('@fullhuman/postcss-purgecss')
const marked = require('marked')

const purgecssConfig = require('./purgecss.config')
const appConfig = require('./app.config')

const postcssPlugins = []

if (process.env.NODE_ENV === 'production') postcssPlugins.push(purgecss(purgecssConfig))

postcssPlugins.push(autoprefixer({
  cascade: false
}))

const remarkPlugins = [
  [
    'gridsome-plugin-remark-prismjs-all', { 
      noInlineHighlight: true,
      aliases: {
        sh: 'shell',
        conf: 'properties'
      }
    }
  ]
]

module.exports = {
  siteName: appConfig.name,
  siteDescription: appConfig.description,
  siteUrl: appConfig.url,
  titleTemplate: `%s · ${appConfig.name}`,
  outputDir: 'public',
  permalinks: {
    slugify: {
      use: '@sindresorhus/slugify',
      options: {
        decamelize: false,
        customReplacements: [['.js', 'js']]
      }
    }
  },
  templates: {
    Blog: '/blog/:year/:month/:day/:title'
  },
  plugins: [
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'content/blog/**/*.md',
        typeName: 'Blog',
        refs: {
          authors: {
            typeName: 'Profile'
          }
        }
      }
    },
    {
      use: '@gridsome/vue-remark',
      options: {
        typeName: 'Profile',
        baseDir: './content/profiles',
        template: './src/templates/Profile.vue',
        route: '/profile/:id'
      }
    },
    {
      use: '@gridsome/vue-remark',
      options: {
        typeName: 'Collection',
        baseDir: './content/collection',
        pathPrefix: '/collection',
        template: './src/templates/Collection.vue',
        plugins: remarkPlugins
      }
    },
    {
      use: '@microflash/gridsome-plugin-feed',
      options: {
        contentTypes: ['Blog'],
        feedOptions: {
          title: appConfig.name,
          description: appConfig.description,
          id: appConfig.url,
          link: appConfig.url,
          image: appConfig.favicon,
          copyright: appConfig.copyright,
        },
        rss: {
          enabled: true,
          output: '/feed.xml'
        },
        atom: {
          enabled: false,
          output: '/feed.atom'
        },
        json: {
          enabled: false,
          output: '/feed.json'
        },
        maxItems: 25,
        htmlFields: ['content'],
        nodeToFeedItem: (node) => ({
          title: node.title,
          date: node.date,
          description: node.excerpt,
          author: [
            {
              name: `@${appConfig.name}`,
              email: appConfig.maintainer,
              link: appConfig.url
            }
          ],
          content: marked(node.content)
        })
      }
    },
    {
      use: '@gridsome/plugin-sitemap',
      options: {
        cacheTime: 600000,
      }
    },
    {
      use: '@gridsome/plugin-google-analytics',
      options: {
        id: 'UA-143076148-1'
      }
    }
  ],
  transformers: {
    remark: {
      plugins: remarkPlugins,
      externalLinksTarget: '_blank',
      externalLinksRel: ['nofollow', 'noopener', 'noreferrer'],
      slug: true,
      autolinkHeadings: {
        content: {
          type: 'element',
          tagName: 'span',
          properties: { className: ['reference'] }
        }
      }
    }
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: postcssPlugins,
      },
    },
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve(__dirname))
    config.module.rules.delete('svg')
    config.module.rule('svg')
      .test(/\.svg$/).use('vue').loader('vue-loader').end()
      .use('svg-to-vue-component').loader('svg-to-vue-component/loader')
  }
}
