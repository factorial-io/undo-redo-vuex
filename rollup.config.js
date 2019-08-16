import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import pkg from "./package.json";

const { presets } = require("./babel.config");

const extensions = [".js", ".jsx", ".ts", ".tsx"];

const name = "undoRedo";

export default {
  input: "./src/undoRedo.ts",

  // Specify here external modules which you don"t want to include in your bundle (for instance: "lodash", "moment" etc.)
  // https://rollupjs.org/guide/en#external-e-external
  external: [],

  plugins: [
    // Compile TypeScript/JavaScript files
    resolve({ extensions }),

    babel({
      babelrc: false,
      extensions,
      include: ["src/**/*"],
      runtimeHelpers: true,
      presets
    })
  ],

  output: [
    {
      file: pkg.main,
      format: "umd",
      name,
      exports: "named"
    },
    {
      file: pkg.module,
      format: "es"
    }
  ]
};
