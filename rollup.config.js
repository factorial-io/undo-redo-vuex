import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import pkg from "./package.json";

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
      extensions,
      include: ["src/**/*"],
      runtimeHelpers: true
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
