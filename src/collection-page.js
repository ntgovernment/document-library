/**
 * collection-page.js — DCDD Collection Page: Vite bundle entry point
 *
 * ── BUILD ─────────────────────────────────────────────────────────────────────
 *   npm run build
 *     → dist/collection-page.js   (trivial IIFE, no runtime logic)
 *     → dist/collection-page.css  collection/document-detail page styles
 *
 * ── DEPLOYMENT ───────────────────────────────────────────────────────────────
 *   Both dist/ files are committed to git. Git File Bridge syncs them into
 *   Squiz Matrix automatically on push. Do NOT add dist/ to .gitignore.
 *   The Matrix paint layout references:
 *     <link rel="stylesheet" href="...\/dist\/collection-page.css">
 *
 * ── ADDING FILES ─────────────────────────────────────────────────────────────
 *   Add an import statement below, run npm run build, then commit
 *   both src/ and dist/ changes together.
 */

// ── Collection Page CSS ───────────────────────────────────────────────────────
import "./css/collection-page.css";
