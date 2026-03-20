"use strict";
var fs = require("fs");
var h = fs.readFileSync("search-section-preview.html", "utf8");

var gtmIdx = h.indexOf("googletagmanager.com");
// Find start of GTM block (look for <script before it)
var scriptBefore = h.lastIndexOf("<script", gtmIdx);
console.log("GTM block start context:");
console.log(JSON.stringify(h.slice(scriptBefore - 5, gtmIdx + 300)));

// Show main.css context
var mainIdx = h.indexOf("_design/css/main.css");
console.log("\nmain.css full line:");
console.log(JSON.stringify(h.slice(mainIdx - 100, mainIdx + 80)));

// Show roboto context
var robIdx = h.indexOf("roboto.css");
console.log("\nroboto.css full line:");
console.log(JSON.stringify(h.slice(robIdx - 100, robIdx + 80)));

// Show status-toolbar.css context
var stIdx = h.indexOf("status-toolbar.css");
console.log("\nstatus-toolbar.css full line:");
console.log(JSON.stringify(h.slice(stIdx - 60, stIdx + 80)));
