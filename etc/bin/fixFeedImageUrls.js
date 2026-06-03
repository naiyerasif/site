#!/usr/bin/env node

import { parse, join } from "node:path"
import { readdirSync, readFileSync, writeFileSync } from "node:fs"

const baseUrl = "naiyerasif.com"
const dist = join(process.cwd(), "dist")
const asset = join(dist, "_astro")

const imageRegistry = new Map()

const files = readdirSync(asset)
for (const fileName of files) {
	const parsed = parse(fileName)
	if (parsed.ext === ".webp" || parsed.ext === ".svg") {
		const originalName = parsed.name.split(".")[0]
		const key = `${baseUrl}/images/${originalName}`
		const value = `${baseUrl}/_astro/${parsed.base}`
		imageRegistry.set(key, value)
	}
}

const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi

function fixImageUrls(feedFileName) {
	const filePath = join(dist, feedFileName)
	const feedContent = readFileSync(filePath, "utf-8")

	const updatedFeed = feedContent.replace(imgRegex, (match, srcPath) => {
		const { dir, name, ext } = parse(srcPath)
		const key = `${dir}/${name}`.replace("https://", "")

		if (imageRegistry.has(key)) {
			return match.replace(key + ext, imageRegistry.get(key))
		}

		return match
	})

	writeFileSync(filePath, updatedFeed)
}

fixImageUrls("all.xml")
fixImageUrls("feed.xml")
