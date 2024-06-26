#!/usr/bin/env node

import { join } from "path";
import { writeFile } from "fs";
import inquirer from "inquirer";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import slugify from "../../src/modules/slugifier/index.js";
import content from "../../src/modules/schema/content.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const date_format = "YYYY-MM-DD HH:mm:ss";
const drafts = ".workspace/drafts";

dayjs.tz.setDefault("GMT");

console.log("Create new post...");

inquirer.prompt({
	type: "list",
	name: "type",
	message: "Select the content type",
	choices: Object.keys(content),
	default: "post"
}).then(({type}) => {
	const questions = [
		{
			type: "list",
			name: "category",
			message: "Select a category",
			choices: content[type],
			default: "guide"
		},
		{
			type: "input",
			name: "title",
			message: "Title (max 64 chars)",
			validate(value) {
				const size = value.length;
				if (size > 0 && size <= 64) {
					return true;
				}
				return "Please enter a title";
			}
		},
		{
			type: "input",
			name: "date",
			message: `Publish date (format: ${date_format})`,
			default: "now",
			filter(value) {
				return value === "now" ? dayjs().format(date_format) : dayjs(value).format(date_format);
			},
			validate(value) {
				if (value === "now" || dayjs(value, date_format, true).isValid()) {
					return true;
				}
				return "Please enter a valid date";
			}
		}
	];

	inquirer.prompt(questions).then((answers) => {
		const slug = slugify(answers.title);
		const date = dayjs(answers.date);
		const frontmatter = [];
		frontmatter.push('---');
		frontmatter.push(`slug: "${date.format("YYYY/MM/DD")}/${slug}"`);
		frontmatter.push(`title: "${answers.title}"`);
		if (type !== "status") frontmatter.push(`description: ""`);
		frontmatter.push(`date: ${answers.date}`);
		frontmatter.push(`update: ${answers.date}`);
		frontmatter.push(`type: "${type}"`);
		frontmatter.push(`category: "${answers.category}"`);
		frontmatter.push('---');
	
		const filePath = join(process.cwd(), drafts, `${date.format('YYYY-MM-DD-HH-mm-ss')}-${slug}.md`);
		writeFile(filePath, `${frontmatter.join('\n')}\n`, () => console.log(`\nCreated "${filePath}"`));
	});
});
