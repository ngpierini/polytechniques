// Checks that every text label in a hand-authored inline SVG is actually
// inside its own viewBox.
//
// Why this exists. An SVG clips to its viewport, so a label placed outside the
// viewBox is silently gone - no error, no warning, and the figure still looks
// plausible because everything else is where it should be. Two figures on this
// site shipped that way and both were caught by eye, once from a screenshot:
// a panel of NMR labels at negative y, and a solute label at y=426 in a
// viewBox only 320 tall. Reading a diagram and noticing an absence is not a
// repeatable way to find these.
//
// Scope is deliberately narrow, because a general "is this shape inside the
// frame" check needs a full SVG geometry engine - transforms, path arcs, text
// metrics - and the first draft of one got an answer wrong that only the
// browser's own layout caught. So: <text> only, whose position is a single
// unambiguous point, and nothing inside a group carrying a transform this
// cannot reason about. That covers the symptom that actually occurred.
//
// Deliberate bleed off the edge is a real illustration technique - this site
// draws a monomer droplet reservoir that way on purpose - so an element can
// opt out with data-bleed. Shapes are not checked at all, only labels, and a
// label almost never wants to be half off the frame.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TOL = 0.5;                  // sub-unit slop is rounding, not a bug
const SKIP = new Set(["defs", "clippath", "mask", "marker", "symbol", "pattern",
  "lineargradient", "radialgradient", "filter"]);

function attrsOf(tagText) {
  const out = {};
  const re = /([a-zA-Z_:][-\w:.]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(tagText))) out[m[1].toLowerCase()] = m[2];
  return out;
}
// Only plain translate()s are understood. Anything else returns null, meaning
// "refuse to reason about this subtree" rather than guess.
function translateOf(attrs) {
  const t = (attrs.transform || "").trim();
  if (!t) return [0, 0];
  if (/(scale|rotate|matrix|skew)/i.test(t)) return null;
  const re = /translate\(\s*([-\d.eE]+)(?:[\s,]+([-\d.eE]+))?\s*\)/g;
  let dx = 0, dy = 0, m, saw = false;
  while ((m = re.exec(t))) { saw = true; dx += parseFloat(m[1]) || 0; dy += parseFloat(m[2]) || 0; }
  if (!saw) return null;
  return [dx, dy];
}

const findings = [];
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")).sort();
let svgCount = 0, labelCount = 0;

for (const file of files) {
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  const openRe = /<svg\b[^>]*>/g;
  let om;
  while ((om = openRe.exec(src))) {
    const svgAttrs = attrsOf(om[0]);
    if (!svgAttrs.viewbox) continue;
    const vb = svgAttrs.viewbox.trim().split(/[\s,]+/).map(parseFloat);
    if (vb.length !== 4 || !vb.every(isFinite)) continue;
    const vx = vb[0], vy = vb[1], vw = vb[2], vh = vb[3];

    // Matching </svg>, counting nesting.
    let depth = 0, end = -1;
    const tagRe = /<(\/?)svg\b(?:"[^"]*"|[^>"])*?(\/?)>/g;
    tagRe.lastIndex = om.index;
    let tm;
    while ((tm = tagRe.exec(src))) {
      if (tm[2] === "/") continue;
      if (tm[1] === "/") { depth--; if (depth === 0) { end = tm.index; break; } }
      else depth++;
    }
    if (end === -1) continue;
    const body = src.slice(om.index + om[0].length, end);
    openRe.lastIndex = end;
    svgCount++;
    const lineNo = src.slice(0, om.index).split("\n").length;

    // Walk, carrying a translate offset and a skip depth. Both open and close
    // tags are handled BEFORE the skip test, so a skipped subtree ends where
    // it should - getting that order wrong makes the skip permanent.
    const stack = [[0, 0]];
    let skipDepth = 0;
    const eltRe = /<(\/?)([a-zA-Z][-\w]*)((?:"[^"]*"|[^>"])*?)(\/?)>/g;
    let em;
    while ((em = eltRe.exec(body))) {
      const closing = em[1] === "/";
      const tag = em[2].toLowerCase();
      const selfClose = em[4] === "/";
      const attrs = attrsOf("<x" + em[3] + ">");

      if (SKIP.has(tag)) {
        if (closing) skipDepth = Math.max(0, skipDepth - 1);
        else if (!selfClose) skipDepth++;
        continue;
      }
      if (tag === "g" || tag === "a") {
        if (closing) {
          if (skipDepth > 0) skipDepth--;
          else if (stack.length > 1) stack.pop();
        } else if (!selfClose) {
          if (skipDepth > 0) { skipDepth++; continue; }
          const t = translateOf(attrs);
          if (t === null) skipDepth++;
          else stack.push([stack[stack.length - 1][0] + t[0], stack[stack.length - 1][1] + t[1]]);
        }
        continue;
      }
      if (skipDepth > 0 || closing || tag !== "text") continue;
      // Accept both the bare attribute and data-bleed="true", so read the raw
      // attribute text rather than the parsed name="value" pairs.
      if (em[3].indexOf("data-bleed") !== -1) continue;
      const own = translateOf(attrs);
      if (own === null) continue;
      const base = stack[stack.length - 1];
      const x = parseFloat(attrs.x), y = parseFloat(attrs.y);
      if (!isFinite(x) || !isFinite(y)) continue;   // positioned by dx/dy or textPath
      labelCount++;
      const px = x + base[0] + own[0], py = y + base[1] + own[1];
      const over = Math.max(vx - px, px - (vx + vw), vy - py, py - (vy + vh));
      if (over > TOL) {
        findings.push(file + ":~" + lineNo + "  label at (" + px + "," + py + ") is " +
          over.toFixed(1) + "u outside viewBox \"" + svgAttrs.viewbox.trim() + "\"");
      }
    }
  }
}

if (findings.length) {
  console.error("SVG labels placed outside their viewBox (they will not render):\n");
  findings.forEach(function (f) { console.error("- " + f); });
  console.error("\nIf the overflow is deliberate, put data-bleed on that element.");
  process.exit(1);
}
console.log("SVG labels OK: " + labelCount + " positioned labels across " + svgCount +
  " inline SVGs, all inside their viewBox.");
