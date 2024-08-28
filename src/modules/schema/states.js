const states =  {
	archived: { label: "Archived", semantics: "warn" },
	outdated: { label: "Outdated", semantics: "deter" },
};

const statesAsList = Object.keys(states);

export {
	states,
	statesAsList as default
}
