#!/usr/bin/env node

// Generates color palettes based on Material 3
// Usage: node ./etc/plumage/index.js

import { writeFile } from "fs/promises";
import { blendedPalette, standalonePalette } from "./api.js";

const colors = {
	primary: "#02805a",
	neutral: "#ffffff",
	commend: "#2abf1d",
	deter: "#db0b2f",
	warn: "#eb993e",
	assert: "#318ce7"
};

const themes = {
	light: "#fcfcfc",
	dark: "#101112"
};

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

writeThemeFile("./src/styles/_colors.scss", scssProperties(standalonePalette(colors)));
