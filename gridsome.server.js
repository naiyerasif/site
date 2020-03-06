const path = require('path')
const fs = require('fs')
const { GraphQLString } = require('gridsome/graphql')
const moment = require('moment')
const appConfig = require('./app.config')
const summarize = require('./marked.config').summarize

const editConfigs = appConfig.editConfig.paths
const { basePath, constructEditUrl } = editConfigs.filter(p => p.collection === 'Post')[0]

const outdationDate = appConfig.prefs.outdationPeriod ? moment().clone().subtract(appConfig.prefs.outdationPeriod, 'days').startOf('day') : null

module.exports = function (api) {

  api.onCreateNode(options => {
    if (options.internal.typeName === 'Post' && !options.updated) {
      options.updated = options.date
    }

    if (options.internal.typeName === 'Post' && !options.outdated && !['never'].includes(options.outdated)) {
      options.outdated = outdationDate && moment(options.updated, 'YYYY-MM-DD HH:mm:ss').isBefore(outdationDate) ? 'old' : '#'
    }
    return { ...options }
  })

  api.loadSource(({ addSchemaResolvers }) => {
    addSchemaResolvers({
      Post: {
        excerpt: {
          type: GraphQLString,
          resolve(post) {
            return post.excerpt ? post.excerpt : summarize(post.content)
          }
        },
        editUrl: {
          type: GraphQLString,
          resolve(post) {
            return constructEditUrl(basePath, post.path)
          }
        }
      }
    })
  })

  api.beforeBuild(context => {
    const collection = context._app.store.getCollection('Post')._collection

    const posts = collection.data.map(post => {
      return {
        title: post.title,
        path: post.path,
        excerpt: post.excerpt ? post.excerpt : summarize(post.content)
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
