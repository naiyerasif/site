#!/usr/bin/env node

import { parse, join } from "path";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import * as cheerio from "cheerio";

const baseUrl = "naiyerasif.com";
const dist = join(process.cwd(), "dist");
const asset = join(dist, "_astro");

const imageRegistry = readdirSync(asset)
	.map(fileName => parse(fileName))
	.filter(fileName => fileName.ext === ".webp" || fileName.ext === ".svg")
	.map(fileName => ({
		key: `${baseUrl}/images/${fileName.name.split(".")[0]}`,
		value: `${baseUrl}/_astro/${fileName.base}`
	}))
	.reduce((a, v) => Object.assign(a, { [v.key]: v.value }), {});

function fixImageUrls(feedFileName) {
	let feed = readFileSync(join(dist, feedFileName), "utf-8");
	const $ = cheerio.load(feed, {}, false);
	$("img").each((index, image) => {
		const { dir, name, ext } = parse(image.attribs.src);
		const key = `${dir}/${name}`.replace("https://", "");
		const imageSrc = imageRegistry[key];
		feed = feed.replace(key + ext, imageSrc);
	});
	writeFileSync(join(dist, feedFileName), feed);
}

fixImageUrls("all.xml");
fixImageUrls("feed.xml");
