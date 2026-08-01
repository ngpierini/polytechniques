// The sitemap is hand-maintained, so it drifts: dispersity-predictor.html, one
// of the main tools, was missing from it for an unknown length of time, and so
// was privacy.html the day it was added. Neither was going to be noticed by
// eye. This makes the drift a build failure instead.
//
// The rule is simply: every page that is meant to be indexed should be listed
// exactly once, and nothing else should be. A page opts out by carrying
// <meta name="robots" content="noindex">, which is how the redirect stubs, the
// 404, the diagnostics self-test and the terms page already exclude
// themselves - so the sitemap follows the pages rather than a second list that
// would drift in its own right.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://getpolytechniques.com/";
const errors = [];

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).sort();
const indexable = pages.filter(f => {
  if (f === "index.html") return false;   // redirect stub to home.html
  return !/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(
    fs.readFileSync(path.join(ROOT, f), "utf8"));
});

const xml = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());

// listed but not indexable, or not a real file
locs.forEach(loc => {
  if (loc.indexOf(SITE) !== 0) {
    errors.push('sitemap entry does not start with ' + SITE + ': ' + loc);
    return;
  }
  const file = loc.slice(SITE.length);
  if (!pages.includes(file)) {
    errors.push("sitemap lists " + file + ", which is not a page in the repo");
  } else if (!indexable.includes(file)) {
    errors.push("sitemap lists " + file + ", which is marked noindex");
  }
});

// indexable but not listed
indexable.forEach(f => {
  if (!locs.includes(SITE + f)) errors.push(f + " is indexable but missing from the sitemap");
});

// listed twice
const seen = {};
locs.forEach(l => {
  seen[l] = (seen[l] || 0) + 1;
  if (seen[l] === 2) errors.push("sitemap lists " + l + " more than once");
});

// a canonical is what tells a crawler which URL is authoritative; a page in the
// sitemap without one invites the .html and pretty-URL forms to compete
indexable.forEach(f => {
  const s = fs.readFileSync(path.join(ROOT, f), "utf8");
  if (!/rel=["']canonical["']/i.test(s)) errors.push(f + " is indexable but has no rel=canonical");
});

if (errors.length) {
  console.error("sitemap.xml failed its check (" + errors.length + " issue" + (errors.length > 1 ? "s" : "") + "):\n");
  errors.forEach(e => console.error("  - " + e));
  process.exit(1);
}
console.log("sitemap.xml OK - " + locs.length + " entries, matching all " + indexable.length + " indexable pages.");
