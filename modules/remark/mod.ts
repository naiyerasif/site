import loader from 'lume/core/loaders/text.ts'
import { merge } from 'lume/core/utils.ts'
import { rehypeStringify, remarkGfm, remarkParse, remarkRehype, unified } from '../../deps.ts'

import { Data, Engine, Helper, Site } from 'lume/core.ts'

export interface Options {
	/** List of extensions this plugin applies to */
	extensions: string[],

	/** List of remark plugins to use */
	remarkPlugins?: unknown[],

	/** List of rehype plugins to use */
	rehypePlugins?: unknown[]
}

// Default options
export const defaults: Options = {
	extensions: ['.md'],
	// By default, GitHub-flavored markdown is enabled
	remarkPlugins: [remarkGfm],
}

/** Template engine to render Markdown files with Remark */
export class MarkdownEngine implements Engine {
	engine: unified.Processor

	constructor(engine: unified.Processor) {
		this.engine = engine
	}

	deleteCache() {}

	async render(content: string, data?: Data, filename?: string): Promise<string> {
		return (await this.engine.process({ value: content, data: data || {}, path: filename })).toString()
	}

	renderSync(content: string, data?: Data, filename?: string): string {
		return this.engine.processSync({ value: content, data: data || {}, path: filename }).toString()
	}

	addHelper() {}
}

/** Register the plugin to support Markdown */
export default function (userOptions?: Partial<Options>) {
	const options = merge(defaults, userOptions)

	return function (site: Site) {
		// @ts-ignore: This expression is not callable
		const engine = unified.unified()

		const plugins = []

		// Add remark-parse to generate MDAST
		plugins.push(remarkParse)

		// Add default remark plugins
		plugins.push(defaults.remarkPlugins)

		// Add remark plugins
		options.remarkPlugins?.forEach((plugin) => plugins.push(plugin))

		// Add remark-rehype to generate HAST
		plugins.push([remarkRehype, { allowDangerousHtml: true }])

		// Add rehype plugins
		options.rehypePlugins?.forEach((plugin) => plugins.push(plugin))

		// Add rehype-stringify to output HTML
		plugins.push([rehypeStringify, { allowDangerousHtml: true }])

		// Register all plugins
		// @ts-ignore: let unified take care of loading all the plugins
		engine.use(plugins)

		// Load the pages
		const remarkEngine = new MarkdownEngine(engine)
		site.loadPages(options.extensions, loader, remarkEngine)

		// Register the md and mdAsync filters
		site.filter('md', filter as Helper)
		site.filter('mdAsync', filterAsync as Helper, true)

		async function filterAsync(content: string | Data): Promise<string | Data> {
			if (typeof content === 'string') {
				return (await remarkEngine.render(content)).trim()
			} else {
				const processed = (await remarkEngine.render(content.content as string, content)).trim()
				content.content = processed
				return content
			}
		}

		function filter(content: string | Data): string | Data {
			if (typeof content === 'string') {
				return remarkEngine.renderSync(content).trim()
			} else {
				const processed = remarkEngine.renderSync(content.content as string, content).trim()
				content.content = processed
				return content
			}
		}
	}
}
