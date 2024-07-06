import puppeteer from "puppeteer";
import fs from "node:fs/promises";
import { deley } from "./utils";

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
	try {
		for (const [index, player] of players.entries()) {
			console.log(
				`[Info] Player number ${index + 1} with id ${player} is redeeming the code ${code}!`,
			);
			results.push(await redeem_code(player, code));
		}
	} catch (error) {}
	return results;
}

async function redeem_code(
	playerId: string,
	code: string,
	numberOfTries?: number,
): Promise<RedeemResult> {
	const result: RedeemResult = {
		playerId,
		numberOfTries: numberOfTries ?? 1,
		message: "",
		success: false,
		playerName: "",
	};

	if (numberOfTries && numberOfTries === 3) {
		result.message = "Tried 3 times!";
		return result;
	}

	const browser = await puppeteer.launch({
		headless: false,
		args: ["--window-size=1080,640"],
	});

	const page = await browser.newPage();

	await page.setViewport({ width: 1080, height: 640 });

	await page.goto("https://wos-giftcode.centurygame.com/");

	await page.type(
		"#app > div > div > div.exchange_container > div.main_content > div.roleId_con > div.roleId_con_top > div.input_wrap > input[type=text]",
		playerId,
		{ delay: 170 },
	);

	await deley(1000, "User id typed!");

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
		console.log("[Error] Invalid player id! Skipping...", error);
		await browser.close();
		result.message = "Invalid player id!";
		result.success = false;
		result.playerName = "";
		return result;
	}

	await deley(100, "Deley before typing code!");

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

	await deley(500, "Awaited before clicking confirm!");

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
				console.log(`[Info] ${message}`);
				result.message = message;
				break;
			case redeeme_types.redeemed:
				console.log(`[Info] ${redeeme_types.redeemed}`);
				result.message = redeeme_types.redeemed;
				result.success = true;
				break;
			case redeeme_types.server_busy:
				console.log(`[Info] ${redeeme_types.server_busy}`);
				await redeem_code(
					playerId,
					code,
					numberOfTries ? numberOfTries + 1 : 1,
				);
				break;
			default:
				result.message = "Unknown message!";
				console.log("[Info] Unknown message!", message);
		}
	}

	await page.click(
		"#app > div > div.message_modal > div.modal_content > div.confirm_btn",
	);

	await deley(500, "Awaited before closing browser!");
	await browser.close();

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
		console.error("error ", error);
		return null;
	}
}
