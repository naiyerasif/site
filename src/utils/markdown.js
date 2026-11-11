import { markdownToMdast } from "satteri";
import satteriExternalLinks from "satteri-external-links";
import {
	satteriCalloutDirectives,
	satteriFigureDirective,
	satteriSlugify,
	satteriTimeDirective,
	satteriYoutubeDirective,
} from "#utils/satteri/index.js";
import satteriStarryNight from "#utils/satteri-starry-night/index.js";
import { titlePlugin, lineAnnotationPlugin } from "#utils/satteri-starry-night/plugins.js";
import { createCountableSlugifier } from "#utils/slugifier.js";

const slugifier = createCountableSlugifier();

const calloutOptions = {
	tagName: "div",
	callouts: {
		note: {
			title: "Note",
			hint: `<svg role="img" class="icon"><use href="#px-circle-info"/></svg>`
		},
		commend: {
			title: "Tip",
			hint: `<svg role="img" class="icon"><use href="#px-circle-check"/></svg>`
		},
		warn: {
			title: "Warning",
			hint: `<svg role="img" class="icon"><use href="#px-triangle-exclaim"/></svg>`
		},
		deter: {
			title: "Caution",
			hint: `<svg role="img" class="icon"><use href="#px-circle-exclaim"/></svg>`
		},
		assert: {
			title: "Important",
			hint: `<svg role="img" class="icon"><use href="#px-bell"/></svg>`
		}
	}
};

const satteriDefaultOptions = {
	features: {
		directive: true,
		definitionList: true
	}
};

const satteriClientOptions = {
	...satteriDefaultOptions,
	mdastPlugins: [
		satteriTimeDirective(),
		satteriFigureDirective(),
		satteriCalloutDirectives(calloutOptions),
		satteriYoutubeDirective()
	],
	hastPlugins: [
		satteriSlugify({
			reset() {
				slugifier.reset();
			},
			slugify(text) {
				return slugifier.slugify(text);
			}
		}),
		satteriExternalLinks({
			target: false,
			rel: ["nofollow", "noopener", "noreferrer"]
		}),
		satteriStarryNight({
			aliases: {
				brewfile: "nushell",
				conf: "ini",
				json: "jsonc",
				sh: "nushell",
			},
			plugins: [
				titlePlugin,
				lineAnnotationPlugin
			]
		})
	]
};

const satteriServerOptions = {
	...satteriDefaultOptions,
	mdastPlugins: [
		satteriTimeDirective(),
		satteriFigureDirective(),
		satteriCalloutDirectives(calloutOptions),
		satteriYoutubeDirective({ server: true })
	],
};

export { calloutOptions, satteriClientOptions, satteriServerOptions };
