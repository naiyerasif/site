const slugify = require('@sindresorhus/slugify')

const options = {
  decamelize: false,
  customReplacements: [['.js', 'js']]
}

const createSlug = text => slugify(text, options)

module.exports = { createSlug }
