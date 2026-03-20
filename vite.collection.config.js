import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: "src/collection-page.js",
      output: {
        // IIFE so it works as a plain <script> tag in Matrix (same as search-page)
        format: "iife",
        name: "DCDDCollectionPage",
        // Predictable filenames — no hashes — so Matrix file asset URLs stay stable
        entryFileNames: "collection-page.js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css")
            ? "collection-page.css"
            : "[name][extname]",
      },
    },
  },
});
