import { grammars } from "@microflash/rehype-starry-night";
import sourcePgsql from "./source.pgsql.js";
import textLog from "./text.log.js";

export const customGrammars = [
	sourcePgsql,
	textLog,
	...grammars.all
];
