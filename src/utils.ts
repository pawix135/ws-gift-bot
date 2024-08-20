import type { RedeemResult } from "./bot";

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
