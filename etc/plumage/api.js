import { TonalPalette, argbFromHex, hexFromArgb } from "@material/material-color-utilities";

// APIs to generate color palettes based on Material 3

export const stops = [
	2, 5, 7, 10, 15, 20, 25, 30, 35, 40, 45, 50,
	55, 60, 65, 70, 75, 80, 85, 90, 93, 95, 97, 98, 99
];

function paletteFromArgb(argb) {
	const tones = TonalPalette.fromInt(argb);
	return Object.fromEntries(stops.map(tone => [tone, hexFromArgb(tones.tone(tone))]));
}

function paletteFromHex(hex) {
	return paletteFromArgb(argbFromHex(hex));
}

export default function standalonePalette(colors) {
	return Object.entries(colors)
		.map(([name, value]) => ({
			name: name,
			input: value,
			base: value,
			palette: paletteFromHex(value)
		}));
}
