const Tone = {
	note: { id: "note" },
	commend: { id: "commend" },
	warn: { id: "warn" },
	deter: { id: "deter" },
	assert: { id: "assert" },
};

const PostType = {
	note: { id: "note", label: "Note", showFull: true },
	guide: { id: "guide", label: "Guide", showFull: false },
	explainer: { id: "explainer", label: "Explainer", showFull: false },
	reference: { id: "reference", label: "Reference", showFull: false },
	opinion: { id: "opinion", label: "Opinion", showFull: false },
};

const PageType = {
	website: { id: "website" },
	article: { id: "article" },
	profile: { id: "profile" },
};

export {
	Tone,
	PostType,
	PageType,
};
