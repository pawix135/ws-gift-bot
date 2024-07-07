import { loadPlayers, runBot } from "./bot";
import { parseArgs } from "node:util";
import fs from "node:fs/promises";

(async () => {
	const args = parseArgs({
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
		},
	});

	if (!args.values.code) {
		console.error(
			"[Error] No code provided. Pass -c or --code flag! Exiting...",
		);
		process.exit(0);
	}

	const playerIds = await loadPlayers(args.values.players ?? "players.json");
	if (playerIds === null) {
		console.error(
			"[Error] No player ids found or the file format is wrong. Check out https://www.javatpoint.com/json-array",
		);
		process.exit(0);
	}

	try {
		const results = await runBot(playerIds, args.values.code);
		const filename = `${args.values.code}_${new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-")}.json`;
		await fs.writeFile(filename, JSON.stringify(results, null, 2));
		console.log(`[Info] Saving results to ${filename}`);
	} catch (error) {
		console.log("Something went wrong");
	}

	process.exit(0);
})();
