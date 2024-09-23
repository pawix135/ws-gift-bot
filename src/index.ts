import { runBot } from "./bot";
import { parseCLI } from "./cli";
import { generateRaport, helpMessage, loadIds } from "./utils";

(async () => {
	const { code, help, players, report } = parseCLI();

	if (help) helpMessage();

	if (!code) {
		console.error(
			"[Error] No code provided. Pass -c or --code flag! Use -h or --help to see available options.",
		);
		process.exit(1);
	}

	const ids = await loadIds(players);

	if (ids === null) {
		console.error("Error while reading the ids files");
		process.exit(1);
	}

	try {
		const results = await runBot(ids, code);
		console.log("[Done] Bot finished running!");

		if (report) generateRaport(results, code);

		const successCount = results.filter((result) => result.success).length;
		const failedCount = results.filter((result) => !result.success).length;
		const total = results.length;

		console.log(
			`[Result]: Succesfly redeemed ${successCount} out of ${total} codes`,
		);
		console.log(
			`[Result]: Failed to redeemed ${failedCount} out of ${total} codes`,
		);
	} catch (error) {
		console.log("Something went wrong. Exiting...");
	}
})();
