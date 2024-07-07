import { loadPlayers, runBot } from "./bot";
import fs from "node:fs/promises";
import { createCLI } from "./cli";

(async () => {
	const { code, help, players, report } = createCLI();

	if (help) {
		console.log("Options:");
		console.log("-h, --help Display this help message.");
		console.log("-c, --code <gift_code> The gift code to redeem.");
		console.log(
			"-p, --players <path_to_file.json> The path to the file with the player ids. Default: players.json.",
		);
		console.log("-r, --report Save the results to a file. Defalut: false");
		console.log(
			"Usage: node src/index.ts -c <gift_code> -p <path_to_file.json>",
		);
		process.exit(0);
	}

	if (!code) {
		console.error(
			"[Error] No code provided. Pass -c or --code flag! Exiting...",
		);
		process.exit(0);
	}

	if (!players) {
		console.error(
			"[Error] Pass the path to the file with the player ids. Exiting...",
		);
		process.exit(0);
	}

	const playerIds = await loadPlayers(players);
	if (playerIds === null) {
		process.exit(0);
	}

	console.log(`[Info] Loaded ${playerIds.length} player ids`);

	try {
		const results = await runBot(playerIds, code);
		if (report) {
			const filename = `${code}_${new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-")}.json`;
			await fs.writeFile(filename, JSON.stringify(results, null, 2));
			console.log(`[Info] Saving results to ${filename}`);
		}

		const successCount = results.filter((result) => result.success).length;
		const failedCount = results.filter((result) => !result.success).length;
		const total = results.length;

		console.log("[Done] Bot finished running!");
		console.log(
			`[Result]: Succesfly redeemed ${successCount} out of ${total} codes`,
		);
		console.log(
			`[Result]: Failed to redeemed ${failedCount} out of ${total} codes`,
		);
	} catch (error) {
		console.log("Something went wrong. Exiting...");
	}

	process.exit(0);
})();
