const codeblockRegex = /^```(?:[^`]+|`(?!``))*```/gms;

export default function readingTime(content, options = {}) {
	const { locale = "en", wordsPerMinute = 275 } = options;
	const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
	const words = segmenter.segment(content.replaceAll(codeblockRegex, ""));
	const wordCount = [...words].filter(word => word.isWordLike).length;
	const minutes = wordCount / wordsPerMinute;
	const readingTime = Math.round(parseFloat(minutes.toFixed(2)));
	return {
		wordCount,
		readingTime
	};
}
