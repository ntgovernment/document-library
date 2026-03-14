import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  // src/ is served as regular static files — Vite watches them for HMR
  publicDir: false,
  server: {
    open: "/Document search _ DCDD intranet.html",
    port: 3000,
    // Watch src/ for changes; HMR will reload the page on edits to JS/CSS
    watch: {
      ignored: ["**/node_modules/**", "**/dist/**", "**/*_files/**"],
    },
  },
  build: {
    outDir: "dist",
    // Keep all CSS in one file alongside the JS entry
    cssCodeSplit: false,
    rollupOptions: {
      // Entry point: src/search-page.js (imports both CSS and JS)
      input: "src/search-page.js",
      output: {
        // Output as IIFE so it works as a plain <script> tag in Matrix.
        // Requires jQuery to be loaded first by the paint layout.
        format: "iife",
        name: "DCDDSearchPage",
        // Predictable filenames — no hashes — so Matrix file asset URLs stay stable
        entryFileNames: "search-page.js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css")
            ? "search-page.css"
            : "[name][extname]",
      },
    },
  },
});
