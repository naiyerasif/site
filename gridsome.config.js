const tailwind = require('tailwindcss');
const purgecss = require('@fullhuman/postcss-purgecss');
const marked = require('marked');

const postcssPlugins = [
  tailwind(),
];

if (process.env.NODE_ENV === 'production') {
  postcssPlugins.push(purgecss())
}

module.exports = {
  siteName: 'Microflash',
  siteDescription: 'Personal website of Naiyer Asif',
  siteUrl: 'https://microflash.github.io',
  titleTemplate: '%s — Microflash',
  outDir: 'public',
  plugins: [
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'blog/**/*.md',
        route: '/blog/:year/:month/:day/:slug',
        typeName: 'Post',
        refs: {
          tags: {
            typeName: 'Tag',
            route: 'tag/:id',
            create: true
          },
          author: 'Author'
        },
        remark: {
          plugins: [
            ['gridsome-plugin-remark-shiki', { theme: 'nord', skipInline: true }],
            ['remark-toc', { maxDepth: 3, tight: true }]
          ]
        }
      }
    },
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'content/cheatsheet/*.md',
        route: '/content/cheatsheet/:slug',
        typeName: 'Cheatsheet',
        refs: {
          author: 'Author'
        },
        remark: {
          plugins: [
            ['gridsome-plugin-remark-shiki', { theme: 'nord', skipInline: true }]
          ]
        }
      }
    },
    {
      use: 'gridsome-plugin-feed',
      options: {
        contentTypes: ['Post'],
        feedOptions: {
          title: 'Microflash',
          description: 'Blog of Naiyer Asif',
          link: 'https://microflash.github.io/',
          image: 'https://raw.githubusercontent.com/Microflash/microflash.github.io/release/src/favicon.png',
          favicon: 'https://raw.githubusercontent.com/Microflash/microflash.github.io/release/src/favicon.png'
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
              name: node.author,
              email: 'naiyer.app@gmail.com',
              link: 'https://microflash.github.io/about/naiyer'
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
      externalLinksTarget: '_blank',
      externalLinksRel: ['nofollow', 'noopener', 'noreferrer'],
      slug: true,
      autolinkHeadings: true,
      autolinkClassName: 'icon icon-link'
    }
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: postcssPlugins,
      },
    },
  },
};
