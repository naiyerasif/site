import { defineMdastPlugin } from "satteri";
import format, { formats } from "#utils/datetime.js";

/**
 * Sätteri plugin to add time using directives
 *
 * @returns {() => import("satteri").MdastPluginDefinition}
 */
export default function satteriTimeDirective() {
	return defineMdastPlugin({
		name: "satteri-time-directive",
		textDirective(node, ctx) {
			if (node.name !== "time") return;

			const content = ctx.textContent(node).trim();
			if (!content) return;

			ctx.setField(node, "data", {
				...node.data,
				hName: node.name,
				hProperties: { ...node.attributes, datetime: format(content, formats.iso) },
			});
			ctx.setField(node, "children", [{ type: "text", value: format(content) }]);
		},
	});
};
