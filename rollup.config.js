import copy from "rollup-plugin-copy-assets";

export default {
  input: "src/betical.js",
  output: {
    file: "dist/betical.js",
    format: "iife",
  },
  plugins: [
    copy({
      assets: [
        "src/assets",
      ],
    }),
  ],
};