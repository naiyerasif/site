#!/usr/bin/env node

import { join } from "path";
import { writeFile } from "fs";
import { styleText } from "util";
import * as p from "@clack/prompts";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import slugify from "#utils/slugifier.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("GMT");

const date_format = "YYYY-MM-DD HH:mm:ss";
const drafts = ".workspace/drafts";

async function main() {
	p.intro(styleText("cyan", "Create new post..."));

	const answers = await p.group({
		title: () => p.text({
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
			});
		},
		showFull: () => p.confirm({
			message: "Show in full?"
		}),
	});

	if (
		typeof answers.title === "symbol" ||
		typeof answers.date === "symbol" ||
		typeof answers.showFull === "symbol"
	) {
		p.outro(styleText("red", `Failed to create a post`));
		return;
	}

	const slug = slugify(answers.title);
	const date = dayjs(answers.date);
	const frontmatter = [];
	frontmatter.push('---');
	frontmatter.push(`slug: "post/${date.format("YYYY/MM/DD")}/${slug}"`);
	frontmatter.push(`title: "${answers.title}"`);
	frontmatter.push(`date: ${answers.date}`);
	frontmatter.push(`update: ${answers.date}`);
	if (answers.showFull) frontmatter.push(`showFull: ${answers.showFull}`);
	frontmatter.push('---');

	const fileName = `${date.format('YYYY-MM-DD')}--${slug}.md`;
	const filePath = join(process.cwd(), drafts, fileName);

	writeFile(
		filePath,
		`${frontmatter.join('\n')}\n`,
		() => p.outro(styleText("green", `Created "${filePath}"`))
	);
}

main().catch(console.error);
