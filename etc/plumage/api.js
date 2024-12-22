import { TonalPalette, argbFromHex, hexFromArgb, themeFromSourceColor } from "@material/material-color-utilities";

// APIs to generate color palettes based on Material 3

const selectedTones = [1, 2, 5, 7, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 93, 95, 98, 99];

function paletteFromArgb(argb) {
	const tones = TonalPalette.fromInt(argb);
	return Object.fromEntries(selectedTones.map(tone => [tone, hexFromArgb(tones.tone(tone))]));
}

function paletteFromHex(hex) {
	return paletteFromArgb(argbFromHex(hex));
}

function standalonePalette(colors) {
	return Object.entries(colors)
		.map(([name, value]) => ({
			name: name,
			input: value,
			base: value,
			palette: paletteFromHex(value)
		}));
}

function blendedPalette(base, colors) {
	const themeColors = Object.entries(colors)
		.map(([name, color]) => ({
			name: name,
			value: argbFromHex(color),
			blend: true
		}));
	const theme = themeFromSourceColor(argbFromHex(base), themeColors);
	return theme.customColors.map(color => ({
		name: color.color.name,
		input: colors[color.color.name],
		base: hexFromArgb(color.value),
		palette: paletteFromArgb(color.value)
	}));
}

export {
	standalonePalette,
	blendedPalette
};
