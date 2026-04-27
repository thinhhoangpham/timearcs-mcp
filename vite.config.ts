import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/browser.ts"),
      name: "TimeArcs",
      formats: ["es", "umd"],
      fileName: (format) =>
        format === "es" ? "timearcs.esm.js" : "timearcs.umd.js",
    },
    outDir: "dist/browser",
    emptyOutDir: true,
    rollupOptions: {
      // No external deps — everything self-contained, including the upstream JS strings.
      external: [],
    },
  },
});
