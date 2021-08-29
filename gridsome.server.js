const { resolveBlog } = require('./lib/typeResolver')
const { writeToFile } = require('./app.server')
const { paths } = require('./app.config')
const projects = require('./content/projects')

module.exports = api => {

  api.onCreateNode(options => {
    resolveBlog(options)
  })

  api.loadSource(async ({ addCollection }) => {
    const allProjects = addCollection({
      typeName: 'Project'
    })
    projects.forEach(project => {
      allProjects.addNode({
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
        tags: post.tags
      }
    })

    writeToFile('search index', paths.search, posts)
  })
}
