const fs = require("node:fs");
const path = require("node:path");

module.exports = class CreateFoldersPlugin {
	apply(compiler) {
		compiler.hooks.emit.tapAsync(
			"CreateFoldersPlugin",
			(compilation, callback) => {
				const outputPath = compilation.options.output.path;
				const directories = ["reports", "ids"];

				if (!outputPath) throw new Error("Output path is not defined");

				for (const dir of directories) {
					const dirPath = path.join(outputPath, dir);
					if (!fs.existsSync(dirPath)) {
						fs.mkdirSync(dirPath, { recursive: true });
					}
				}

				callback();
			},
		);
	}
};
