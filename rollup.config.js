import { terser } from "rollup-plugin-terser";

export default {
  input: "src/jsfeat.js",
  output: [
    {
      file: "build/jsfeat.js",
      format: "umd",
      name: "jsfeat",
    },
    {
      file: "build/jsfeat-min.js",
      format: "umd",
      name: "jsfeat",
      plugins: [terser()],
    },
  ],
};
