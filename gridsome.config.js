const path = require('path')
const marked = require('marked')
const stripTocRenderer = require('./marked.config').stripTocRenderer
const shiki = require('shiki')
const site = require('./data/site.json')

const addStyleResources = (rule) => {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/assets/scss/main.scss')
      ]
    })
}

const shikiOptions = {
  theme: shiki.loadTheme('./static/remarkable.json'),
  skipInline: true
}

const remarkOptions = (maxDepth) => {
  return { 
    maxDepth: maxDepth, 
    tight: true 
  }
}

module.exports = {
  siteName: site.title,
  siteDescription: site.description,
  siteUrl: site.url,
  titleTemplate: `%s · ${site.title}`,
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
    Post: '/blog/:year/:month/:day/:path',
    Author: '/about/:id',
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
          author: 'Author'
        },
        remark: {
          plugins: [
            ['gridsome-plugin-remark-shiki', shikiOptions],
            ['remark-toc', remarkOptions(3)]
          ]
        }
      }
    },
    {
      use: 'gridsome-plugin-feed',
      options: {
        contentTypes: ['Post'],
        feedOptions: {
          title: site.title,
          description: site.description,
          id: site.url,
          link: site.url,
          image: site.favicon,
          copyright: site.copyright,
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
          description: node.summary,
          author: [
            {
              name: `@${site.title}`,
              email: site.maintainer,
              link: site.about
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
        id: site.gatid
      }
    }
  ],
  transformers: {
    remark: {
      externalLinksTarget: '_blank',
      externalLinksRel: ['nofollow', 'noopener', 'noreferrer'],
      slug: true,
      autolinkHeadings: true,
      autolinkClassName: 'toclink'
    }
  },
  chainWebpack(config) {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResources(config.module.rule('scss').oneOf(type)))
  }
}
