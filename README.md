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
 src/css/search-widget.css ─┐      Paint Layout
 src/js/coveo-search.js    ─┤      ├── <link>  search-page.css  ←── dist/search-page.css
                             ├─ npm run build                    ←── dist/search-page.js
                             └──────────────► dist/ ── Git File Bridge
                                              ├── search-section.html  → Nested container 1 (form)
                                              └── search-results.html  → Nested container 2 (results)
```

**Key rule for agents and developers:** Edit source files in `src/js/`, `src/css/`, `src/search-section.html`, or `src/search-results.html`, then run `npm run build`. Always commit **both** `src/` changes and the regenerated `dist/` files together — the `dist/` files are what Git File Bridge delivers to Matrix.

---

## Git File Bridge Deployment

[Git File Bridge](https://matrix.squiz.net/manuals/git-file-bridge) syncs specific files from this GitHub repository into Squiz Matrix file assets automatically on push.

**Files deployed to Matrix:**

| Local path                 | Matrix asset          | Used by                                                           |
| -------------------------- | --------------------- | ----------------------------------------------------------------- |
| `dist/search-page.js`      | `search-page.js`      | Paint layout `<script>` (after jQuery)                            |
| `dist/search-page.css`     | `search-page.css`     | Paint layout `<link>`                                             |
| `dist/search-section.html` | `search-section.html` | Squiz Matrix nested container — search form                       |
| `dist/search-results.html` | `search-results.html` | Squiz Matrix nested container — results area, filters, pagination |

> **`dist/` must be rebuilt before committing HTML fragment changes.** The `auto-rebuild-on-src-change` Vite plugin only watches `src/js/` and `src/css/`. Changes to `src/search-section.html` or `src/search-results.html` require a manual `npm run build` to update `dist/`.

**`dist/` is intentionally committed to git.** Git File Bridge reads from the repository, so the built output must be present in the commit. It is **not** in `.gitignore`.

The HTML page template and vendor/third-party scripts are managed separately inside Matrix and are not deployed via this repository.

### Paint layout references

```html
<!-- in the paint layout <head> -->
<link rel="stylesheet" href="%asset_file_path:search-page-css-asset-id%" />

