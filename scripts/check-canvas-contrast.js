// Checks that the structure canvas draws element labels legibly on both themes.
//
// Why this exists. The canvas paints element symbols itself, in its own
// palette, so none of the site's CSS governs them and nothing in a stylesheet
// review would ever look at them. Two things had gone wrong and neither was
// visible to any existing check:
//
//   - Elements missing from the palette fell back to a hardcoded #111, which
//     on the dark card (#1f1e24) is 1.14:1. Everything reachable from the
//     periodic table but absent from the table hit it - Sn, Na, Zn, Al, Li.
//     The label was painted and could not be read.
//   - The palette itself was one fixed set of colours serving two
//     backgrounds, so every entry failed 4.5:1 on one of them. Sulfur yellow
//     measured 1.92:1 on white, which is the default theme.
//
// These are 15px bold glyphs, below the 18.66px that the 3:1 large-text
// allowance needs, so the bar is 4.5:1. And the colour is not redundant
// decoration: the coloured glyph is the text being read.
//
// Same lesson as check-ring-geometry.js - found by measuring pixels once,
// then pinned here.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = fs.readFileSync(path.join(ROOT, "polymer-search.js"), "utf8");
const CSS = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");

const MIN = 4.5;
const errors = [];

function rgbOf(hex) {
  let h = String(hex).trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminance(rgb) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}
function contrast(a, b) {
  const hi = Math.max(a, b), lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

// ---- the two backgrounds, taken from the stylesheet ----------------------
// The explicit data-theme blocks, not the media query, because those are what
// the toggle sets and so what a reader actually gets.
function cardBg(selector) {
  const head = ":root[data-theme=" + JSON.stringify(selector) + "]";
  const at = CSS.indexOf(head);
  if (at === -1) return null;
  const open = CSS.indexOf("{", at), close = CSS.indexOf("}", open);
  if (open === -1 || close === -1) return null;
  const block = [null, CSS.slice(open + 1, close)];
  if (!block) return null;
  const m = /--card-bg:\s*([^;]+);/.exec(block[1]);
  return m ? m[1].trim() : null;
}
const BG = { light: cardBg("light"), dark: cardBg("dark") };
Object.keys(BG).forEach(function (k) {
  if (!BG[k] || !rgbOf(BG[k])) errors.push("could not read --card-bg for the " + k + " theme from style.css");
});

// ---- the palettes, taken from the shipped source ------------------------
// Parsed rather than restated, so a copy in this file cannot drift.
function palette(which) {
  const re = which === "dark"
    ? /var colors = dark\s*\r?\n\s*\?\s*\{([^}]*)\}/
    : /var colors = dark[\s\S]{0,400}?:\s*\{([^}]*)\}/;
  const m = re.exec(SRC);
  if (!m) return null;
  const out = {};
  m[1].replace(/([A-Za-z][A-Za-z0-9]*)\s*:\s*'(#[0-9a-fA-F]{3,6})'/g, function (_, el, hex) {
    out[el] = hex; return "";
  });
  return Object.keys(out).length ? out : null;
}
const PAL = { light: palette("light"), dark: palette("dark") };

if (!PAL.light || !PAL.dark) {
  errors.push("could not parse both element palettes out of polymer-search.js " +
    "(light=" + (PAL.light ? "ok" : "missing") + ", dark=" + (PAL.dark ? "ok" : "missing") + ")");
} else {
  // Both themes must cover the same elements, or one theme silently drops an
  // element onto the fallback colour.
  const lk = Object.keys(PAL.light).sort().join(","), dk = Object.keys(PAL.dark).sort().join(",");
  if (lk !== dk) errors.push("the light and dark palettes cover different elements:\n  light: " + lk + "\n  dark:  " + dk);

  ["light", "dark"].forEach(function (theme) {
    const bg = rgbOf(BG[theme]);
    if (!bg) return;
    const bgL = luminance(bg);
    Object.keys(PAL[theme]).forEach(function (el) {
      const rgb = rgbOf(PAL[theme][el]);
      if (!rgb) { errors.push(theme + " palette: " + el + " is not a hex colour (" + PAL[theme][el] + ")"); return; }
      const c = contrast(luminance(rgb), bgL);
      if (c < MIN) {
        errors.push(theme + " theme: " + el + " " + PAL[theme][el] + " on " + BG[theme] +
          " is " + c.toFixed(2) + ":1, under " + MIN + ":1");
      }
    });
  });
}

// ---- the fallback must not be a constant -------------------------------
// An element with no palette entry takes the caller's text colour. If that
// argument goes away, every such element silently returns to a fixed #111.
if (!/function elColor\(el, fallback, dark\)/.test(SRC)) {
  errors.push("elColor no longer takes (el, fallback, dark); an element outside the palette " +
    "would fall back to a constant colour that cannot suit both themes");
}
if (!/return colors\[el\] \|\| fallback \|\| '#111';/.test(SRC)) {
  errors.push("elColor's fallback chain changed; it must prefer the caller's text colour");
}
if (!/elColor\(a\.el, textColor, darkBg\)/.test(SRC)) {
  errors.push("the elColor call site no longer passes the caller's text colour and background");
}

// ---- exports force their own background, so check that pair too --------
const et = /var EXPORT_TEXT = '([^']+)', EXPORT_BG = '([^']+)';/.exec(SRC);
if (!et) {
  errors.push("could not find EXPORT_TEXT / EXPORT_BG");
} else {
  const c = contrast(luminance(rgbOf(et[1])), luminance(rgbOf(et[2])));
  if (c < MIN) errors.push("export text " + et[1] + " on " + et[2] + " is " + c.toFixed(2) + ":1, under " + MIN + ":1");
}

if (errors.length) {
  console.error("Canvas contrast problems:\n");
  errors.forEach(function (e) { console.error("- " + e); });
  process.exit(1);
}
const n = PAL.light ? Object.keys(PAL.light).length : 0;
console.log("Canvas contrast OK: " + n + " element colours per theme, all >= " + MIN +
  ":1 on " + BG.light + " and " + BG.dark + ".");
