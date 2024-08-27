#!/usr/bin/env node

import { join } from "path";
import { writeFile } from "fs";
import * as p from "@clack/prompts";
import color from "picocolors";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import slugify from "../../src/modules/slugifier/index.js";
import types from "../../src/modules/schema/types.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("GMT");

const date_format = "YYYY-MM-DD HH:mm:ss";
const drafts = ".workspace/drafts";

async function main() {
	p.intro(`${color.cyan("Create new post...")}`);

	const answers = await p.group({
		type: () =>
			p.select({
				message: "Select the content type",
				initialValue: "guide",
				options: types.map(t => ({ value: t, label: t }))
			}),
		title: () =>
			p.text({
				message: "Title (max 64 chars)",
				validate: (value) => {
					const size = value.length;
					if (!size) return "Please enter a title";
					if (size > 64) return "Please enter a shorter title";
				}
			}),
		date: () => {
			const now = dayjs().format(date_format);
			return p.text({
				message: `Publish date (format: ${date_format})`,
				initialValue: now,
				validate: (value) => {
					if (!dayjs(value, date_format, true).isValid()) return "Please enter a valid date";
				}
			})
		}
	});

	const slug = slugify(answers.title);
	const date = dayjs(answers.date);
	const frontmatter = [];
	frontmatter.push('---');
	frontmatter.push(`slug: "${date.format("YYYY/MM/DD")}/${slug}"`);
	frontmatter.push(`title: "${answers.title}"`);
	if (answers.type !== "status") frontmatter.push(`description: ""`);
	frontmatter.push(`date: ${answers.date}`);
	frontmatter.push(`update: ${answers.date}`);
	frontmatter.push(`type: "${answers.type}"`);
	frontmatter.push('---');

	const fileName = `${date.format('YYYY-MM-DD-HH-mm-ss')}-${slug}.md`;
	const filePath = join(process.cwd(), drafts, fileName);

	writeFile(
		filePath,
		`${frontmatter.join('\n')}\n`,
		() => p.outro(color.green(`Created "${filePath}"`))
	);
}

main().catch(console.error);
