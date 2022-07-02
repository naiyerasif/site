import lume from 'lume/mod.ts'
import inline from 'lume/plugins/inline.ts'
import postcss from 'lume/plugins/postcss.ts'
import sass from 'lume/plugins/sass.ts'
import terser from 'lume/plugins/terser.ts'
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

site.use(inline())
site.use(postcss())
site.use(sass())
site.use(terser())

site.loadData(['.md'])
site.copy('assets', '.')

site.filter('source', (path) => new URL(path, data.app.repositoryContext).href)
site.filter('capitalize', ([ first, ...rest ]) => [first.toUpperCase(), ...rest].join(''))
site.filter('readingTime', (text) => readingTime(text) + ' min read')

export default site
