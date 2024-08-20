import puppeteer, { type Browser } from "puppeteer";
import fs from "node:fs/promises";
import { deley, makePlayersQueye, sumQueueResults } from "./utils";

export interface RedeemResult {
	message?: string;
	playerName?: string;
	success?: boolean;
	playerId?: string;
	numberOfTries?: number;
}

// Known redeem messages
const redeeme_types = {
	already_claimed: "Already claimed, unable to claim again.",
	redeemed: "Redeemed, please claim the rewards in your mail!",
	not_found: "Gift Code not found!",
	server_busy: "Server busy. Please try again later.",
} as const;

// Loops through the player ids list and redeem the code for each player
export async function runBot(
	players: string[],
	code: string,
): Promise<RedeemResult[]> {
	const results: RedeemResult[] = [];

	// Split the players into batches of 7
	const queue = makePlayersQueye(players);
	const queueLength = queue.length;

	// Create a new browser instance
	const browser = await puppeteer.launch({
		headless: false,
		args: ["--window-size=1080,640"],
	});

	// Loop through the batched players
	for (const [index, players] of queue.entries()) {
		console.log(
			`[Info] Queue ${index + 1}/${queueLength} with ${players.length} players`,
		);
		const queue_results = await Promise.all(
			players.map((p) => redeem_code(p, code, browser)),
		);
		results.push(...queue_results);

		//Print the results
		const sum = sumQueueResults(queue_results);
		console.log("-----------------------------------");
		console.log(`[Info] Queue no.${index + 1} done!`);
		console.log(`[Results] Total: ${sum.total}`);
		console.log(`[Results] Success: ${sum.success}`);
		console.log(`[Results] Failed: ${sum.failed}`);
		console.log("-----------------------------------");

		// Deley before the next batch
		await deley(3000);
	}

	await browser.close();

	return results;
}

async function redeem_code(
	playerId: string,
	code: string,
	browser: Browser,
	numberOfTries?: number,
): Promise<RedeemResult> {
	const result: RedeemResult = {
		playerId,
		numberOfTries: numberOfTries ?? 1,
		message: "",
		success: false,
		playerName: "",
	};

	// If the retries failed return the result
	if (numberOfTries && numberOfTries === 3) {
		result.message = "Tried 3 times!";
		return result;
	}

	const page = await browser.newPage();

	await page.setViewport({ width: 1080, height: 640 });

	await page.goto("https://wos-giftcode.centurygame.com/");

	// Fill the player id input
	await page.type(
		"#app > div > div > div.exchange_container > div.main_content > div.roleId_con > div.roleId_con_top > div.input_wrap > input[type=text]",
		playerId,
		{ delay: 170 },
	);

	await deley(1000);

	await page.waitForSelector(".login_btn");
	await page.click(".login_btn");

	try {
		await page.waitForSelector(
			"#app > div > div > div.exchange_container > div.main_content > div.roleInfo_con > img",
			{ timeout: 3000 },
		);
		const playerName: string = await (
			await page.$(
				"#app > div > div > div.exchange_container > div.main_content > div.roleInfo_con > div.roleInfo > p.name",
			)
		)?.evaluate((el) => el.textContent);
		result.playerName = playerName;
	} catch (error) {
		console.log(`[Error] Invalid player id: ${playerId}! Skipping...`);
		await browser.close();
		result.message = "Invalid player id!";
		result.success = false;
		result.playerName = "";
		return result;
	}

	await deley(100);

	await page.type(
		"#app > div > div > div.exchange_container > div.main_content > div.code_con > div.input_wrap > input[type=text]",
		code,
		{
			delay: 200,
		},
	);

	await page.click(
		"#app > div > div > div.exchange_container > div.main_content > div.btn.exchange_btn",
	);

	await page.waitForSelector(
		"#app > div > div.message_modal > div.modal_content > div.confirm_btn",
	);

	await deley(500);

	const message: string = await (
		await page.$("#app > div > div.message_modal > div.modal_content > p")
	)?.evaluate((el) => el.textContent);

	if (typeof message !== "string") {
		console.log(
			`[Error] Something went wrong while getting redeemed message! The message: ${message}`,
		);
	} else {
		switch (message) {
			case redeeme_types.already_claimed:
			case redeeme_types.not_found:
				console.log(`[Redeeme] ${message}`);
				result.message = message;
				break;
			case redeeme_types.redeemed:
				console.log(`[Redeeme] ${redeeme_types.redeemed}`);
				result.message = redeeme_types.redeemed;
				result.success = true;
				break;
			case redeeme_types.server_busy:
				console.log(`[Redeeme] ${redeeme_types.server_busy}`);
				await browser.close();
				await redeem_code(
					playerId,
					code,
					browser,
					numberOfTries ? numberOfTries + 1 : 1,
				);
				break;
			default:
				result.message = "Unknown message!";
				console.log("[Redeeme] Unknown message!", message);
		}
	}

	await page.click(
		"#app > div > div.message_modal > div.modal_content > div.confirm_btn",
	);

	await deley(500);

	await page.close();

	return result;
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
