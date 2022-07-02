import lume from 'lume/mod.ts'
import readingTime from './modules/reading-time/mod.ts'
import data from './src/_data.ts'

const site = lume({
	src: './src',
	dest: './dist',
	location: new URL(data.app.url),
	server: {
		port: 8080
	}
})

site.filter('source', (path) => new URL(path, data.app.repositoryContext).href)
site.filter('capitalize', ([ first, ...rest ]) => [first.toUpperCase(), ...rest].join(''))
site.filter('readingTime', (text) => readingTime(text) + ' min read')

export default site
