const path = require('path');
const fs = require('fs');
const authorDataSource = path.join(__dirname, 'data/authors.json');
const authorData = require(authorDataSource);
const rmmd = require('remove-markdown');
const { GraphQLString } = require('gridsome/graphql');

module.exports = function (api, options) {
  api.loadSource(async ({ addSchemaResolvers, addCollection }) => {
    // Add Authors
    const authors = addCollection('Author');

    authorData.forEach(({ id, name: title, ...fields }) => {
      authors.addNode({
        id,
        title,
        internal: {
          origin: authorDataSource
        },
        ...fields
      })
    });

    // Generate summary from the first paragraph of a Post
    addSchemaResolvers({
      Post: {
        summary: {
          type: GraphQLString,
          resolve(obj) {
            let idxOfFirstHeader = obj.content.indexOf('###');
            let firstParagraph = obj.content.substr(0, idxOfFirstHeader);
            return rmmd(firstParagraph);
          }
        }
      }
    });
  });

  api.beforeBuild(({ store }) => {

    // Generate an index file for Fuse to search Posts
    const { collection } = store.getCollection('Post');

    const posts = collection.data.map(post => {
      return {
        title: post.title,
        path: post.path,
        summary: post.summary
      }
    });

    const output = {
      dir: './static',
      name: 'search.json',
      ...options.output
    };

    const outputPath = path.resolve(process.cwd(), output.dir);
    const outputPathExists = fs.existsSync(outputPath);
    const fileName = output.name.endsWith('.json')
      ? output.name
      : `${ output.name }.json`;

    if (outputPathExists) {
      fs.writeFileSync(path.resolve(process.cwd(), output.dir, fileName), JSON.stringify(posts))
    } else {
      fs.mkdirSync(outputPath);
      fs.writeFileSync(path.resolve(process.cwd(), output.dir, fileName), JSON.stringify(posts))
    }
  })
};
