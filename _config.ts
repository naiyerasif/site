import lume from 'lume/mod.ts'
import inline from 'lume/plugins/inline.ts'
import postcss from 'lume/plugins/postcss.ts'
import esbuild from 'lume/plugins/esbuild.ts'
import remark from './modules/remark/mod.ts'
import rehypePlugins from './modules/rehype/plugins.ts'
import remarkPlugins from './modules/remark/plugins.ts'
import feed from './modules/feed/mod.ts'
import sitemap from './modules/sitemap/mod.ts'
import postcssPlugins from './modules/postcss/plugins.ts'
import { csso, dayjs } from './deps.ts'
import data from './src/_data.ts'

const site = lume({
	src: './src',
	dest: './dist',
	location: new URL(data.app.url),
	server: {
		port: 8080
	}
})

site.use(dayjs({
	unit: 'year',
	precisionMode: true
}))
site.use(inline())
site.use(remark({
	remarkPlugins: remarkPlugins,
	rehypePlugins: rehypePlugins
}))
site.use(postcss({
	plugins: postcssPlugins
}))
site.use(csso())
site.use(esbuild())

site.loadData(['.md'])
site.copy('assets', '.')

site.filter('source', (path) => new URL(data.app.repositoryContext + path).href)
site.filter('capitalize', ([ first, ...rest ]) => [first.toUpperCase(), ...rest].join(''))
site.filter('feed', (feedOptions) => feed(feedOptions))
site.filter('sitemap', (urls) => sitemap(urls))

export default site
