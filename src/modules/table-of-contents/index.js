function diveChildren(item, depth) {
	if (depth === 1) {
		return item.children;
	} else if (item.children.length > 0) {
		return diveChildren(item.children.at(-1), depth - 1);
	} else {
		return [];
	}
}

// source: https://github.com/withastro/starlight/blob/c04c79785f7ac343edc5565a5f1faed929fe350a/packages/starlight/components/TableOfContents/generateToC.ts#L24
export default function generateTocHierarchy(headings, maxDepth) {
	headings = [...headings.filter(({ depth }) => depth <= maxDepth)];
	const toc = [];

	for (const heading of headings) {
		if (toc.length === 0) {
			toc.push({ ...heading, children: [], current: true });
		} else {
			const lastItemInToc = toc.at(-1);
			if (heading.depth < lastItemInToc.depth) {
				throw new Error(`Orphan heading found: ${heading.text}.`);
			}
			if (heading.depth === lastItemInToc.depth) {
				// same depth
				toc.push({ ...heading, children: [] });
			} else {
				// higher depth
				// push into children, or children's children alike
				const gap = heading.depth - lastItemInToc.depth;
				const target = diveChildren(lastItemInToc, gap);
				target.push({ ...heading, children: [] });
			}
		}
	}

	return toc;
}
