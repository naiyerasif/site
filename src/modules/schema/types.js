const contentTypes =  {
	guide: "directions on how to solve a problem",
	opinion: "personal view on a topic",
	note: "brief, informal post",
	reference: "detailed, informative context",
	status: "quick, very short update"
};

const contentTypesAsList = Object.keys(contentTypes);

export {
	contentTypes,
	contentTypesAsList as default
}
