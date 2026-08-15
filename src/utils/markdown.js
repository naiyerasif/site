const calloutOptions = {
	tagName: "div",
	callouts: {
		note: {
			title: "Note",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-note"/></svg>`
		},
		commend: {
			title: "Tip",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-commend"/></svg>`
		},
		warn: {
			title: "Warning",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-warn"/></svg>`
		},
		deter: {
			title: "Caution",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-deter"/></svg>`
		},
		assert: {
			title: "Important",
			hint: `<svg role="img" class="icon"><use href="#x4-callout-assert"/></svg>`
		}
	},
	generate(title, children, prefs) {
		return [
			{
				type: "paragraph",
				data: {
					hName: "div",
					hProperties: { className: ["callout-header"] }
				},
				children: [
					{
						type: "html",
						value: prefs.hint
					},
					{
						type: "strong",
						children: [
							{
								type: "text",
								value: `${title} `
							}
						]
					}
				]
			},
			{
				type: "paragraph",
				data: {
					hName: "div",
					hProperties: { className: ["callout-body"] }
				},
				children
			}
		];
	}
};

export { calloutOptions };
