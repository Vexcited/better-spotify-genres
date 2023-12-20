import { defineConfig } from "tsup";

export default defineConfig({
  entry: { "spotifyGenres": "./src/index.ts" },
  minify: "terser",
  format: "iife",
  clean: true,
});
