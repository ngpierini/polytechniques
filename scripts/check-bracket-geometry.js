// Checks the polymer bracket's geometry without a browser.
//
// Why this exists. The structure data has been checked for a long time -
// formula, valence, ring counts, identity hashes - and every one of those
// checks passed on a polyetherimide whose brackets were drawn BESIDE the
// molecule instead of across it. They passed because none of them look at
// where a line is put. The bug was reported by eye, from a screenshot, which
// is not a repeatable way to find it.
//
// A bracket bar either crosses the bond it claims to cut or it does not, and
// that is a question about two vectors. So it is asked here, over a full sweep
// of bond angles, and the answer does not depend on a canvas, on RDKit, or on
// a page load.
"use strict";

const BG = require("../bracket-geometry.js");

const errors = [];
const BOND = 40;                       // a nominal bond length, as in the editor
const FLOOR = BOND * 0.22;             // the clipper's floor, as polymer-search.js sets it
const BIAS = 0.16;                     // the outward bias, likewise

// A bar that meets its bond at less than this is not crossing it in any useful
// sense. sin(20 deg) ~ 0.34; the failing polyetherimide bars were near zero.
const MIN_CROSSING = 0.34;

function atomAt(id, x, y) { return { id: id, x: x, y: y }; }

// ---- 1. The bar must cross its bond, at every angle ----------------------
// The bug in one line: an "upright" bar on a steep bond is nearly parallel to
// it. Sweeping the full circle is what makes that impossible to miss.
for (let deg = 0; deg < 360; deg += 5) {
  const r = deg * Math.PI / 180;
  const inside = atomAt("in", 0, 0);
  const outside = atomAt("out", -BOND * Math.cos(r), -BOND * Math.sin(r));
  [true, false].forEach(function (upright) {
    const bar = BG.barOnBond(outside, inside, upright, BIAS);
    const c = BG.crossing(bar, outside, inside);
    if (!(c >= MIN_CROSSING)) {
      errors.push("bond at " + deg + " deg, upright=" + upright +
        ": bar meets its bond at |sin| " + c.toFixed(3) + ", below " + MIN_CROSSING +
        " - it runs along the bond rather than across it");
    }
    if (!isFinite(bar.x) || !isFinite(bar.y) || !isFinite(bar.ax) || !isFinite(bar.ay)) {
      errors.push("bond at " + deg + " deg, upright=" + upright + ": bar has non-finite geometry");
    }
    // The bar direction must be a unit vector, or the drawn length is wrong.
    const m = Math.hypot(bar.ax, bar.ay);
    if (Math.abs(m - 1) > 1e-9) {
      errors.push("bond at " + deg + " deg, upright=" + upright + ": bar direction is not unit length (" + m.toFixed(4) + ")");
    }
    // The tick must point somewhere, and never along the bar itself.
    const dot = bar.ax * bar.tx + bar.ay * bar.ty;
    if (Math.abs(dot) > 1e-9) {
      errors.push("bond at " + deg + " deg, upright=" + upright + ": tick is not perpendicular to the bar");
    }
  });
}

// ---- 2. The bar must sit ON the bond it cuts -----------------------------
// The bias slides it outwards for clearance; it must not slide it off the end.
for (let deg = 0; deg < 360; deg += 15) {
  const r = deg * Math.PI / 180;
  const inside = atomAt("in", 0, 0);
  const outside = atomAt("out", -BOND * Math.cos(r), -BOND * Math.sin(r));
  const bar = BG.barOnBond(outside, inside, true, BIAS);
  const vx = inside.x - outside.x, vy = inside.y - outside.y;
  const t = ((bar.x - outside.x) * vx + (bar.y - outside.y) * vy) / (vx * vx + vy * vy);
  if (!(t > 0.05 && t < 0.95)) {
    errors.push("bond at " + deg + " deg: bar sits at " + t.toFixed(3) + " along the bond, outside the 0.05-0.95 span");
  }
}

