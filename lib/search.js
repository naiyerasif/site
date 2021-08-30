import Fuse from 'fuse.js'

const options = {
  shouldSort: true,
  includeMatches: true,
  tokenize: true,
  matchAllTokens: true,
  threshold: 0.3,
  location: 0,
  distance: 600,
  maxPatternLength: 32,
  minMatchCharLength: 3,
}

export default function search(query, data, keys) {
  return new Promise(function(resolve, reject) {
    const fuse = new Fuse(data, { ...options, keys })
    resolve(fuse.search(query))
  })
}
