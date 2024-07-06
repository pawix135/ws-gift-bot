import fs from "node:fs/promises";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// Creates the template players.json file.
async function createPlayersFile(filename: string, players: string[]) {
	try {
		await fs.writeFile(filename, JSON.stringify(players, null, 2));
		console.log("[Info] File has been created!");
		return true;
	} catch (error) {
		console.error("Something went wrong while writing the file!");
		return false;
	}
}

(async () => {
	const playerIdsFileName = "players.json";
	const playersTemplate = ["123456789", "987654321", "123123123"];

	try {
		await fs.access(playerIdsFileName, fs.constants.F_OK);
		const rl = readline.createInterface({ input, output });
		const decision = await rl.question(
			"[Info] File exists. Do you want to overwrite it? Type y or n: ",
		);
		if (decision.includes("n")) {
			console.log("[Info] Exiting...");
			rl.close();
			process.exit(0);
		}
		rl.close();

		console.log("[Info] Overwriting the file...");
		await createPlayersFile(playerIdsFileName, playersTemplate);
	} catch (e) {
		if (e instanceof Error) {
			const error = e as Error & { code: string };
			if (error.code === "ENOENT") {
				await createPlayersFile(playerIdsFileName, playersTemplate);
			} else {
				console.error("Something went wrong: ", e);
				throw error;
			}
		}
	}
})();
