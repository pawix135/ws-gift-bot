import { join, resolve } from 'jsr:@std/path'
import { exists } from "jsr:@std/fs/exists";
import type { RedeemResult } from "./bot.ts";
import { ID_DIR, REPORT__DIR } from "./constants.ts";

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
  console.log(filename);
  
	try {
		const rawPlayerIds = new TextDecoder().decode(await Deno.readFile(filename));
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
        error
			);
		}
		return null;
	}
}

export async function loadIds(customPath?: string): Promise<string[] | null> {
  console.log(typeof customPath, customPath?.length);
  
	if (typeof customPath === "string") {
		try {
			return await loadPlayers(customPath);
		} catch (error) {
      console.log(error);
      
			return null;
		}
	}

	try {

    const ids: string[] = [];

    for await (const dirEntry of Deno.readDir(join(Deno.cwd(), ID_DIR))) {

      if (dirEntry.isFile && dirEntry.name.endsWith(".json")) {

        let rawFileContent: Uint8Array;

        try {
          rawFileContent = await Deno.readFile(join(Deno.cwd(), ID_DIR, dirEntry.name));
        } catch (_error) {
          console.error(`[Error] Error while reading file ${dirEntry.name}! Check the format of the file!`);
          Deno.exit(1)
        }

        try {
          const contentToJson = JSON.parse(new TextDecoder().decode(rawFileContent)) as string[];
          if(!Array.isArray(contentToJson)) {
            console.error(`[Error] File ${dirEntry.name}: Array of ids not found! Check out https://www.w3schools.com/js/js_json_arrays.asp to see correct JSON array format!`);
            Deno.exit(1)
          }
          ids.push(...contentToJson);
        } catch (_error) {
          console.error(`[Error] Invalid JSON in file ${dirEntry.name}!`);
          Deno.exit(1)
        }
        
      }
    }

		if (ids.length === 0) return null;

		return ids;
	} catch (error) {
		console.log("Error while reading the ids directory", error);
		return null;
	}
}

export async function generateRaport(results: RedeemResult[], code: string) {

  if(!(await exists(REPORT__DIR))) {
    await Deno.mkdir(REPORT__DIR);
  }

  const filePath = join(Deno.cwd(), REPORT__DIR, `${code}_${new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-")}.json`);

	try {
		console.log("[Info] Generating report...");
		await Deno.writeFile(filePath, new TextEncoder().encode(JSON.stringify(results, null, 2)));
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
	Deno.exit(0);
}
