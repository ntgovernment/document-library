# Document Library – DCDD Policy Search Page

## Overview

This repository holds the **source assets and compiled bundles** for the DCDD intranet document library search page. The page is rendered by [Squiz Matrix](https://www.squiz.net/platform/matrix) and its JS/CSS is deployed via **Git File Bridge**. The production page lives at:

```
https://internal.nt.gov.au/dcdd/dev/policy-library/document-search
```

The page provides staff with a filterable, full-text search interface over DCDD policy documents, backed by a **Coveo** search index. It is part of the wider NTG (Northern Territory Government) intranet design system (`ntgc` prefix throughout the codebase).

---

## Architecture at a glance

```
 GitHub repo (this)                Squiz Matrix (production CMS)
 ──────────────────                ─────────────────────────────
 src/js/*.js    ─┐                 Paint Layout
 src/css/*.css  ─┤─ npm run build  ├── <link>   search-page.css  ←─── dist/search-page.css
                 └──────────────► dist/ ──── Git File Bridge ──────── dist/search-page.js
                                  └── search-section.html  ←───────── dist/search-section.html
                                                                            │
                                  Page / Nested Container (HTML)            │
                                  ├── Search section (nested container) ───┘
                                  ├── Coveo results area
                                  └── <script> search-page.js
```

**Key rule for agents and developers:** Edit source files in `src/js/`, `src/css/`, or `src/search-section.html`, then run `npm run build`. Always commit **both** `src/` changes and the regenerated `dist/` files together — the `dist/` files are what Git File Bridge delivers to Matrix.

---

## Git File Bridge Deployment

[Git File Bridge](https://matrix.squiz.net/manuals/git-file-bridge) syncs specific files from this GitHub repository into Squiz Matrix file assets automatically on push.

**Files deployed to Matrix:**

| Local path                   | Matrix asset          | Used by                                              |
| ---------------------------- | --------------------- | ---------------------------------------------------- |
| `dist/search-page.js`        | `search-page.js`      | Paint layout `<script>`                              |
| `dist/search-page.css`       | `search-page.css`     | Paint layout `<link>`                                |
| `dist/search-section.html`   | `search-section.html` | Squiz Matrix nested container (search input section) |

**`dist/` is intentionally committed to git.** Git File Bridge reads from the repository, so the built output must be present in the commit. It is **not** in `.gitignore`.

The HTML template and vendor/third-party scripts are managed separately inside Matrix and are not deployed via this repository.

### Paint layout references

```html
<!-- in the paint layout <head> -->
<link rel="stylesheet" href="%asset_file_path:search-page-css-asset-id%" />

<!-- at the bottom of the paint layout <body>, after jQuery -->
<script src="%asset_file_path:search-page-js-asset-id%"></script>
```

> **jQuery dependency:** The paint layout must load jQuery **before** `search-page.js`. The bundle is IIFE format and expects `$` / `jQuery` to be available as globals.

### Nested container

`dist/search-section.html` is a **bare HTML fragment** (no `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` tags). It is pasted directly into a Squiz Matrix nested container asset that is included inside the page template. The paint layout already loads `search-page.css` and `search-page.js`, so the fragment needs no additional asset references.

To update the search input markup:
1. Edit `src/search-section.html`
2. Run `npm run build` — the fragment is copied automatically to `dist/search-section.html`
3. Commit `src/search-section.html` + `dist/search-section.html`

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Setup

```bash
npm install
npm run build   # must run at least once first — preview page references dist/
npm run dev     # Vite dev server at http://localhost:3000 with HMR
npm run preview # serve the dist/ build locally for final checks
```

`npm run dev` opens `search-section-preview.html` automatically. This is a **standalone preview page** that wraps the search fragment with the results area and a hidden result template, so you can test the full search interaction locally against mock data without needing VPN or CMS access.

For the full CMS page snapshot in dev you also need (gitignored — obtained separately):

- `Document search _ DCDD intranet.html` — place in project root

Vite serves both and **HMR is active** — edits to any file in `src/` reload the browser instantly without a full page refresh.

### Standard change workflow

```bash
# 1. Edit source files
code src/js/coveo-search.js
code src/css/main.css
code src/search-section.html

# 2. Preview changes interactively (HMR on search-section-preview.html)
npm run dev

# 3. Build the deployable bundle
npm run build

# 4. Commit source + built output together
git add src/ dist/
git commit -m "describe your change"
git push
# ↑ Git File Bridge picks up dist/ and syncs to Matrix automatically
```

### Build entry point

[`src/search-page.js`](src/search-page.js) is the Vite entry point. It imports all first-party CSS and JS. **Edit the imports there** to add or remove files from the bundle. The output filenames are fixed (no content hashes) so Matrix file asset URLs remain stable across builds.

---

## Repository Structure

```
document-library/
│
├── src/                                      ← EDIT HERE — all source files are git-tracked
│   ├── search-page.js                        # ★ BUILD ENTRY — edit imports to add/remove bundle contents
│   ├── search-section.html                   # ★ Search input HTML fragment → dist/search-section.html (Matrix nested container)
│   ├── js/                                   ← NTG first-party scripts
│   │   ├── coveo-search.js                   # ★ Coveo REST API fetch + result rendering (dev: mock JSON; prod: live API)
│   │   ├── components.js                     # Design system component behaviours (accordions, tabs, etc.)
│   │   ├── global-v2.js                      # Global NTG behaviours: nav URL rewriting, .oft download attr, user profile fetch
│   │   ├── profile-menu.js                   # User profile dropdown menu
│   │   └── status-toolbar.js                 # Dev/test status toolbar (slides in from right)
│   ├── css/                                  ← NTG first-party stylesheets
│   │   ├── main.css                          # Primary NTG intranet stylesheet (~1.8 MB); .ntgc-search-section block appended at end
│   │   └── status-toolbar.css                # Dev/test status toolbar styles
│   ├── mock/                                 ← Development mock data — do not deploy
│   │   └── coveo-search-rest-api-query.json  # Sample Coveo REST API response (189 results) for local dev/offline testing
│   └── vendor/                               ← Third-party locked dependencies — do not edit
│       ├── js/
│       │   ├── jquery-3.4.1.min.js           # jQuery 3.4.1 — loaded in <head>, must be first
│       │   ├── jquery.sumoselect.min.js       # SumoSelect — styled multi-select dropdowns
│       │   ├── jquery.tablesort.min.js        # Lightweight table column sorting
│       │   ├── imageslider-fotorama.js        # Fotorama image slider (header carousel)
│       │   ├── auds.js                        # Australian Government Design System (AUDS) JS
│       │   ├── ntg-central-update-user-profile.js  # Syncs user profile from NTG Central
│       │   ├── moment.min.js                  # Moment.js — date formatting for search results
│       │   ├── pagination.min.js              # Coveo search pagination
│       │   └── gtm.js                         # Google Tag Manager bundle (GA4: G-WY2GK59DRN)
│       ├── css/
│       │   ├── all.css                        # Font Awesome 5 Pro icon set (local fallback)
│       │   ├── roboto.css                     # Roboto web font (self-hosted)
│       │   ├── imageslider-fotorama.css        # Fotorama slider styles
│       │   └── yht7rxj.css                    # Squiz Matrix / GTM injected stylesheet
│       └── img/                              ← Vendor SVG assets (formerly /?a=XXXXXX Matrix asset references)
│           ├── ntg-central-rose-petal-default.svg  # Petal shape used by .ntgc-petal-icon and .ntgc-image-mask--petal
│           ├── ntgc-image-mask-type-a.svg          # Blob mask A — .ntgc-image-mask--blob-a
│           ├── ntgc-image-mask-type-b.svg          # Blob mask B — .ntgc-image-mask--blob-b
│           └── ntgc-image-mask-type-c.svg          # Blob mask C — .ntgc-image-mask--blob-c
│
├── dist/                                     ← BUILD OUTPUT — committed; Git File Bridge deploys these
│   ├── search-page.js                        # ★ Deployed to Matrix paint layout <script>
│   ├── search-page.css                       # ★ Deployed to Matrix paint layout <link>
│   └── search-section.html                   # ★ Deployed to Matrix nested container asset (bare HTML fragment)
│
├── search-section-preview.html               # Local dev preview page (full HTML; references dist/)
├── Document search _ DCDD intranet.html      # CMS page snapshot for local dev (gitignored)
├── Document search _ DCDD intranet_files/    # Original snapshot assets (gitignored, backup only)
├── vite.config.js                            # Vite config: dev server (HMR) + build (IIFE) + copy-search-section plugin
├── package.json                              # npm scripts: dev / build / preview
├── .gitignore
└── README.md
```

### What to edit — quick reference

| Goal                               | Action                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Change search input layout/markup  | Edit `src/search-section.html` → `npm run build` → commit `src/` + `dist/`                             |
| Change search input styles         | Edit `.ntgc-search-section` block at end of `src/css/main.css` → build → commit                        |
| Change search fetch or result rendering | Edit `src/js/coveo-search.js` → build → commit                                                   |
| Change page styles                 | Edit `src/css/main.css` → `npm run build` → commit `src/` + `dist/`                                    |
| Change status toolbar styles       | Edit `src/css/status-toolbar.css` → build → commit                                                     |
| Change component behaviour         | Edit `src/js/components.js` → build → commit                                                            |
| Change global nav / link behaviour | Edit `src/js/global-v2.js` → build → commit                                                             |
| Change profile menu                | Edit `src/js/profile-menu.js` → build → commit                                                          |
| Change status toolbar behaviour    | Edit `src/js/status-toolbar.js` → build → commit                                                        |
| Add a new file to the bundle       | Add `import './js/newfile.js'` to `src/search-page.js` → build → commit                                |
| Upgrade a vendor library           | Replace file in `src/vendor/js/` or `src/vendor/css/` and update the reference in the Matrix page template |
| Update a vendor SVG image          | Replace file in `src/vendor/img/`; CSS in `src/css/main.css` already references it via relative path   |

---

## Page Architecture

### CMS: Squiz Matrix

The HTML is rendered server-side by Squiz Matrix. Key Matrix-specific patterns:

| Pattern                                                           | Purpose                                                                 |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `<!--coveo_no_index_start_XX-->` / `<!--coveo_no_index_end_XX-->` | Tells the Coveo crawler to skip indexing sections of the page           |
| `meta[name="ntgc.*"]`                                             | NTG-specific page metadata (asset ID, lineage, shortname)               |
| `meta[name="dcterms.*"]`                                          | Dublin Core metadata required by NTG publishing standards               |
| `data-user="770097"` on `<body>`                                  | The logged-in user's Squiz Matrix asset ID                              |
| `pagedata` JS object                                              | Runtime page context injected by Matrix (asset IDs, URLs, persona data) |
| `pagedata.variations`                                             | Matrix content variations/personalisations defined against this asset   |

### Search: Coveo

Search results are fetched by `src/js/coveo-search.js` (bundled into `dist/search-page.js`). It detects the environment by hostname and chooses the correct data source:

| Environment                  | Data source                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| `localhost` / `127.0.0.1`    | `src/mock/coveo-search-rest-api-query.json` (189 sample results, no VPN needed) |
| All other hosts (production) | Coveo Search REST API (see URL below)                                    |

**Production API URL:**

```
https://search-internal.nt.gov.au/Coveo/rest
  ?enableDidYouMean=true
  &partialMatch=true
  &partialMatchKeywords=2
  &partialMatchThreshold=2
  &scope=28319
  &numberOfResults=1000
  &SortCriteria=relevancy         ← reads ?sort= URL param, falls back to "relevancy"
  &maximumAge=1
  &q=ENCODED_QUERY                ← encodeURIComponent(input value)
```

> **VPN required:** `search-internal.nt.gov.au` is only accessible on the NTG network or VPN. Use the mock data file for local development.

**Behaviour on page load:** `coveo-search.js` runs an initial search with an empty query (shows all results) and pre-fills `#search` with any `?query=` URL parameter if present.

**Results are injected** into `#search-results-list` using the `.search-template` element as a client-side HTML template. `data-ref` attributes on child elements are binding points:

| `data-ref` value              | API field mapped                                             |
| ----------------------------- | ------------------------------------------------------------ |
| `search-result-title`         | `result.raw.resourcefriendlytitle \|\| result.title`         |
| `search-result-icon`          | FA icon class derived from `result.raw.resourcetype`         |
| `search-result-description`   | `result.raw.resourcedescription \|\| result.excerpt`         |
| `search-result-doctype`       | `result.raw.resourcedoctype` (rendered as a tag span)        |
| `search-result-assetURL`      | `result.raw.asseturl` — direct download link                 |
| `search-result-assetURL-open` | `result.raw.asseturl` — open in new tab                      |
| `search-result-collectionURL` | `result.raw.collectionurl` — parent collection page          |
| `search-result-filesize`      | `result.raw.resourcefilesize`                                |
| `search-result-last-updated`  | `result.raw.resourceupdated` (formatted by moment.js if loaded) |

**Icon mapping** (`result.raw.resourcetype` → Font Awesome class):

| `resourcetype` | Icon class         |
| -------------- | ------------------ |
| `pdf_file`     | `fal fa-file-pdf`  |
| `word`         | `fal fa-file-word` |
| `spreadsheet`  | `fal fa-file-excel`|
| anything else  | `fal fa-file-alt`  |

Pagination is handled by `pagination.min.js` and injected into `#sync-pagination`. The loading spinner (`#initialLoadingSpinner`) is shown until the fetch resolves.

### Search Section (Nested Container)

The search input is a **Squiz Matrix nested container** asset, rendered from `dist/search-section.html`. This decouples the search input markup from the main page template so it can be versioned and deployed independently.

Source of truth: `src/search-section.html`  
Built output: `dist/search-section.html` (copied verbatim from `src/` by the `copy-search-section` Vite plugin)  
Dev preview: `search-section-preview.html` (full page wrapping the fragment; use after `npm run build`)

**BEM classes for the search input** (styled in `src/css/main.css` — `.ntgc-search-section` block at bottom of file):

| Class                                    | Element                                        |
| ---------------------------------------- | ---------------------------------------------- |
| `.ntgc-search-section`                   | Outer wrapper — full-width, centred, padded    |
| `.ntgc-search-section__container`        | Inner constrained container (max-width 1232px) |
| `.ntgc-search-section__input-wrapper`    | Input + button row (max-width 640px, outlined) |
| `.ntgc-search-section__input-field`      | Flex row inside wrapper (white bg, overflow:hidden) |
| `.ntgc-search-section__text-input`       | `<input type="text">` — transparent, unstyled  |
| `.ntgc-search-section__submit-btn`       | `<button type="submit">` — transparent, padded |
| `.ntgc-search-section__icon-container`   | 24×24 icon wrapper                             |
| `.ntgc-search-section__icon`             | Font Awesome search icon (`fal fa-search`)     |

CSS custom properties used (with hex fallbacks for environments without a design token layer):

| Token                    | Fallback  | Used on                     |
| ------------------------ | --------- | --------------------------- |
| `--clr-border-subtle`    | `#D0E0E0` | Border/outline colour       |
| `--clr-bg-default`       | `white`   | Input field background      |
| `--clr-text-alt`         | `#384560` | Input placeholder/text      |
| `--clr-text-default`     | `#102040` | Search icon colour          |

### User Session Data

On page load, Matrix injects the authenticated user's details into `localStorage` for use by other NTG scripts:

| Key                      | Value                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `intra-user-id`          | Squiz Matrix asset ID of the logged-in user                                              |
| `intra-user-info`        | JSON object: `UIgivenName, sn, telephoneNumber, mail, title, location, departmentNumber` |
| `intra-user-displayName` | `'Yes'` if the display name should be shown                                              |

### Analytics

Google Analytics 4 via Google Tag Manager. GTM bundle is loaded from the local `js` file (originally `gtm.js`). The GA4 measurement ID is `G-WY2GK59DRN`.

---

## Key Element IDs

| ID                                           | Purpose                                                      |
| -------------------------------------------- | ------------------------------------------------------------ |
| `#policy-search-form`                        | Main search form — submitting it triggers a new Coveo search |
| `#search`                                    | Free-text keyword input (`name="query"`)                     |
| `#search-results-list`                       | `coveo-search.js` injects result cards here                  |
| `#sync-pagination`                           | Pagination controls injected here                            |
| `#initialLoadingSpinner`                     | Shown while search loads; hidden on response                 |
| `#ntgc-status--toolbar`                      | Dev/test status toolbar (hidden off-screen by default)       |

---

## CSS Class Conventions

All NTG design system classes use the `ntgc-` prefix. Bootstrap 4 grid classes (`col-md-*`, `d-none`, etc.) are also used throughout. Key page-specific classes:

| Class                       | Purpose                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `.ntgc-search-section`      | Outer wrapper for the search input section (nested container)    |
| `.ntg-search-listing__item` | A single search result card                                      |
| `.search-template`          | Hidden template element cloned by `coveo-search.js` per result   |
| `.ntgc-pill`                | An active filter pill tag                                        |
| `.ntgc-pill__checkbox`      | Checkbox inside pill; unchecking removes the filter              |
| `.ntgc-body--neutral-2`     | Light grey background used for the results area                  |

---

## Squiz Matrix Asset IDs

| Asset                          | ID       |
| ------------------------------ | -------- |
| Current page (Document search) | `944140` |
| Site globe (DCDD intranet)     | `434727` |
| Site index                     | `434732` |
| Page variation (Page Contents) | `944141` |

---

## Known Quirks & Notes for Developers

- **`js` file (no extension):** The Google Tag Manager bundle in `_files/js` has no file extension — it was originally `gtm.js` but saved without extension by the browser. It still loads correctly as JavaScript.
- **Font Awesome kit (dev):** `search-section-preview.html` loads Font Awesome via the project kit (`https://kit.fontawesome.com/9bf658a5c7.js`). This is a JS-based kit loader and requires internet access. The production Matrix paint layout loads Font Awesome Pro from a different source — ensure both are in sync when upgrading icon versions.
- **SRI hash on `all.css`:** The `integrity` attribute on the Font Awesome stylesheet will cause a browser error if the file is modified locally. Remove the `integrity` / `crossorigin` attributes if you need to edit `all.css`.
- **VPN required for production search:** `search-internal.nt.gov.au` is only accessible on the NTG network. `coveo-search.js` automatically uses `src/mock/coveo-search-rest-api-query.json` when hostname is `localhost` or `127.0.0.1` — no VPN needed for local development.
- **Mock data is static:** The mock JSON (`src/mock/coveo-search-rest-api-query.json`) always returns the same 189 results regardless of the query string typed in dev. It is a snapshot used purely to test the rendering pipeline.
- **`coveo-search.js` and `ntgov-coveo-search.js` co-exist on the full Matrix page:** The full CMS page also loads `ntgov-coveo-search.js` from the production CDN, which has its own `ntgCOVEO` object. Both `coveo-search.js` (bundled) and `ntgov-coveo-search.js` (CDN) listen to `#policy-search-form` submit and render into `#search-results-list`. There is no conflict, but results may render twice on the full Matrix page. The intention is to eventually remove the CDN dependency.
- **Vendor SVGs in `src/vendor/img/`:** The four SVG files (petal + blob masks) were previously referenced as `/?a=XXXXXX` Matrix asset URLs. They are now local files referenced by relative path from `src/css/main.css`. If the Matrix design system is updated, replace the files in `src/vendor/img/` and rebuild.
- **jQuery loaded twice (potentially):** `jquery-3.4.1.min.js` is loaded in `<head>` and `jquery.sumoselect.min.js` is loaded at the bottom of `<body>`. The sumoselect init depends on jQuery already being present, which is satisfied by the head load.
- **`.oft` link handling:** `global-v2.js` automatically adds a `download` attribute to any `<a>` tag pointing to a `.oft` (Outlook Template) file.
- **Anchor scroll fix:** A `$(window).on('load')` handler re-triggers `window.location.hash` scrolling after 1000ms to work around Coveo's async DOM injection pushing page elements down after initial load.
- **Apostrophe stripping:** A form submit handler strips `'` and `'` (smart apostrophe) from search inputs — this prevents Coveo query parse errors.
- **`@supports` CSS warning at build time:** Vite/esbuild emits a `[WARNING] Expected identifier but found "@supports"` during minification due to a vendor CSS pattern targeting IE (`-ms-ime-align`). This is a known pre-existing issue in the vendor stylesheet and does not affect functionality. Safe to ignore.
