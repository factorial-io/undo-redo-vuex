const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/undoRedo.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        type: "javascript/esm",
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "undo-redo-vuex.min.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd"
  },
  plugins: [new CleanWebpackPlugin()],
  mode: "production"
};
