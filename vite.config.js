import { defineConfig, build } from "vite";
import { copyFileSync } from "fs";

export default defineConfig({
  root: ".",
  // src/ is served as regular static files — Vite watches them for HMR
  publicDir: false,
  plugins: [
    {
      name: "copy-search-section",
      closeBundle() {
        copyFileSync("src/search-section.html", "dist/search-section.html");
        copyFileSync("src/search-results.html", "dist/search-results.html");
      },
    },
    {
      // Watches src/js/ and src/css/ during `vite` dev server.
      // On any change: rebuilds the bundle then sends a full page reload.
      name: "auto-rebuild-on-src-change",
      configureServer(server) {
        let building = false;

        server.watcher.add(["src/js/**/*.js", "src/css/**/*.css"]);

        server.watcher.on("change", async (file) => {
          const normalised = file.replace(/\\/g, "/");
          if (
            !normalised.includes("/src/js/") &&
            !normalised.includes("/src/css/")
          )
            return;
          if (building) return;

          building = true;
          server.config.logger.info(
            `[auto-rebuild] ${file} changed — rebuilding…`,
          );
          try {
            await build({ logLevel: "silent" });
            server.config.logger.info("[auto-rebuild] done, reloading browser");
            server.hot.send({ type: "full-reload" });
          } catch (err) {
            server.config.logger.error(
              "[auto-rebuild] build failed: " + err.message,
            );
          } finally {
            building = false;
          }
        });
      },
    },
  ],
  server: {
    open: "/search-section-preview.html",
    port: 3000,
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
