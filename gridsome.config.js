const autoprefixer = require('autoprefixer')
const purgecss = require('@fullhuman/postcss-purgecss')
const marked = require('marked')
const shiki = require('shiki')
const appConfig = require('./app.config')
const stripTocRenderer = require('./marked.config').stripTocRenderer

const postcssPlugins = []

if (process.env.NODE_ENV === 'production') postcssPlugins.push(purgecss())

postcssPlugins.push(autoprefixer({
  cascade: false
}))

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
    Post: '/blog/:year/:month/:day/:title',
    Tag: '/tag/:id'
  },
  plugins: [
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'content/blog/**/*.md',
        typeName: 'Post',
        refs: {
          tags: {
            typeName: 'Tag',
            create: true
          },
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
        baseDir: './profiles',
        template: './src/templates/Profile.vue',
        route: '/profile/:id'
      }
    },
    {
      use: 'gridsome-plugin-feed',
      options: {
        contentTypes: ['Post'],
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
          description: node.blurb,
          author: [
            {
              name: `@${appConfig.name}`,
              email: appConfig.maintainer,
              link: appConfig.url
            }
          ],
          content: marked(node.content, { renderer: stripTocRenderer })
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
        id: appConfig.gatid
      }
    }
  ],
  transformers: {
    remark: {
      plugins: [
        ['gridsome-plugin-remark-shiki', { theme: shiki.loadTheme('./static/remarkable.json'), skipInline: true }],
        ['remark-toc', { heading: appConfig.tocPattern, maxDepth: 3, tight: true }]
      ],
      externalLinksTarget: '_blank',
      externalLinksRel: ['nofollow', 'noopener', 'noreferrer'],
      slug: true,
      autolinkHeadings: {
        content: {
          type: 'element',
          tagName: 'span',
          properties: { className: ['ref-link'] }
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
  }
}
