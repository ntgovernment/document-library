/**
 * search-page.js — DCDD Document Search page bundle entry point
 *
 * This file is the Vite build entry point. Running `npm run build` from the
 * project root compiles everything imported here into two files:
 *
 *   dist/search-page.js   → referenced in the Squiz Matrix paint layout as <script>
 *   dist/search-page.css  → referenced in the Squiz Matrix paint layout as <link>
 *
 * Both dist/ files are committed to git so that Git File Bridge can sync them
 * into Matrix automatically on push. Do NOT add dist/ to .gitignore.
 *
 * BUNDLE FORMAT: IIFE (Immediately Invoked Function Expression)
 *   The bundle runs as a plain <script> tag — no module loader required.
 *   jQuery MUST already be on the page (loaded by the paint layout) before
 *   this script executes. All four JS files below rely on $ / jQuery as globals.
 *
 * WHAT IS NOT IN THIS BUNDLE (loaded separately by the Matrix page template):
 *   - jQuery, SumoSelect, Fotorama, AUDS, NTG Central profile sync  (vendor/js/)
 *   - Font Awesome, Roboto, Fotorama CSS                              (vendor/css/)
 *   - Coveo search engine, pagination, moment.js                      (live CDN)
 *   - Google Tag Manager                                              (gtm.js)
 *
 * TO ADD A FILE TO THE BUNDLE: add an import statement below, then run
 *   npm run build   and commit both src/ and dist/ changes together.
 */

// ── CSS ───────────────────────────────────────────────────────────────────────
import "./css/main.css";
import "./css/status-toolbar.css";

// ── NTG first-party JS ────────────────────────────────────────────────────────
import "./js/components.js";
import "./js/global-v2.js";
import "./js/profile-menu.js";
import "./js/status-toolbar.js";
