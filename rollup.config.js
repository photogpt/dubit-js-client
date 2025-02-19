import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "src/index.ts",
    external: ["@daily-co/daily-js"], // treat daily-js as external
    output: [
      {
        file: "dist/dubit.cjs.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/dubit.esm.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/dubit.umd.js",
        format: "umd",
        name: "Dubit",
        sourcemap: true,
      },
    ],
    plugins: [
      // Resolves modules from node_modules
      nodeResolve(),
      // Converts CommonJS modules to ES6
      commonjs(),
      // Transpile TypeScript
      typescript({ tsconfig: "./tsconfig.json" }),
      // Transpile to ES5 if necessary
      babel({
        babelHelpers: "bundled",
        extensions: [".js", ".ts"],
        exclude: "node_modules/**",
      }),
    ],
  },
  // Type declarations bundle
  {
    input: "dist/index.d.ts", // output folder from tsc with declarations
    output: [{ file: "dist/dubit.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];
