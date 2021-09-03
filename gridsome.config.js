const path = require('path')
const autoprefixer = require('autoprefixer')

const { processMarkdown } = require('./lib/markdown')
const slugifyOptions = require('./lib/slugify').options
const siteConfig = require('./data/site.config')

module.exports = {
  siteName: siteConfig.name,
  siteDescription: siteConfig.description,
  siteUrl: siteConfig.url,
  titleTemplate: `%s — ${siteConfig.name}`,
  outputDir: 'public',
  permalinks: {
    slugify: {
      use: '@sindresorhus/slugify',
      options: slugifyOptions
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
        path: 'data/posts/**/*.md',
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
        path: 'data/profiles/**/*.md',
        typeName: 'Profile'
      }
    },
    {
      use: '@microflash/gridsome-plugin-feed',
      options: {
        contentTypes: ['Blog'],
        feedOptions: {
          title: siteConfig.name,
          description: siteConfig.description,
          id: siteConfig.url,
          link: siteConfig.url,
          image: siteConfig.favicon,
          copyright: siteConfig.copyright,
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
              name: `@${siteConfig.name}`,
              email: siteConfig.maintainer,
              link: siteConfig.url
            }
          ],
          content: processMarkdown(node.content)
        })
      }
    },
    {
      use: '@gridsome/plugin-sitemap',
      options: {
        cacheTime: 600000,
      }
    }
  ],
  transformers: {
    remark: {
      plugins: [
        'remark-admonitions',
        [
          '@noxify/gridsome-plugin-remark-embed', {
            'enabledProviders': ['Youtube']
          }
        ],
        [
          require('./lib/remark-shiki'), {
            theme: 'css-variables',
            skipInline: true,
            showLanguage: true,
            aliases: {
              conf: 'ini',
              dockerfile: 'docker',
              log: 'sh',
              properties: 'ini',
              yml: 'yaml'
            }
          }
        ],
        'gridsome-remark-figure-caption'
      ],
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
        plugins: [
          autoprefixer()
        ],
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
