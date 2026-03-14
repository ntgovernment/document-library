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
 src/css/*.css  ─┤─ npm run build  ├── <link>   search-page.css  ←─┐
                 └──────────────► dist/ ────── Git File Bridge ───┘
                                  └── search-page.js  ←────────────┐
                                                                    │
                                  Page Template (HTML)             │
                                  ├── Coveo search engine          │
                                  ├── Filter dropdowns             │
                                  └── <script> search-page.js ────┘
```

**Key rule for agents and developers:** Edit source files in `src/js/` or `src/css/`, then run `npm run build`. Always commit **both** `src/` changes and the regenerated `dist/` files together — the `dist/` files are what Git File Bridge delivers to Matrix.

---

## Git File Bridge Deployment

[Git File Bridge](https://matrix.squiz.net/manuals/git-file-bridge) syncs specific files from this GitHub repository into Squiz Matrix file assets automatically on push.

**Files deployed to Matrix:**

| Local path             | Matrix file asset | Used by                 |
| ---------------------- | ----------------- | ----------------------- |
| `dist/search-page.js`  | `search-page.js`  | Paint layout `<script>` |
| `dist/search-page.css` | `search-page.css` | Paint layout `<link>`   |

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

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Setup

```bash
npm install
npm run dev     # Vite dev server at http://localhost:3000 with HMR
npm run build   # compile → dist/search-page.js + dist/search-page.css
npm run preview # serve the dist/ build locally for final checks
```

For local dev you also need the **CMS page snapshot** (gitignored — obtained separately):

- `Document search _ DCDD intranet.html` — place in project root
- `Document search _ DCDD intranet_files/` — original assets, backup reference only (page now uses `src/`)

Vite opens the snapshot automatically and **HMR is active** — edits to any file in `src/` reload the browser instantly without a full page refresh.

### Standard change workflow

```bash
# 1. Edit source files
code src/js/global-v2.js
code src/css/main.css

# 2. Preview changes interactively (HMR)
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
│   ├── js/                                   ← NTG first-party scripts
│   │   ├── components.js                     # Design system component behaviours (accordions, tabs, etc.)
│   │   ├── global-v2.js                      # Global NTG behaviours: nav URL rewriting, .oft download attr
│   │   ├── profile-menu.js                   # User profile dropdown menu
│   │   └── status-toolbar.js                 # Dev/test status toolbar (slides in from right)
│   ├── css/                                  ← NTG first-party stylesheets
│   │   ├── main.css                          # Primary NTG intranet stylesheet (~1.8 MB)
│   │   └── status-toolbar.css                # Dev/test status toolbar styles
│   ├── mock/                                 ← Development mock data — do not deploy
│   │   └── coveo-search-rest-api-query.json   # Sample Coveo REST API response (189 results) for local dev/testing
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
│       └── css/
│           ├── all.css                        # Font Awesome 5 Pro icon set (local fallback)
│           ├── roboto.css                     # Roboto web font (self-hosted)
│           ├── imageslider-fotorama.css        # Fotorama slider styles
│           └── yht7rxj.css                    # Squiz Matrix / GTM injected stylesheet
│
├── dist/                                     ← BUILD OUTPUT — committed; Git File Bridge deploys these
│   ├── search-page.js                        # ★ Deployed to Matrix paint layout <script>
│   └── search-page.css                       # ★ Deployed to Matrix paint layout <link>
│
├── Document search _ DCDD intranet.html      # CMS page snapshot for local dev (gitignored)
├── Document search _ DCDD intranet_files/    # Original snapshot assets (gitignored, backup only)
├── vite.config.js                            # Vite config: dev server (HMR) + build (IIFE output)
├── package.json                              # npm scripts: dev / build / preview
├── .gitignore
└── README.md
```

### What to edit — quick reference

| Goal                               | Action                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Change page layout or content      | Edit the HTML template in Squiz Matrix                                                       |
| Change page styles                 | Edit `src/css/main.css` → `npm run build` → commit `src/` + `dist/`                          |
| Change status toolbar styles       | Edit `src/css/status-toolbar.css` → build → commit                                           |
| Change component behaviour         | Edit `src/js/components.js` → build → commit                                                 |
| Change global nav / link behaviour | Edit `src/js/global-v2.js` → build → commit                                                  |
| Change profile menu                | Edit `src/js/profile-menu.js` → build → commit                                               |
| Change status toolbar behaviour    | Edit `src/js/status-toolbar.js` → build → commit                                             |
| Add a new file to the bundle       | Add `import './js/newfile.js'` to `src/search-page.js` → build → commit                      |
| Upgrade a vendor library           | Replace file in `src/vendor/` and update the `<script>`/`<link>` in the Matrix page template |

```

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

Search is powered by a custom Coveo integration loaded at runtime from the production CDN:

```

https://internal.nt.gov.au/dcdd/dev/policy-library/coveo/site/ntgov-coveo-search.js

````

The search is initialised with:

```js
ntgCOVEO.init(query, doctype, owner, corrections, "53");
````

| Parameter     | Type    | Description                                        |
| ------------- | ------- | -------------------------------------------------- |
| `query`       | string  | Initial free-text search term (empty on page load) |
| `doctype`     | string  | Pre-selected doctype filter value                  |
| `owner`       | string  | Pre-selected owner filter value                    |
| `corrections` | boolean | Whether Coveo spell-correction is enabled (`true`) |
| `'53'`        | string  | Coveo results-per-page count                       |

**Results are injected** into `#search-results-list` using the `.search-template` element as a client-side HTML template. `data-ref` attributes on child elements are binding points used by `ntgov-coveo-search.js`:

| `data-ref` value              | Populated with                                |
| ----------------------------- | --------------------------------------------- |
| `search-result-title`         | Document title                                |
| `search-result-description`   | Document excerpt/description                  |
| `search-result-doctype`       | Document type tag(s)                          |
| `search-result-assetURL`      | Direct download URL                           |
| `search-result-assetURL-open` | URL to open in new tab                        |
| `search-result-collectionURL` | Link to the document's collection/folder page |
| `search-result-filesize`      | File size string                              |
| `search-result-last-updated`  | Last modified date                            |
| `search-result-icon`          | Icon element for the doctype                  |

Pagination is handled by `pagination.min.js` and injected into `#sync-pagination`. The loading spinner (`#initialLoadingSpinner`) is shown until Coveo returns its first response.

### Filters

Scripts for the filter dropdowns and their active-filter pill system are loaded **after** the main page scripts, in a sequential loader pattern (to avoid race conditions):

```js
// Loaded in order, each waiting for the previous onload:
1. jquery.sumoselect.min.js   (CDN: cdnjs.cloudflare.com)
2. pagination.min.js           (Coveo CDN)
3. moment.min.js               (Coveo CDN)
4. ntgov-coveo-search.js       (Coveo CDN — main search engine)
```

`setupSumoWithPills($select, $pillsContainer)` wires up each `<select>` with:

- **SumoSelect** — styled multi-select dropdown
- **Pill rendering** — an active-filter tag is appended to `#filterPills` / `#ownerPills` for each selected value
- **Form re-submit on change** — `$('#policy-search-form').trigger('submit')` fires after each selection change or pill removal
- **Clear all** — `#clearAllFilters` / `#clearAllOwners` deselects all options and removes all pills

Filter selects:

| Element ID       | Filter Name | Options source                                       |
| ---------------- | ----------- | ---------------------------------------------------- |
| `#document_type` | Doctype     | Hard-coded `<option>` elements in Matrix template    |
| `#owner`         | Owner       | Hard-coded `<option>` elements (business unit names) |

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
| `#document_type`                             | Doctype multi-select filter                                  |
| `#owner`                                     | Owner multi-select filter                                    |
| `#search-results-list`                       | Coveo injects result cards here                              |
| `#sync-pagination`                           | Coveo injects pagination controls here                       |
| `#initialLoadingSpinner`                     | Shown while Coveo loads; hidden on first response            |
| `#filterPillsContainer` / `#active-doctypes` | Pill row for active doctype filters                          |
| `#ownerPillsContainer` / `#active-owner`     | Pill row for active owner filters                            |
| `#filterPills`                               | `<span>` where doctype pill elements are appended            |
| `#ownerPills`                                | `<span>` where owner pill elements are appended              |
| `#clearAllFilters`                           | Clears all doctype selections                                |
| `#clearAllOwners`                            | Clears all owner selections                                  |
| `#ntgc-status--toolbar`                      | Dev/test status toolbar (hidden off-screen by default)       |

---

## CSS Class Conventions

All NTG design system classes use the `ntgc-` prefix. Bootstrap 4 grid classes (`col-md-*`, `d-none`, etc.) are also used throughout. Key page-specific classes:

| Class                       | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `.ntg-search-listing__item` | A single search result card                             |
| `.search-template`          | Hidden template element cloned by Coveo for each result |
| `.ntgc-pill`                | An active filter pill tag                               |
| `.ntgc-pill__checkbox`      | Checkbox inside pill; unchecking removes the filter     |
| `.filter-option`            | Wrapper for each filter control row                     |
| `.ntgc-body--neutral-2`     | Light grey background used for the results area         |

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
- **SRI hash on `all.css`:** The `integrity` attribute on the Font Awesome stylesheet will cause a browser error if the file is modified locally. Remove the `integrity` / `crossorigin` attributes if you need to edit `all.css`.
- **Coveo scripts loaded from production:** `ntgov-coveo-search.js`, `pagination.min.js`, and `moment.min.js` are always fetched from the live production server. The search will not return results unless you are on the NTG VPN or network. A static Coveo REST API response snapshot is available at `src/mock/coveo-search-rest-api-query.json` (189 results from the `DCDD-documents` collection) for use in local testing or building mock integrations without VPN access.
- **jQuery loaded twice (potentially):** `jquery-3.4.1.min.js` is loaded in `<head>` and `jquery.sumoselect.min.js` is loaded at the bottom of `<body>`. The sumoselect init depends on jQuery already being present, which is satisfied by the head load.
- **`.oft` link handling:** `global-v2.js` automatically adds a `download` attribute to any `<a>` tag pointing to a `.oft` (Outlook Template) file.
- **Anchor scroll fix:** A `$(window).on('load')` handler re-triggers `window.location.hash` scrolling after 1000ms to work around Coveo's async DOM injection pushing page elements down after initial load.
- **Apostrophe stripping:** A form submit handler strips `'` and `'` (smart apostrophe) from search inputs — this prevents Coveo query parse errors.
