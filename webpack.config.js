const path = require("node:path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
	mode: "production",
	target: "node20.10",
	entry: {
		main: "./src/index.ts",
	},
  externals: [nodeExternals()],
  externalsPresets: {
      node: true 
  },
  optimization: {
    minimize: true,
  },
	output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "index.js",
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
			},
		],
	},
};
