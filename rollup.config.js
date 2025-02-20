import typescript from "@rollup/plugin-typescript";
import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "src/dubit.ts",
    external: ["@daily-co/daily-js"], // treat daily-js as external
    output: [
      {
        file: "dist/dubit.cjs.js",
        format: "cjs",
        sourcemap: false,
      },
      {
        file: "dist/dubit.esm.js",
        format: "esm",
        sourcemap: false,
      },
      {
        file: "dist/dubit.umd.js",
        format: "umd",
        name: "Dubit",
        sourcemap: false,
        globals: {
          "@daily-co/daily-js": "Daily",
        },
      },
    ],
    plugins: [
      // Resolves modules from node_modules
      nodeResolve(),
      // Converts CommonJS modules to ES6
      commonjs(),
      // Transpile TypeScript
      typescript({
        tsconfig: "./tsconfig.json",
        compilerOptions: {
          module: "ESNext",
        },
      }),
      // Transpile to ES5 if necessary
      babel({
        babelHelpers: "bundled",
        extensions: [".js", ".ts"],
        exclude: "node_modules/**",
      }),
    ],
  },
];
