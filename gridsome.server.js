const { resolveNode } = require('./lib/nodeResolver')
const { createSearchIndex } = require('./lib/searchIndex')
const { loadProjects } = require('./data/projects')

module.exports = api => {
  api.onCreateNode(options => resolveNode(options))

  api.loadSource(async ({ addCollection }) => {
    loadProjects(addCollection({ typeName: 'Project'}))
  })

  api.createPages(async ({ graphql, createPage }) => {
    const { data } = await graphql(`
      {
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
      }
    `)

    data.allBlog.edges.forEach(element => {
      createPage({
        path: element.node.path,
        component: './src/templates/Post.vue',
        context: {
          previousId: element.previous ? element.previous.id : '#',
          nextId: element.next ? element.next.id : '#',
          id: element.node.id,
        },
      })
    })
  })

  api.beforeBuild(context => {
    const posts = context._app.store
      .getCollection('Blog')
      ._collection.data.map(post => (({ title, path, tags }) => ({ title, path, tags }))(post))
    createSearchIndex(posts, 'static/search.json')
  })
}
