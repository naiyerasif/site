const path = require('path')
const autoprefixer = require('autoprefixer')
const marked = require('marked')

const appConfig = require('./app.config')

const postcssPlugins = [
  autoprefixer({
    cascade: false
  })
]

const remarkPlugins = [
  'remark-admonitions',
  [
    '@noxify/gridsome-plugin-remark-embed', {
      'enabledProviders': ['Youtube']
    }
  ],
  [
    'gridsome-plugin-remark-prismjs-all', { 
      noInlineHighlight: true,
      aliases: {
        sh: 'shell',
        conf: 'properties',
        yml: 'yaml'
      }
    }
  ],
  'gridsome-remark-figure-caption'
]

module.exports = {
  siteName: appConfig.name,
  siteDescription: appConfig.description,
  siteUrl: appConfig.url,
  titleTemplate: `%s — ${appConfig.name}`,
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
    Blog: '/blog/:year/:month/:day/:title',
    Profile: '/profile/:id',
    Project: '/project/:title'
  },
  plugins: [
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'content/posts/**/*.md',
        typeName: 'Blog',
        refs: {
          authors: {
            typeName: 'Profile'
          }
        }
      }
    },
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'content/profiles/**/*.md',
        typeName: 'Profile'
      }
    },
    {
      use: "gridsome-plugin-tailwindcss"
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
        maxItems: 25,
        htmlFields: ['content'],
        nodeToFeedItem: (node) => ({
          title: node.title,
          date: node.date,
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
        id: 'UA-143076148-1',
        debug: {
          sendHitTask: process.env.NODE_ENV === 'production'
        }
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
