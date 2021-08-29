const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const expiry = require('../data/site.config').expiry
const expiryDate = dayjs().clone().subtract(expiry, 'days').startOf('day')
const expiryMessage = 'This post is old. Some information may be inaccurate.'

const defaultCategory = 'guide'
const defaultAuthors = ['naiyer']
const defaultExpiryMessage = date => dayjs(date).isBefore(expiryDate) ? expiryMessage : ''

const resolveBlog = options => {
  if (options.internal.typeName === 'Blog') {
    options.tagline = options.tagline || ''
    options.updated = options.updated || options.date
    options.category = options.category || defaultCategory
    options.authors = options.authors || defaultAuthors
    options.expired = options.expired || defaultExpiryMessage(options.updated)
  }

  return { ...options }
}

module.exports = { resolveBlog }
