// Checks the theme colour tokens against the surfaces they are used on.
//
// Why this exists. An audit of all 46 pages in both themes - every element
// carrying its own text, compared against its composited background - found 89
// contrast failures in light and 36 in dark. Almost every one came from the
// same habit: a colour chosen while looking at one theme, written as a fixed
// value, and then used in both. The fixes were to split those into per-theme
// token pairs.
//
// That audit needs a browser, so it cannot run here. What CAN run here is the
// arithmetic on the token definitions themselves, which is where the fixes
// live. If someone restores one of the old values - and several of them look
// perfectly reasonable in isolation, which is how they shipped - this fails.
//
// It deliberately does NOT try to discover which colour sits on which surface.
// The pairings below were established by measuring the rendered pages, and are
// restated here as the thing being asserted.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
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
function ratio(fg, bg) { return contrast(luminance(fg), luminance(bg)); }
// A tint of `c` at `a` over `bg`, which is how the pills and the journal
// labels get their backgrounds.
function tint(c, a, bg) { return c.map((v, i) => v * a + bg[i] * (1 - a)); }

// ---- read a token out of a specific theme block ------------------------
// The blocks are the explicit data-theme ones, because those are what the
// toggle sets and therefore what a reader actually gets.
function block(selector) {
  const head = ":root[data-theme=" + JSON.stringify(selector) + "]";
  const at = CSS.indexOf(head);
  if (at === -1) return null;
  const open = CSS.indexOf("{", at), close = CSS.indexOf("}", open);
  if (open === -1 || close === -1) return null;
  return CSS.slice(open + 1, close);
}
const BLOCKS = { light: block("light"), dark: block("dark") };
Object.keys(BLOCKS).forEach(function (k) {
  if (!BLOCKS[k]) errors.push("could not find the :root[data-theme=\"" + k + "\"] block in style.css");
});
function token(theme, name) {
  if (!BLOCKS[theme]) return null;
  const m = new RegExp("--" + name + ":\\s*([^;]+);").exec(BLOCKS[theme]);
  return m ? rgbOf(m[1]) : null;
}
// Each .accent-<hue> rule declares its bright colour and one ink per
// appearance, so read them straight off that rule.
function accentTriple(hue) {
  const sel = ".accent-" + hue + " {";
  const at = CSS.indexOf(sel);
  if (at === -1) return null;
  const body = CSS.slice(at, CSS.indexOf("}", at));
  const pick = (name) => {
    const m = new RegExp("--" + name + ":s*([^;]+)[;}]").exec(body);
    return m ? rgbOf(m[1]) : null;
  };
  return { bright: pick("accent-bright"), dark: pick("accent-ink-dark"), light: pick("accent-ink-light") };
}

function need(label, fg, bg, theme) {
  if (!fg || !bg) { errors.push(label + " (" + theme + "): could not read a colour"); return; }
  const c = ratio(fg, bg);
  if (c < MIN) {
    errors.push(theme + ": " + label + " is " + c.toFixed(2) + ":1, under " + MIN + ":1");
  }
}

let checked = 0;
["light", "dark"].forEach(function (theme) {
  const card = token(theme, "card-bg");
  const bg = token(theme, "bg");
  const primary = token(theme, "primary");
  if (!card || !bg || !primary) {
    errors.push(theme + ": missing --card-bg, --bg or --primary");
    return;
  }

  // Body and dimmed text on both surfaces.
  [["--text", "text"], ["--text-dim", "text-dim"]].forEach(function (p) {
    const c = token(theme, p[1]);
    need(p[0] + " on --card-bg", c, card, theme);
    need(p[0] + " on --bg", c, bg, theme);
    checked += 2;
  });

  // --primary is the prose link colour, on both surfaces.
  need("--primary on --card-bg", primary, card, theme);
  need("--primary on --bg", primary, bg, theme);
  checked += 2;

  // --on-primary is the label of a filled --primary button. White on the
  // lighter dark-theme primary was 3.23:1, which is what this catches.
  need("--on-primary on --primary", token(theme, "on-primary"), primary, theme);
  checked++;

  // --accent and --danger are read as text on the page, on the card, and on
  // the 10-22% tints of themselves that the callouts and pills use. The tints
  // are hardcoded rgba of the ORIGINAL colours, so they do not move when the
  // token does - which is why the tint, not the card, is the binding case.
  [["--accent", "accent", [0.15]], ["--danger", "danger", [0.10, 0.15]]].forEach(function (p) {
    const c = token(theme, p[1]);
    need(p[0] + " on --card-bg", c, card, theme);
    need(p[0] + " on --bg", c, bg, theme);
    checked += 2;
    // the tints are built from the light-theme values, in both themes
    const source = rgbOf(p[1] === "accent" ? "#0e9f6e" : "#d64545");
    p[2].forEach(function (a) {
      need(p[0] + " on its own " + Math.round(a * 100) + "% tint over --card-bg",
        c, tint(source, a, card), theme);
      checked++;
    });
  });

  // --amber-ink sits on 18-22% amber tints over the card.
  const amberInk = token(theme, "amber-ink");
  [0.18, 0.22].forEach(function (a) {
    need("--amber-ink on a " + Math.round(a * 100) + "% amber tint over --card-bg",
      amberInk, tint(rgbOf("#f2b84b"), a, card), theme);
    checked++;
  });

  // Each accent ink, as text on the card and on a 14% tint of its own bright
  // accent - the recent-papers journal pill is exactly that.
  ["blue", "violet", "teal", "yellow", "mint", "salmon", "pink"].forEach(function (hue) {
    const t = accentTriple(hue);
    if (!t || !t.bright || !t.dark || !t.light) {
      errors.push("could not read all three values for .accent-" + hue);
      return;
    }
    const ink = theme === "light" ? t.light : t.dark;
    need("accent-" + hue + " ink on --card-bg", ink, card, theme);
    // the journal pill is a 14% tint of the BRIGHT accent, whichever ink is on it
    need("accent-" + hue + " ink on its own 14% tint", ink, tint(t.bright, 0.14, card), theme);
    checked += 2;
  });
});

if (errors.length) {
  console.error("Theme contrast problems:\n");
  errors.forEach(function (e) { console.error("- " + e); });
  console.error("\nThese pairings were established by measuring the rendered pages. If a\n" +
    "pairing is wrong rather than a colour, fix it in this file.");
  process.exit(1);
}
console.log("Theme contrast OK: " + checked + " colour pairs, both themes, all >= " + MIN + ":1.");
