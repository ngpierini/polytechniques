// Internal link integrity.
//
// Two failures this catches, both of which have already happened here.
//
// ORPHANS. hydrogel-mesh-size.html shipped linking out to four pages and
// linked to from one, the changelog. A page reachable only from a changelog
// entry is invisible to someone browsing and close to invisible to a crawler,
// and this site was turned down once for looking thin. The changelog does not
// count towards a page's inbound links precisely because every new page lands
// there automatically; it is the link that proves nothing.
//
// BROKEN LINKS. 40-odd hand-maintained pages cross-referencing each other, and
// a rename or a typo produces a 404 that nothing else here would notice.
//
// Redirect stubs (noindex, meta refresh) are neither counted as sources nor
// required to have inbound links: they exist to catch old URLs.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MIN_INBOUND = 2;
const MIN_OUTBOUND = 2;

// A page that is allowed to be reached only from the nav, because that is what
// it is for. Everything else has to earn a link from prose.
const NAV_ONLY = new Set([
  "index.html",          // the home page, linked from the logo everywhere
  "404.html",
  "privacy.html",
  "terms.html",
  "founder.html",
  "whats-new.html",
  "glossary.html",
  "diagnostics.html",
  "calc.html",
]);

// Links from here do not count as a page being wired into the site.
const WEAK_SOURCES = new Set(["whats-new.html", "404.html", "diagnostics.html"]);

function isNoindex(html) {
  return /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html) ||
    /<meta\s+http-equiv=["']refresh["']/i.test(html);
}

function main() {
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
  const html = {};
  files.forEach((f) => { html[f] = fs.readFileSync(path.join(ROOT, f), "utf8"); });

  const indexable = files.filter((f) => !isNoindex(html[f]));
  const exists = new Set(files);

  const inbound = {};
  const outbound = {};
  indexable.forEach((f) => { inbound[f] = new Set(); outbound[f] = new Set(); });

  const errors = [];
  const broken = [];

  files.forEach((from) => {
    const seen = new Set();
    const re = /href\s*=\s*["']([^"'#?]+\.html)(?:[#?][^"']*)?["']/gi;
    let m;
    while ((m = re.exec(html[from])) !== null) {
      const target = m[1].replace(/^\.\//, "");
      if (target.indexOf("/") !== -1 || /^https?:/i.test(target)) continue;
      if (!exists.has(target)) {
        const key = from + " -> " + target;
        if (!seen.has(key)) { seen.add(key); broken.push(key); }
        continue;
      }
      if (target === from) continue;
      if (inbound[target] && !WEAK_SOURCES.has(from)) inbound[target].add(from);
      if (outbound[from] && !NAV_ONLY.has(target)) outbound[from].add(target);
    }
  });

  broken.forEach((b) => {
    errors.push("broken internal link: " + b + " does not exist.");
  });

  indexable.forEach((f) => {
    if (NAV_ONLY.has(f)) return;
    // A page nobody can leave. Every tool here is one step of a longer job, so
    // the page that gives you a number should say what the next number is.
    const out = outbound[f].size;
    if (out < MIN_OUTBOUND) {
      errors.push('"' + f + '" links onward to ' + out + " other page" +
        (out === 1 ? "" : "s") + ". A tool page is a dead end below " +
        MIN_OUTBOUND + ": say where the reader goes next, in prose or a related-tools card.");
    }
    const n = inbound[f].size;
    if (n < MIN_INBOUND) {
      errors.push('"' + f + '" has ' + n + " inbound link" + (n === 1 ? "" : "s") +
        " from prose (" + (n ? [...inbound[f]].join(", ") : "none") + "). " +
        "Every tool or guide needs at least " + MIN_INBOUND +
        ", from pages where it actually belongs. Links from the changelog do not count, " +
        "because every new page lands there automatically.");
    }
  });

  if (errors.length) {
    console.error("internal links failed (" + errors.length + " issue" +
      (errors.length === 1 ? "" : "s") + "):\n");
    errors.forEach((e) => console.error("  - " + e));
    process.exit(1);
  }

  const tools = indexable.filter((f) => !NAV_ONLY.has(f));
  const inMin = Math.min.apply(null, tools.map((f) => inbound[f].size));
  const outMin = Math.min.apply(null, tools.map((f) => outbound[f].size));
  console.log("internal links OK - " + indexable.length + " indexable pages, no broken links, " +
    tools.length + " tool pages all at least " + MIN_INBOUND + " inbound (thinnest: " + inMin +
    ") and " + MIN_OUTBOUND + " outbound (thinnest: " + outMin + ").");
}

main();
