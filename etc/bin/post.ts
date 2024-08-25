import { crypto } from 'https://deno.land/std@0.152.0/crypto/mod.ts'
import { join } from 'https://deno.land/std@0.152.0/path/mod.ts'
import yargs from 'https://deno.land/x/yargs@v17.5.1-deno/deno.ts'
import { Arguments } from 'https://deno.land/x/yargs@v17.5.1-deno/deno-types.ts'
import dayjs from 'https://esm.sh/dayjs@1.11.3'
import customParseFormat from 'https://esm.sh/dayjs@1.11.3/plugin/customParseFormat'
import slugify from '../../modules/slugify/mod.ts'

dayjs.extend(customParseFormat)

const draftDirectory = '.workspace/posts'

const args: Arguments = yargs(Deno.args)
	.alias('t', 'title')
	.alias('c', 'category')
	.alias('d', 'date')
	.alias('h', 'tags')
	.argv

const date = args.date ? dayjs(args.date, 'YYYY-MM-DD HH:mm:ss') : dayjs()
const publishDate = date.format('YYYY-MM-DD HH:mm:ss')
const slug = slugify(args.title)

const frontmatter = []
frontmatter.push('---')
frontmatter.push(`id: ${crypto.randomUUID()}`)
frontmatter.push(`title: '${args.title}'`)
frontmatter.push(`description: ""`)
frontmatter.push(`canonical: /post/${date.format('YYYY/MM/DD')}/${slug}/`)
frontmatter.push(`date: ${publishDate}`)
frontmatter.push(`update: ${publishDate}`)
frontmatter.push(`category: ${args.category || 'guide'}`)
frontmatter.push(`tags: [${args.tags.split(',').map((tag: string) => `'${tag.trim()}'`).join(', ')}]`)
frontmatter.push('---')

const filePath = join(Deno.cwd(), draftDirectory, `${date.format('YYYY-MM-DD-HH-mm-ss')}-${slug}.md`)

await Deno.writeTextFile(filePath, `${frontmatter.join('\n')}\n`)

console.log(`Post created at "${filePath}"`)
