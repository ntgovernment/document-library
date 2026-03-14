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
 * result.raw.resourcecollectionname   — "Category" facet value
 * result.raw.collectionurl            — collection browse URL
 * result.raw.resourceupdated          — last-updated date (YYYY-MM-DD HH:mm:ss)
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
 *   #doc-search-sort-select       <select>; values: relevancy | newest | oldest
 *   #doc-search-view-toggle       button; aria-pressed="true" = table view active
 *   #doc-search-type-filters      <ul> receives Type facet checkboxes
 *   #doc-search-category-filters  <ul> receives Category facet checkboxes
 *   #doc-search-user-message      receives error / no-results message strings
 *   .search-template[hidden]      card template element, cloned per result
 *
 * Card template data-ref slots (inside .search-template):
 *   [data-ref="search-result-link"]            <a> href = asseturl
 *   [data-ref="search-result-title"]           document title text
 *   [data-ref="search-result-extlink"]         external-link icon (hidden unless external)
 *   [data-ref="search-result-description"]     description / excerpt text
 *   [data-ref="search-result-collection-row"]  entire row hidden when no collection
 *   [data-ref="search-result-collection"]      collection name text
 *   [data-ref="search-result-collection-link"] <a> href = collectionurl
 *   [data-ref="search-result-doctype"]         doctype badge text
 *   [data-ref="search-result-last-updated"]    formatted last-updated date
 *
 * ── URL PARAMETERS READ ON INIT ──────────────────────────────────────────────
 *   ?searchterm=<string>  pre-fills #search and immediately runs a search
 *   ?sort=<string>        sets initial sort (relevancy | newest | oldest)
 *
 * ── SEARCH FLOW ──────────────────────────────────────────────────────────────
 * On form submit: the handler redirects to
 *   window.location.pathname + "?searchterm=" + encodeURIComponent(query)
 * This triggers a fresh page load, which then reads ?searchterm= above.
 * runSearch() is therefore always driven by the URL parameter, never called
 * directly from the submit handler.
 *
 * ── KEY CONSTANTS ────────────────────────────────────────────────────────────
 *   RESULTS_PER_PAGE_CARD   10  — cards shown per page
 *   RESULTS_PER_PAGE_TABLE  15  — rows shown per page in table view
 *   MAX_FACET_VISIBLE        5  — facet items visible before "Show all"
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
  var MAX_FACET_VISIBLE = 5;

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
  function buildCoveoUrl(query) {
    return COVEO_BASE_URL + "?searchterm=" + encodeURIComponent(query);
  }

  function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // ── Date formatting ──────────────────────────────────────────────────────────
  function formatDate(dateStr) {
    if (window.moment && dateStr) {
      return window
        .moment(dateStr, "YYYY-MM-DD HH:mm:ss")
        .format("D MMMM YYYY");
    }
    return dateStr || "";
  }

  // ── View helpers ─────────────────────────────────────────────────────────────
  function isTableView() {
    return $("#doc-search-results-col").attr("data-view") === "table";
  }

  function resultsPerPage() {
    return isTableView() ? RESULTS_PER_PAGE_TABLE : RESULTS_PER_PAGE_CARD;
  }

  // ── Filter building ──────────────────────────────────────────────────────────
  function buildFilters(results) {
    buildFacet(
      results,
      "resourcedoctype",
      "#doc-search-type-filters",
      activeTypeFilters,
    );
    buildFacet(
      results,
      "resourcecollectionname",
      "#doc-search-category-filters",
      activeCategoryFilters,
    );
  }

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

    // "Show all" toggle
    if (keys.length > MAX_FACET_VISIBLE) {
      var remaining = keys.length - MAX_FACET_VISIBLE;
      var $showAll = $(
        '<li><button type="button" class="doc-search-show-all" data-facet-container="' +
          containerId +
          '">' +
          "Show all (" +
          keys.length +
          ")" +
          "</button></li>",
      );
      $container.append($showAll);
    }
  }

  // ── Sort ─────────────────────────────────────────────────────────────────────
  function applySort() {
    if (currentSort === "relevancy") {
      allResults = originalResults.slice();
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
        !activeCategoryFilters.has(raw.resourcecollectionname)
      ) {
        return false;
      }
      return true;
    });
    renderPage(1);
  }

  // ── Render a page ────────────────────────────────────────────────────────────
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
        .text(raw.resourcefriendlytitle || result.title || "");

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
      var collectionAssetId = raw.collectionassetid || "";
      if (collectionAssetId) {
        $item
          .find('[data-ref="search-result-collection"]')
          .text("%globals_asset_name:" + collectionAssetId + "%");
        $item
          .find('[data-ref="search-result-collection-link"]')
          .attr("href", "./?a=" + collectionAssetId);
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
  function renderTableResults(results) {
    var $tbody = $("#doc-search-table-body");
    $tbody.empty();

    results.forEach(function (result) {
      var raw = result.raw || {};
      var assetUrl = raw.asseturl || result.clickUri || "#";
      var collectionName = raw.resourcecollectionname || "";
      var collectionUrl = raw.collectionurl || "#";
      var title = raw.resourcefriendlytitle || result.title || "";
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

  // ── Pagination ────────────────────────────────────────────────────────────────
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

  function range(from, to) {
    var arr = [];
    for (var i = from; i <= to; i++) arr.push(i);
    return arr;
  }

  // ── User message (error / no results) ────────────────────────────────────────
  function setUserMessage(msg) {
    $("#doc-search-user-message").text(msg || "");
  }

  // ── HTML helpers ─────────────────────────────────────────────────────────────
  function escHtml(str) {
    return $("<span>")
      .text(str || "")
      .html();
  }

  function escAttr(str) {
    return $("<span>")
      .text(str || "")
      .html()
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ── Core search ──────────────────────────────────────────────────────────────
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

  // ── Event: checkbox filter change ────────────────────────────────────────────
  $(document).on("change", "[data-facet]", function () {
    var $cb = $(this);
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

  // ── Event: "Show all" facet toggle ───────────────────────────────────────────
  $(document).on("click", ".doc-search-show-all", function () {
    var $btn = $(this);
    var $list = $btn.closest("ul");
    $list
      .find(".doc-search-facet-hidden")
      .removeClass("doc-search-facet-hidden");
    $btn.closest("li").remove();
  });

  // ── Event: sort change ───────────────────────────────────────────────────────
  $(document).on("change", "#doc-search-sort-select", function () {
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

  // ── Init ─────────────────────────────────────────────────────────────────────
  $(document).ready(function () {
    // Read initial state from URL params
    var initialQuery = getUrlParam("searchterm") || "";
    var urlSort = getUrlParam("sort");

    if (urlSort) {
      currentSort = urlSort;
      $("#doc-search-sort-select").val(urlSort);
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
