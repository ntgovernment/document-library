/**
 * coveo-search.js — DCDD Document Search: Coveo REST API integration
 *
 * Fetches results from the Coveo Search REST API (production) or local mock
 * data (dev), then renders them into the page using the .search-template clone
 * pattern. Supports card/table view toggle, client-side Type + Category filters,
 * sort-by (re-fetches from Coveo), and paginated results.
 *
 * Dev detection: hostname is localhost or 127.0.0.1
 * Mock data:     /src/mock/coveo-search-rest-api-query.json
 * Production:    https://search-internal.nt.gov.au/Coveo/rest?...&q=QUERY
 *
 * Dependencies (loaded separately by the Matrix paint layout or preview page):
 *   - jQuery (window.$)
 *   - moment.js (optional — dates fall back to raw string if unavailable)
 */

(function ($) {
  "use strict";

  // ── Environment ──────────────────────────────────────────────────────────────
  var isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  var COVEO_BASE_URL = "https://search-internal.nt.gov.au/Coveo/rest";
  var MOCK_URL = "/src/mock/coveo-search-rest-api-query.json";

  var RESULTS_PER_PAGE_CARD = 10;
  var RESULTS_PER_PAGE_TABLE = 15;
  var MAX_FACET_VISIBLE = 5;

  // ── Module state ─────────────────────────────────────────────────────────────
  var allResults = [];
  var filteredResults = [];
  var currentPage = 1;
  var activeTypeFilters = new Set();
  var activeCategoryFilters = new Set();
  var currentSort = "relevancy";
  var currentQuery = "";

  // ── URL builder ──────────────────────────────────────────────────────────────
  function buildCoveoUrl(query, sort) {
    var params = new URLSearchParams({
      enableDidYouMean: "true",
      partialMatch: "true",
      partialMatchKeywords: "2",
      partialMatchThreshold: "2",
      scope: "28319",
      numberOfResults: "1000",
      SortCriteria: sort || "relevancy",
      maximumAge: "1",
      q: query,
    });
    return COVEO_BASE_URL + "?" + params.toString();
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
      var collectionName = raw.resourcecollectionname || "";
      var collectionUrl = raw.collectionurl || "#";
      if (collectionName) {
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

    var url = isDev ? MOCK_URL : buildCoveoUrl(query, currentSort);

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Search request failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        $spinner.addClass("d-none");
        allResults = data.results || [];

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
    // Re-fetch with new sort; clear active filters so they get rebuilt
    activeTypeFilters.clear();
    activeCategoryFilters.clear();
    runSearch(currentQuery);
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
    var initialQuery = getUrlParam("query") || "";
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
        activeTypeFilters.clear();
        activeCategoryFilters.clear();
        runSearch(query);
      });
    }
  });
})(window.jQuery);
