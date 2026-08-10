// Where a polymer bracket's bars go, and how long they may be.
//
// Split out of polymer-search.js for one reason: this is pure geometry, and it
// was the only part of the drawing that nothing could check. Structure data has
// had a CI check for a long time - formula, valence, ring counts, hashes - and
// all of it passed on a polyetherimide whose brackets were drawn beside the
// molecule instead of across it, because none of those checks look at where a
// line is put. A bar either crosses the bond it claims to cut or it does not,
// and that is a question about two vectors, not about a canvas. So it lives
// here, DOM-free and dependency-free like polymer-graph.js, and
// scripts/check-bracket-geometry.js exercises it over a sweep of bond angles.
//
// Coordinates are canvas coordinates throughout: x to the right, y DOWNWARD.
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();          // Node / CommonJS (the CI check)
  } else {
    root.BracketGeometry = factory();    // browser global
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // A bar sits on the bond between `outside` (the atom being cut off) and
  // `inside` (the atom staying in the unit), and runs across it.
  //
  // "Upright" is a tidiness preference, not a rule. On a zigzag backbone the
  // bonds run at about 30 degrees, a vertical bar crosses them cleanly, and it
  // looks like the bracket in a textbook. That only holds while the bond is
  // nearer horizontal than vertical: on a steep bond an upright bar is very
  // nearly PARALLEL to the thing it is meant to cut, so it crosses nothing and
  // the clipper below then trims it to a stub against whatever it does meet.
  // Polyetherimide showed this plainly - both chain ends hang straight down off
  // a ring, and both brackets collapsed to specks beside the molecule.
  //
  // `bias` slides the bar along the bond, away from `inside`, as a fraction of
  // the bond length. The default midpoint is the crowded end when the bond
  // leaves a ring, which is exactly when the clipper has least room to work
  // with; moving the bar outwards buys clearance without weakening the clipper.
  // 0 is the midpoint, 0.5 would sit on the outside atom itself.
  function barOnBond(outside, inside, upright, bias) {
    var vx = inside.x - outside.x, vy = inside.y - outside.y;
    var m = Math.hypot(vx, vy) || 1;
    var t = 0.5 - (bias || 0);           // fraction of the way from outside to inside
    var bar = {
      x: outside.x + vx * t, y: outside.y + vy * t,
      cutA: outside.id, cutB: inside.id
    };
    if (upright && Math.abs(vx) < Math.abs(vy)) upright = false;
    if (upright) { bar.ax = 0; bar.ay = 1; bar.tx = vx >= 0 ? 1 : -1; bar.ty = 0; }
    else { bar.ax = -vy / m; bar.ay = vx / m; bar.tx = vx / m; bar.ty = vy / m; }
    return bar;
  }

  // |sin| of the angle between the bar and the bond it cuts. 1 is perpendicular,
  // 0 is parallel and useless. The check script asserts this never falls low.
  function crossing(bar, outside, inside) {
    var vx = inside.x - outside.x, vy = inside.y - outside.y;
    var m = Math.hypot(vx, vy);
    if (!m) return 0;
    return Math.abs((bar.ax * vy - bar.ay * vx) / m);
  }

  // How far a line may run from a point before it meets a bond it is not
  // cutting, capped at `want` and kept a little clear of the meeting.
  function clearRun(atoms, bonds, px, py, dx, dy, want, cutA, cutB) {
    var at = indexAtoms(atoms);
    var lim = want, margin = 3;
    bonds.forEach(function (b) {
      if ((b.a === cutA && b.b === cutB) || (b.a === cutB && b.b === cutA)) return;
      var p = at[b.a], q = at[b.b];
      if (!p || !q) return;
      var rx = q.x - p.x, ry = q.y - p.y;
      var det = -dx * ry + rx * dy;
      if (Math.abs(det) < 1e-9) return;
      var ex = p.x - px, ey = p.y - py;
      var s = (dx * ey - ex * dy) / det;
      if (s < 0 || s > 1) return;
      var t = (-ex * ry + rx * ey) / det;
      if (t >= 0) lim = Math.min(lim, t - margin);
    });
    return Math.max(lim, 0);
  }

  // How far a bar may run each way before it meets a bond it is not cutting.
  // A bar that runs through a neighbouring bond reads as cutting that bond too:
  // on a methacrylate the ester leaves the backbone carbon almost sideways, so
  // an upright bar sliced straight through it and the bracket claimed the ester
  // was a chain continuation rather than a side group. That is why this exists,
  // and why its floor stays small - a cramped bar means a crowded drawing, not
  // a wrong bracket, and raising the floor would bring that bug back.
  function clipBarHalf(atoms, bonds, bar, want, floor) {
    var at = indexAtoms(atoms);
    var ux = bar.ax, uy = bar.ay;
    var pos = want, neg = want, margin = 5;
    bonds.forEach(function (b) {
      if ((b.a === bar.cutA && b.b === bar.cutB) || (b.a === bar.cutB && b.b === bar.cutA)) return;
      var p = at[b.a], q = at[b.b];
      if (!p || !q) return;
      var rx = q.x - p.x, ry = q.y - p.y;
      var det = -ux * ry + rx * uy;
      if (Math.abs(det) < 1e-9) return;           // parallel
      var ex = p.x - bar.x, ey = p.y - bar.y;
      var s = (ux * ey - ex * uy) / det;
      if (s < 0 || s > 1) return;                 // meets the line, not the bond
      var t = (-ex * ry + rx * ey) / det;
      if (t > 0) pos = Math.min(pos, t - margin);
      else neg = Math.min(neg, -t - margin);
    });
    var f = floor || 0;
    return { pos: Math.max(pos, f), neg: Math.max(neg, f) };
  }

  function indexAtoms(atoms) {
    var m = {};
    atoms.forEach(function (a) { m[a.id] = a; });
    return m;
  }

  return { barOnBond: barOnBond, crossing: crossing, clearRun: clearRun, clipBarHalf: clipBarHalf };
});
