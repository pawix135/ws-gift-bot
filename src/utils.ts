export const deley = (ms: number, reason?: string) => {
	return new Promise((resolve) => {
		return setTimeout(() => {
			console.log(`[Deley] ${ms} ms! Reason: ${reason}`);
			resolve(resolve);
		}, ms);
	});
};
