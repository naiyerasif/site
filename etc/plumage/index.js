#!/usr/bin/env node

// Generates color palettes based on Material 3
// Usage: node ./etc/plumage/index.js

import { writeFile } from "fs/promises";
import standalonePalette from "./api.js";

// original colors
const colors = {
	primary: "#1c9761",
	neutral: "#000000",
	note: "#f4eddb",
	commend: "#449a3f",
	deter: "#da1f1f",
	warn: "#eb993e",
	assert: "#318ce7"
};

// harmonized colors using https://github.com/evilmartians/harmonizer
const base = {
	light: {
		primary: "#13b667",
		neutral: "#fefdfb",
		commend: "#6ab139",
		deter: "#fc775c",
		warn: "#d69200",
		assert: "#3ba3ff"
	},
	dark: {
		primary: "#18b667",
		neutral: "#101112",
		commend: "#6ab13a",
		deter: "#fb775c",
		warn: "#d69200",
		assert: "#3ca3ff"
	}
}

function cssProperties(palette, prefix = "color") {
	return ":root {\n" +
		palette.map(item => Object.entries(item.palette)
			.map(([tone, color]) => `\t--${prefix}-${item.name}-${tone}: ${color};`)
			.join("\n")
		).join("\n\n") +
		"\n}";
}

function scssProperties(palette, prefix = "color") {
	return palette.map(item => Object.entries(item.palette)
		.map(([tone, color]) => `$${prefix}-${item.name}-${tone}: ${color};`)
		.join("\n")
	).join("\n\n");
}

async function writeThemeFile(fileName, content) {
	try {
		await writeFile(fileName, content);
		console.log(`Output written to ${fileName}`);
	} catch (err) {
		console.error("Error writing file:", err);
	}
};

writeThemeFile(
	`./src/styles/_colors.scss`,
	Object.entries(base).map(([k, v]) => scssProperties(standalonePalette(v), `x-${k}`)).join('\n\n')
);
