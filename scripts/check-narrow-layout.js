// Lints the two CSS patterns that made pages scroll sideways on a phone.
//
// Why this exists. A sweep of all 46 pages at a fixed viewport width - loading
// each into an iframe and comparing documentElement.scrollWidth against
// clientWidth - found two pages scrolling sideways at 375px and five at 320px.
// That sweep needs a browser and cannot run here. Both causes are visible in
// the stylesheet, so those can be.
//
// 1. A grid track minimum a column cannot shrink below.
//
//    repeat(auto-fit, minmax(340px, 1fr)) reads as "at least 340px", and that
//    is literal: in a 312px content area the column stays 340 and hangs off
//    the page. minmax(min(340px, 100%), 1fr) is the fix and is identical
//    whenever the container is wider than the minimum, so there is no reason
//    for a bare pixel minimum to exist.
//
// 2. Long chemical names with nothing to break at.
//
//    This site's content is polymer names, and plenty are a single token with
//    no space and no hyphen: Poly(bisbenzimidazobenzophenanthroline) renders
//    295px wide and will not wrap. The containers that hold them need
//    overflow-wrap, and three of them - the family entry name, its note, and
//    .fam-meta - are checked here by name because that is where the content
//    goes. Deliberately not a global rule: style.css turns overflow-wrap off
//    on purpose in two places (a stacked table label that snapped to
//    "TENDENC / Y", and the monospace paste box), so the pattern here is
//    per-container.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const errors = [];

// ---- 1. every grid minimum must be able to shrink ----------------------
// Matches minmax( <number>px , anything ) where the first argument is a bare
// length rather than a min()/clamp() that can collapse.
const BARE_MIN = /minmax\(\s*(\d+)px\s*,/g;
let gridsChecked = 0;
for (const file of fs.readdirSync(ROOT)) {
  if (!/\.(css|html)$/.test(file)) continue;
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  const lines = src.split(/\r?\n/);
  lines.forEach(function (line, i) {
    BARE_MIN.lastIndex = 0;
    let m;
    while ((m = BARE_MIN.exec(line))) {
      gridsChecked++;
      errors.push(file + ":" + (i + 1) + ": minmax(" + m[1] + "px, ...) cannot shrink below " +
        m[1] + "px, so it hangs off a narrower screen. Use minmax(min(" + m[1] + "px, 100%), ...).");
    }
  });
}
// Count the ones already written correctly, so the summary means something.
let wrapped = 0;
for (const file of fs.readdirSync(ROOT)) {
  if (!/\.(css|html)$/.test(file)) continue;
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  wrapped += (src.match(/minmax\(\s*min\(\s*\d+px\s*,\s*100%\s*\)/g) || []).length;
}

// ---- 2. the containers that hold polymer names -------------------------
// Each must allow a break inside a word, or a 39-character name sits outside
// its own card.
const CSS = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
const NEED_WRAP = [
  [".fam-entry h4", "the family entry heading, which IS the polymer name"],
  [".fam-entry p", "the curated note under it"],
  [".fam-meta", "the entry's metadata line"]
];
NEED_WRAP.forEach(function (pair) {
  const sel = pair[0];
  // find the rule block for this exact selector
  const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}");
  const m = re.exec(CSS);
  if (!m) {
    errors.push("could not find the rule for " + sel + " (" + pair[1] + ")");
    return;
  }
  if (!/overflow-wrap:\s*(break-word|anywhere)/.test(m[1])) {
    errors.push(sel + " no longer sets overflow-wrap, so a long polymer name " +
      "will sit outside its container (" + pair[1] + ").");
  }
});

if (errors.length) {
  console.error("Narrow-screen layout problems:\n");
  errors.forEach(function (e) { console.error("- " + e); });
  process.exit(1);
}
console.log("Narrow layout OK: " + wrapped + " grid minimums can shrink, " +
  NEED_WRAP.length + " name containers can break a long word.");
