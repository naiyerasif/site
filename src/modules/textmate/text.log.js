// This is a TextMate grammar distributed by `rehype-starry-night`.
// This grammar is developed at
// <https://github.com/emilast/vscode-logfile-highlighter>
// and licensed `mit`.
// See <https://github.com/wooorm/starry-night> for more info.
/**
 * @import {Grammar} from '@wooorm/starry-night'
 */

/** @type {Grammar} */
const grammar = {
	names: ["log", "logcat"],
	scopeName: "text.log",
	extensions: [".log"],
	patterns: [
		{
			match: "\\b([Tt]race|TRACE)\\b:?",
			name: "comment log.verbose",
		},
		{
			match: "(?i)\\[(verbose|verb|vrb|vb|v)\\]",
			name: "comment log.verbose",
		},
		{
			match: "(?=^[\\s\\d\\p]*)\\bV\\b",
			name: "comment log.verbose",
		},
		{
			match: "\\b(DEBUG|Debug)\\b|(?i)\\b(debug)\\:",
			name: "markup.other log.debug",
		},
		{
			match: "(?i)\\[(debug|dbug|dbg|de|d)\\]",
			name: "markup.other log.debug",
		},
		{
			match: "(?=^[\\s\\d\\p]*)\\bD\\b",
			name: "markup.other log.debug",
		},
		{
			match: "\\b(HINT|INFO|INFORMATION|Info|NOTICE|II)\\b|(?i)\\b(info|information)\\:",
			name: "markup.inserted log.info",
		},
		{
			match: "(?i)\\[(information|info|inf|in|i)\\]",
			name: "markup.inserted log.info",
		},
		{
			match: "(?=^[\\s\\d\\p]*)\\bI\\b",
			name: "markup.inserted log.info",
		},
		{
			match: "\\b(WARNING|WARN|Warn|WW)\\b|(?i)\\b(warning)\\:",
			name: "markup.changed log.warning",
		},
		{
			match: "(?i)\\[(warning|warn|wrn|wn|w)\\]",
			name: "markup.changed log.warning",
		},
		{
			match: "(?=^[\\s\\d\\p]*)\\bW\\b",
			name: "markup.changed log.warning",
		},
		{
			match: "\\b(ALERT|CRITICAL|EMERGENCY|ERROR|FAILURE|FAIL|Fatal|FATAL|Error|EE)\\b|(?i)\\b(error)\\:",
			name: "markup.deleted log.error",
		},
		{
			match: "(?i)\\[(error|eror|err|er|e|fatal|fatl|ftl|fa|f)\\]",
			name: "markup.deleted log.error",
		},
		{
			match: "(?=^[\\s\\d\\p]*)\\bE\\b",
			name: "markup.deleted log.error",
		},
		{
			match: "\\b\\d{4}-\\d{2}-\\d{2}(?=T|\\b)",
			name: "comment log.date",
		},
		{
			match: "(?=(^|\\s))\\d{2}[^\\w\\s]\\d{2}[^\\w\\s]\\d{4}\\b",
			name: "comment log.date",
		},
		{
			match: "T?\\d{1,2}:\\d{2}(:\\d{2}([.,]\\d{1,})?)?(Z| ?[+-]\\d{1,2}:\\d{2})?\\b",
			name: "comment log.date",
		},
		{
			match: "T\\d{2}\\d{2}(\\d{2}([.,]\\d{1,})?)?(Z| ?[+-]\\d{1,2}\\d{2})?\\b",
			name: "comment log.date",
		},
		{
			match: "\\b([0-9a-fA-F]{40}|[0-9a-fA-F]{10}|[0-9a-fA-F]{7})\\b",
			name: "constant.language",
		},
		{
			match: "\\b[0-9a-fA-F]{8}[-]?([0-9a-fA-F]{4}[-]?){3}[0-9a-fA-F]{12}\\b",
			name: "constant.language log.constant",
		},
		{
			match: "\\b([0-9a-fA-F]{2,}[:-])+[0-9a-fA-F]{2,}+\\b",
			name: "constant.language log.constant",
		},
		{
			match: "\\b([0-9]+|true|false|null)\\b",
			name: "constant.language log.constant",
		},
		{
			match: "\\b(0x[a-fA-F0-9]+)\\b",
			name: "constant.language log.constant",
		},
		{
			match: '"[^"]*"',
			name: "string log.string",
		},
		{
			match: "(?![\\w])'[^']*'",
			name: "string log.string",
		},
		{
			match: "\\b([a-zA-Z.]*Exception)\\b",
			name: "string.regexp, emphasis log.exceptiontype",
		},
		{
			begin: "^[\\t ]*at[\\t ]",
			end: "$",
			name: "string.key, emphasis log.exception",
		},
		{
			match: "\\b[a-z]+://\\S+\\b/?",
			name: "constant.language log.constant",
		},
		{
			match: "(?![\\w/\\\\])([\\w-]+\\.)+([\\w-])+(?![\\w/\\\\])",
			name: "constant.language log.constant",
		},
	]
};

export default grammar;
