const path = require('path')
const fs = require('fs')
const { GraphQLString } = require('gridsome/graphql')
const moment = require('moment')

const appConfig = require('./app.config')
const excerpt = require('./app.server').excerpt

const outdationDate = appConfig.prefs.outdationPeriod ? moment().clone().subtract(appConfig.prefs.outdationPeriod, 'days').startOf('day') : null

module.exports = function (api) {

  api.onCreateNode(options => {
    if (options.internal.typeName === 'Blog') {
      if (!options.updated) {
        options.updated = options.date
      }

      if (!options.outdated && !['never'].includes(options.outdated)) {
        options.outdated = outdationDate && moment(options.updated, 'YYYY-MM-DD HH:mm:ss').isBefore(outdationDate) ? 'old' : '#'
      }
    }
    
    return { ...options }
  })

  api.loadSource(({ addMetadata,addSchemaResolvers }) => {
    addSchemaResolvers({
      Blog: {
        excerpt: {
          type: GraphQLString,
          resolve(post) {
            return post.excerpt ? post.excerpt : excerpt(post.content)
          }
        }
      }
    })
  })

  api.createPages(async ({ graphql, createPage }) => {
    const { data } = await graphql(`{
      allBlog {
        edges {
          node {
            id
            path
          }
          next {
            id
          }
          previous {
            id
          }
        }
      }
    }`)

    data.allBlog.edges.forEach(element => {
      createPage({
        path: element.node.path,
        component: './src/templates/Post.vue',
        context: {
          previousId: (element.previous) ? element.previous.id : '#',
          nextId: (element.next) ? element.next.id : '#',
          id: element.node.id
        }
      })
    })
  })

  api.beforeBuild(context => {
    const collection = context._app.store.getCollection('Blog')._collection

    const posts = collection.data.map(post => {
      return {
        title: post.title,
        path: post.path,
        excerpt: post.excerpt ? post.excerpt : excerpt(post.content)
      }
    })

    const output = {
      dir: `./${appConfig.searchConfig.file.dir}`,
      name: appConfig.searchConfig.file.name
    }

    const outputPath = path.resolve(process.cwd(), output.dir)
    const outputPathExists = fs.existsSync(outputPath)
    const fileName = output.name.endsWith('.json') ? output.name : `${output.name}.json`

    if (!outputPathExists) {
      fs.mkdirSync(outputPath)
    }

    fs.writeFileSync(path.resolve(process.cwd(), output.dir, fileName), JSON.stringify(posts))
  })
}