// ---- 2b. Two blocks sharing a junction bond must not cross their bars ----
// Adjacent blocks of a copolymer both put a bar on the bond between them. The
// left block's bar closes it and the right block's bar opens the next, so the
// closing bar has to stay on the left. Biased outward they swap over and the
// drawing reads "[ ]" where "] [" belongs; this is that case in the abstract.
{
  const left = atomAt("L", 0, 0);          // last atom of the left block
  const right = atomAt("R", BOND, 0);      // first atom of the right block
  // Each block's bar: its own atom is "inside", the neighbour is "outside".
  const leftBar = BG.barOnBond(right, left, true, -BIAS);   // belongs to the left block
  const rightBar = BG.barOnBond(left, right, true, -BIAS);  // belongs to the right block
  if (!(leftBar.x < rightBar.x)) {
    errors.push("at a block junction the left block's bar is at x=" + leftBar.x.toFixed(1) +
      " and the right block's at x=" + rightBar.x.toFixed(1) +
      " - the closing bracket is not to the left of the opening one");
  }
  if (Math.abs(leftBar.x - rightBar.x) < 4) {
    errors.push("the two bars on a shared junction bond are only " +
      Math.abs(leftBar.x - rightBar.x).toFixed(1) + " apart and will draw on top of each other");
  }
}

// ---- 3. The clipper must shorten a bar that would cut a neighbour --------
// The case it was written for: a substituent leaving the same atom almost
// sideways, which an unclipped bar would slice through, making the bracket
// claim that substituent was a chain continuation.
{
  const atoms = [atomAt(1, 0, 0), atomAt(2, BOND, 0), atomAt(3, BOND, -BOND)];
  const bonds = [{ a: 1, b: 2 }, { a: 2, b: 3 }];
  const bar = BG.barOnBond(atoms[0], atoms[1], true, 0);   // on bond 1-2, upright
  const lim = BG.clipBarHalf(atoms, bonds, bar, BOND, FLOOR);
  if (!(lim.pos >= FLOOR && lim.neg >= FLOOR)) {
    errors.push("clipBarHalf returned a half below the floor (" + JSON.stringify(lim) + ")");
  }
  if (!(lim.pos <= BOND && lim.neg <= BOND)) {
    errors.push("clipBarHalf returned a half longer than asked for (" + JSON.stringify(lim) + ")");
  }
}

// ---- 4. An isolated bond must not be clipped at all ----------------------
{
  const atoms = [atomAt(1, 0, 0), atomAt(2, BOND, 0)];
  const bonds = [{ a: 1, b: 2 }];
  const bar = BG.barOnBond(atoms[0], atoms[1], true, 0);
  const lim = BG.clipBarHalf(atoms, bonds, bar, BOND, FLOOR);
  if (lim.pos !== BOND || lim.neg !== BOND) {
    errors.push("a bar with nothing near it was still clipped (" + JSON.stringify(lim) + ")");
  }
}

// ---- 5. The floor must never be exceeded downwards -----------------------
// Boxed in on all sides, the bar still has to be drawable.
{
  const atoms = [atomAt(1, 0, 0), atomAt(2, BOND, 0), atomAt(3, BOND / 2, -2), atomAt(4, BOND / 2, 2)];
  const bonds = [{ a: 1, b: 2 }, { a: 3, b: 4 }];
  const bar = BG.barOnBond(atoms[0], atoms[1], true, 0);
  const lim = BG.clipBarHalf(atoms, bonds, bar, BOND, FLOOR);
  if (!(lim.pos >= FLOOR && lim.neg >= FLOOR)) {
    errors.push("a fully boxed-in bar fell below the floor (" + JSON.stringify(lim) + ")");
  }
}

if (errors.length) {
  console.error("bracket geometry failed its check (" + errors.length + " issue" + (errors.length > 1 ? "s" : "") + "):\n");
  errors.slice(0, 12).forEach(function (e) { console.error("  - " + e); });
  if (errors.length > 12) console.error("  ...and " + (errors.length - 12) + " more");
  process.exit(1);
}
console.log("bracket geometry OK - bars cross their bond at every angle, sit on it, and clip without vanishing.");
