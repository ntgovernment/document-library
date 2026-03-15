import { defineConfig, build } from "vite";
import { copyFileSync, readFileSync, writeFileSync } from "fs";

/**
 * Keeps the result card <li> template in search-section-preview.html in sync
 * with the canonical copy in src/search-results.html.
 * Extracts the block delimited by the '<!-- Result card template' comment and
 * the closing </li>, re-indents it to match the preview file's 8-space indent,
 * then replaces the equivalent block in search-section-preview.html.
 */
function syncPreviewTemplate() {
  const src = readFileSync("src/search-results.html", "utf8");
  const match = src.match(/(<!-- Result card template[\s\S]*?<\/li>)/);
  if (!match) return;
  // src uses no leading indent; preview uses 8-space indent
  const indented = match[1]
    .split("\n")
    .map((line) => (line.length ? "        " + line : line))
    .join("\n");
  let preview = readFileSync("search-section-preview.html", "utf8");
  preview = preview.replace(
    /        <!-- Result card template[\s\S]*?<\/li>/,
    indented,
  );
  writeFileSync("search-section-preview.html", preview, "utf8");
}

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
        syncPreviewTemplate();
      },
    },
    {
      // Watches src/js/ and src/css/ during `vite` dev server.
      // On any change: rebuilds the bundle then sends a full page reload.
      name: "auto-rebuild-on-src-change",
      configureServer(server) {
        let building = false;

        server.watcher.add(["src/js/**/*.js", "src/css/**/*.css", "src/*.html"]);

        server.watcher.on("change", async (file) => {
          const normalised = file.replace(/\\/g, "/");
          const isHtml =
            normalised.includes("/src/") && normalised.endsWith(".html");
          const isJsOrCss =
            normalised.includes("/src/js/") ||
            normalised.includes("/src/css/");

          if (!isJsOrCss && !isHtml) return;

          if (isHtml && !isJsOrCss) {
            // Just recopy HTML files — no need to rebuild the JS bundle
            try {
              copyFileSync("src/search-section.html", "dist/search-section.html");
              copyFileSync("src/search-results.html", "dist/search-results.html");
              syncPreviewTemplate();
              server.config.logger.info(
                `[auto-rebuild] ${file} changed — HTML recopied, reloading browser`,
              );
              server.hot.send({ type: "full-reload" });
            } catch (err) {
              server.config.logger.error(
                "[auto-rebuild] HTML copy failed: " + err.message,
              );
            }
            return;
          }

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
