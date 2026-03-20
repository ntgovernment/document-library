"use strict";
var fs = require("fs");

// Verify index.html
var idx = fs.readFileSync("index.html", "utf8");
console.log("=== index.html verification ===");
console.log("Title:", idx.match(/<title>[^<]*<\/title>/)[0]);
console.log("Has GTM:", idx.includes("googletagmanager.com"));
console.log(
  "Has NTG main.css CDN:",
  idx.includes("internal.nt.gov.au/dcdd/_design/css/main.css"),
);
console.log("Local main.css:", idx.includes("./src/css/main.css"));
console.log(
  "Local vendor jQuery:",
  idx.includes("./src/vendor/js/jquery-3.4.1.min.js"),
);
console.log("Local auds.js:", idx.includes("./src/vendor/js/auds.js"));
console.log("Local components.js:", idx.includes("./src/js/components.js"));
console.log("dist/search-page.js:", idx.includes("./dist/search-page.js"));
console.log("dist/search-page.css:", idx.includes("./dist/search-page.css"));
console.log("Has policy-search-form:", idx.includes("policy-search-form"));
console.log("Length:", idx.length);

// Verify a collection page
var coll = fs.readFileSync("collection/gifts-and-benefits.html", "utf8");
console.log("\n=== collection/gifts-and-benefits.html verification ===");
console.log("Title:", coll.match(/<title>[^<]*<\/title>/)[0]);
console.log(
  "Has ../dist/collection-page.css:",
  coll.includes("../dist/collection-page.css"),
);
console.log(
  "Has ../dist/collection-page.js:",
  coll.includes("../dist/collection-page.js"),
);
console.log("Has ../src/css/main.css:", coll.includes("../src/css/main.css"));
console.log(
  "Has ../src/vendor/js/jquery:",
  coll.includes("../src/vendor/js/jquery-3.4.1.min.js"),
);
console.log("Has back-to-search link:", coll.includes("back-to-search"));
console.log("back href attribute:", coll.includes('href="../index.html"'));
console.log("history.back():", coll.includes("history.back()"));
console.log(
  "Has h2 collection name:",
  coll.includes("<h2>Gifts and benefits</h2>"),
);
console.log(
  "Has policy-documents section:",
  coll.includes('class="policy-documents"'),
);
console.log(
  "Has related-policies section:",
  coll.includes('class="related-policies"'),
);
console.log(
  "Related links use slug.html:",
  coll.includes('href="work-health-and-safety.html"'),
);
console.log(
  "Has old NTG CDN for main.css:",
  coll.includes("internal.nt.gov.au/dcdd/_design/css/main.css"),
);
console.log("Length:", coll.length);

// List collection directory
console.log("\n=== collection/ directory ===");
fs.readdirSync("collection").forEach(function (f) {
  console.log(" ", f);
});

// List dist directory
console.log("\n=== dist/ files ===");
fs.readdirSync("dist").forEach(function (f) {
  console.log(" ", f);
});
