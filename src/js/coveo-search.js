/**
 * coveo-search.js — DCDD Document Search: Coveo REST API integration
 *
 * ── OVERVIEW ─────────────────────────────────────────────────────────────────
 * Fetches all matching documents from the Coveo Search REST API in a single
 * request, then performs client-side filtering, sorting, and pagination.
 * Results are rendered by cloning a hidden .search-template element.
 *
 * ── API ENDPOINT ─────────────────────────────────────────────────────────────
 * Production:  https://internal.nt.gov.au/dcdd/dev/policy-library/coveo/site/coveo-search-rest-api-query
 *   Squiz Matrix page asset — same-origin (internal.nt.gov.au); returns the
 *   Coveo JSON response directly. Only one param is accepted:
 *     ?searchterm=<encoded query>   — omit or empty → returns all documents
 *   Do NOT use the ?a=<assetId> proxy shorthand — that resolves to the
 *   document-search page itself and returns HTML, not JSON.
 * Dev/local:   /src/mock/coveo-search-rest-api-query.json  (static fixture)
 *
 * Dev detection: window.location.hostname is "localhost" or "127.0.0.1"
 *
 * Sorting is performed client-side after the full result set is received:
 *   applySort() is called after every fetch and after every sort <select> change.
 *   "relevancy"        — preserves the original API response order (originalResults)
 *   "date descending"  — sorts allResults by raw.resourceupdated descending
 *   "date ascending"   — sorts allResults by raw.resourceupdated ascending
 *   raw.resourceupdated format is "YYYY-MM-DD HH:mm:ss"; lexicographic comparison
 *   produces the correct chronological order for that format.
 *
 * ── COVEO RESULT FIELDS USED ─────────────────────────────────────────────────
 * result.title                        — fallback title
 * result.clickUri                     — fallback URL
 * result.excerpt                      — fallback description
 * result.raw.resourcefriendlytitle    — display title
 * result.raw.asseturl                 — primary document URL
 * result.raw.resourcedescription      — card/table description
 * result.raw.resourcedoctype          — "Type" facet value and tag label
 * result.raw.collectionname           — "Category" facet value (used as filter key)
 * result.raw.collectionname           — human-readable collection name; used as display text in both card and table views
 * result.raw.collectionassetid        — Squiz asset ID for the collection (not used in rendering)
 * result.raw.collectionurl            — direct collection URL; used as href in both card and table view
 * result.raw.resourceupdated          — last-updated date (YYYY-MM-DD HH:mm:ss)
 * result.raw.resourcetype             — file type key (e.g. "pdf_file", "word_doc"); mapped to uppercase label
 * result.raw.resourcefilesize         — human-readable file size (e.g. "354.2 KB")
 *
 * ── DOM CONTRACT ─────────────────────────────────────────────────────────────
 * IDs and attributes that must exist in the page HTML:
 *
 *   #search                       text input — holds the search query
 *   #policy-search-form           form element (optional); submit triggers search
 *   #initialLoadingSpinner        shown/hidden via .d-none during fetch
 *   #doc-search-results-col       wrapper; data-view="card" | "table"
 *   #doc-search-results-list      <ul> populated with card results
 *   #doc-search-table-body        <tbody> populated with table rows
 *   #doc-search-results-summary   receives "Showing X–Y of Z results" text
 *   #doc-search-pagination        receives prev/page-number/next buttons
 *   #doc-search-sort-select       <select>; option values: "relevancy" | "date descending" | "date ascending"
 *   #doc-search-view-toggle       button; aria-pressed="true" = table view active
 *   #doc-search-type-filters      <ul> receives Type facet checkboxes
 *   #doc-search-category-filters  <ul> receives Category facet checkboxes
 *   #doc-search-user-message      receives error / no-results message strings
 *   .search-template[hidden]      card template element, cloned per result
 *
 * Card template data-ref slots (inside .search-template):
 *   [data-ref="search-result-link"]            <a> href = asseturl
 *   [data-ref="search-result-title"]           document title with formatFileMeta() suffix
 *                                                e.g. "My Document (PDF, 354.2 KB)"
 *   [data-ref="search-result-extlink"]         external-link icon (hidden unless external)
 *   [data-ref="search-result-description"]     description / excerpt text
 *   [data-ref="search-result-collection-row"]  entire row hidden when no collection
 *   [data-ref="search-result-collection"]      collection name text (raw.collectionname)
 *   [data-ref="search-result-collection-link"] <a> href = raw.collectionurl
 *   [data-ref="search-result-doctype"]         doctype badge text
 *   [data-ref="search-result-last-updated"]    formatted last-updated date
 *
 * Table columns (built by renderTableResults into #doc-search-table-body <tr> rows):
 *   .doc-search-table__col-title       title cell — <a class="doc-search-table__title-link">
 *                                        title text includes formatFileMeta() suffix
 *   .doc-search-table__col-updated     last-updated plain text
 *   .doc-search-table__col-type        doctype — <span class="doc-search-table__tag"> or empty
 *   .doc-search-table__col-collection  collection — <a class="doc-search-table__collection-link">
 *                                        href = raw.collectionurl
 *                                        text = raw.collectionname
 *
 * Facet items (built by buildFacet into #doc-search-type-filters / #doc-search-category-filters):
 *   input[data-facet][data-value]       checkbox; data-facet = raw field name, data-value = raw value
 *   .doc-search-facet-item              <label> wrapper
 *   .doc-search-facet-item__label       human-readable value text
 *   .doc-search-facet-item__count       occurrence count "(n)"
 *   .doc-search-facet-hidden            items beyond MAX_FACET_VISIBLE; removed on "Show all" click
 *   .doc-search-show-all                "Show all (n)" toggle button; data-facet-container = containerId
 *
 * ── URL PARAMETERS READ ON INIT ──────────────────────────────────────────────
 *   ?searchterm=<string>  pre-fills #search and immediately runs a search
 *   ?sort=<string>        pre-selects sort; must match a <select> option value:
 *                           "relevancy" | "date descending" | "date ascending"
 *
 * ── SEARCH FLOW ──────────────────────────────────────────────────────────────
 * On form submit: the handler redirects to
 *   window.location.pathname + "?searchterm=" + encodeURIComponent(query)
 * This triggers a fresh page load, which then reads ?searchterm= above.
 * runSearch() is therefore always driven by the URL parameter, never called
 * directly from the submit handler.
 *
 * ── KEY CONSTANTS ────────────────────────────────────────────────────────────
 *   RESULTS_PER_PAGE_CARD   10      — cards shown per page
 *   RESULTS_PER_PAGE_TABLE  15      — rows shown per page in table view
 *   MAX_FACET_VISIBLE        7      — facet items visible before "Show all"
 *   FILE_TYPE_LABELS        Object  — maps raw.resourcetype keys to uppercase display labels
 *                                     (e.g. "pdf_file" → "PDF", "word_doc" → "DOCX")
 *                                     Add entries here to support additional file types.
 *
 * ── TITLE COMPOSITION ────────────────────────────────────────────────────────
 * Card and table titles are both composed as:
 *   (raw.resourcefriendlytitle || result.title) + formatFileMeta(raw)
 * formatFileMeta() appends a parenthetical suffix when raw.resourcetype and/or
 * raw.resourcefilesize are present — for example:
 *   "My Document (PDF, 354.2 KB)"   — both type and size present
 *   "My Document (DOCX)"            — type only (size absent)
 *   "My Document (58.5 KB)"         — size only (type unmapped or absent)
 *   "My Document"                   — neither present
 * To add a new file type mapping, add an entry to FILE_TYPE_LABELS.
 *
 * ── MODULE STATE ─────────────────────────────────────────────────────────────
 *   originalResults  Array   — raw API response order; restored on "relevancy" sort
 *   allResults       Array   — current display order (sorted copy of originalResults)
 *   filteredResults  Array   — subset of allResults after checkbox filters applied
 *   currentPage      Number  — active pagination page (1-based)
 *   activeTypeFilters     Set  — checked "Type" facet values
 *   activeCategoryFilters Set  — checked "Category" facet values
 *   currentSort      String  — "relevancy" | "date descending" | "date ascending"
 *   currentQuery     String  — last query passed to runSearch()
 *
 * ── DEPENDENCIES ─────────────────────────────────────────────────────────────
 *   jQuery (window.$)  — must be loaded before this script executes
 *   moment.js          — optional; dates fall back to raw string if absent
 */

