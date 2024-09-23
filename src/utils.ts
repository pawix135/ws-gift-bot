import type { RedeemResult } from "./bot";
import fs from "node:fs/promises";
import { ID_DIR, REPORT__DIR } from "./constants";
export const deley = (ms: number) => {
	return new Promise((resolve) => {
		return setTimeout(() => {
			resolve(resolve);
		}, ms);
	});
};

export const makePlayersQueye = (players: string[]): string[][] => {
	const queue = players.slice();
	const queueSize = 7;
	const queueList: string[][] = [];

	while (queue.length) {
		queueList.push(queue.splice(0, queueSize));
	}

	return queueList;
};

export function sumQueueResults(results: RedeemResult[]) {
	const success = results.filter((r) => r.success).length;
	const failed = results.filter((r) => !r.success).length;
	const total = results.length;
	return { success, failed, total };
}

// Load the player ids from the file
export async function loadPlayers(filename: string): Promise<string[] | null> {
	try {
		const rawPlayerIds = await fs.readFile(filename, "utf-8");
		const playerIds = JSON.parse(rawPlayerIds) as string[];
		if (!Array.isArray(playerIds)) {
			throw new Error("Players file is not an valid array!");
		}
		return playerIds;
	} catch (error) {
		const e = error as {
			errno: number;
			code: string;
			path: string;
			syscall: string;
		};

		if (error instanceof SyntaxError) {
			console.error(`[Error] Invalid JSON in file ${filename}!`);
		}

		if (e.code === "ENOENT" && e.syscall === "open") {
			console.error(`[Error] File ${filename} not found! Exiting...`);
		} else {
			console.error(
				"[Error] Something went wrong while reading the file! Exiting...",
			);
		}
		return null;
	}
}

export async function loadIds(customPath?: string): Promise<string[] | null> {
	if (typeof customPath === "string") {
		try {
			return await loadPlayers(customPath);
		} catch (error) {
			return null;
		}
	}

	try {
		const idsFilenames = await fs.readdir(ID_DIR);

		if (idsFilenames.length === 0) return null;

		const ids: string[] = [];
		try {
			await Promise.all(
				idsFilenames.map(async (filename) => {
					const loadedIds = await loadPlayers(`${ID_DIR}/${filename}`);
					if (loadedIds !== null) {
						ids.push(...loadedIds);
					}
				}),
			);
		} catch (error) {
			console.error("Error while reading the ids files", error);
		}

		return ids;
	} catch (error) {
		console.log("Error while reading the ids directory", error);
		return null;
	}
}

export async function generateRaport(results: RedeemResult[], code: string) {
	const filePath = `${REPORT__DIR}/${code}_${new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-")}.json`;
	try {
		console.log("[Info] Generating report...");
		await fs.writeFile(filePath, JSON.stringify(results, null, 2));
		console.log(`[Info] Saved to ${filePath}`);
	} catch (error) {
		console.error("Error while saving the report", error);
	}
}

export function helpMessage() {
	console.log("Options:");
	console.log("-h, --help Display this help message.");
	console.log("-c, --code <gift_code> The gift code to redeem.");
	console.log(
		"-p, --players <path_to_file.json> The path to the file with the player ids. Leaving this empty will merge all ids files from the ids directory.",
	);
	console.log("-r, --report Save the results to a file. Defalut: true");
	console.log(
		"Usage: node src/index.ts -c <gift_code> -p <path_to_file.json> -r <true/false>",
	);
	process.exit(0);
}
