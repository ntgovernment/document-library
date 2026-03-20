"use strict";
var fs = require("fs");

// Check collection-page-preview.html
var h = fs.readFileSync("collection-page-preview.html", "utf8");
var titleMatch = h.match(/<title>[^<]*<\/title>/);
console.log("=== collection-page-preview.html ===");
console.log("title:", titleMatch ? titleMatch[0] : "NOT FOUND");
console.log(
  "content div idx:",
  h.indexOf('<div id="content" class="ntgc-body">'),
);
console.log("footer marker idx:", h.indexOf("<!--coveo_no_index_start_90-->"));
console.log("dist collection css:", h.indexOf("./dist/collection-page.css"));
console.log("dist collection js:", h.indexOf("./dist/collection-page.js"));
console.log("total len:", h.length);

// Check search-section-preview.html
var s = fs.readFileSync("search-section-preview.html", "utf8");
var sTitle = s.match(/<title>[^<]*<\/title>/);
console.log("\n=== search-section-preview.html ===");
console.log("title:", sTitle ? sTitle[0] : "NOT FOUND");
console.log("FA Pro CDN idx:", s.indexOf("pro.fontawesome.com"));
var faIdx = s.indexOf("pro.fontawesome.com");
if (faIdx > -1) {
  console.log("FA context:", JSON.stringify(s.slice(faIdx - 50, faIdx + 250)));
}
console.log("dist search css:", s.indexOf("./dist/search-page.css"));
console.log("dist search js:", s.indexOf("./dist/search-page.js"));
console.log("total len:", s.length);

// Check NTG CDN URLs present
var ntgUrls = [
  "https://use.typekit.net/yht7rxj.css",
  "https://internal.nt.gov.au/cdn/fonts/roboto/roboto.css",
  "https://internal.nt.gov.au/dcdd/_design/css/main.css",
  "status-toolbar.css",
  "jquery-3.4.1.min.js",
  "imageslider-fotorama.css",
  "imageslider-fotorama.js",
  "auds.js",
  "ntg-central-update-user-profile.js",
  "components.js",
  "global-v2.js",
  "profile-menu.js",
  "status-toolbar.js",
];
console.log("\n=== NTG CDN URLs in search-section-preview.html ===");
ntgUrls.forEach(function (url) {
  var idx = s.indexOf(url);
  if (idx > -1) {
    console.log("FOUND:", url.split("/").pop(), "@", idx);
  } else {
    console.log("NOT FOUND:", url.split("/").pop());
  }
});
