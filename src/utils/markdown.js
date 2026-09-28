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