(function ($) {
  "use strict";

  // ── Environment ──────────────────────────────────────────────────────────────
  var isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  var COVEO_BASE_URL =
    "https://internal.nt.gov.au/dcdd/dev/policy-library/coveo/site/coveo-search-rest-api-query";
  var MOCK_URL = "/src/mock/coveo-search-rest-api-query.json";

  var RESULTS_PER_PAGE_CARD = 10;
  var RESULTS_PER_PAGE_TABLE = 15;
  var MAX_FACET_VISIBLE = 7;

  // ── Module state ─────────────────────────────────────────────────────────────
  var originalResults = []; // API response order — restored when sort = relevancy
  var allResults = [];
  var filteredResults = [];
  var currentPage = 1;
  var activeTypeFilters = new Set();
  var activeCategoryFilters = new Set();
  var currentSort = "relevancy";
  var currentQuery = "";

  // ── URL builder ──────────────────────────────────────────────────────────────
  /**
   * Builds the Coveo search endpoint URL for the given query string.
   * @param {string} query  Raw (unencoded) search term.
   * @returns {string} Full URL with ?searchterm= query parameter.
   */
  function buildCoveoUrl(query) {
    return COVEO_BASE_URL + "?searchterm=" + encodeURIComponent(query);
  }

  /**
   * Returns the value of a URL query parameter from the current page URL,
   * or null when the parameter is absent.
   * @param {string} name  Parameter name (e.g. "searchterm", "sort").
   * @returns {string|null}
   */
  function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // ── Date formatting ──────────────────────────────────────────────────────────
  var MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  /**
   * Formats a Coveo date string as "D\u00a0MMMM YYYY" (e.g. "5\u00a0March 2026").
   * The non-breaking space between day and month prevents line-wrapping at that point.
   * Returns the original string unchanged when it does not match the expected format,
   * and returns "" when dateStr is falsy.
   * @param {string} dateStr  Date in "YYYY-MM-DD HH:mm:ss" format (raw.resourceupdated).
   * @returns {string}
   */
  function formatDate(dateStr) {
    if (!dateStr) return "";
    // Parse "YYYY-MM-DD HH:mm:ss" and format as "D\u00a0MMMM YYYY"
    // Non-breaking space between day and month prevents them wrapping onto separate lines
    var m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      var day = parseInt(m[3], 10);
      var month = MONTHS[parseInt(m[2], 10) - 1];
      return day + "\u00a0" + month + " " + m[1];
    }
    return dateStr;
  }

  // ── File type labels ──────────────────────────────────────────────────────────
  var FILE_TYPE_LABELS = {
    pdf_file: "PDF",
    word_doc: "DOCX",
    excel: "XLSX",
    powerpoint: "PPTX",
  };

  /**
   * Builds a parenthetical file-type/size suffix for appending to a document title.
   * Uses FILE_TYPE_LABELS to map raw.resourcetype to a display label (e.g. "PDF").
   * Returns an empty string when neither raw.resourcetype nor raw.resourcefilesize
   * is present.
   * @param {Object} raw  result.raw from the Coveo API response.
   * @returns {string}  e.g. " (PDF, 354.2 KB)", " (DOCX)", " (58.5 KB)", or "".
   */
  function formatFileMeta(raw) {
    var ext = FILE_TYPE_LABELS[raw.resourcetype] || "";
    var size = raw.resourcefilesize || "";
    if (ext && size) return " (" + ext + ", " + size + ")";
    if (ext) return " (" + ext + ")";
    if (size) return " (" + size + ")";
    return "";
  }

  // ── View helpers ─────────────────────────────────────────────────────────────
  /** Returns true when the results column is in table view (data-view="table"). */
  function isTableView() {
    return $("#doc-search-results-col").attr("data-view") === "table";
  }

  /** Returns the correct results-per-page constant for the active view. */
  function resultsPerPage() {
    return isTableView() ? RESULTS_PER_PAGE_TABLE : RESULTS_PER_PAGE_CARD;
  }

  // ── Filter building ──────────────────────────────────────────────────────────
  /**
   * Rebuilds both the Type and Category facet lists from the given result set.
   * Delegates to buildFacet() for each facet field.
   * @param {Array} results  Full (unfiltered) result set to count facet values from.
   */
  function buildFilters(results) {
    buildFacet(
      results,
      "resourcedoctype",
      "#doc-search-type-filters",
      activeTypeFilters,
    );
    buildFacet(
      results,
      "collectionname",
      "#doc-search-category-filters",
      activeCategoryFilters,
    );
  }

  /**
   * Populates a facet <ul> with checkbox items sorted descending by occurrence count.
   * @param {Array}  results      full result set to count facet values from
   * @param {string} field        result.raw property name (e.g. "resourcedoctype")
   * @param {string} containerId  jQuery selector for the target <ul>
   * @param {Set}    activeSet    currently active filter values; matching checkboxes rendered checked
   */
  function buildFacet(results, field, containerId, activeSet) {
    // Count occurrences
    var counts = {};
    results.forEach(function (r) {
      var val = (r.raw || {})[field];
      if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });

    var keys = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a]; // descending by count
    });

    var $container = $(containerId);
    $container.empty();

    keys.forEach(function (key, idx) {
      var isHidden = idx >= MAX_FACET_VISIBLE;
      var id = "facet-" + field + "-" + idx;
      var checked = activeSet.has(key) ? " checked" : "";
      var hiddenAttr = isHidden ? ' class="doc-search-facet-hidden"' : "";
      var $item = $(
        "<li" +
          hiddenAttr +
          ">" +
          '<label class="doc-search-facet-item">' +
          '<input type="checkbox" data-facet="' +
          field +
          '" data-value="' +
          escAttr(key) +
          '"' +
          checked +
          ">" +
          '<span class="doc-search-facet-item__label">' +
          escHtml(key) +
          "</span>" +
          '<span class="doc-search-facet-item__count">(' +
          counts[key] +
          ")</span>" +
          "</label>" +
          "</li>",
      );
      $container.append($item);
    });

    // "Show all" / "Show less" toggle
    if (keys.length > MAX_FACET_VISIBLE) {
      var $showAll = $(
        '<li><button type="button" class="doc-search-show-all" data-facet-container="' +
          containerId +
          '" data-total="' +
          keys.length +
          '" data-max="' +
          MAX_FACET_VISIBLE +
          '">' +
          "Show all (" +
          keys.length +
          ")" +
          "</button></li>",
      );
      $container.append($showAll);
    }
  }

  // ── Sort ────────────────────────────────────────────────────────────────────
  /**
   * Rebuilds allResults from originalResults according to currentSort.
   * "relevancy" restores the original API order. "date descending" / "date ascending"
   * sort on raw.resourceupdated using lexicographic comparison, which is correct for
   * the "YYYY-MM-DD HH:mm:ss" format.
   */
  function applySort() {
    if (currentSort === "relevancy") {
      allResults = originalResults.slice();
    } else if (
      currentSort === "alpha ascending" ||
      currentSort === "alpha descending"
    ) {
      allResults = originalResults.slice().sort(function (a, b) {
        var ta = (
          (a.raw || {}).resourcefriendlytitle ||
          a.title ||
          ""
        ).toLowerCase();
        var tb = (
          (b.raw || {}).resourcefriendlytitle ||
          b.title ||
          ""
        ).toLowerCase();
        return currentSort === "alpha ascending"
          ? ta.localeCompare(tb)
          : tb.localeCompare(ta);
      });
    } else {
      allResults = originalResults.slice().sort(function (a, b) {
        var da = (a.raw || {}).resourceupdated || "";
        var db = (b.raw || {}).resourceupdated || "";
        return currentSort === "date descending"
          ? db.localeCompare(da)
          : da.localeCompare(db);
      });
    }
  }

  // ── Apply filters ────────────────────────────────────────────────────────────
  /**
   * Filters allResults into filteredResults using the active facet Sets, then
   * renders page 1. Facets are ANDed across types; values within a facet are ORed.
   * An empty Set means no filter is applied for that facet (all values pass).
   */
  function applyFilters() {
    filteredResults = allResults.filter(function (r) {
      var raw = r.raw || {};
      if (
        activeTypeFilters.size > 0 &&
        !activeTypeFilters.has(raw.resourcedoctype)
      ) {
        return false;
      }
      if (
        activeCategoryFilters.size > 0 &&
        !activeCategoryFilters.has(raw.collectionname)
      ) {
        return false;
      }
      return true;
    });
    renderPage(1);
  }

  // ── Render a page ──────────────────────────────────────────────────────────
  /**
   * Slices filteredResults to the requested page, renders card or table rows,
   * then updates the summary line and pagination bar.
   * @param {number} page  1-based page number to display.
   */
  function renderPage(page) {
    currentPage = page;
    var perPage = resultsPerPage();
    var start = (page - 1) * perPage;
    var pageSlice = filteredResults.slice(start, start + perPage);

    if (isTableView()) {
      renderTableResults(pageSlice);
    } else {
      renderCardResults(pageSlice);
    }

    updateResultsSummary();
    renderPagination();
  }

  // ── Card results ─────────────────────────────────────────────────────────────
  /**
   * Renders a page slice as cloned .search-template <li> cards into
   * #doc-search-results-list. Collection row is shown only when both
   * raw.collectionname AND raw.collectionurl are present.
   * @param {Array} results  Slice of filteredResults for the current page.
   */
  function renderCardResults(results) {
    var $list = $("#doc-search-results-list");
    var $template = $(".search-template");

    $list.empty();

    results.forEach(function (result) {
      var raw = result.raw || {};
      var $item = $template
        .clone()
        .removeClass("search-template")
        .removeAttr("hidden");

      // Title + link
      var assetUrl = raw.asseturl || result.clickUri || "#";
      $item.find('[data-ref="search-result-link"]').attr("href", assetUrl);
      $item
        .find('[data-ref="search-result-title"]')
        .text(
          (raw.resourcefriendlytitle || result.title || "") +
            formatFileMeta(raw),
        );

      // External link icon
      var isExternal =
        assetUrl !== "#" && assetUrl.indexOf("internal.nt.gov.au") === -1;
      if (isExternal) {
        $item.find('[data-ref="search-result-extlink"]').removeAttr("hidden");
      }

      // Description
      $item
        .find('[data-ref="search-result-description"]')
        .text(raw.resourcedescription || result.excerpt || "");

      // Collection row
      var collectionName = raw.collectionname || "";
      var collectionUrl = raw.collectionurl || "";
      if (collectionName && collectionUrl) {
        $item
          .find('[data-ref="search-result-collection"]')
          .text(collectionName);
        $item
          .find('[data-ref="search-result-collection-link"]')
          .attr("href", collectionUrl);
      } else {
        $item
          .find('[data-ref="search-result-collection-row"]')
          .attr("hidden", true);
      }

      // Doctype tag
      $item
        .find('[data-ref="search-result-doctype"]')
        .text(raw.resourcedoctype || "");

      // Last updated
      $item
        .find('[data-ref="search-result-last-updated"]')
        .text(formatDate(raw.resourceupdated));

      $list.append($item);
    });
  }

  // ── Table results ─────────────────────────────────────────────────────────────
  /**
   * Renders a page slice as <tr> rows into #doc-search-table-body.
   * Collection cell: href = raw.collectionurl; text = raw.collectionname.
   * @param {Array} results  Slice of filteredResults for the current page.
   */
  function renderTableResults(results) {
    var $tbody = $("#doc-search-table-body");
    $tbody.empty();

    results.forEach(function (result) {
      var raw = result.raw || {};
      var assetUrl = raw.asseturl || result.clickUri || "#";
      var collectionName = raw.collectionname || "";
      var collectionUrl = raw.collectionurl || "#";
      var title =
        (raw.resourcefriendlytitle || result.title || "") + formatFileMeta(raw);
      var doctype = raw.resourcedoctype || "";
      var updated = formatDate(raw.resourceupdated);

      var isExternal =
        assetUrl !== "#" && assetUrl.indexOf("internal.nt.gov.au") === -1;
      var extIcon = isExternal
        ? ' <svg class="doc-search-result__ext-icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
        : "";

      var collectionCell = collectionName
        ? '<a class="doc-search-table__collection-link" href="' +
          escAttr(collectionUrl) +
          '">' +
          escHtml(collectionName) +
          "</a>"
        : "";

      var $row = $(
        "<tr>" +
          '<td class="doc-search-table__col-title">' +
          '<a class="doc-search-table__title-link" href="' +
          escAttr(assetUrl) +
          '">' +
          escHtml(title) +
          extIcon +
          "</a>" +
          "</td>" +
          '<td class="doc-search-table__col-updated doc-search-table__updated">' +
          escHtml(updated) +
          "</td>" +
          '<td class="doc-search-table__col-type">' +
          (doctype
            ? '<span class="doc-search-table__tag">' +
              escHtml(doctype) +
              "</span>"
            : "") +
          "</td>" +
          '<td class="doc-search-table__col-collection">' +
          collectionCell +
          "</td>" +
          "</tr>",
      );
      $tbody.append($row);
    });
  }

  // ── Results summary line ──────────────────────────────────────────────────────
  /**
   * Updates #doc-search-results-summary with "Showing X–Y of Z results" text,
   * or "No results found." when filteredResults is empty.
   */
  function updateResultsSummary() {
    var perPage = resultsPerPage();
    var total = filteredResults.length;
    var start = (currentPage - 1) * perPage + 1;
    var end = Math.min(currentPage * perPage, total);
    var $summary = $("#doc-search-results-summary");

    if (total === 0) {
      $summary.text("No results found.");
    } else {
      $summary.text(
        "Showing " +
          start +
          "–" +
          end +
          " of " +
          total +
          " result" +
          (total !== 1 ? "s" : ""),
      );
    }
  }

  // ── Pagination ──────────────────────────────────────────────────────────────
  /**
   * Rebuilds the #doc-search-pagination nav with Prev, numbered, and Next buttons.
   * Clears the nav and returns early when there is only one page.
   */
  function renderPagination() {
    var $nav = $("#doc-search-pagination");
    var perPage = resultsPerPage();
    var total = filteredResults.length;
    var pages = Math.ceil(total / perPage);

    $nav.empty();

    if (pages <= 1) return;

    // Previous
    var $prev = $(
      '<button type="button" class="doc-search-pagination__btn doc-search-pagination__btn--prev">' +
        "\u2039 Prev</button>",
    );
    if (currentPage === 1) $prev.prop("disabled", true);
    $prev.on("click", function () {
      renderPage(currentPage - 1);
    });
    $nav.append($prev);

    // Page numbers (with ellipsis)
    var pagesToShow = buildPageRange(currentPage, pages);
    pagesToShow.forEach(function (p) {
      if (p === "…") {
        $nav.append('<span class="doc-search-pagination__ellipsis">…</span>');
        return;
      }
      var cls =
        "doc-search-pagination__btn" +
        (p === currentPage ? " doc-search-pagination__btn--active" : "");
      var $btn = $(
        '<button type="button" class="' + cls + '">' + p + "</button>",
      );
      if (p !== currentPage) {
        $btn.on(
          "click",
          (function (pg) {
            return function () {
              renderPage(pg);
            };
          })(p),
        );
      }
      $nav.append($btn);
    });

    // Next
    var $next = $(
      '<button type="button" class="doc-search-pagination__btn doc-search-pagination__btn--next">' +
        "Next \u203a</button>",
    );
    if (currentPage === pages) $next.prop("disabled", true);
    $next.on("click", function () {
      renderPage(currentPage + 1);
    });
    $nav.append($next);
  }

  /**
   * Returns a mixed array of page numbers and "…" gap markers for the pagination bar.
   * Always includes page 1, the last page, and current ±1. Inserts "…" where the gap
   * is larger than one page. Returns a flat consecutive range when total ≤ 7.
   * @param {number} current  Active page (1-based).
   * @param {number} total    Total number of pages.
   * @returns {Array<number|string>}  e.g. [1, "…", 4, 5, 6, "…", 12]
   */
  function buildPageRange(current, total) {
    if (total <= 7) {
      return range(1, total);
    }
    var pages = [];
    pages.push(1);
    if (current > 3) pages.push("…");
    var lo = Math.max(2, current - 1);
    var hi = Math.min(total - 1, current + 1);
    for (var i = lo; i <= hi; i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
    return pages;
  }

  /**
   * Returns an inclusive array of sequential integers from `from` to `to`.
   * @param {number} from  Start value (inclusive).
   * @param {number} to    End value (inclusive).
   * @returns {number[]}
   */
  function range(from, to) {
    var arr = [];
    for (var i = from; i <= to; i++) arr.push(i);
    return arr;
  }

  // ── User message (error / no results) ────────────────────────────────────────
  /**
   * Sets the #doc-search-user-message text. Pass an empty string or omit `msg`
   * to clear any existing message.
   * @param {string} [msg]  Text to display (e.g. an error string or "No results found.").
   */
  function setUserMessage(msg) {
    $("#doc-search-user-message").text(msg || "");
  }

  // ── HTML helpers ─────────────────────────────────────────────────────────────
  /**
   * Encodes a plain string for safe insertion as HTML text content.
   * Uses jQuery's .text()/.html() round-trip to escape &, <, >, and related chars.
   * @param {string} str
   * @returns {string} HTML-escaped string.
   */
  function escHtml(str) {
    return $("<span>")
      .text(str || "")
      .html();
  }

  /**
   * Encodes a plain string for safe use inside an HTML attribute value.
   * Extends escHtml by additionally escaping `"` (&quot;) and `'` (&#39;).
   * @param {string} str
   * @returns {string} Attribute-safe escaped string.
   */
  function escAttr(str) {
    return $("<span>")
      .text(str || "")
      .html()
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ── Core search ──────────────────────────────────────────────────────────────
  /**
   * Fetches results from the Coveo API (or mock fixture in dev) for the given query,
   * then chains: applySort() → buildFilters() → applyFilters() to render page 1.
   * Existing filter/sort state is preserved across calls; clear activeTypeFilters and
   * activeCategoryFilters before calling if a clean filter slate is needed.
   * @param {string} query  Raw (unencoded) search term. Pass "" to return all documents.
   */
  function runSearch(query) {
    currentQuery = query;

    var $spinner = $("#initialLoadingSpinner");
    var $list = $("#doc-search-results-list");
    var $tbody = $("#doc-search-table-body");
    var $pag = $("#doc-search-pagination");
    var $summary = $("#doc-search-results-summary");

    $spinner.removeClass("d-none");
    $list.empty();
    $tbody.empty();
    $pag.empty();
    $summary.empty();
    setUserMessage("");

    var url = isDev ? MOCK_URL : buildCoveoUrl(query);

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Search request failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        $spinner.addClass("d-none");
        originalResults = data.results || [];
        applySort();

        if (allResults.length === 0) {
          setUserMessage(
            query
              ? 'No results found for "' + query + '".'
              : "No documents found.",
          );
          return;
        }

        buildFilters(allResults);
        applyFilters();
      })
      .catch(function (err) {
        $spinner.addClass("d-none");
        setUserMessage(
          "Search is currently unavailable. Please try again later.",
        );
        console.error("[coveo-search] Error:", err);
      });
  }

  // ── Mobile drawer ────────────────────────────────────────────────────────────

  /**
   * Populates the drawer's facet lists from the current allResults set,
   * mirroring the active sidebar filter state.
   */
  function buildDrawerFilters() {
    buildFacet(
      allResults,
      "resourcedoctype",
      "#doc-search-drawer-type-filters",
      activeTypeFilters,
    );
    buildFacet(
      allResults,
      "collectionname",
      "#doc-search-drawer-category-filters",
      activeCategoryFilters,
    );
    $('input[name="doc-search-drawer-sort"][value="' + currentSort + '"]').prop(
      "checked",
      true,
    );
  }

  /** Opens the mobile filter drawer. */
  function openDrawer() {
    buildDrawerFilters();
    $("#doc-search-drawer").addClass("is-open").attr("aria-hidden", "false");
    $("#doc-search-drawer-overlay")
      .addClass("is-open")
      .attr("aria-hidden", "false");
    $("#doc-search-mobile-filter-btn").attr("aria-expanded", "true");
    // Move focus into the drawer
    $("#doc-search-drawer-close").trigger("focus");
    // Prevent body scroll
    $("body").css("overflow", "hidden");
  }

  /** Closes the mobile filter drawer. */
  function closeDrawer() {
    $("#doc-search-drawer").removeClass("is-open").attr("aria-hidden", "true");
    $("#doc-search-drawer-overlay")
      .removeClass("is-open")
      .attr("aria-hidden", "true");
    $("#doc-search-mobile-filter-btn").attr("aria-expanded", "false");
    $("body").css("overflow", "");
    $("#doc-search-mobile-filter-btn").trigger("focus");
  }

  // Open drawer
  $(document).on("click", "#doc-search-mobile-filter-btn", openDrawer);

  // Close drawer via close button or overlay tap
  $(document).on(
    "click",
    "#doc-search-drawer-close, #doc-search-drawer-overlay",
    closeDrawer,
  );

  // Close drawer on Escape key
  $(document).on("keydown", function (e) {
    if (e.key === "Escape" && $("#doc-search-drawer").hasClass("is-open")) {
      closeDrawer();
    }
  });

  // Apply filters from drawer
  $(document).on("click", "#doc-search-drawer-apply", function () {
    // Read sort
    var drawerSort =
      $('input[name="doc-search-drawer-sort"]:checked').val() || "relevancy";
    currentSort = drawerSort;
    $('input[name="doc-search-sort"][value="' + drawerSort + '"]').prop(
      "checked",
      true,
    );

    // Rebuild filter sets from drawer checkboxes
    activeTypeFilters.clear();
    activeCategoryFilters.clear();
    $("#doc-search-drawer [data-facet]").each(function () {
      if ($(this).is(":checked")) {
        var field = $(this).data("facet");
        var value = $(this).data("value");
        if (field === "resourcedoctype") {
          activeTypeFilters.add(value);
        } else {
          activeCategoryFilters.add(value);
        }
      }
    });

    applySort();
    applyFilters();
    // Rebuild sidebar filters to reflect new checkbox state
    buildFilters(allResults);
    closeDrawer();
  });

  // Clear all filters inside drawer (resets UI without applying)
  $(document).on("click", "#doc-search-drawer-clear", function () {
    $("#doc-search-drawer [data-facet]").prop("checked", false);
    $('input[name="doc-search-drawer-sort"][value="relevancy"]').prop(
      "checked",
      true,
    );
  });

  // ── Event: checkbox filter change ────────────────────────────────────────────
  $(document).on("change", "[data-facet]", function () {
    var $cb = $(this);
    // Inside the drawer, changes are applied only via the "Apply filters" button
    if ($cb.closest("#doc-search-drawer").length) {
      return;
    }
    var field = $cb.data("facet");
    var value = $cb.data("value");
    var set =
      field === "resourcedoctype" ? activeTypeFilters : activeCategoryFilters;

    if ($cb.is(":checked")) {
      set.add(value);
    } else {
      set.delete(value);
    }
    applyFilters();
  });

  // ── Event: "Show all" / "Show less" facet toggle ───────────────────────────
  $(document).on("click", ".doc-search-show-all", function () {
    var $btn = $(this);
    var $ul = $btn.closest("ul");
    var isExpanded = $btn.data("expanded");
    var max = $btn.data("max");
    var total = $btn.data("total");

    if (!isExpanded) {
      // Expand — show all items
      $ul
        .find(".doc-search-facet-hidden")
        .removeClass("doc-search-facet-hidden");
      $btn.text("Show less");
      $btn.data("expanded", true);
    } else {
      // Collapse — re-hide items beyond max
      $ul
        .find("li")
        .not($btn.closest("li"))
        .each(function (i) {
          if (i >= max) {
            $(this).addClass("doc-search-facet-hidden");
          }
        });
      $btn.text("Show all (" + total + ")");
      $btn.data("expanded", false);
    }
  });

  // ── Event: Sort by expand/collapse ─────────────────────────────────────────
  $(document).on("click", ".doc-search-filter-group__toggle", function () {
    var $btn = $(this);
    $btn.attr(
      "aria-expanded",
      $btn.attr("aria-expanded") === "true" ? "false" : "true",
    );
  });

  // ── Event: sort change ───────────────────────────────────────────────────────
  $(document).on("change", 'input[name="doc-search-sort"]', function () {
    currentSort = $(this).val();
    applySort();
    applyFilters();
  });

  // ── Event: view toggle ───────────────────────────────────────────────────────
  $(document).on("click", "#doc-search-view-toggle", function () {
    var $btn = $(this);
    var $col = $("#doc-search-results-col");
    var tableNow = $col.attr("data-view") === "table";

    if (tableNow) {
      $col.attr("data-view", "card");
      $btn.attr("aria-pressed", "false");
    } else {
      $col.attr("data-view", "table");
      $btn.attr("aria-pressed", "true");
    }
    renderPage(1);
  });

  // ── Reset table view on mobile ────────────────────────────────────────────────
  // If the viewport drops to mobile width while table view is active, switch back
  // to card view so the hidden toggle doesn't leave a broken table-only state.
  (function () {
    var mq = window.matchMedia("(max-width: 900px)");
    function resetTableViewOnMobile(e) {
      if (
        e.matches &&
        $("#doc-search-results-col").attr("data-view") === "table"
      ) {
        $("#doc-search-results-col").attr("data-view", "card");
        $("#doc-search-view-toggle").attr("aria-pressed", "false");
        renderPage(currentPage);
      }
    }
    mq.addEventListener("change", resetTableViewOnMobile);
  })();

  // ── Init ─────────────────────────────────────────────────────────────────────
  $(document).ready(function () {
    // Read initial state from URL params
    var initialQuery = getUrlParam("searchterm") || "";
    var urlSort = getUrlParam("sort");

    if (urlSort) {
      currentSort = urlSort;
      $('input[name="doc-search-sort"][value="' + urlSort + '"]').prop(
        "checked",
        true,
      );
    }

    // Pre-fill search input if present
    $("#search").val(initialQuery);

    // Always load results on page load — independent of form presence
    runSearch(initialQuery);

    // Wire up the search form if it exists on this page
    var $form = $("#policy-search-form");
    if ($form.length) {
      $form.on("submit", function (e) {
        e.preventDefault();
        var query = $.trim($("#search").val());
        window.location.href =
          window.location.pathname + "?searchterm=" + encodeURIComponent(query);
      });
    }
  });
})(window.jQuery);
