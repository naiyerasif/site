const fs = require('fs-extra');
const path = require('path');
const pick = require('lodash.pick');
const yaml = require('js-yaml');

module.exports = function (api, options) {
  api.loadSource(async store => {
    // Add Authors
    const authorsPath = path.join(__dirname, 'data/authors.yaml');
    const authorsRaw = await fs.readFile(authorsPath, 'utf8');
    const authorsData = yaml.safeLoad(authorsRaw);
    const authors = store.addContentType({
      typeName: 'Author',
      route: '/about/:id'
    });

    authorsData.forEach(({ id, name: title, ...fields }) => {
      authors.addNode({
        id,
        title,
        fields,
        internal: {
          origin: authorsPath
        }
      })
    });
  });

  api.beforeBuild(({ config, store }) => {

    // Generate an index file for Fuse to search Posts
    const { collection } = store.getContentType('Post');

    const posts = collection.data.map(post => {
      return pick(post, ['title', 'path', 'summary']);
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
