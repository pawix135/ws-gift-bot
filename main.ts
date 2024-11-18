import { runBot } from "./bot/bot.ts";
import { cliPrompt } from "./bot/cli.ts";
import { generateRaport, loadIds } from "./bot/utils.ts";

const code = await cliPrompt<string>("Enter the gift code: ", "string");
const players = await cliPrompt<string | undefined>("Enter the path to the file with the player ids: ", "string", true);
const report = await cliPrompt<boolean>("Do you want to generate a report? (y/n): ", "boolean");

if (!code) {
  console.error(
    "[Error] No code provided. Pass -c or --code flag! Use -h or --help to see available options.",
  );
  Deno.exit(1);
}

const ids = await loadIds(players);

if (ids === null) {
  console.error("Error while reading the ids files");
  Deno.exit(1);
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
} catch (_error) {
  console.log("Something went wrong. Exiting...");
}
