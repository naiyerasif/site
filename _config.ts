import lume from 'lume/mod.ts'
import inline from 'lume/plugins/inline.ts'
import postcss from 'lume/plugins/postcss.ts'
import sass from 'lume/plugins/sass.ts'
import esbuild from 'lume/plugins/esbuild.ts'
import remark from './modules/remark/mod.ts'
import date from './modules/date/mod.ts'
import readingTime from './modules/reading-time/mod.ts'
import rehypePlugins from './modules/rehype/plugins.ts'
import remarkPlugins from './modules/remark/plugins.ts'
import postcssPlugins from './modules/postcss/plugins.ts'
import data from './src/_data.ts'

const site = lume({
	src: './src',
	dest: './dist',
	location: new URL(data.app.url),
	server: {
		port: 8080
	}
})

site.use(date({
	unit: 'year',
	precisionMode: true
}))
site.use(inline())
site.use(remark({
	remarkPlugins: remarkPlugins,
	rehypePlugins: rehypePlugins
}))
site.use(postcss({
	plugins: postcssPlugins,
}))
site.use(sass())
site.use(esbuild())

site.loadData(['.md'])
site.copy('assets', '.')

site.filter('source', (path) => new URL(path, data.app.repositoryContext).href)
site.filter('capitalize', ([ first, ...rest ]) => [first.toUpperCase(), ...rest].join(''))
site.filter('readingTime', (text) => readingTime(text) + ' min read')

export default site
