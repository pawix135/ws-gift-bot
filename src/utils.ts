export const deley = (ms: number) => {
	return new Promise((resolve) => {
		return setTimeout(() => {
			resolve(resolve);
		}, ms);
	});
};
