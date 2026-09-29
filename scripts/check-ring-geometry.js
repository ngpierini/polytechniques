// Checks that every ring template the canvas can stamp is drawn with the same
// bond length.
//
// Why this exists. The ring tool is generic over the ring size: each toolbar
// button carries a data-ring-n and the editor stamps a regular n-gon. But the
// circumradius was written as BOND_LEN * 0.72, a constant, which is the right
// radius for a hexagon and for nothing else. So benzene and cyclohexane were
// correct and every other button was wrong, by the ratio sin(30 deg)/sin(180/n):
// a cyclopropane came out with bonds 73% too long, a cyclooctane 23% too short.
// Measured on the real canvas before the fix, a stamped cyclopropane and a
// stamped benzene had the same bounding box, 55px wide, which is the tell.
//
// This shipped in the page's first commit and survived every existing check,
// because all of them look at structure - formula, valence, ring count,
// identity hash - and a ring with stretched bonds has exactly the right
// structure. It is only wrong on screen. Same lesson as the bracket bars in
// check-bracket-geometry.js: found by eye once, then pinned here so it cannot
// come back.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = fs.readFileSync(path.join(ROOT, "polymer-search.js"), "utf8");
const HTML = fs.readFileSync(path.join(ROOT, "polymer-search.html"), "utf8");

const errors = [];

// ---- 1. Pull the real helper out of the editor and run it ----------------
// Evaluating the shipped source, rather than restating the formula here, is
// the point: a copy in this file would drift and still pass.
const bondMatch = SRC.match(/var BOND_LEN = ([\d.]+);/);
const fnMatch = SRC.match(/function ringRadius\(n\) \{\s*return ([^;]+);\s*\}/);

if (!bondMatch) errors.push("could not find BOND_LEN in polymer-search.js");
if (!fnMatch) errors.push("could not find a single-expression ringRadius(n) in polymer-search.js");

if (bondMatch && fnMatch) {
  const BOND_LEN = parseFloat(bondMatch[1]);
  const ringRadius = new Function("BOND_LEN", "n", "return " + fnMatch[1] + ";")
    .bind(null, BOND_LEN);

  const SIZES = [3, 4, 5, 6, 7, 8];
  const side = (n) => 2 * ringRadius(n) * Math.sin(Math.PI / n);

  // Every ring's bonds must be as long as the hexagon's, which is the size the
  // rest of the drawing is proportioned around.
  const want = side(6);
  SIZES.forEach(function (n) {
    const got = side(n);
    if (Math.abs(got - want) > 1e-9) {
      errors.push("ring n=" + n + " has bond length " + got.toFixed(4) +
        ", but the hexagon's is " + want.toFixed(4) +
        " (ratio " + (got / want).toFixed(3) + ")");
    }
  });

  // The hexagon is the reference, and its radius is what the worked examples
  // (polystyrene's phenyl) and the bracket bounds were laid out against, so it
  // must not move even slightly.
  const hexWas = BOND_LEN * 0.72;
  if (Math.abs(ringRadius(6) - hexWas) > 1e-9) {
    errors.push("the hexagon radius moved: expected " + hexWas +
      ", got " + ringRadius(6) + " (this shifts the polystyrene worked example)");
  }

  // A bigger ring is a bigger ring. Cheap, but it would have caught an
  // inverted sine.
  for (let i = 1; i < SIZES.length; i++) {
    if (!(ringRadius(SIZES[i]) > ringRadius(SIZES[i - 1]))) {
      errors.push("ringRadius is not increasing in n at n=" + SIZES[i]);
    }
  }
}

// ---- 2. No second source of truth for the radius -------------------------
// The actual regression: someone re-inlines a constant radius at a new call
// site and only that one ring size is wrong again.
const stray = [];
SRC.split(/\r?\n/).forEach(function (line, i) {
  if (!/BOND_LEN\s*\*\s*0\.72/.test(line)) return;
  if (/function ringRadius|return \(BOND_LEN \* 0\.72\) \//.test(line)) return;
  if (/^\s*\/\//.test(line)) return;                  // a comment explaining it
  stray.push("  polymer-search.js:" + (i + 1) + ": " + line.trim());
});
if (stray.length) {
  errors.push("a ring radius is hardcoded outside ringRadius(), so that size " +
    "will be drawn with the wrong bond length:\n" + stray.join("\n"));
}

// ---- 3. Every toolbar button asks for a size the helper handles -----------
const buttons = HTML.match(/data-ring-n="(\d+)"/g) || [];
if (!buttons.length) errors.push("no ring buttons found in polymer-search.html");
buttons.forEach(function (b) {
  const n = parseInt(b.match(/\d+/)[0], 10);
  if (n < 3 || n > 8) {
    errors.push("a ring button asks for n=" + n + ", outside the checked range 3-8");
  }
});

if (errors.length) {
  console.error("Ring geometry problems:\n");
  errors.forEach(function (e) { console.error("- " + e); });
  process.exit(1);
}
console.log("Ring geometry OK: " + buttons.length + " ring buttons, sizes 3-8 " +
  "all stamped with the hexagon's bond length.");
