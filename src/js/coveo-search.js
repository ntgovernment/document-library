/**
 * coveo-search.js — DCDD Document Search: Coveo REST API integration
 *
 * Fetches results from the Coveo Search REST API (production) or local mock
 * data (dev), then renders them into the page using the .search-template clone
 * pattern.
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

  // ── URL builder ──────────────────────────────────────────────────────────────
  function buildCoveoUrl(query) {
    var params = new URLSearchParams({
      enableDidYouMean: "true",
      partialMatch: "true",
      partialMatchKeywords: "2",
      partialMatchThreshold: "2",
      scope: "28319",
      numberOfResults: "1000",
      SortCriteria: getUrlParam("sort") || "relevancy",
      maximumAge: "1",
      q: query,
    });
    return COVEO_BASE_URL + "?" + params.toString();
  }

  function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // ── Icon mapping ─────────────────────────────────────────────────────────────
  var ICON_MAP = {
    pdf_file: "fa-file-pdf",
    word: "fa-file-word",
    spreadsheet: "fa-file-excel",
    html: "fa-file-alt",
  };

  function iconClassFor(resourceType) {
    return "fal " + (ICON_MAP[resourceType] || "fa-file-alt");
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

  // ── Result rendering ─────────────────────────────────────────────────────────
  function renderResults(results) {
    var $list = $("#search-results-list");
    var $template = $(".search-template");

    $list.empty();

    if (!results || results.length === 0) {
      return;
    }

    results.forEach(function (result) {
      var raw = result.raw || {};
      var $item = $template.clone().removeClass("search-template");

      // Title
      $item
        .find('[data-ref="search-result-title"]')
        .text(raw.resourcefriendlytitle || result.title || "");

      // Icon
      $item
        .find('[data-ref="search-result-icon"]')
        .attr(
          "class",
          iconClassFor(raw.resourcetype) + " ntgc-search-listing__icon-fa",
        );

      // Description
      $item
        .find('[data-ref="search-result-description"]')
        .text(raw.resourcedescription || result.excerpt || "");

      // Doctype tag
      if (raw.resourcedoctype) {
        $item
          .find('[data-ref="search-result-doctype"]')
          .html(
            '<span class="ntgc-tag ntgc-tag--secondary">' +
              $("<span>").text(raw.resourcedoctype).html() +
              "</span>",
          );
      }

      // Asset URL (Download button + Open link)
      var assetUrl = raw.asseturl || result.clickUri || "#";
      $item.find('[data-ref="search-result-assetURL"]').attr("href", assetUrl);
      $item
        .find('[data-ref="search-result-assetURL-open"]')
        .attr("href", assetUrl);

      // Collection URL (Show more link)
      var collectionUrl = raw.collectionurl || "#";
      $item
        .find('[data-ref="search-result-collectionURL"]')
        .attr("href", collectionUrl);

      // File size
      $item
        .find('[data-ref="search-result-filesize"]')
        .text(raw.resourcefilesize || "");

      // Last updated
      $item
        .find('[data-ref="search-result-last-updated"]')
        .text(formatDate(raw.resourceupdated));

      $item.removeAttr("hidden").css("display", "");
      $list.append($item);
    });
  }

  // ── User message ─────────────────────────────────────────────────────────────
  function setUserMessage(totalCount, query) {
    var $msg = $(".search-user-message");
    if (totalCount === 0) {
      $msg.text(
        query ? 'No results found for "' + query + '".' : "No documents found.",
      );
    } else {
      $msg.text(
        totalCount +
          " document" +
          (totalCount !== 1 ? "s" : "") +
          (query ? ' matching "' + query + '"' : "") +
          " found.",
      );
    }
  }

  // ── Core search ──────────────────────────────────────────────────────────────
  function runSearch(query) {
    var $spinner = $("#initialLoadingSpinner");
    var $list = $("#search-results-list");
    var $msg = $(".search-user-message");

    $spinner.removeClass("d-none").show();
    $list.empty();
    $msg.empty();

    var url = isDev ? MOCK_URL : buildCoveoUrl(query);

    fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Search request failed: " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        $spinner.hide();
        var results = data.results || [];
        var total = data.totalCount != null ? data.totalCount : results.length;
        renderResults(results);
        setUserMessage(total, query);
      })
      .catch(function (err) {
        $spinner.hide();
        $msg.text("Search is currently unavailable. Please try again later.");
        console.error("[coveo-search] Error:", err);
      });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  $(document).ready(function () {
    var $form = $("#policy-search-form");
    if (!$form.length) return;

    // Run initial search (empty query shows all results, matching Matrix page behaviour)
    var initialQuery = getUrlParam("query") || "";
    $("#search").val(initialQuery);
    runSearch(initialQuery);

    // Handle form submit
    $form.on("submit", function (e) {
      e.preventDefault();
      var query = $.trim($("#search").val());
      runSearch(query);
    });
  });
})(window.jQuery);
