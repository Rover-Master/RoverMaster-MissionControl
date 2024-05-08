/* --------------------------------------------------------
 * Copyright (c) 2024 Yuxuan Zhang, robotics@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ---------------------------------------------------------
 * Rollup configuration for server build
 * ------------------------------------------------------ */

import { resolve } from "path";
import { fileURLToPath } from "url";
import { type RollupOptions } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

const ROOT = resolve(fileURLToPath(import.meta.url), "..");
const r = (...p: string[]) => resolve(ROOT, ...p);

const config: RollupOptions[] = [];

config.push({
  input: r("src", "index.ts"),
  output: {
    format: "esm",
    file: r("..", "dist", "server.js"),
  },
  plugins: [nodeResolve(), commonjs(), json(), esbuild({ target: "node18" })],
});

export default config;
