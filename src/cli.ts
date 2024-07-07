import { parseArgs } from "node:util";

export const createCLI = () => {
	const cli = parseArgs({
		args: process.argv.slice(2),
		options: {
			players: {
				type: "string",
				default: "players.json",
				multiple: false,
				short: "p",
			},
			code: {
				type: "string",
				default: "",
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
				default: false,
				multiple: false,
				short: "r",
			},
		},
	});

	return {
		...cli.values,
	};
};
