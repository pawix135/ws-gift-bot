import { parseArgs } from "node:util";

export const parseCLI = () => {
	const cli = parseArgs({
		args: process.argv.slice(2),
		options: {
			players: {
				type: "string",
				multiple: false,
				short: "p",
			},
			code: {
				type: "string",
				multiple: false,
				short: "c",
			},
			help: {
				type: "boolean",
				default: false,
				multiple: false,
				short: "h",
			},
			report: {
				type: "boolean",
				default: true,
				multiple: false,
				short: "r",
			},
		},
	});

	return {
		...cli.values,
	};
};
