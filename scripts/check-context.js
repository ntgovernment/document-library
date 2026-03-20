"use strict";
var fs = require("fs");
var h = fs.readFileSync("search-section-preview.html", "utf8");

// Show context around fontawesome-compiled.css
var faCompIdx = h.indexOf("fontawesome-compiled.css");
console.log("=== fontawesome-compiled.css context ===");
console.log(JSON.stringify(h.slice(faCompIdx - 200, faCompIdx + 100)));

// Show context around GTM/GA
var gtmIdx = h.indexOf("googletagmanager.com");
console.log("\n=== GTM context ===");
console.log(JSON.stringify(h.slice(gtmIdx - 20, gtmIdx + 300)));

// Show the FA Pro multiline link
var faProIdx = h.indexOf("pro.fontawesome.com");
console.log("\n=== FA Pro CDN context ===");
console.log(JSON.stringify(h.slice(faProIdx - 20, faProIdx + 250)));

// Show the main.css line
var mainIdx = h.indexOf("https://internal.nt.gov.au/dcdd/_design/css/main.css");
console.log("\n=== main.css context ===");
console.log(JSON.stringify(h.slice(mainIdx - 5, mainIdx + 60)));
