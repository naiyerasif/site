const path = require('path')
const fs = require('fs')
const moment = require('moment')

const { prefs, paths } = require('./app.config')
const projects = require('./content/projects')

const outdationDate = prefs.outdationPeriod ? moment().clone().subtract(prefs.outdationPeriod, 'days').startOf('day') : null

module.exports = api => {

  api.onCreateNode(options => {
    if (options.internal.typeName === 'Blog') {
      if (!options.updated) {
        options.updated = options.date
      }

      if (!options.category) {
        options.category = 'guide'
      }

      if (typeof(options.outdated) == 'undefined') {
        options.outdated = outdationDate && moment(options.updated, 'YYYY-MM-DD HH:mm:ss').isBefore(outdationDate) ? 'true' : 'undefined'
      }
    }
    
    return { ...options }
  })

  api.loadSource(async ({ getCollection, addCollection }) => {
    const { collection } = getCollection('Project')

    const allProjects = addCollection({
      typeName: 'CompleteProject'
    })

    projects.concat(collection.data).forEach(project => {
      allProjects.addNode({
        id: project.id,
        title: project.title,
        description: project.description,
        link: project.path
      })
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
        topics: post.topics
      }
    })

    const output = paths.search
    const outputPath = path.resolve(process.cwd(), output.dir)
    const outputPathExists = fs.existsSync(outputPath)
    const fileName = output.name.endsWith('.json') ? output.name : `${output.name}.json`

    if (!outputPathExists) {
      fs.mkdirSync(outputPath)
    }

    fs.writeFileSync(path.resolve(process.cwd(), output.dir, fileName), JSON.stringify(posts))
  })
}