<!-- at the bottom of the paint layout <body>, after jQuery -->
<script src="%asset_file_path:search-page-js-asset-id%"></script>
```

> **jQuery dependency:** The paint layout must load jQuery **before** `search-page.js`. The bundle is IIFE format and expects `$` / `jQuery` to be available as globals.

### Nested containers (HTML fragments)

Both `dist/search-section.html` and `dist/search-results.html` are **bare HTML fragments** (no `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` tags). Each is pasted into a separate Squiz Matrix nested container asset on the document search page. The paint layout already loads `search-page.css` and `search-page.js`, so the fragments need no additional asset references.

| Fragment                   | Source                    | Matrix placement                 |
| -------------------------- | ------------------------- | -------------------------------- |
| `dist/search-section.html` | `src/search-section.html` | Nested container above main body |
| `dist/search-results.html` | `src/search-results.html` | Nested container in main body    |

Both HTML files are copied verbatim from `src/` to `dist/` by the `copy-search-section` Vite plugin — no transformation occurs.

### Vite plugins

1. **`copy-search-section`** (`closeBundle` hook): after each build, copies `src/search-section.html` → `dist/search-section.html` and `src/search-results.html` → `dist/search-results.html` verbatim, then calls `syncPreviewTemplate()` (see below).

2. **`auto-rebuild-on-src-change`** (`configureServer` hook, dev server only): watches `src/js/**/*.js`, `src/css/**/*.css`, and `src/*.html`. Behaviour varies by file type:
   - **JS or CSS change:** runs Vite's programmatic `build()` to regenerate `dist/search-page.js` and `dist/search-page.css`, then sends a full browser reload. A `building` guard prevents concurrent builds. Logged as `[auto-rebuild] <file> changed — rebuilding…`.
   - **HTML change (`src/*.html`):** recopies `src/search-section.html` and `src/search-results.html` to `dist/`, calls `syncPreviewTemplate()`, then sends a full browser reload — no JS bundle rebuild needed. Logged as `[auto-rebuild] <file> changed — HTML recopied, reloading browser`.

3. **`syncPreviewTemplate()`** (called by both of the above): reads the result card `<li>` template block (the `<!-- Result card template … </li>` section) from `src/search-results.html`, re-indents it to the 8-space indent used in `search-section-preview.html`, and replaces the matching block in-place. This keeps the dev preview's card template in sync with the canonical source automatically — you never need to manually edit `search-section-preview.html` for card template changes.

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

`npm run dev` opens `search-section-preview.html` automatically. This is a **full-fidelity preview page** generated from the production CMS snapshot (`Document search _ DCDD intranet.html`). It includes the real Matrix page chrome (header, nav, footer) and references `./dist/search-page.css` and `./dist/search-page.js` locally, so you can test the complete search interaction without VPN or CMS access.

**Auto-rebuild is active** — edits to any file in `src/js/` or `src/css/` automatically rebuild `dist/` and trigger a full browser reload. Edits to `src/search-section.html` or `src/search-results.html` are automatically recopied to `dist/`, synced into `search-section-preview.html` via `syncPreviewTemplate()`, and trigger a full browser reload — no manual build step needed during dev. Run `npm run build` once before committing to ensure `dist/` reflects the final state.

### Mock data vs production API

| Environment               | Data source                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| `localhost` / `127.0.0.1` | `src/mock/coveo-search-rest-api-query.json` (189 results, no VPN needed) |
| All other hostnames       | Live Coveo REST API at `search-internal.nt.gov.au`                       |

The mock JSON always returns the same 189 results regardless of the query. It exercises the full rendering pipeline (filters, pagination, card/table view) without network access.

### Standard change workflow

```bash
# 1. Edit source files
code src/js/coveo-search.js
code src/css/search-widget.css
code src/search-section.html
code src/search-results.html

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

[`src/search-page.js`](src/search-page.js) is the Vite entry point. It imports only two files:

```js
import "./css/search-widget.css"; // widget styles (compiled → dist/search-page.css)
import "./js/coveo-search.js"; // search logic  (compiled → dist/search-page.js)
```

**Edit the imports there** to add or remove files from the bundle. Output filenames are fixed (no content hashes) so Matrix file asset URLs stay stable across builds.

---

## Repository Structure

```
document-library/
│
├── src/                                      ← EDIT HERE — all source files are git-tracked
│   ├── search-page.js                        # ★ BUILD ENTRY — imports search-widget.css + coveo-search.js
│   ├── search-section.html                   # ★ Search form HTML fragment → dist/search-section.html
│   ├── search-results.html                   # ★ Results/filters HTML fragment → dist/search-results.html
│   ├── js/
│   │   └── coveo-search.js                   # ★ Coveo REST API fetch, filtering, pagination, card/table rendering
│   ├── css/
│   │   ├── search-widget.css                 # ★ All widget styles: design tokens, form, .doc-search-* components
│   │   ├── main.css                          # NTG central stylesheet (~13,900 lines) — loaded by Matrix, NOT bundled
│   │   └── status-toolbar.css                # Dev/test status toolbar styles — loaded by Matrix, NOT bundled
│   ├── mock/
│   │   └── coveo-search-rest-api-query.json  # 189-result Coveo API snapshot for local dev
│   └── vendor/                               ← Third-party locked dependencies — do not edit
│       ├── js/
│       │   ├── jquery-3.4.1.min.js           # jQuery 3.4.1 (loaded by Matrix paint layout before this bundle)
│       │   ├── jquery.sumoselect.min.js       # Styled multi-select dropdowns
│       │   ├── jquery.tablesort.min.js        # Lightweight table sort
│       │   ├── imageslider-fotorama.js        # Header carousel
│       │   ├── auds.js                        # Australian Government Design System JS
│       │   ├── ntg-central-update-user-profile.js  # NTG Central user profile sync
│       │   ├── moment.min.js                  # Date formatting (window.moment — optional)
│       │   ├── pagination.min.js              # Coveo pagination helper (legacy)
│       │   └── gtm.js                         # Google Tag Manager (GA4: G-WY2GK59DRN)
│       ├── css/
│       │   ├── all.css                        # Font Awesome 5 Pro (loaded by Matrix)
│       │   ├── roboto.css                     # Roboto web font (loaded by Matrix)
│       │   ├── imageslider-fotorama.css        # Fotorama slider styles (loaded by Matrix)
│       │   └── yht7rxj.css                    # Squiz Matrix / Adobe Fonts stylesheet (loaded by Matrix)
│       └── img/
│           ├── ntg-central-rose-petal-default.svg
│           ├── ntgc-image-mask-type-a.svg
│           ├── ntgc-image-mask-type-b.svg
│           └── ntgc-image-mask-type-c.svg
│
├── dist/                                     ← BUILD OUTPUT — committed; Git File Bridge deploys these
│   ├── search-page.js                        # ★ → Matrix paint layout <script>
│   ├── search-page.css                       # ★ → Matrix paint layout <link>
│   ├── search-section.html                   # ★ → Matrix nested container (form)
│   └── search-results.html                   # ★ → Matrix nested container (results)
│
├── search-section-preview.html               # Full-page dev preview (references ./dist/)
├── Document search _ DCDD intranet.html      # CMS page snapshot used to generate preview (gitignored)
├── Document search _ DCDD intranet_files/    # Snapshot companion assets (gitignored, reference only)
├── vite.config.js                            # Vite: dev server + IIFE build + copy-html + auto-rebuild plugins
├── package.json                              # npm scripts: dev / build / preview
├── .gitignore
└── README.md
```

### What to edit — quick reference

| Goal                                      | File(s) to edit                                       | Then                                 |
| ----------------------------------------- | ----------------------------------------------------- | ------------------------------------ |
| Change search input markup                | `src/search-section.html`                             | `npm run build` → commit src+dist    |
| Change results/filters/pagination layout  | `src/search-results.html`                             | `npm run build` → commit src+dist    |
| Change search logic, rendering, filters   | `src/js/coveo-search.js`                              | `npm run build` → commit src+dist    |
| Change widget styles (tokens, components) | `src/css/search-widget.css`                           | `npm run build` → commit src+dist    |
| Add a file to the bundle                  | Add `import './...'` to `src/search-page.js`          | `npm run build` → commit src+dist    |
| Change mock data for local testing        | `src/mock/coveo-search-rest-api-query.json`           | No build needed (fetched at runtime) |
| Upgrade a vendor library                  | Replace in `src/vendor/`; update Matrix page template | `npm run build` → commit             |

---

## Page Architecture

### CMS: Squiz Matrix

The HTML is rendered server-side by Squiz Matrix. Key Matrix-specific patterns:

| Pattern                                                           | Purpose                                                               |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| `<!--coveo_no_index_start_XX-->` / `<!--coveo_no_index_end_XX-->` | Tells the Coveo crawler to skip indexing sections of the page         |
| `meta[name="ntgc.*"]`                                             | NTG-specific page metadata (asset ID, lineage, shortname)             |
| `meta[name="dcterms.*"]`                                          | Dublin Core metadata required by NTG publishing standards             |
| `data-user="…"` on `<body>`                                       | The logged-in user's Squiz Matrix asset ID                            |
| `pagedata` JS object                                              | Runtime page context injected by Matrix (asset IDs, URLs, variations) |

### Search: Coveo

Search results are fetched by `src/js/coveo-search.js` (compiled into `dist/search-page.js`).

**Production API endpoint:**

```
https://internal.nt.gov.au/dcdd/dev/policy-library/coveo/site/coveo-search-rest-api-query?searchterm=ENCODED_QUERY
```

This is a Squiz Matrix page asset on the same origin (`internal.nt.gov.au`) that returns the Coveo JSON response directly. It accepts only one caller-supplied parameter: `searchterm`. All other Coveo configuration (scope, result count, partial match, etc.) is baked into the Matrix asset server-side.

> **Do not use `?a=<assetId>` shorthand.** The `?a=944069` asset shorthand resolves to the document-search page itself and returns the full page HTML — not the Coveo JSON. This causes a `SyntaxError: Unexpected token '<'` in the fetch pipeline.

Sorting is performed **client-side** via `applySort()` after every fetch and after every sort radio button change — no re-fetch is needed. `originalResults` holds the API response order; `allResults` is a sorted copy used for rendering.

**Behaviour on page load:** `coveo-search.js` fires `runSearch()` unconditionally on `$(document).ready`. It reads `?searchterm=` and `?sort=` from the URL and pre-fills `#search` accordingly. The search form submit handler is attached only if `#policy-search-form` is present — its absence does not block results from loading.

**Date formatting:** Dates from `raw.resourceupdated` (`YYYY-MM-DD HH:mm:ss`) are formatted as `D MMMM YYYY` (e.g. `5 March 2026`) using a native JS regex — no external library. A non-breaking space (`\u00a0`) is inserted between the day number and month name so they never wrap onto separate lines.

**Search flow (submit → redirect → load):** When the form is submitted, the handler does **not** call `runSearch()` in-place. Instead it redirects to `window.location.pathname + "?searchterm=" + encodeURIComponent(query)`. The resulting page load reads `?searchterm=` and calls `runSearch()` via the normal init path. This keeps the URL bookmarkable and shareable with a single source of truth for the active query.

**Module state (inside the IIFE):**

| Variable                | Type   | Purpose                                                                                           |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `originalResults`       | Array  | Raw API response order — restored when sort is set back to "Relevance"                            |
| `allResults`            | Array  | Sorted copy of `originalResults`; source for filter and render operations                         |
| `filteredResults`       | Array  | Subset of `allResults` after applying active checkbox filters                                     |
| `currentPage`           | Number | Current pagination page (1-based)                                                                 |
| `activeTypeFilters`     | Set    | Checked values under the Type facet                                                               |
| `activeCategoryFilters` | Set    | Checked values under the Category facet                                                           |
| `currentSort`           | String | Active sort — `"relevancy"` \| `"date descending"` \| `"alpha ascending"` \| `"alpha descending"` |
| `currentQuery`          | String | Last query string passed to `runSearch()`                                                         |

**`data-ref` bindings** (attributes on elements inside `.search-template`, populated by `renderCardResults()`):

| `data-ref` value                | Coveo API field                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search-result-link`            | `raw.asseturl \|\| result.clickUri` — set as `href`                                                                                               |
| `search-result-title`           | `raw.resourcefriendlytitle \|\| result.title`                                                                                                     |
| `search-result-extlink`         | Shown (unhidden) when URL does not contain `internal.nt.gov.au`                                                                                   |
| `search-result-description`     | `raw.resourcedescription \|\| result.excerpt`                                                                                                     |
| `search-result-collection-row`  | Hidden (via `hidden` attribute) when `raw.collectionname` or `raw.collectionurl` is empty — both must be present for the row to show              |
| `search-result-collection`      | `raw.collectionname` — human-readable display name of the collection                                                                              |
| `search-result-collection-link` | `raw.collectionurl` — set as `href`; `raw.collectionname` is the link text                                                                        |
| `search-result-doctype`         | `raw.resourcedoctype` (rendered as a tag `<span>`)                                                                                                |
| `search-result-last-updated`    | `raw.resourceupdated` — formatted by `formatDate()` as `D\u00a0MMMM YYYY` (e.g. `5 March 2026`); non-breaking space prevents day/month line-break |

**External link detection:** A result is considered external if its URL does not contain `internal.nt.gov.au`. External results show an inline SVG external-link icon (`.doc-search-result__ext-icon`) — there is no Font Awesome dependency in this bundle.

**Sort change behaviour:** Changing the sort radio buttons (sidebar: `input[name="doc-search-sort"]`; mobile drawer: `input[name="doc-search-drawer-sort"]`) calls `applySort()` then `applyFilters()` — **no Coveo API re-fetch, no network request**. Active Type and Category filter checkboxes are preserved. Four options: **Relevance** (`relevancy`) restores the original API response order (`originalResults`); **Last updated** (`date descending`) sorts `allResults` by `raw.resourceupdated` descending using lexicographic comparison (the `YYYY-MM-DD HH:mm:ss` format makes lexicographic order identical to chronological order); **A – Z** (`alpha ascending`) and **Z – A** (`alpha descending`) sort by `raw.resourcefriendlytitle` (falling back to `result.title`) using `String.localeCompare()`.

### HTML fragments

#### `src/search-section.html` → `dist/search-section.html`

The search form. Deployed as a Matrix nested container. Contains an `<input type="text" name="query" id="search">` and a submit button with an inline SVG search icon. The form itself (`<form id="policy-search-form">`) is expected to be added by Matrix as a container wrapper, or be present in the page template — the fragment does not include the `<form>` tag.

#### `src/search-results.html` → `dist/search-results.html`

The results area. Deployed as a separate Matrix nested container. Contains:

- `.doc-search-outer` / `.doc-search-layout` — outer wrapper and two-column flex container
- `#doc-search-results-col` — results column; `data-view="card"` or `data-view="table"` switches the active view
- `#initialLoadingSpinner` — CSS ring spinner; visible while fetch is in progress
- `#doc-search-user-message` — error / no-results message area
- `#doc-search-results-summary` — "Showing X–Y of N results" text
- `#doc-search-mobile-filter-btn` — "Filters" pill button (hidden on desktop, visible ≤ 900 px); slides in the filter drawer
- `#doc-search-view-toggle` — card/table toggle pill button (`aria-pressed="true"` = table active)
- `#doc-search-results-list` — `<ul>` where card result `<li>` items are appended
- `#doc-search-table` / `#doc-search-table-body` — `<table>` rendered in table view (hidden on mobile)
- `#doc-search-pagination` — pagination `<nav>` (prev/next buttons + numbered pages with ellipsis)
- `#doc-search-sidebar` — filter sidebar containing Sort by (collapsible), Type, and Category facet groups; hidden on mobile
- `#doc-search-sort-group` — `<div role="radiogroup">` for sidebar sort; inputs use `name="doc-search-sort"` (values: `relevancy`, `date descending`, `alpha ascending`, `alpha descending`)
- `#doc-search-type-filters` — `<ul>` of checkbox filter items for `resourcedoctype`
- `#doc-search-category-filters` — `<ul>` of checkbox filter items for `collectionname`
- `#doc-search-drawer` — slide-in filter drawer (`role="dialog" aria-modal="true"`); shown/hidden via `aria-hidden`
- `#doc-search-drawer-overlay` — semi-transparent backdrop; click closes the drawer
- `#doc-search-drawer-close` — × close button in the drawer header
- `#doc-search-drawer-sort-group` — drawer copy of the sort radio group; inputs use `name="doc-search-drawer-sort"`
- `#doc-search-drawer-type-filters` — drawer copy of the Type facet checkbox list
- `#doc-search-drawer-category-filters` — drawer copy of the Category facet checkbox list
- `#doc-search-drawer-clear` — "Clear all filters" button in the drawer body — resets sort + all checkboxes
- `#doc-search-drawer-apply` — "Apply filters" button in the drawer footer — syncs drawer state back to sidebar
- `.search-template` (`hidden`) — result card template `<li>` cloned by JS per result

---

## Key Element IDs

| ID                                    | Purpose                                                                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#policy-search-form`                 | Search form — submit triggers `runSearch()`                                                                                                        |
| `#search`                             | Free-text input (`name="query"`); pre-filled from `?searchterm=` URL param                                                                         |
| `#doc-search-results-col`             | Results column; `data-view` attr controls card/table                                                                                               |
| `#initialLoadingSpinner`              | Shown during fetch; hidden on response                                                                                                             |
| `#doc-search-user-message`            | Error / no-results message                                                                                                                         |
| `#doc-search-results-summary`         | "Showing X–Y of N results" line                                                                                                                    |
| `#doc-search-sort-group`              | Sidebar sort radio group `<div role="radiogroup">`; `input[name="doc-search-sort"]` change triggers `applySort()` + `applyFilters()` (no API call) |
| `#doc-search-mobile-filter-btn`       | Mobile-only "Filters" pill button (hidden on desktop); opens the filter drawer                                                                     |
| `#doc-search-view-toggle`             | Card/table toggle pill button                                                                                                                      |
| `#doc-search-results-list`            | Card results `<ul>`                                                                                                                                |
| `#doc-search-table-body`              | Table results `<tbody>`                                                                                                                            |
| `#doc-search-pagination`              | Pagination `<nav>`                                                                                                                                 |
| `#doc-search-sidebar`                 | Filter sidebar `<aside>` (hidden on mobile)                                                                                                        |
| `#doc-search-type-filters`            | Type facet checkbox list (sidebar)                                                                                                                 |
| `#doc-search-category-filters`        | Category facet checkbox list (sidebar)                                                                                                             |
| `#doc-search-drawer`                  | Slide-in filter drawer (`role="dialog"`, `aria-modal="true"`); shown/hidden via `aria-hidden`                                                      |
| `#doc-search-drawer-overlay`          | Semi-transparent backdrop behind the drawer; click closes the drawer                                                                               |
| `#doc-search-drawer-close`            | × close button in the drawer header                                                                                                                |
| `#doc-search-drawer-sort-group`       | Drawer copy of the sort radio group; inputs use `name="doc-search-drawer-sort"`                                                                    |
| `#doc-search-drawer-type-filters`     | Drawer copy of the Type facet checkbox list                                                                                                        |
| `#doc-search-drawer-category-filters` | Drawer copy of the Category facet checkbox list                                                                                                    |
| `#doc-search-drawer-clear`            | "Clear all filters" button in drawer body — resets sort to Relevance, clears all checkboxes                                                        |
| `#doc-search-drawer-apply`            | "Apply filters" button in drawer footer — commits drawer sort + filter selections back to sidebar state                                            |

---

## CSS — search-widget.css

`src/css/search-widget.css` is the **only CSS file in the bundle** (`dist/search-page.css`). It is fully self-contained — no dependency on `main.css` or any external stylesheet.

### Design tokens (`:root` block)

All colours, typography scales, and border radii are defined as CSS custom properties. Key tokens:

| Token                    | Value     | Usage                                |
| ------------------------ | --------- | ------------------------------------ |
| `--clr-text-default`     | `#102040` | Body text, links                     |
| `--clr-text-alt`         | `#384560` | Secondary text, input placeholder    |
| `--clr-border-subtle`    | `#d0e0e0` | Borders, outlines                    |
| `--clr-bg-default`       | `#ffffff` | Input background                     |
| `--clr-bg-shade-alt`     | `#ecf0f0` | Results area background              |
| `--clr-icon-subtle`      | `#878f9f` | Toggle pill (off state)              |
| `--clr-surface-selected` | `#107810` | Active pagination page / toggle (on) |

### Spacing scale

CSS custom property spacing tokens are **not** defined in `:root` — spacing values are written directly in class rules. The design system uses named step labels as a shorthand in design discussions:

| Label   | Value  | Common uses in this widget                                                       |
| ------- | ------ | -------------------------------------------------------------------------------- |
| `sp-xs` | `8px`  | Tag horizontal padding, icon gaps                                                |
| `sp-sm` | `12px` | Vertical gap between card elements (title → description → collection → meta row) |
| `sp-md` | `16px` | Table cell padding                                                               |
| `sp-lg` | `24px` | Card vertical padding                                                            |
| `sp-xl` | `32px` | Card horizontal padding                                                          |

When changing internal card spacing, use `12px` (`sp-sm`) as the baseline for all bottom margins between elements — title link, description, collection row.

### BEM classes

#### Search form (`ntgc-search-section`)

| Class                                  | Element                                         |
| -------------------------------------- | ----------------------------------------------- |
| `.ntgc-search-section`                 | Outer wrapper — full-width, centred, padded     |
| `.ntgc-search-section__container`      | Constrained inner container (max-width 1232px)  |
| `.ntgc-search-section__input-wrapper`  | Input + button row (max-width 640px, outlined)  |
| `.ntgc-search-section__input-field`    | Flex row — white background, overflow hidden    |
| `.ntgc-search-section__text-input`     | `<input type="text">` — unstyled                |
| `.ntgc-search-section__submit-btn`     | `<button type="submit">` — transparent          |
| `.ntgc-search-section__icon-container` | 24×24 icon wrapper                              |
| `.ntgc-search-section__icon`           | Inline SVG search icon (no Font Awesome needed) |

#### Results widget (`doc-search-*`)

| Class                                    | Element                                                                                                                                                                                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.doc-search-outer`                      | Outer section wrapper — shaded bg, padded                                                                                                                                                                                          |
| `.doc-search-layout`                     | Two-column flex (results col + sidebar)                                                                                                                                                                                            |
| `.doc-search-results-col`                | Results column; `[data-view="table"]` activates table mode                                                                                                                                                                         |
| `.doc-search-results-header`             | Bar above results — summary text + controls                                                                                                                                                                                        |
| `.doc-search-results-summary`            | "Showing X–Y of N results" `<p>`                                                                                                                                                                                                   |
| `.doc-search-results-controls`           | Flex row — view toggle button (sort has moved to the filter sidebar)                                                                                                                                                               |
| `.doc-search-view-toggle`                | Card/table toggle pill `<button>`                                                                                                                                                                                                  |
| `.doc-search-view-toggle__pill`          | The sliding oval indicator                                                                                                                                                                                                         |
| `.doc-search-view-toggle__label`         | "Table view" / "Card view" text                                                                                                                                                                                                    |
| `.doc-search-spinner`                    | Loading spinner wrapper                                                                                                                                                                                                            |
| `.doc-search-spinner__ring`              | CSS `@keyframes` ring animation                                                                                                                                                                                                    |
| `.doc-search-user-message`               | Error / empty-state message                                                                                                                                                                                                        |
| `.doc-search-results-list`               | Card results `<ul>`                                                                                                                                                                                                                |
| `.doc-search-result`                     | Single result card `<li>`                                                                                                                                                                                                          |
| `.doc-search-result__title-link`         | Card title `<a>` — `display: flex` (block-level) so the following `<p>` sits flush below with no browser-default paragraph margin-top                                                                                              |
| `.doc-search-result__ext-icon`           | Inline SVG external-link icon (shown for external URLs)                                                                                                                                                                            |
| `.doc-search-result__description`        | Excerpt/description `<p>` — `margin: 12px 0 12px !important` overrides browser `<p>` default top margin                                                                                                                            |
| `.doc-search-result__collection-row`     | "Collection: …" row                                                                                                                                                                                                                |
| `.doc-search-result__collection-icon`    | Inline SVG folder icon preceding "Collection:" — 12×12, `stroke="currentColor"`, `aria-hidden="true"`, vertically aligned to text baseline                                                                                         |
| `.doc-search-result__collection-link`    | Link to the parent collection                                                                                                                                                                                                      |
| `.doc-search-result__meta`               | Flex row — doctype tag + last-updated date                                                                                                                                                                                         |
| `.doc-search-result__tag`                | Document type tag `<span>` (e.g. "Policy") — `display: inline-flex`, `outline: 1px solid var(--clr-border-subtle)` (not `border`), **no `border-radius`**, 12px/700 uppercase Roboto                                               |
| `.doc-search-result__updated`            | Last-updated date wrapper `<div>` — contains literal text `Last updated:` and an inner `<span [data-ref="search-result-last-updated"]>` with the formatted date (card view only; table view renders plain text directly in `<td>`) |
| `.doc-search-table-wrap`                 | Overflow wrapper for table (hidden in card view)                                                                                                                                                                                   |
| `.doc-search-table`                      | Results `<table>` (visible only when `data-view="table"`)                                                                                                                                                                          |
| `.doc-search-table__col-title`           | Title column — 50% width                                                                                                                                                                                                           |
| `.doc-search-table__col-updated`         | Last Updated column                                                                                                                                                                                                                |
| `.doc-search-table__col-type`            | Type column                                                                                                                                                                                                                        |
| `.doc-search-table__col-collection`      | Collection column                                                                                                                                                                                                                  |
| `.doc-search-table__title-link`          | Title `<a>` inside table row                                                                                                                                                                                                       |
| `.doc-search-table__tag`                 | Doctype `<span>` inside table row — same style as `.doc-search-result__tag` (`inline-flex`, `outline`, no `border-radius`)                                                                                                         |
| `.doc-search-pagination`                 | Pagination `<nav>`                                                                                                                                                                                                                 |
| `.doc-search-pagination__btn`            | Page number / prev / next `<button>`                                                                                                                                                                                               |
| `.doc-search-pagination__btn--active`    | Currently selected page button                                                                                                                                                                                                     |
| `.doc-search-pagination__btn--prev`      | "‹ Prev" button                                                                                                                                                                                                                    |
| `.doc-search-pagination__btn--next`      | "Next ›" button                                                                                                                                                                                                                    |
| `.doc-search-pagination__ellipsis`       | `…` gap `<span>` between page numbers                                                                                                                                                                                              |
| `.doc-search-sidebar`                    | Filter sidebar `<aside>` (hidden on mobile ≤ 900 px)                                                                                                                                                                               |
| `.doc-search-filter-group`               | A single collapsible filter section (Sort by / Type / Category)                                                                                                                                                                    |
| `.doc-search-filter-group__title`        | Non-collapsible facet group heading `<h3>` (Type, Category)                                                                                                                                                                        |
| `.doc-search-filter-group__toggle`       | Collapsible `<button>` heading (Sort by); `aria-expanded` drives open/closed state; **collapsed by default** (`aria-expanded="false"`); `display: inline-flex; width: auto; justify-content: flex-start` so the button fits its content (label + chevron) rather than stretching full-width; 16 px bold |
| `.doc-search-filter-group__chevron`      | Chevron-down SVG (`viewBox="61.5 9.3 13 7"`) inside `.doc-search-filter-group__toggle`; sits immediately after the "Sort by" label text; **`rotate(0deg)`** = chevron-down = collapsed (default); **`rotate(180deg)`** on `aria-expanded="true"` = chevron-up = expanded; `transition: transform 0.2s ease` |
| `.doc-search-sort-group`                 | `<div role="radiogroup">` containing sort radio buttons; `display: grid` for vertical stacking; **hidden by default** (Sort by starts collapsed); shown when toggle `aria-expanded="true"` |
| `.doc-search-sort-option`                | `<label>` wrapping a sort radio `<input>` and its custom indicator                                                                                                                                                                 |
| `.doc-search-sort-option__radio`         | Custom circular radio indicator (32×32 px); **both states use SVG `background-image`** (no CSS border): unselected = open-ring SVG (white-filled circle with `#102040` ring); selected = ring-plus-inner-dot SVG (`#102040`); no `border`; `box-sizing: border-box` |
| `.doc-search-sort-option__label`         | Sort option display text (Relevance, Last updated, A – Z, Z – A); `font-weight: var(--font-weight-regular) !important` (400) to override any external stylesheet inheritance |
| `.doc-search-mobile-filter-btn`          | Mobile-only "Filters" pill button (`display: none` on desktop); contains icon SVG, label, and chevron                                                                                                                              |
| `.doc-search-mobile-filter-btn__left`    | Left slot — wraps the filter-lines icon SVG and "Filters" text                                                                                                                                                                     |
| `.doc-search-mobile-filter-btn__icon`    | Filter-lines SVG (three horizontal lines) on the left of the button                                                                                                                                                                |
| `.doc-search-mobile-filter-btn__label`   | "Filters" text span                                                                                                                                                                                                                |
| `.doc-search-mobile-filter-btn__chevron` | Stroke chevron SVG on the right of the mobile button                                                                                                                                                                               |
| `.doc-search-drawer`                     | Slide-in filter panel (`position: fixed`; slides in from the right); `aria-hidden` drives visibility                                                                                                                               |
| `.doc-search-drawer-overlay`             | Semi-transparent fixed overlay behind the drawer; click triggers close                                                                                                                                                             |
| `.doc-search-drawer__header`             | Sticky header row — "Filters" title + × close button                                                                                                                                                                               |
| `.doc-search-drawer__title`              | "Filters" heading `<span>`                                                                                                                                                                                                         |
| `.doc-search-drawer__close`              | × close `<button>`; `align-self: stretch` fills the full header height; inset focus ring (`outline-offset: -4px`)                                                                                                                  |
| `.doc-search-drawer__body`               | Scrollable region containing the sort group, Type facet, Category facet, and Clear button                                                                                                                                          |
| `.doc-search-drawer__footer`             | Sticky footer containing the "Apply filters" button                                                                                                                                                                                |
| `.doc-search-drawer__apply`              | "Apply filters" `<button>` — syncs drawer selections to sidebar and fires `applyFilters()`                                                                                                                                         |
| `.doc-search-drawer__clear`              | "Clear all filters" `<button>` inside `.doc-search-drawer__body`; resets sort to Relevance and unchecks all facets                                                                                                                 |
| `.doc-search-facet-list`                 | Checkbox list `<ul>`                                                                                                                                                                                                               |
| `.doc-search-facet-item`                 | Checkbox label wrapper `<label>`                                                                                                                                                                                                   |
| `.doc-search-facet-item__label`          | Facet value text                                                                                                                                                                                                                   |
| `.doc-search-facet-item__count`          | Result count `(N)` in parentheses                                                                                                                                                                                                  |
| `.doc-search-facet-hidden`               | Applied to facet items beyond `MAX_FACET_VISIBLE` (7)                                                                                                                                                                              |
| `.doc-search-show-all`                   | "Show all (N)" button — removes `.doc-search-facet-hidden`                                                                                                                                                                         |
| `.search-template`                       | Hidden `<li>` template — cloned per result by JS                                                                                                                                                                                   |

**Responsive breakpoints:** At ≤ 900 px, `.doc-search-layout` switches from row to column, the filter sidebar (`#doc-search-sidebar`) is hidden, and a "Filters" pill button (`#doc-search-mobile-filter-btn`) appears in the results column. Tapping it slides in the filter drawer (`#doc-search-drawer`) from the right. The table view toggle is also hidden at this breakpoint — only card view is available on mobile.

---

## User Session Data

Matrix injects the authenticated user's details into `localStorage` on page load:

| Key                      | Value                                                                             |
| ------------------------ | --------------------------------------------------------------------------------- |
| `intra-user-id`          | Squiz Matrix asset ID of the logged-in user                                       |
| `intra-user-info`        | JSON: `UIgivenName, sn, telephoneNumber, mail, title, location, departmentNumber` |
| `intra-user-displayName` | `'Yes'` if the display name should be shown                                       |

---

## Analytics

Google Analytics 4 via Google Tag Manager. Tag ID: `G-WY2GK59DRN`. GTM is loaded by the Matrix paint layout — it is not in this bundle.

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

- **No Font Awesome in the bundle.** `dist/search-page.css` and `dist/search-page.js` have zero Font Awesome dependencies. All icons are inline SVGs (external-link icon in cards and table, sort group chevron, filter group toggle chevron, mobile filter button icons) or pure CSS (spinner ring via `@keyframes doc-search-spin`, pagination arrows via unicode `‹`/`›`). Font Awesome Pro is still loaded by the Matrix paint layout for the rest of the page — just not needed here.

- **VPN required for production search.** The Coveo endpoint (`https://internal.nt.gov.au/...`) is only reachable on the NTG network. `coveo-search.js` automatically falls back to the mock JSON when `hostname` is `localhost` or `127.0.0.1`. Do not use a `?a=<assetId>` Matrix shorthand URL — it resolves to an HTML page, not JSON.

- **Mock data is static.** `src/mock/coveo-search-rest-api-query.json` always returns the same 189 results regardless of the query string. It is a snapshot used purely to exercise the rendering pipeline locally.

- **Sort is client-side; filters are preserved on sort change.** Changing the sort radio buttons (`input[name="doc-search-sort"]` in the sidebar, or `input[name="doc-search-drawer-sort"]` in the mobile drawer) calls `applySort()` then `applyFilters()` — no API call, no filter reset. `originalResults` always holds the unmodified API response so "Relevance" can restore it cheaply. The mobile drawer has its own radio group that mirrors the sidebar state; the "Apply filters" button syncs the drawer selection back to the sidebar before firing.

- **Mobile filter drawer.** On screens ≤ 900 px the filter sidebar is hidden and replaced by a "Filters" pill button. Tapping it opens a slide-in drawer (`#doc-search-drawer`, `position: fixed`, slides from the right) with the full sort + facet UI duplicated. The drawer has its own sort radio group (`name="doc-search-drawer-sort"`) and its own Type/Category checkbox lists. On "Apply filters" (`#doc-search-drawer-apply`), `coveo-search.js` reads the drawer sort selection, syncs it to the sidebar radios, reads the drawer checkboxes, syncs them to the sidebar checkboxes, then calls `applySort()` + `applyFilters()`. On "Clear all filters" (`#doc-search-drawer-clear`), sort resets to `relevancy` and all checkboxes are unchecked (in both drawer and sidebar). The overlay and close button both fire the same close routine.

- **`runSearch()` fires unconditionally.** The `$(document).ready` handler calls `runSearch()` regardless of whether `#policy-search-form` exists on the page. The form submit handler is wired up separately, only if `#policy-search-form` is found — and it **redirects** to `?searchterm=<encoded_query>` rather than calling `runSearch()` directly. The redirect triggers a fresh page load which re-enters via the init path. This allows the results area to work as a standalone nested container without needing the form on the same page load, and keeps the URL bookmarkable.

- **`moment.js` is not used by this bundle.** `formatDate()` uses a native regex (`/^(\d{4})-(\d{2})-(\d{2})/`) to parse and reformat `raw.resourceupdated`. There is no `window.moment` dependency — dates display correctly whether or not moment.js is loaded by the Matrix page.

- **`@supports` CSS warning at build time.** Vite/esbuild emits `[WARNING] Expected identifier but found "@supports"` from `src/css/main.css`. This is a pre-existing IE-targeting vendor pattern (`-ms-ime-align`) and does not affect functionality. Safe to ignore — `main.css` is not in the bundle anyway.

- **Vendor SVGs in `src/vendor/img/`.** The four SVG mask files were previously referenced as `/?a=XXXXXX` Matrix asset URLs in production. They are now local files referenced by relative path from `src/css/main.css`. If the NTG design system is updated, replace the files in `src/vendor/img/` and rebuild.

- **`.oft` link handling.** `global-v2.js` (loaded by Matrix, not bundled) automatically adds a `download` attribute to any `<a>` pointing to a `.oft` (Outlook Template) file.

- **Card element vertical spacing is `12px` uniform (`sp-sm`).** Title link, description, and collection row each carry `margin-bottom: 12px`. The description `<p>` also carries `margin-top: 12px !important` — the `!important` is required because browsers default `<p>` to `margin-top: 1em` and the parent block context makes that apply even when the title link sets `margin-bottom: 0`.

- **`.doc-search-result__title-link` must be `display: flex`, not `display: inline-flex`.** As a block-level flex container it establishes a new block formatting context, preventing the browser's default `<p>` `margin-top: 1em` from appearing above the description. Changing it back to `inline-flex` reintroduces the unwanted top gap before the description.

- **Tags use `outline`, not `border`, and have no `border-radius`.** Both `.doc-search-result__tag` and `.doc-search-table__tag` use `outline: 1px var(--clr-border-subtle) solid; outline-offset: -1px` and `overflow: hidden` to achieve the rectangular border appearance. This matches the Figma "Default" variant of the tag component. Do not add `border-radius` — the design is intentionally square-cornered.

- **`search-section-preview.html` card template is auto-synced.** The `syncPreviewTemplate()` function in `vite.config.js` automatically extracts the result card `<li>` template from `src/search-results.html` and patches it into `search-section-preview.html` on every build and on every `src/*.html` save during dev. You **never need to manually edit `search-section-preview.html`** for card template changes — edit `src/search-results.html` and save. If you need to fully regenerate `search-section-preview.html` from scratch (e.g. after the production CMS page chrome changes significantly): write a Node script that reads `Document search _ DCDD intranet.html`, replaces the CDN widget refs with `./dist/` paths, wraps the `ntgc-search-section` div in `<form id="policy-search-form">`, and injects the contents of `src/search-results.html` after the form — then ensure the result card template block starts with `<!-- Result card template` so `syncPreviewTemplate()` can locate it. See `build-preview.js` (deleted after use) in git history for reference.
