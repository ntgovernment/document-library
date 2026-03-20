"use strict";
var fs = require("fs");
var h = fs.readFileSync("search-section-preview.html", "utf8");

// Extract all external URLs
var matches = h.match(/(?:href|src)="(https?:\/\/[^"]+)"/g) || [];
var unique = [];
matches.forEach(function (m) {
  if (unique.indexOf(m) === -1) unique.push(m);
});
console.log("All external URLs in search-section-preview.html:");
unique.forEach(function (u) {
  console.log(" ", u);
});

// Also check collection-page-preview.html
console.log("\nAll external URLs in collection-page-preview.html:");
var c = fs.readFileSync("collection-page-preview.html", "utf8");
var cm = c.match(/(?:href|src)="(https?:\/\/[^"]+)"/g) || [];
var cu = [];
cm.forEach(function (m) {
  if (cu.indexOf(m) === -1) cu.push(m);
});
cu.forEach(function (u) {
  console.log(" ", u);
});
