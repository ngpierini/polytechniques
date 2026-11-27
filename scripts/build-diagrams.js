// Explanatory diagrams whose curves are computed, not drawn.
//
// Why this exists. The first diagrams on the site were hand-drawn SVG, and a
// hand-drawn curve is a picture of an equation rather than the equation. One of
// them also carried a wrong claim in its margin note (Fox in degrees Celsius
// does not land above the line; it lands far below it, or becomes nonsense when
// a Tg is below zero). These are generated from the same relations the pages'
// calculators use, so a plotted curve cannot drift from its physics, and every
// number printed on a diagram is computed here rather than typed.
//
// Each diagram is written between marker comments in its page:
//   <!-- diagram:NAME:start --> ... <!-- diagram:NAME:end -->
// so re-running replaces it in place. The first run inserts it before the
// given anchor.
//
// Sources for the facts on each diagram are given in its caption, and were
// checked against the primary listing (or a reproduction of it) before use.
//
// Run:  node scripts/build-diagrams.js         (writes the pages)
//       node scripts/build-diagrams.js --check  (exit 1 if any page is stale)
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const BLUE = "var(--primary, #5b8def)";
const GREEN = "var(--accent, #0b7954)";
const VIOLET = "#b07bd0";
const DIM = "var(--text-dim)";
const BORDER = "var(--border)";

const f1 = (n) => n.toFixed(1);
// A non-finite point in an SVG path raises no error: the browser silently drops
// the whole curve. That hid the styrene/maleic anhydride line, whose Mayo-Lewis
// expression is 0/0 at f1 = 0, until a screenshot showed it missing. So refuse
// to emit one.
const pathOf = (pts) => {
  pts.forEach((p, i) => {
    if (!isFinite(p[0]) || !isFinite(p[1])) throw new Error("non-finite point " + i + " in a plotted curve: " + p);
  });
  return pts.map((p, i) => (i ? "L" : "M") + f1(p[0]) + "," + f1(p[1])).join(" ");
};

function axes(x0, y0, x1, y1) {
  return '<line x1="' + x0 + '" y1="' + y1 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="' + BORDER + '" stroke-width="1.2"/>' +
    '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
}
const text = (x, y, s, cls, extra) =>
  '<text x="' + f1(x) + '" y="' + f1(y) + '"' + (cls ? ' class="' + cls + '"' : "") + (extra || "") + ">" + s + "</text>";

function panel(name, aria, w, h, body, caption, source) {
  return "<!-- diagram:" + name + ":start -->\n" +
    '    <div class="diagram-panel" data-figure="' + name + '">\n' +
    '      <svg class="diagram-svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + aria + '">\n' +
    "        " + body + "\n" +
    "      </svg>\n" +
    '      <p class="diagram-caption">' + caption + "</p>\n" +
    (source ? '      <p class="diagram-source">' + source + "</p>\n" : "") +
    "    </div>\n" +
    "    <!-- diagram:" + name + ":end -->";
}

// ---- 1. Mayo-Lewis -------------------------------------------------------
function mayoLewis(f, r1, r2) {
  const g = 1 - f;
  const den = r1 * f * f + 2 * f * g + r2 * g * g;
  if (den > 1e-12) return (r1 * f * f + f * g) / den;
  // 0/0 only at a pure feed whose own ratio is zero (f = 0 with r2 = 0, or
  // f = 1 with r1 = 0). Either way the limit is F1 = 1/2: each radical can
  // only add the other monomer, so the copolymer alternates.
  return 0.5;
}
function copolymer() {
  const X0 = 60, Y0 = 26, S = 170, X1 = X0 + S, Y1 = Y0 + S;
  const sx = (f) => X0 + f * S, sy = (F) => Y1 - F * S;
  const curve = (r1, r2) => {
    const pts = [];
    for (let i = 0; i <= 100; i++) { const f = i / 100; pts.push([sx(f), sy(mayoLewis(f, r1, r2))]); }
    return pathOf(pts);
  };
  const az = (r1, r2) => (1 - r2) / (2 - r1 - r2);
  const azTxt = az(0.52, 0.46), azNmr = az(0.697, 0.491);
  let b = axes(X0, Y0, X1, Y1);
  b += '<line x1="' + X0 + '" y1="' + Y1 + '" x2="' + X1 + '" y2="' + Y0 + '" stroke="' + DIM + '" stroke-width="1" stroke-dasharray="4 4"/>';
  b += '<path d="' + curve(2, 0.5) + '" fill="none" stroke="' + VIOLET + '" stroke-width="2.2"/>';
  b += '<path d="' + curve(0.52, 0.46) + '" fill="none" stroke="' + BLUE + '" stroke-width="2.4"/>';
  b += '<path d="' + curve(0.02, 0.01) + '" fill="none" stroke="' + GREEN + '" stroke-width="2.2"/>';
  b += '<circle cx="' + f1(sx(azTxt)) + '" cy="' + f1(sy(azTxt)) + '" r="4" fill="' + BLUE + '"/>';
  b += text(X0 + S / 2, Y1 + 16, "f<tspan baseline-shift=\"sub\" font-size=\"8\">1</tspan>, monomer 1 in the feed", "small dim", ' text-anchor="middle"');
  b += text(X0 + 4, Y0 - 8, "F<tspan baseline-shift=\"sub\" font-size=\"8\">1</tspan>, in the copolymer", "small dim");
  b += text(X0 - 6, Y1 + 4, "0", "small dim", ' text-anchor="end"');
  b += text(X0 - 6, Y0 + 10, "1", "small dim", ' text-anchor="end"');
  // legend and the azeotrope numbers
  const L = 300;
  const row = (y, col, dash, label, sub) => {
    let s = '<line x1="' + L + '" y1="' + y + '" x2="' + (L + 22) + '" y2="' + y + '" stroke="' + col + '" stroke-width="2.4"' + (dash ? ' stroke-dasharray="4 4"' : "") + "/>";
    s += text(L + 30, y + 4, label, "small");
    if (sub) s += text(L + 30, y + 23, sub, "small dim");
    return s;
  };
  b += row(40, VIOLET, false, "ideal: r<tspan baseline-shift=\"sub\" font-size=\"8\">1</tspan>r<tspan baseline-shift=\"sub\" font-size=\"8\">2</tspan> = 1 (here 2 and 0.5)", "never crosses the diagonal; one monomer always richer");
  b += row(82, BLUE, false, "styrene / MMA, r = 0.52 / 0.46", "crosses at the azeotrope, f<tspan baseline-shift=\"sub\" font-size=\"8\">1</tspan> = " + azTxt.toFixed(2));
  b += row(124, GREEN, false, "styrene / maleic anhydride, 0.02 / 0.01", "pinned near F<tspan baseline-shift=\"sub\" font-size=\"8\">1</tspan> = 0.5: alternating");
  b += row(166, DIM, true, "r<tspan baseline-shift=\"sub\" font-size=\"8\">1</tspan> = r<tspan baseline-shift=\"sub\" font-size=\"8\">2</tspan> = 1: copolymer matches feed", null);
  b += text(L + 30, 200, "same pair, NMR ratios 0.697 / 0.491: azeotrope at " + azNmr.toFixed(2), "small dim");
  const caption = "Instantaneous copolymer composition F<sub>1</sub> against feed f<sub>1</sub>, computed from the Mayo&ndash;Lewis equation for three kinds of pair. Where a curve crosses the diagonal the copolymer has the composition of its feed and does not drift as conversion rises: an azeotrope, at f<sub>1</sub>&nbsp;=&nbsp;(1&nbsp;&minus;&nbsp;r<sub>2</sub>)/(2&nbsp;&minus;&nbsp;r<sub>1</sub>&nbsp;&minus;&nbsp;r<sub>2</sub>), which exists only when both ratios sit on the same side of 1. For styrene and MMA the textbook ratios put it at " + azTxt.toFixed(2) + "; a modern in situ NMR determination puts it at " + azNmr.toFixed(2) + ". That gap is a fair measure of what a reactivity ratio is worth.";
  const source = 'Styrene/MMA 0.52/0.46 at 60&nbsp;&deg;C as tabulated in Young &amp; Lovell, <i>Introduction to Polymers</i>, 3rd ed., Table 9.1; in situ <sup>1</sup>H NMR values from <a href="https://doi.org/10.1021/acs.macromol.8b01526">Macromolecules 51 (2018)</a>. Styrene/maleic anhydride 0.02/0.01 from the <i>Polymer Handbook</i>, 4th ed. (2003); some textbooks round the second ratio to zero.';
  return panel("mayo-lewis", "Copolymer composition against feed composition for an ideal pair, styrene and methyl methacrylate with its azeotrope marked, and an alternating pair.", 680, 230, b, caption, source);
}

// ---- 2. worm-like chain ---------------------------------------------------
function wlcR2overL2(x) { // x = L/P
  return (2 / x) * (1 - (1 / x) * (1 - Math.exp(-x)));
}
function wlcRg(L, P) {
  return Math.sqrt(P * L / 3 - P * P + 2 * P * P * P / L - (2 * Math.pow(P, 4) / (L * L)) * (1 - Math.exp(-L / P)));
}
function chainDimensions() {
  const X0 = 60, Y0 = 24, X1 = 400, Y1 = 186;
  const lmin = -2, lmax = 3;                       // log10(L/P)
  const sx = (lx) => X0 + (lx - lmin) / (lmax - lmin) * (X1 - X0);
  const sy = (v) => Y1 - v * (Y1 - Y0);            // R_rms / L from 0 to 1
  const pts = [], coil = [];
  for (let i = 0; i <= 200; i++) {
    const lx = lmin + (lmax - lmin) * i / 200, x = Math.pow(10, lx);
    pts.push([sx(lx), sy(Math.sqrt(wlcR2overL2(x)))]);
    const c = Math.sqrt(2 / x);
    if (c <= 1) coil.push([sx(lx), sy(c)]);
  }
  let b = axes(X0, Y0, X1, Y1);
  b += '<line x1="' + X0 + '" y1="' + f1(sy(1)) + '" x2="' + X1 + '" y2="' + f1(sy(1)) + '" stroke="' + DIM + '" stroke-width="1" stroke-dasharray="4 4"/>';
  b += '<path d="' + pathOf(coil) + '" fill="none" stroke="' + DIM + '" stroke-width="1" stroke-dasharray="4 4"/>';
  b += '<path d="' + pathOf(pts) + '" fill="none" stroke="' + BLUE + '" stroke-width="2.4"/>';
  for (let k = lmin; k <= lmax; k++) {
    b += text(sx(k), Y1 + 14, k === 0 ? "1" : "10<tspan font-size=\"7\" baseline-shift=\"super\">" + k + "</tspan>", "small dim", ' text-anchor="middle"');
  }
  b += text((X0 + X1) / 2, Y1 + 30, "L / P, contour length over persistence length", "small dim", ' text-anchor="middle"');
  b += text(X0 - 6, sy(1) + 4, "1", "small dim", ' text-anchor="end"');
  b += text(X0 + 4, Y0 - 8, "R<tspan baseline-shift=\"sub\" font-size=\"8\">rms</tspan> / L", "small dim");
  b += text(sx(-1.6), sy(1) + 14, "rod: R = L", "small dim");
  b += text(sx(2.0), sy(Math.sqrt(2 / 100)) - 10, "coil: R&#178; = 2PL", "small dim");
  // DNA at 50 nm persistence: 100 bp and 3 kb
  const P = 50, rise = 0.34;
  const dna = [[100, "100 bp"], [3000, "3 kb"]].map(([bp, lab]) => {
    const L = bp * rise, x = L / P, r = Math.sqrt(wlcR2overL2(x));
    return { lab, L, x, r, rg: wlcRg(L, P) };
  });
  dna.forEach((d) => {
    const cx = sx(Math.log10(d.x)), cy = sy(d.r);
    b += '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="4" fill="' + GREEN + '"/>';
    b += text(cx + 8, cy - 6, d.lab, "small");
  });
  const L = 440;
  b += text(L, 54, "Double-stranded DNA, P &#8776; 50 nm,", "small");
  b += text(L, 68, "0.34 nm per base pair:", "small");
  b += text(L, 94, "100 bp: L = " + dna[0].L.toFixed(0) + " nm, R/L = " + dna[0].r.toFixed(2), "small dim");
  b += text(L, 108, "&#8195;still nearly a rod", "small dim");
  b += text(L, 132, "3 kb: L = " + dna[1].L.toFixed(0) + " nm, R/L = " + dna[1].r.toFixed(2), "small dim");
  b += text(L, 146, "&#8195;a coil, R<tspan baseline-shift=\"sub\" font-size=\"8\">g</tspan> = " + dna[1].rg.toFixed(0) + " nm", "small dim");
  const caption = "The worm-like chain, computed: &lang;R&sup2;&rang;&nbsp;=&nbsp;2PL[1&nbsp;&minus;&nbsp;(P/L)(1&nbsp;&minus;&nbsp;e<sup>&minus;L/P</sup>)]. A chain much shorter than its persistence length is a rod and its end-to-end distance is its length; one much longer is a Gaussian coil with Kuhn length 2P. Persistence length sets where the crossover falls, which is why a hundred base pairs of DNA is still a stiff rod while three thousand is already a coil.";
  const source = 'Kratky and Porod, <a href="https://doi.org/10.1002/recl.19490681203"><i>Recl. Trav. Chim. Pays-Bas</i> 68 (1949) 1106</a>. dsDNA persistence length 45&ndash;50&nbsp;nm in physiological salt, as widely measured.';
  return panel("worm-like-chain", "End-to-end distance as a fraction of contour length against contour length over persistence length, with the rod and coil limits and two DNA lengths marked.", 680, 230, b, caption, source);
}

// ---- 3. time-temperature superposition ------------------------------------
function wlf(dT, C1, C2) { return -C1 * dT / (C2 + dT); }
function tts() {
  // a model storage modulus: glassy plateau high, rubbery plateau low
  const logG = (lw) => 6 + 3 / (1 + Math.exp(-1.2 * (lw - 1)));
  const X0 = 50, Y0 = 26, X1 = 390, Y1 = 180;
  const lwMin = -5, lwMax = 7;
  const sx = (lw) => X0 + (lw - lwMin) / (lwMax - lwMin) * (X1 - X0);
  const sy = (lg) => Y1 - (lg - 5.6) / (9.4 - 5.6) * (Y1 - Y0);
  const master = [];
  for (let i = 0; i <= 240; i++) { const lw = lwMin + (lwMax - lwMin) * i / 240; master.push([sx(lw), sy(logG(lw))]); }
  let b = axes(X0, Y0, X1, Y1);
  b += '<path d="' + pathOf(master) + '" fill="none" stroke="' + DIM + '" stroke-width="1.2" stroke-dasharray="4 4"/>';
  // the instrument window, -1 to +2 in log frequency, at three temperatures
  const win = [-1, 2];
  const iso = [
    { shift: 3, col: BLUE, lab: "colder" },         // measured where it is glassy; shifts right
    { shift: 0, col: "var(--text)", lab: "T<tspan baseline-shift=\"sub\" font-size=\"8\">ref</tspan>" },
    { shift: -3, col: GREEN, lab: "hotter" }        // measured where it is rubbery; shifts left
  ];
  iso.forEach((s) => {
    // where the data actually sit after shifting
    const seg = [];
    for (let i = 0; i <= 30; i++) { const lw = win[0] + (win[1] - win[0]) * i / 30; seg.push([sx(lw + s.shift), sy(logG(lw + s.shift))]); }
    b += '<path d="' + pathOf(seg) + '" fill="none" stroke="' + s.col + '" stroke-width="3" stroke-linecap="round"/>';
  });
  // arrows from the measurement window to where each segment lands
  const mid = (win[0] + win[1]) / 2;
  b += '<defs><marker id="tts-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0.5 L7.5,4 L0,7.5 Z" fill="' + DIM + '"/></marker></defs>';
  b += '<rect x="' + f1(sx(win[0])) + '" y="' + (Y1 - 8) + '" width="' + f1(sx(win[1]) - sx(win[0])) + '" height="8" fill="' + DIM + '" opacity="0.18"/>';
  b += text(sx(mid), Y1 + 14, "instrument window", "small dim", ' text-anchor="middle"');
  b += '<line x1="' + f1(sx(mid) + 26) + '" y1="' + (Y1 - 22) + '" x2="' + f1(sx(mid + 3) - 6) + '" y2="' + (Y1 - 22) + '" stroke="' + DIM + '" stroke-width="1.4" marker-end="url(#tts-arrow)"/>';
  b += '<line x1="' + f1(sx(mid) - 26) + '" y1="' + (Y1 - 22) + '" x2="' + f1(sx(mid - 3) + 6) + '" y2="' + (Y1 - 22) + '" stroke="' + DIM + '" stroke-width="1.4" marker-end="url(#tts-arrow)"/>';
  b += text(sx(mid + 3), sy(logG(mid + 3)) - 12, "colder: shifts to higher &#969;", "small", ' text-anchor="middle" fill="' + BLUE + '"');
  b += text(sx(mid - 3), sy(logG(mid - 3)) + 22, "hotter: to lower &#969;", "small", ' text-anchor="middle" fill="' + GREEN + '"');
  b += text(X1, Y1 + 14, "log &#969;a<tspan baseline-shift=\"sub\" font-size=\"8\">T</tspan>", "small dim", ' text-anchor="end"');
  b += text(X0 + 4, Y0 - 8, "log G&#8242;", "small dim");
  // WLF numbers
  const C1 = 17.44, C2 = 51.6;
  const L = 430;
  b += text(L, 50, "WLF: log a<tspan baseline-shift=\"sub\" font-size=\"8\">T</tspan> = &#8722;C<tspan baseline-shift=\"sub\" font-size=\"8\">1</tspan>(T &#8722; T<tspan baseline-shift=\"sub\" font-size=\"8\">r</tspan>) / (C<tspan baseline-shift=\"sub\" font-size=\"8\">2</tspan> + T &#8722; T<tspan baseline-shift=\"sub\" font-size=\"8\">r</tspan>)", "small");
  b += text(L, 72, "&#8220;universal&#8221; with T<tspan baseline-shift=\"sub\" font-size=\"8\">r</tspan> = T<tspan baseline-shift=\"sub\" font-size=\"8\">g</tspan>: C<tspan baseline-shift=\"sub\" font-size=\"8\">1</tspan> = 17.44, C<tspan baseline-shift=\"sub\" font-size=\"8\">2</tspan> = 51.6 K", "small dim");
  [[10], [20], [50]].forEach(([dT], i) => {
    const la = wlf(dT, C1, C2);
    b += text(L, 100 + i * 22, "T<tspan baseline-shift=\"sub\" font-size=\"8\">g</tspan> + " + dT + " K: log a<tspan baseline-shift=\"sub\" font-size=\"8\">T</tspan> = " + la.toFixed(2) + ", a factor of " + Math.pow(10, -la).toExponential(1).replace("e+", "&#215;10<tspan font-size=\"7\" baseline-shift=\"super\">") + "</tspan>", "small dim");
  });
  b += text(L, 180, "A few kelvin near T<tspan baseline-shift=\"sub\" font-size=\"8\">g</tspan> is worth decades of time.", "small");
  const caption = "Three isothermal frequency sweeps, each a short stretch of the same curve, slide horizontally onto one master curve. Data measured colder than the reference temperature cover behaviour the reference temperature only shows at high frequency, so they shift right; data measured hotter shift left. The shift factors follow WLF, and near the glass transition they grow so fast that a few kelvin stands in for several decades of time.";
  const source = 'WLF: Williams, Landel and Ferry, <i>J. Am. Chem. Soc.</i> 77 (1955) 3701; shift direction and universal constants as given in <a href="https://www.tainstruments.com/wp-content/uploads/DMA-Theory-and-Instrumentation_PHL.pdf">TA Instruments DMA theory notes</a>. The modulus curve is a model shape, not a material.';
  return panel("tts", "Three short frequency sweeps at a colder, reference and hotter temperature sliding onto one master curve of storage modulus against shifted frequency, with WLF shift factors for three temperatures above Tg.", 680, 230, b, caption, source);
}

// ---- 4. hydrogel mesh ------------------------------------------------------
function hydrogel() {
  let b = "";
  // a square lattice of wavy strands, 4 x 3 cells, crosslinks at the nodes
  const ox = 52, oy = 60, c = 46, nx = 5, ny = 4;
  const wave = (x0, y0, x1, y1) => {
    const mx = (x0 + x1) / 2 + (y1 - y0) * 0.12, my = (y0 + y1) / 2 + (x1 - x0) * 0.12;
    return "M" + f1(x0) + "," + f1(y0) + " Q" + f1(mx) + "," + f1(my) + " " + f1(x1) + "," + f1(y1);
  };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx - 1; i++)
    b += '<path d="' + wave(ox + i * c, oy + j * c, ox + (i + 1) * c, oy + j * c) + '" fill="none" stroke="' + BLUE + '" stroke-width="1.8"/>';
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx; i++)
    b += '<path d="' + wave(ox + i * c, oy + j * c, ox + i * c, oy + (j + 1) * c) + '" fill="none" stroke="' + BLUE + '" stroke-width="1.8"/>';
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++)
    b += '<circle cx="' + (ox + i * c) + '" cy="' + (oy + j * c) + '" r="3.2" fill="' + BLUE + '"/>';
  // the mesh size, marked across one cell
  b += '<line x1="' + (ox + c) + '" y1="' + (oy + 3 * c + 14) + '" x2="' + (ox + 2 * c) + '" y2="' + (oy + 3 * c + 14) + '" stroke="' + DIM + '" stroke-width="1.2"/>';
  b += text(ox + 1.5 * c, oy + 3 * c + 28, "&#958;, mesh size", "small dim", ' text-anchor="middle"');
  // three solutes against the same cell
  // radii at 0.15, 0.6 and 1.0 of the mesh size, the same ratios marked on the
  // plot beside it, so the picture and the graph say the same thing
  const sol = [
    { x: ox + 0.5 * c, y: oy + 0.5 * c, r: 0.15 * c, col: GREEN },
    { x: ox + 1.5 * c, y: oy + 2.5 * c, r: 0.6 * c, col: "#d08a3a" },
    { x: ox + 3.5 * c, y: oy + 0.5 * c, r: 1.0 * c, col: "#c45c5c" }
  ];
  sol.forEach((s) => { b += '<circle cx="' + f1(s.x) + '" cy="' + f1(s.y) + '" r="' + s.r + '" fill="' + s.col + '" opacity="0.38" stroke="' + s.col + '" stroke-width="1.4"/>'; });
  // right: the sieving factor, computed
  const X0 = 310, Y0 = 56, X1 = 480, Y1 = 188;
  const sx = (q) => X0 + q * (X1 - X0), sy = (v) => Y1 - v * (Y1 - Y0);
  b += axes(X0, Y0, X1, Y1);
  const pts = [];
  for (let i = 0; i <= 40; i++) { const q = i / 40; pts.push([sx(q), sy(1 - q)]); }
  b += '<path d="' + pathOf(pts) + '" fill="none" stroke="' + BLUE + '" stroke-width="2.4"/>';
  const marks = [[0.15, GREEN, "passes"], [0.6, "#d08a3a", "hindered"], [1, "#c45c5c", "blocked"]];
  marks.forEach(([q, col, lab]) => {
    b += '<circle cx="' + f1(sx(q)) + '" cy="' + f1(sy(1 - q)) + '" r="4" fill="' + col + '"/>';
    b += text(sx(q) + 7, sy(1 - q) - 6, lab, "small");
  });
  b += text((X0 + X1) / 2, Y1 + 16, "r<tspan baseline-shift=\"sub\" font-size=\"8\">s</tspan> / &#958;, solute radius over mesh size", "small dim", ' text-anchor="middle"');
  b += text(X0 + 4, Y0 - 10, "1 &#8722; r<tspan baseline-shift=\"sub\" font-size=\"8\">s</tspan>/&#958;, the sieving factor", "small dim");
  b += text(X0 - 6, Y0 + 4, "1", "small dim", ' text-anchor="end"');
  b += text(X0 - 6, Y1 + 4, "0", "small dim", ' text-anchor="end"');
  b += text(500, 70, "&#958; = v<tspan baseline-shift=\"sub\" font-size=\"8\">2,s</tspan><tspan font-size=\"7\" baseline-shift=\"super\">&#8722;1/3</tspan> l (2C<tspan baseline-shift=\"sub\" font-size=\"8\">n</tspan>M<tspan baseline-shift=\"sub\" font-size=\"8\">c</tspan>/M<tspan baseline-shift=\"sub\" font-size=\"8\">r</tspan>)<tspan font-size=\"7\" baseline-shift=\"super\">1/2</tspan>", "small");
  b += text(500, 98, "swelling opens the mesh", "small dim");
  b += text(500, 114, "as v<tspan baseline-shift=\"sub\" font-size=\"8\">2,s</tspan><tspan font-size=\"7\" baseline-shift=\"super\">&#8722;1/3</tspan>; strand length", "small dim");
  b += text(500, 136, "between crosslinks as M<tspan baseline-shift=\"sub\" font-size=\"8\">c</tspan><tspan font-size=\"7\" baseline-shift=\"super\">1/2</tspan>.", "small dim");
  const caption = "A swollen network is a sieve with an opening &xi; set by how far it swells and how long its strands are. A solute much smaller than &xi; diffuses almost as it would in water; one approaching &xi; is hindered; one larger than &xi; is held. The simplest model of that is the sieving factor 1&nbsp;&minus;&nbsp;r<sub>s</sub>/&xi;, which reaches zero exactly at the mesh size; real transport also loses some mobility to the obstruction of the strands themselves, so it falls faster.";
  const source = 'Mesh size: Canal and Peppas, <i>J. Biomed. Mater. Res.</i> 23 (1989) 1183. Sieving factor: Lustig and Peppas, as reviewed in <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6631542/">Gels 5 (2019) 28</a>.';
  return panel("mesh", "A hydrogel network drawn as a lattice of strands with three solutes of increasing size, beside a plot of the sieving factor falling linearly to zero as the solute radius reaches the mesh size.", 680, 240, b, caption, source);
}

// ---- 5. radical kinetics ---------------------------------------------------
function radical() {
  let b = "";
  const steps = [
    ["initiator decomposition", "I &#8594; 2 R&#8226;", "k<tspan baseline-shift=\"sub\" font-size=\"8\">d</tspan>, efficiency f"],
    ["initiation", "R&#8226; + M &#8594; M<tspan baseline-shift=\"sub\" font-size=\"8\">1</tspan>&#8226;", ""],
    ["propagation", "M<tspan baseline-shift=\"sub\" font-size=\"8\">n</tspan>&#8226; + M &#8594; M<tspan baseline-shift=\"sub\" font-size=\"8\">n+1</tspan>&#8226;", "k<tspan baseline-shift=\"sub\" font-size=\"8\">p</tspan>"],
    ["termination, by combination or disproportionation", "M<tspan baseline-shift=\"sub\" font-size=\"8\">n</tspan>&#8226; + M<tspan baseline-shift=\"sub\" font-size=\"8\">m</tspan>&#8226; &#8594; dead chain", "k<tspan baseline-shift=\"sub\" font-size=\"8\">t</tspan>"]
  ];
  steps.forEach((s, i) => {
    const y = 40 + i * 42;
    b += '<circle cx="34" cy="' + (y - 4) + '" r="9" fill="none" stroke="' + DIM + '" stroke-width="1.2"/>';
    b += text(34, y, String(i + 1), "small dim", ' text-anchor="middle"');
    b += text(52, y - 6, s[0], "small dim");
    b += text(52, y + 9, s[1], "small");
    if (s[2]) b += text(210, y + 9, s[2], "small dim");
  });
  // log-log: Rp ~ [I]^1/2 up, nu ~ [I]^-1/2 down
  const X0 = 400, Y0 = 30, X1 = 620, Y1 = 170;
  b += axes(X0, Y0, X1, Y1);
  const lx = (v) => X0 + (v + 1) / 2 * (X1 - X0);   // log10[I] from -1 to +1 (relative)
  const ly = (v) => (Y0 + Y1) / 2 - v * (Y1 - Y0) / 2.2;
  const up = [], down = [];
  for (let i = 0; i <= 20; i++) { const v = -1 + 2 * i / 20; up.push([lx(v), ly(0.5 * v)]); down.push([lx(v), ly(-0.5 * v)]); }
  b += '<path d="' + pathOf(up) + '" fill="none" stroke="' + BLUE + '" stroke-width="2.4"/>';
  b += '<path d="' + pathOf(down) + '" fill="none" stroke="' + GREEN + '" stroke-width="2.4"/>';
  b += text(X1 - 4, ly(0.5) - 8, "R<tspan baseline-shift=\"sub\" font-size=\"8\">p</tspan> &#8733; [I]<tspan font-size=\"7\" baseline-shift=\"super\">1/2</tspan>", "small", ' text-anchor="end" fill="' + BLUE + '"');
  b += text(X1 - 4, ly(-0.5) + 16, "&#957; &#8733; [I]<tspan font-size=\"7\" baseline-shift=\"super\">&#8722;1/2</tspan>", "small", ' text-anchor="end" fill="' + GREEN + '"');
  b += text((X0 + X1) / 2, Y1 + 16, "log [I]", "small dim", ' text-anchor="middle"');
  b += text(X0 + 4, Y0 - 10, "log rate, log chain length", "small dim");
  // a computed example: four times the initiator
  b += text(X0, Y1 + 34, "4&#215; the initiator: rate &#215;" + Math.sqrt(4).toFixed(0) + ", chains &#247;" + Math.sqrt(4).toFixed(0), "small");
  const caption = "Radicals are made one at a time and destroyed two at a time, so at steady state their concentration goes as the square root of the initiator: [M&#8226;]&nbsp;=&nbsp;(fk<sub>d</sub>[I]/k<sub>t</sub>)<sup>1/2</sup>. Both headline results follow from that one square root, in opposite directions. The rate R<sub>p</sub>&nbsp;=&nbsp;k<sub>p</sub>[M][M&#8226;] rises with it; the kinetic chain length, monomer consumed per radical, falls with it. More initiator is always a faster reaction and always shorter chains.";
  const source = "Steady-state free-radical kinetics as derived in standard texts, e.g. Odian, <i>Principles of Polymerization</i>, 4th ed., ch. 3.";
  return panel("radical-steps", "The four elementary steps of free-radical polymerization beside a log-log plot in which rate rises and kinetic chain length falls with the square root of initiator concentration.", 680, 230, b, caption, source);
}

// ---- 6. conversion by 1H NMR -----------------------------------------------
// Two stacked spectra drawn the way a paper or an SI page draws them: chemical
// shift decreasing to the right, one trace per time point, integrals printed
// under the peaks. Lines are Lorentzians of one width, so a peak's area is
// proportional to its height and the drawn heights are honest integrals.
const sub = (s) => '<tspan baseline-shift="sub" font-size="8">' + s + "</tspan>";
const sup = (s) => '<tspan font-size="7" baseline-shift="super">' + s + "</tspan>";
const tint = (c) => ' style="fill:' + c + '"';
function nmr() {
  const X0 = 30, X1 = 470, D0 = 7.45, D1 = 4.85;           // ppm runs D0 (left) to D1 (right)
  const sx = (d) => X0 + (D0 - d) / (D0 - D1) * (X1 - X0);
  const HW = 0.011;                                        // half width at half height, ppm
  const UNIT = 3.6;                                        // px of height per integral unit
  const RATIO = 20;                                        // monomer : standard, mol/mol
  const p = 0.55;
  // integrals per proton count, with the standard's own 6 protons calibrated to 6.00
  const mono0 = RATIO * 1, monoT = RATIO * (1 - p);        // one proton per =CH2 signal
  const peaksAt = (mono) => [
    [7.26, 1.4, "solvent"], [6.10, mono, "mma"], [5.57, mono, "mma"], [5.14, 6, "std"]
  ];
  const trace = (base, scale, mono) => {
    const pk = peaksAt(mono);
    const y = (d) => base - scale * UNIT * pk.reduce((s, q) => s + q[1] / (1 + ((d - q[0]) / HW) * ((d - q[0]) / HW)), 0);
    // coarse everywhere, fine near each line: a smooth curve without a 2000-point path
    const ds = new Set();
    for (let x = X0; x <= X1; x += 3) ds.add(+x.toFixed(2));
    pk.forEach((q) => { for (let k = -24; k <= 24; k++) ds.add(+(sx(q[0]) + k * 0.6).toFixed(2)); });
    const xs = [...ds].filter((x) => x >= X0 && x <= X1).sort((a, b) => a - b);
    const toD = (x) => D0 - (x - X0) / (X1 - X0) * (D0 - D1);
    return '<path d="' + pathOf(xs.map((x) => [x, y(toD(x))])) + '" fill="none" stroke="var(--text)" stroke-width="1.1"/>';
  };
  let b = "";
  const B1 = 112, B2 = 224, S2 = 0.72;                     // the second aliquot is smaller
  b += trace(B1, 1, mono0) + trace(B2, S2, monoT);
  // peak labels over the first trace
  b += text(sx(7.26), B1 - 1.4 * UNIT - 8, "CHCl" + sub("3"), "small dim", ' text-anchor="middle"');
  b += text((sx(6.10) + sx(5.57)) / 2, B1 - mono0 * UNIT - 10, "MMA =CH" + sub("2") + ", 1H each", "small", ' text-anchor="middle"');
  b += text(sx(5.14), B1 - 6 * UNIT - 8, "trioxane, 6H", "small", ' text-anchor="middle"' + tint(GREEN));
  // integrals under each trace
  const integ = (base, mono) => {
    let s = "";
    [[6.10, mono], [5.57, mono], [5.14, 6]].forEach(([d, v]) => {
      s += '<line x1="' + f1(sx(d) - 12) + '" y1="' + (base + 6) + '" x2="' + f1(sx(d) + 12) + '" y2="' + (base + 6) + '" stroke="' + DIM + '" stroke-width="1"/>';
      s += text(sx(d), base + 18, v.toFixed(2), "small" + (d === 5.14 ? "" : ""), ' text-anchor="middle"' + (d === 5.14 ? tint(GREEN) : ""));
    });
    return s;
  };
  b += integ(B1, mono0) + integ(B2, monoT);
  b += text(X0, B1 - 62, "t = 0", "small");
  b += text(X0, B2 - 62, "t = 2 h", "small");
  b += text(sx(6.6), B2 - 30, "smaller aliquot:", "small dim", ' text-anchor="middle"');
  b += text(sx(6.6), B2 - 17, "every line shorter", "small dim", ' text-anchor="middle"');
  // shift axis
  const YA = 262;
  b += '<line x1="' + X0 + '" y1="' + YA + '" x2="' + X1 + '" y2="' + YA + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
  [7.0, 6.5, 6.0, 5.5, 5.0].forEach((d) => {
    b += '<line x1="' + f1(sx(d)) + '" y1="' + YA + '" x2="' + f1(sx(d)) + '" y2="' + (YA + 4) + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
    b += text(sx(d), YA + 16, d.toFixed(1), "small dim", ' text-anchor="middle"');
  });
  b += text(X1, YA + 30, "&#948; (ppm)", "small dim", ' text-anchor="end"');
  // the arithmetic, computed from the same numbers that drew the lines
  const XR = 500;
  const r0 = mono0 / 6, rt = monoT / 6;
  b += text(XR, 52, "Ratio to the standard", "small dim");
  b += text(XR, 70, "t = 0: " + mono0.toFixed(2) + " / 6.00 = " + r0.toFixed(2), "small");
  b += text(XR, 88, "t = 2 h: " + monoT.toFixed(2) + " / 6.00 = " + rt.toFixed(2), "small");
  b += text(XR, 118, "p = 1 &#8722; " + rt.toFixed(2) + " / " + r0.toFixed(2), "small");
  b += text(XR, 136, "&#8195;= " + (1 - rt / r0).toFixed(2), "small");
  b += text(XR, 170, "The standard is", "small dim");
  b += text(XR, 186, "calibrated to its own", "small dim");
  b += text(XR, 202, "proton count in each", "small dim");
  b += text(XR, 218, "spectrum, so the", "small dim");
  b += text(XR, 234, "aliquot size cancels.", "small dim");
  const caption = "What the worked example looks like on the instrument. Both vinyl lines of methyl methacrylate shrink as monomer is used up, while the trioxane line, mixed into the flask at the start, cannot change. The second aliquot was smaller, so every line in it is shorter, the standard included; that is exactly why the raw heights mean nothing and the ratio to the standard means everything. Poly(methyl methacrylate) has no signal in this window, so nothing grows in to be mistaken for monomer.";
  const source = "Typical shifts in CDCl<sub>3</sub>: MMA =CH<sub>2</sub> 6.10 and 5.57&nbsp;ppm, 1,3,5-trioxane 5.14&nbsp;ppm; residual CHCl<sub>3</sub> 7.26&nbsp;ppm (Fulmer et al., <i>Organometallics</i> 29 (2010) 2176). Check them against your own t&nbsp;=&nbsp;0 spectrum. Line shapes are idealized Lorentzians of equal width.";
  return panel("nmr-conversion", "Two stacked proton NMR spectra, at time zero and at two hours. The methyl methacrylate vinyl lines at 6.10 and 5.57 ppm fall from an integral of 20 to 9 relative to a trioxane standard at 5.14 ppm calibrated to 6, giving 55 percent conversion.", 680, 300, b, caption, source);
}

// ---- 7. where dispersity comes from -----------------------------------------
// The page's own equation, split into its two terms and stacked, for the
// page's defaults (target DP 200, RAFT agent with C_ex = 30), with a poorer and
// a better agent drawn as single lines for scale.
function dispersityTerms() {
  const DP = 200;
  const X0 = 56, Y0 = 24, X1 = 430, Y1 = 214;
  const PMIN = 0.05, YMAX = 2.0;
  const sx = (p) => X0 + p * (X1 - X0);
  const sy = (D) => Y1 - (D - 1) / (YMAX - 1) * (Y1 - Y0);
  const poisson = (p) => 1 / (DP * p);
  const exch = (p, cex) => (1 / cex) * (2 / p - 1);
  let b = axes(X0, Y0, X1, Y1);
  // stacked bands for C_ex = 30, clipped at the top of the plot
  const ps = [];
  for (let i = 0; i <= 190; i++) ps.push(PMIN + (1 - PMIN) * i / 190);
  const clip = (D) => Math.min(D, YMAX);
  const band = (lo, hi, fill, op) => {
    const top = ps.map((p) => [sx(p), sy(clip(hi(p)))]);
    const bot = ps.slice().reverse().map((p) => [sx(p), sy(clip(lo(p)))]);
    return '<path d="' + pathOf(top.concat(bot)) + ' Z" fill="' + fill + '" fill-opacity="' + op + '" stroke="none"/>';
  };
  b += band(() => 1, (p) => 1 + poisson(p), VIOLET, 0.6);
  b += band((p) => 1 + poisson(p), (p) => 1 + poisson(p) + exch(p, 30), BLUE, 0.22);
  const line = (cex, dash, w) => {
    const pts = ps.filter((p) => 1 + poisson(p) + exch(p, cex) <= YMAX).map((p) => [sx(p), sy(1 + poisson(p) + exch(p, cex))]);
    return '<path d="' + pathOf(pts) + '" fill="none" stroke="' + BLUE + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
  };
  b += line(30, "", 2.4) + line(5, "5 4", 1.6) + line(300, "2 3", 1.6);
  // axis labels
  [0, 0.25, 0.5, 0.75, 1].forEach((p) => {
    b += '<line x1="' + f1(sx(p)) + '" y1="' + Y1 + '" x2="' + f1(sx(p)) + '" y2="' + (Y1 + 4) + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
    b += text(sx(p), Y1 + 16, p === 0 ? "0" : p === 1 ? "1" : String(p), "small dim", ' text-anchor="middle"');
  });
  [1, 1.25, 1.5, 1.75, 2].forEach((D) => {
    b += text(X0 - 6, sy(D) + 4, D.toFixed(2), "small dim", ' text-anchor="end"');
  });
  b += text((X0 + X1) / 2, Y1 + 32, "conversion, p", "small dim", ' text-anchor="middle"');
  b += text(X0 - 40, Y0 - 10, "&#272;", "small dim");
  // curve labels at the right-hand end, computed at p = 1
  const at1 = (cex) => 1 + poisson(1) + exch(1, cex);
  b += text(X1 + 6, sy(at1(5)) + 4, "C" + sub("ex") + " = 5", "small");
  b += text(X1 + 6, sy(at1(30)) - 2, "C" + sub("ex") + " = 30", "small");
  b += text(X1 + 6, sy(at1(300)) + 13, "C" + sub("ex") + " = 300", "small");
  // band labels inside the plot
  // label in the open space, with a leader into the band (inside it is too thin)
  b += '<line x1="' + f1(sx(0.3) - 3) + '" y1="' + f1(sy(1.33)) + '" x2="' + f1(sx(0.2)) + '" y2="' + f1(sy(1.16)) + '" stroke="' + DIM + '" stroke-width="1"/>';
  b += text(sx(0.3), sy(1.35), "exchange term, C(2/p &#8722; 1)", "small");
  // the numbers at the page's default conversion
  const p9 = 0.9, a = poisson(p9), e = exch(p9, 30);
  const XR = 520;
  b += text(XR, 40, "At p = 0.9, C" + sub("ex") + " = 30:", "small dim");
  b += text(XR, 60, "1/DP" + sub("n") + " = " + a.toFixed(4), "small" , tint(VIOLET));
  b += text(XR, 78, "C(2/p &#8722; 1) = " + e.toFixed(4), "small", tint(BLUE));
  b += text(XR, 96, "&#272; = " + (1 + a + e).toFixed(3), "small");
  b += text(XR, 124, "Exchange is " + Math.round(e / (a + e) * 100) + "% of the", "small dim");
  b += text(XR, 140, "excess over 1; the", "small dim");
  b += text(XR, 156, "chain-length floor", "small dim");
  b += text(XR, 172, "(violet, along the", "small dim");
  b += text(XR, 188, "bottom) is the rest.", "small dim");
  // the claim in the caption, checked rather than asserted
  ps.forEach((p) => { if (exch(p, 30) <= poisson(p)) throw new Error("exchange term does not dominate at p = " + p); });
  const end30 = 1 + poisson(1) + exch(1, 30), end300 = 1 + poisson(1) + exch(1, 300);
  const caption = "The equation on this page has two terms, and they matter at different times. The chain-length term 1/DP<sub>n</sub> (violet) is the Poisson floor a perfect living polymerization would reach; for a target DP of 200 it is already small. The exchange term C(2/p&nbsp;&minus;&nbsp;1) (blue) is the price of a finite transfer constant, and with C<sub>ex</sub>&nbsp;=&nbsp;30 it is the larger of the two at every conversion. At full conversion it falls to C itself, so the best &#272; an agent can reach is 1&nbsp;+&nbsp;1/DP<sub>n</sub>&nbsp;+&nbsp;C: " + end30.toFixed(3) + " here, and " + end300.toFixed(3) + " with an agent ten times better, where the chain-length floor finally starts to matter.";
  const source = "&#272;&nbsp;=&nbsp;1&nbsp;+&nbsp;1/DP<sub>n</sub>&nbsp;+&nbsp;C(2/p&nbsp;&minus;&nbsp;1) with C&nbsp;=&nbsp;1/C<sub>ex</sub> for RAFT and DP<sub>n</sub>&nbsp;=&nbsp;200p: Krys and Matyjaszewski, <i>Eur. Polym. J.</i> 89 (2017) 482, Eq. 6. Curves above &#272;&nbsp;=&nbsp;2 are cut off.";
  return panel("dispersity-terms", "Dispersity against conversion for a target degree of polymerization of 200, drawn as two stacked bands: a thin chain-length floor and a larger exchange term that falls as conversion rises. Lines for RAFT transfer constants of 5, 30 and 300 show the final dispersity falling as the agent improves.", 680, 260, b, caption, source);
}

// ---- 8. one sample, three distributions --------------------------------------
// The same Flory most-probable population plotted three ways. Each curve is
// scaled to its own maximum; what differs is where the maximum is.
function mwdViews() {
  const DPn = 100, P = 1 - 1 / DPn;                          // Flory: DPn = 1/(1-p)
  const DPw = (1 + P) / (1 - P);
  const XMAX = 500;
  const X0 = 50, Y0 = 30, X1 = 450, Y1 = 200;
  const sx = (x) => X0 + x / XMAX * (X1 - X0);
  const sy = (v) => Y1 - v * (Y1 - Y0);
  const n = (x) => Math.pow(P, x - 1);                       // number fraction, up to a constant
  const w = (x) => x * Math.pow(P, x - 1);                   // weight fraction
  const g = (x) => x * x * Math.pow(P, x - 1);               // per unit log M: what a GPC trace shows
  const xs = [];
  for (let x = 1; x <= XMAX; x += 2) xs.push(x);
  const peak = (fn) => { let bx = 1, bv = -1; for (let x = 1; x <= 2000; x++) { const v = fn(x); if (v > bv) { bv = v; bx = x; } } return [bx, bv]; };
  const [nx, nv] = peak(n), [wx, wv] = peak(w), [gx, gv] = peak(g);
  let b = axes(X0, Y0, X1, Y1);
  const curve = (fn, top, col, dash) =>
    '<path d="' + pathOf(xs.map((x) => [sx(x), sy(fn(x) / top)])) + '" fill="none" stroke="' + col + '" stroke-width="2.2"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
  b += curve(n, nv, DIM, "5 4") + curve(w, wv, BLUE) + curve(g, gv, GREEN);
  // DPn and DPw markers
  [[DPn, "DP" + sub("n") + " = " + DPn], [DPw, "DP" + sub("w") + " = " + DPw.toFixed(0)]].forEach(([x, lab]) => {
    b += '<line x1="' + f1(sx(x)) + '" y1="' + Y0 + '" x2="' + f1(sx(x)) + '" y2="' + Y1 + '" stroke="' + DIM + '" stroke-width="1" stroke-dasharray="2 3"/>';
    b += text(sx(x), Y0 - 8, lab, "small", ' text-anchor="middle"');
  });
  [0, 100, 200, 300, 400, 500].forEach((x) => {
    b += '<line x1="' + f1(sx(x)) + '" y1="' + Y1 + '" x2="' + f1(sx(x)) + '" y2="' + (Y1 + 4) + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
    b += text(sx(x), Y1 + 16, String(x), "small dim", ' text-anchor="middle"');
  });
  b += text((X0 + X1) / 2, Y1 + 32, "chain length, x (repeat units)", "small dim", ' text-anchor="middle"');
  b += text(X0 - 6, Y0 + 4, "1", "small dim", ' text-anchor="end"');
  b += text(X0 - 6, Y1 + 4, "0", "small dim", ' text-anchor="end"');
  // legend, each line naming where its own curve peaks (computed above)
  const XR = 478;
  const leg = (y, col, dash, name, where) => {
    let s = '<line x1="' + XR + '" y1="' + (y - 4) + '" x2="' + (XR + 22) + '" y2="' + (y - 4) + '" stroke="' + col + '" stroke-width="2.2"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
    s += text(XR + 30, y, name, "small");
    s += text(XR + 30, y + 15, where, "small dim");
    return s;
  };
  b += leg(52, DIM, "5 4", "number of chains", "largest at x = " + nx);
  b += leg(96, BLUE, "", "mass of chains", "peaks at x = " + wx + ", near DP" + sub("n"));
  b += leg(140, GREEN, "", "GPC trace, dw/dlog M", "peaks at x = " + gx + ", near DP" + sub("w"));
  b += text(XR, 186, "Each curve scaled to its", "small dim");
  b += text(XR, 202, "own maximum.", "small dim");
  const caption = "One sample, three pictures. In a most-probable distribution (&#272;&nbsp;=&nbsp;2) the single commonest chain is the shortest one, yet almost none of the mass is there: weighting each chain by its length moves the maximum out to DP<sub>n</sub>. A GPC trace is plotted against log&nbsp;M, which weights by length once more, and moves the peak again, to within a percent of DP<sub>w</sub>. So the peak of a chromatogram is not M<sub>n</sub>, and for a broad sample it is not even close to it.";
  const source = "Number fraction (1&nbsp;&minus;&nbsp;p)p<sup>x&minus;1</sup> and weight fraction x(1&nbsp;&minus;&nbsp;p)<sup>2</sup>p<sup>x&minus;1</sup>: Flory, <i>J. Am. Chem. Soc.</i> 58 (1936) 1877. The trace per unit log&nbsp;M is proportional to M&nbsp;w(M). Drawn for p&nbsp;=&nbsp;0.99.";
  return panel("mwd-views", "The same most-probable chain-length distribution drawn three ways: number of chains falling from a maximum at one repeat unit, mass of chains peaking near the number-average length of 100, and the GPC trace per log M peaking near the weight-average length of 199.", 680, 250, b, caption, source);
}

// ---- 9. Mn, Mw and Mz on one trace ---------------------------------------------
// A log-normal (Wesslau) distribution, the shape most GPC traces resemble,
// with its averages placed where the moments put them. A few slices are drawn
// to show what the page's sums run over.
function gpcAverages() {
  const D = 2, MP = 5e4;
  const s2 = Math.log(D), s = Math.sqrt(s2);
  const Mn = MP * Math.exp(-s2 / 2), Mw = MP * Math.exp(s2 / 2), Mz = MP * Math.exp(1.5 * s2);
  const L0 = 3, L1 = 6.3;                                    // log10 M range
  const X0 = 40, Y0 = 34, X1 = 470, Y1 = 200;
  const sx = (M) => X0 + (Math.log10(M) - L0) / (L1 - L0) * (X1 - X0);
  const sy = (v) => Y1 - v * (Y1 - Y0);
  const h = (M) => Math.exp(-Math.pow(Math.log(M / MP), 2) / (2 * s2));   // dw/dlnM, peak 1
  let b = "";
  // slices: thin bars under the curve, one highlighted
  const SL = 0.1;                                              // slice width in log10 M
  for (let k = 0; k <= 25; k++) {
    const L = 3.4 + k * SL;
    const M = Math.pow(10, L + SL / 2), x = sx(Math.pow(10, L));
    const hi = k === 8;                                        // a slice on the low side, where there is room to label it
    b += '<rect x="' + f1(x + 0.6) + '" y="' + f1(sy(h(M))) + '" width="' + f1((X1 - X0) * SL / (L1 - L0) - 1.2) + '" height="' + f1(Y1 - sy(h(M))) + '" fill="' + (hi ? GREEN : BLUE) + '" fill-opacity="' + (hi ? 0.55 : 0.12) + '"/>';
    if (hi) {
      b += text(x - 5, sy(h(M)) + 4, "slice i: height h" + sub("i"), "small", ' text-anchor="end"' + tint(GREEN));
      b += text(x - 5, sy(h(M)) + 22, "at M" + sub("i"), "small", ' text-anchor="end"' + tint(GREEN));
    }
  }
  b += axes(X0, Y0, X1, Y1);
  const pts = [];
  for (let i = 0; i <= 220; i++) { const L = L0 + (L1 - L0) * i / 220; pts.push([sx(Math.pow(10, L)), sy(h(Math.pow(10, L)))]); }
  b += '<path d="' + pathOf(pts) + '" fill="none" stroke="var(--text)" stroke-width="2"/>';
  // the averages
  const fmtM = (M) => (M / 1000).toFixed(1) + "k";
  [[Mn, "M" + sub("n"), VIOLET], [MP, "M" + sub("p"), DIM], [Mw, "M" + sub("w"), BLUE], [Mz, "M" + sub("z"), GREEN]].forEach(([M, lab, col], i) => {
    const x = sx(M);
    b += '<line x1="' + f1(x) + '" y1="' + f1(sy(h(M))) + '" x2="' + f1(x) + '" y2="' + Y1 + '" stroke="' + col + '" stroke-width="' + (i === 1 ? 1 : 1.8) + '"' + (i === 1 ? ' stroke-dasharray="2 3"' : "") + "/>";
    b += text(x, Y1 + 16 + (i === 1 ? 14 : 0), lab, "small", ' text-anchor="middle"');
  });
  // decade ticks
  [3, 4, 5, 6].forEach((L) => {
    b += '<line x1="' + f1(sx(Math.pow(10, L))) + '" y1="' + Y1 + '" x2="' + f1(sx(Math.pow(10, L))) + '" y2="' + (Y1 - 4) + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
    b += text(sx(Math.pow(10, L)), Y1 + 48, "10" + sup(String(L)), "small dim", ' text-anchor="middle"');
  });
  b += text(X1, Y1 + 62, "M (g/mol), log scale", "small dim", ' text-anchor="end"');
  b += text(X0 + 4, Y0 - 12, "detector signal, dw/dlog M", "small dim");
  // elution direction: high M comes off first
  b += '<path d="M' + (X1 - 10) + "," + (Y0 - 16) + " L" + (X1 - 110) + "," + (Y0 - 16) + '" stroke="' + DIM + '" stroke-width="1.2" marker-end="url(#gpc-arrow)" fill="none"/>';
  b += '<defs><marker id="gpc-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" fill="' + DIM + '"/></marker></defs>';
  b += text(X1 - 116, Y0 - 12, "elutes later", "small dim", ' text-anchor="end"');
  // the spacing, computed
  const XR = 500;
  const step = Math.log10(Mw / Mn);
  b += text(XR, 40, "Drawn for &#272; = " + D.toFixed(1) + ":", "small dim");
  [["M" + sub("n"), Mn], ["M" + sub("p"), MP], ["M" + sub("w"), Mw], ["M" + sub("z"), Mz]].forEach(([lab, M], i) => {
    b += text(XR, 60 + i * 20, lab + " = " + fmtM(M) + " g/mol", "small");
  });
  b += text(XR, 148, "On a log axis the three", "small dim");
  b += text(XR, 164, "averages are evenly", "small dim");
  b += text(XR, 180, "spaced by log &#272; (" + step.toFixed(2) + " decades),", "small dim");
  b += text(XR, 196, "and the peak sits halfway", "small dim");
  b += text(XR, 212, "from M" + sub("n") + " to M" + sub("w") + ".", "small dim");
  const caption = "The three sums on this page run over the same slices; they differ only in how hard they weight the heavy end. M<sub>n</sub> divides each slice by its M and is dragged down by the low tail; M<sub>w</sub> is a plain mass average; M<sub>z</sub> multiplies by M again and is pulled toward the high tail. The trace is drawn against log&nbsp;M, increasing to the right as papers plot it; on the column itself the order is reversed, because the largest chains elute first.";
  const source = "Log-normal weight distribution (Wesslau, <i>Makromol. Chem.</i> 20 (1956) 111), for which M<sub>n</sub>, M<sub>w</sub> and M<sub>z</sub> are M<sub>p</sub>e<sup>&minus;s&sup2;/2</sup>, M<sub>p</sub>e<sup>s&sup2;/2</sup> and M<sub>p</sub>e<sup>3s&sup2;/2</sup>, s being the width in ln&nbsp;M.";
  return panel("gpc-averages", "A gel permeation chromatography trace drawn as slices against log molar mass, with the number-, weight- and z-average molar masses and the peak marked. For a dispersity of 2 the three averages are evenly spaced on the log axis and the peak lies halfway between the number and weight averages.", 680, 280, b, caption, source);
}

// ---- 10. Carothers, with a stoichiometric imbalance -------------------------
// Xn = (1 + r)/(1 + r - 2rp) for an AA + BB step-growth polymerization with
// r = N_A/N_B <= 1. At r = 1 it is 1/(1 - p); at p = 1 it stops at (1 + r)/(1 - r).
function carothers() {
  const X0 = 58, Y0 = 36, X1 = 430, Y1 = 206;
  const P0 = 0.9, LMIN = Math.log10(5), LMAX = 3;            // Xn from 5 to 1000, log scale
  const sx = (p) => X0 + (p - P0) / (1 - P0) * (X1 - X0);
  const sy = (xn) => Y1 - (Math.log10(xn) - LMIN) / (LMAX - LMIN) * (Y1 - Y0);
  const Xn = (p, r) => (1 + r) / (1 + r - 2 * r * p);
  let b = "";
  // decade gridlines
  [10, 100, 1000].forEach((v) => {
    b += '<line x1="' + X0 + '" y1="' + f1(sy(v)) + '" x2="' + X1 + '" y2="' + f1(sy(v)) + '" stroke="' + BORDER + '" stroke-width="0.8" stroke-dasharray="2 4"/>';
    b += text(X0 - 6, sy(v) + 4, String(v), "small dim", ' text-anchor="end"');
  });
  b += axes(X0, Y0, X1, Y1);
  const series = [[1, BLUE, ""], [0.99, GREEN, ""], [0.98, VIOLET, ""], [0.95, DIM, "5 4"]];
  series.forEach(([r, col, dash]) => {
    const pts = [];
    for (let i = 0; i <= 160; i++) {
      const p = P0 + (1 - P0) * i / 160, v = Xn(p, r);
      if (v <= 1000) pts.push([sx(p), sy(v)]);
    }
    b += '<path d="' + pathOf(pts) + '" fill="none" stroke="' + col + '" stroke-width="2.2"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
    const end = Xn(1, r);
    const lab = r === 1 ? "r = 1.00, no limit" : "r = " + r.toFixed(2) + ", stops at " + end.toFixed(0);
    b += text(X1 + 6, (r === 1 ? Y0 + 4 : sy(end) + 4), lab, "small", tint(col === DIM ? "var(--text-dim)" : col));
  });
  // p ticks
  [0.9, 0.92, 0.94, 0.96, 0.98, 1].forEach((p) => {
    b += '<line x1="' + f1(sx(p)) + '" y1="' + Y1 + '" x2="' + f1(sx(p)) + '" y2="' + (Y1 + 4) + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
    b += text(sx(p), Y1 + 16, p === 1 ? "1" : p.toFixed(2), "small dim", ' text-anchor="middle"');
  });
  b += text((X0 + X1) / 2, Y1 + 32, "extent of reaction, p", "small dim", ' text-anchor="middle"');
  b += text(X0 - 50, Y0 - 20, "X" + sub("n") + ", log scale", "small dim");
  // one point worth reading off: 99% conversion at perfect balance
  const px = sx(0.99), py = sy(Xn(0.99, 1));
  b += '<circle cx="' + f1(px) + '" cy="' + f1(py) + '" r="3.5" fill="' + BLUE + '"/>';
  b += text(px - 8, py - 8, "p = 0.99: X" + sub("n") + " = " + Xn(0.99, 1).toFixed(0), "small", ' text-anchor="end"');
  const caption = "Step growth builds long chains only at the very end. At perfect balance X<sub>n</sub>&nbsp;=&nbsp;1/(1&nbsp;&minus;&nbsp;p), so 99% of the functional groups must react before the average chain is a hundred monomer units long. An excess of either monomer caps the chains: once the minority groups are used up there is nothing left to join, and X<sub>n</sub> stops at (1&nbsp;+&nbsp;r)/(1&nbsp;&minus;&nbsp;r) however long the reaction runs. A 1% mismatch in weighing holds the average chain below 199 monomer units, about a hundred diol&ndash;diacid repeats; a 5% one, below 39.";
  const source = "X<sub>n</sub>&nbsp;=&nbsp;(1&nbsp;+&nbsp;r)/(1&nbsp;+&nbsp;r&nbsp;&minus;&nbsp;2rp): Carothers, <i>Trans. Faraday Soc.</i> 32 (1936) 39; Odian, <i>Principles of Polymerization</i>, 4th ed., Sec. 2-6. r is the ratio of A to B groups, at most 1, and X<sub>n</sub> counts monomer residues.";
  return panel("carothers", "Number-average degree of polymerization against extent of reaction on a log scale, for stoichiometric ratios of 1, 0.99, 0.98 and 0.95. At a ratio of 1 the curve rises without limit; the others level off at 199, 99 and 39.", 680, 250, b, caption, source);
}

// ---- 11. ring strain, from Odian Table 7-1 ----------------------------------
// Cycloalkane to polymethylene at 25 C, liquid monomer to crystalline polymer.
// Values transcribed from the page image of the table (book p. 545), not from
// a text dump, which interleaves table rows.
const ODIAN_7_1 = [   // n, dH (kJ/mol), dS (J/mol/K), dG (kJ/mol), as printed
  [3, -113.0, -69.1, -92.5], [4, -105.1, -55.3, -90.0], [5, -21.2, -42.7, -9.2],
  [6, 2.9, -10.5, 5.9], [7, -21.8, -15.9, -16.3], [8, -34.8, -3.3, -34.3]
];
function ringStrain() {
  const X0 = 64, Y0 = 26, X1 = 470, Y1 = 220;
  const VMIN = -120, VMAX = 30;
  const sy = (v) => Y0 + (VMAX - v) / (VMAX - VMIN) * (Y1 - Y0);
  const GW = (X1 - X0) / ODIAN_7_1.length, BW = 15;
  let b = "";
  [-120, -90, -60, -30, 0, 30].forEach((v) => {
    b += '<line x1="' + X0 + '" y1="' + f1(sy(v)) + '" x2="' + X1 + '" y2="' + f1(sy(v)) + '" stroke="' + BORDER + '" stroke-width="' + (v === 0 ? 1.2 : 0.8) + '"' + (v === 0 ? "" : ' stroke-dasharray="2 4"') + "/>";
    b += text(X0 - 6, sy(v) + 4, v === 0 ? "0" : (v > 0 ? "+" : "&#8722;") + Math.abs(v), "small dim", ' text-anchor="end"');
  });
  const bar = (x, v, col, op) => {
    const ya = sy(Math.max(v, 0)), yb = sy(Math.min(v, 0));
    return '<rect x="' + f1(x) + '" y="' + f1(ya) + '" width="' + BW + '" height="' + f1(Math.max(yb - ya, 0.8)) + '" fill="' + col + '" fill-opacity="' + op + '"/>';
  };
  ODIAN_7_1.forEach(([n, dH, dS, dG], i) => {
    const cx = X0 + GW * (i + 0.5);
    const mTdS = -298.15 * dS / 1000;                          // the entropy penalty, positive
    b += bar(cx - 1.5 * BW - 2, dH, BLUE, 0.85);
    b += bar(cx - 0.5 * BW, mTdS, VIOLET, 0.75);
    b += bar(cx + 0.5 * BW + 2, dG, dG > 0 ? "#c45c5c" : GREEN, 0.9);
    const gy = dG > 0 ? sy(dG) - 5 : sy(dG) + 13;
    b += text(cx + BW + 2, gy, (dG > 0 ? "+" : "&#8722;") + Math.abs(dG).toFixed(1), "small", ' text-anchor="middle"');
    b += text(cx, Y1 + 16, String(n), "small", ' text-anchor="middle"');
  });
  b += text((X0 + X1) / 2, Y1 + 32, "ring size, n (atoms in the ring)", "small dim", ' text-anchor="middle"');
  b += text(X0 - 56, Y0 - 12, "kJ/mol, 25 &#176;C", "small dim");
  // legend
  const XR = 500;
  const leg = (y, col, op, s1, s2) =>
    '<rect x="' + XR + '" y="' + (y - 9) + '" width="12" height="12" fill="' + col + '" fill-opacity="' + op + '"/>' +
    text(XR + 18, y + 1, s1, "small") + (s2 ? text(XR + 18, y + 16, s2, "small dim") : "");
  b += leg(44, BLUE, 0.85, "&#916;H, ring strain released", "");
  b += leg(72, VIOLET, 0.75, "&#8722;T&#916;S, entropy lost", "");
  b += leg(100, GREEN, 0.9, "&#916;G &lt; 0: polymerizes", "");
  b += leg(128, "#c45c5c", 0.9, "&#916;G &gt; 0: will not", "");
  b += text(XR, 166, "Only the six-membered ring", "small dim");
  b += text(XR, 182, "has nothing to release: it", "small dim");
  b += text(XR, 198, "is the one cycloalkane that", "small dim");
  b += text(XR, 214, "cannot be polymerized.", "small dim");
  const caption = "Where the driving force comes from. Three- and four-membered rings carry so much bond-angle strain that the entropy cost of tying monomers into a chain hardly matters. The five-membered ring holds much less, eclipsing strain only, and the entropy term takes away most of it. Cyclohexane is strain-free, and opening it costs enthalpy as well as entropy. Seven- and eight-membered rings regain some strain from crowding across the ring. Heterocycles follow the pattern only loosely. Their heteroatom gives an initiator somewhere to attack, which a cycloalkane lacks, and six-membered lactams and lactones do polymerize where cyclohexane cannot.";
  const source = "Odian, <i>Principles of Polymerization</i>, 4th ed., Table 7-1 (cycloalkane to polymethylene, liquid monomer to crystalline polymer, 25&nbsp;&deg;C; data of Dainton and Ivin 1958, Finke et al. 1956, Cubbon 1964). &#916;G is as printed; &#8722;T&#916;S is computed from the tabulated &#916;S at 298&nbsp;K.";
  return panel("ring-strain", "Grouped bars for cycloalkane ring sizes three to eight showing the enthalpy, the entropy penalty and the free energy of polymerization at 25 degrees Celsius. Free energy is strongly negative for three- and four-membered rings, mildly negative for five, seven and eight, and positive only for the six-membered ring.", 680, 260, b, caption, source);
}

// ---- 12. when a diblock orders, and into what ---------------------------------
// The mean-field (random-phase approximation) stability limit of the
// disordered melt, computed from Leibler's structure factor with Debye
// functions, and the sequence of ordered phases along composition.
const debyeG = (f, x) => 2 * (f * x + Math.exp(-f * x) - 1) / (x * x);
function leiblerSpinodal(f) {
  let best = Infinity;
  for (let x = 0.5; x < 30; x += 0.01) {
    const saa = debyeG(f, x), sbb = debyeG(1 - f, x), sab = 0.5 * (debyeG(1, x) - saa - sbb);
    const v = (saa + sbb + 2 * sab) / (saa * sbb - sab * sab);
    if (v < best) best = v;
  }
  return best / 2;
}
function blockPhases() {
  const X0 = 52, Y0 = 92, X1 = 452, Y1 = 236;
  const CMAX = 60;
  const sx = (f) => X0 + f * (X1 - X0);
  const sy = (c) => Y1 - c / CMAX * (Y1 - Y0);
  const crit = leiblerSpinodal(0.5);
  if (Math.abs(crit - 10.495) > 0.01) throw new Error("spinodal at f = 0.5 is " + crit + ", expected 10.495");
  let b = "";
  // disordered region under the curve
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const f = 0.05 + 0.9 * i / 120, c = leiblerSpinodal(f);
    if (c <= CMAX) pts.push([sx(f), sy(c)]);
  }
  const fl = pts[0], fr = pts[pts.length - 1];
  // mixed everywhere below the curve, including the lopsided ends where it runs off the top
  b += '<path d="M' + X0 + "," + Y1 + " L" + X0 + "," + Y0 + " L" + f1(fl[0]) + "," + Y0 + " " + pathOf(pts).replace(/^M/, "L") + " L" + f1(fr[0]) + "," + Y0 + " L" + X1 + "," + Y0 + " L" + X1 + "," + Y1 + ' Z" fill="' + DIM + '" fill-opacity="0.08" stroke="none"/>';
  b += '<path d="' + pathOf(pts) + '" fill="none" stroke="' + BLUE + '" stroke-width="2.4"/>';
  b += axes(X0, Y0, X1, Y1);
  b += '<circle cx="' + f1(sx(0.5)) + '" cy="' + f1(sy(crit)) + '" r="3.5" fill="' + BLUE + '"/>';
  b += text(sx(0.5), sy(crit) + 16, "&#967;N = " + crit.toFixed(3) + " at f = 0.5", "small", ' text-anchor="middle"');
  b += text(sx(0.5), sy(44), "ordered", "small dim", ' text-anchor="middle"');
  b += text(sx(0.5), Y1 - 34, "disordered", "small dim", ' text-anchor="middle"');
  [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
    b += '<line x1="' + f1(sx(f)) + '" y1="' + Y1 + '" x2="' + f1(sx(f)) + '" y2="' + (Y1 + 4) + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
    b += text(sx(f), Y1 + 16, String(f), "small dim", ' text-anchor="middle"');
  });
  [0, 20, 40, 60].forEach((c) => b += text(X0 - 6, sy(c) + 4, String(c), "small dim", ' text-anchor="end"'));
  b += text((X0 + X1) / 2, Y1 + 32, "f" + sub("A") + ", volume fraction of block A", "small dim", ' text-anchor="middle"');
  b += text(X0 - 44, Y0 - 6, "&#967;N", "small dim");
  // morphology strip along the top: minority block drawn solid
  const S = 34, YI = 18;
  const icon = (f, kind) => {
    const x = sx(f) - S / 2, minor = f < 0.5 ? BLUE : GREEN, major = f < 0.5 ? GREEN : BLUE;
    let s = '<rect x="' + f1(x) + '" y="' + YI + '" width="' + S + '" height="' + S + '" rx="4" fill="' + major + '" fill-opacity="0.18" stroke="' + BORDER + '"/>';
    if (kind === "S") [[9, 9], [25, 9], [17, 17], [9, 25], [25, 25]].forEach(([u, v]) => { s += '<circle cx="' + f1(x + u) + '" cy="' + (YI + v) + '" r="3.6" fill="' + minor + '"/>'; });
    if (kind === "C") [7, 17, 27].forEach((v) => { s += '<rect x="' + f1(x + 4) + '" y="' + (YI + v - 3) + '" width="' + (S - 8) + '" height="6" rx="3" fill="' + minor + '"/>'; });
    if (kind === "G") {
      s += '<path d="M' + f1(x + 4) + "," + (YI + 10) + " q6,-8 13,0 t13,0 M" + f1(x + 4) + "," + (YI + 24) + " q6,8 13,0 t13,0 M" + f1(x + 17) + "," + (YI + 10) + " v14" + '" fill="none" stroke="' + minor + '" stroke-width="4" stroke-linecap="round"/>';
    }
    if (kind === "L") [0, 1, 2].forEach((k) => { s += '<rect x="' + f1(x + 2 + k * 11) + '" y="' + (YI + 2) + '" width="5.5" height="' + (S - 4) + '" fill="' + BLUE + '"/>'; });
    return s + text(sx(f), YI + S + 14, kind === "S" ? "spheres" : kind === "C" ? "cylinders" : kind === "G" ? "gyroid" : "lamellae", "small dim", ' text-anchor="middle"');
  };
  b += icon(0.1, "S") + icon(0.24, "C") + icon(0.36, "G") + icon(0.5, "L") + icon(0.64, "G") + icon(0.76, "C") + icon(0.9, "S");
  const XR = 486;
  b += text(XR, 104, "The curve is the mean-field", "small dim");
  b += text(XR, 120, "limit of stability of the", "small dim");
  b += text(XR, 136, "mixed melt. Only at f = 0.5", "small dim");
  b += text(XR, 152, "is it also where ordering", "small dim");
  b += text(XR, 168, "begins; at other f the", "small dim");
  b += text(XR, 184, "ordered phase appears a", "small dim");
  b += text(XR, 200, "little below it.", "small dim");
  const caption = "Two numbers decide a diblock&rsquo;s structure. &#967;N, the incompatibility per chain, decides whether it orders at all: below the curve the blocks stay mixed. Composition decides what it orders into, running from spheres of the minority block through cylinders and the gyroid to lamellae at a near-even split, then back again with the blocks&rsquo; roles exchanged. A symmetric diblock is the easiest to order, at &#967;N&nbsp;&asymp;&nbsp;10.5; a lopsided one needs much longer chains or much more incompatible blocks. Real melts order somewhat above the mean-field value, because composition fluctuations stabilize the mixed state, and the shortest chains most.";
  const source = "Stability limit from the random-phase structure factor: Leibler, <i>Macromolecules</i> 13 (1980) 1602. Fluctuation shift: Fredrickson and Helfand, <i>J. Chem. Phys.</i> 87 (1987) 697. Phase sequence: Matsen and Bates, <i>Macromolecules</i> 29 (1996) 1091; the gyroid is stable only at intermediate &#967;N, and the icons mark the order of phases, not their boundaries.";
  return panel("block-phases", "The mean-field order-disorder curve of a diblock copolymer, chi N against volume fraction, with its minimum of 10.5 at a volume fraction of one half, beneath a strip of morphologies running spheres, cylinders, gyroid, lamellae, gyroid, cylinders, spheres.", 680, 280, b, caption, source);
}

// ---- 13. Flory-Huggins: a blend and a solution -------------------------------
// Free energy of mixing per lattice site, phi = volume fraction of component 2:
//   f = (1-phi) ln(1-phi)/N1 + phi ln(phi)/N2 + chi phi (1-phi)
// The binodal is the common tangent, found here numerically, and checked
// against the closed form that exists for equal chains before it is trusted.
function fhFns(N1, N2, chi) {
  return {
    f: (p) => (1 - p) * Math.log(1 - p) / N1 + p * Math.log(p) / N2 + chi * p * (1 - p),
    d: (p) => -(Math.log(1 - p) + 1) / N1 + (Math.log(p) + 1) / N2 + chi * (1 - 2 * p)
  };
}
// the two roots of 2 chi = 1/(N1 (1-phi)) + 1/(N2 phi), or null below critical
function fhSpinodal(N1, N2, chi) {
  const g = (p) => 1 / (N1 * (1 - p)) + 1 / (N2 * p) - 2 * chi;
  const pc = Math.sqrt(N1) / (Math.sqrt(N1) + Math.sqrt(N2));
  if (g(pc) >= 0) return null;
  const bis = (lo, hi) => { for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if ((g(lo) > 0) === (g(m) > 0)) lo = m; else hi = m; } return (lo + hi) / 2; };
  return [bis(1e-300, pc), bis(pc, 1 - 1e-16)];
}
function fhBinodal(N1, N2, chi) {
  const sp = fhSpinodal(N1, N2, chi);
  if (!sp) return null;
  const { f, d } = fhFns(N1, N2, chi);
  const [s1, s2] = sp;
  // for a point a on the phi-poor side, the point b on the rich side with the same slope
  const partner = (a) => {
    const t = d(a);
    if (t < d(s2)) return null;
    let lo = s2, hi = 1 - 1e-16;
    for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2; if (d(m) < t) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const h = (a) => { const b = partner(a); return b === null ? null : f(b) - f(a) - d(a) * (b - a); };
  // walk away from the spinodal in growing steps of log a until h changes
  // sign, then bisect on log a. Near the critical point the root sits very
  // close to the spinodal, so the first steps have to be small.
  let prevL = null, prevH = null, bracket = null;
  const Ls = Math.log10(s1);
  for (let step = 1e-6; Ls - step > -300; step *= 1.25) {
    const L = Ls - step, v = h(Math.pow(10, L));
    if (v === null) continue;
    if (prevH !== null && (prevH > 0) !== (v > 0)) { bracket = [L, prevL]; break; }
    prevL = L; prevH = v;
  }
  if (!bracket) return null;
  let [lo, hi] = bracket;
  const hlo = h(Math.pow(10, lo)) > 0;
  for (let k = 0; k < 100; k++) { const m = (lo + hi) / 2; if ((h(Math.pow(10, m)) > 0) === hlo) lo = m; else hi = m; }
  const a = Math.pow(10, (lo + hi) / 2);
  return [a, partner(a)];
}
function floryHuggins() {
  let b = "";
  // left: symmetric blend, in chi N, where it is universal
  {
    const X0 = 46, Y0 = 30, X1 = 276, Y1 = 196, CMIN = 1, CMAX = 4;
    const sx = (p) => X0 + p * (X1 - X0), sy = (c) => Y1 - (c - CMIN) / (CMAX - CMIN) * (Y1 - Y0);
    // the numerical binodal must reproduce the closed form chi N = ln(phi/(1-phi))/(2 phi - 1)
    const N = 1000, chiN = 3;
    const nb = fhBinodal(N, N, chiN / N);
    const closed = (p) => Math.log(p / (1 - p)) / (2 * p - 1);
    if (!nb || Math.abs(closed(nb[0]) - chiN) > 1e-6 || Math.abs(nb[0] + nb[1] - 1) > 1e-8) throw new Error("blend binodal check failed: " + nb);
    const bin = [], spn = [];
    for (let i = 1; i < 200; i++) {
      const p = i / 200;
      const cb = Math.abs(p - 0.5) < 1e-9 ? 2 : closed(p), cs = 1 / (2 * p * (1 - p));
      if (cb <= CMAX) bin.push([sx(p), sy(cb)]);
      if (cs <= CMAX) spn.push([sx(p), sy(cs)]);
    }
    b += '<path d="' + pathOf(bin) + '" fill="none" stroke="var(--text)" stroke-width="2.2"/>';
    b += '<path d="' + pathOf(spn) + '" fill="none" stroke="#c45c5c" stroke-width="1.8" stroke-dasharray="5 4"/>';
    b += axes(X0, Y0, X1, Y1);
    // tie line at chi N = 3, from the numerical binodal
    b += '<line x1="' + f1(sx(nb[0])) + '" y1="' + f1(sy(3)) + '" x2="' + f1(sx(nb[1])) + '" y2="' + f1(sy(3)) + '" stroke="' + DIM + '" stroke-width="1.2"/>';
    [nb[0], nb[1]].forEach((p) => b += '<circle cx="' + f1(sx(p)) + '" cy="' + f1(sy(3)) + '" r="3" fill="var(--text)"/>');
    b += text(sx(0.5), sy(3) - 6, "tie line", "small dim", ' text-anchor="middle"');
    b += '<circle cx="' + f1(sx(0.5)) + '" cy="' + f1(sy(2)) + '" r="3.5" fill="var(--text)"/>';
    b += text(sx(0.5), sy(2) + 16, "&#967;N = 2", "small", ' text-anchor="middle"');
    b += text(sx(0.5), sy(3.75), "two phases", "small dim", ' text-anchor="middle"');
    b += text(sx(0.5), Y1 - 6, "one phase", "small dim", ' text-anchor="middle"');
    [0, 0.5, 1].forEach((p) => b += text(sx(p), Y1 + 16, String(p), "small dim", ' text-anchor="middle"'));
    [1, 2, 3, 4].forEach((c) => b += text(X0 - 6, sy(c) + 4, String(c), "small dim", ' text-anchor="end"'));
    b += text((X0 + X1) / 2, Y1 + 32, "&#966;, blend of two equal chains", "small dim", ' text-anchor="middle"');
    b += text(X0 - 34, Y0 - 12, "&#967;N", "small dim");
  }
  // right: polymer in a small-molecule solvent, three chain lengths
  {
    const X0 = 362, Y0 = 30, X1 = 592, Y1 = 196, PMAX = 0.5, CMIN = 0.45, CMAX = 0.75;
    const sx = (p) => X0 + p / PMAX * (X1 - X0), sy = (c) => Y1 - (c - CMIN) / (CMAX - CMIN) * (Y1 - Y0);
    b += '<line x1="' + X0 + '" y1="' + f1(sy(0.5)) + '" x2="' + X1 + '" y2="' + f1(sy(0.5)) + '" stroke="' + DIM + '" stroke-width="1" stroke-dasharray="2 3"/>';
    b += text(X1, sy(0.5) + 14, "&#952;: &#967; = 1/2", "small dim", ' text-anchor="end"');
    const NS = [[100, VIOLET], [1000, BLUE], [10000, GREEN]];
    NS.forEach(([N, col]) => {
      const pc = 1 / (1 + Math.sqrt(N)), cc = 0.5 * Math.pow(1 + 1 / Math.sqrt(N), 2);
      const left = [], right = [];
      let solved = 0;
      for (let i = 1; i <= 60; i++) {
        const chi = cc + (CMAX - cc) * Math.pow(i / 60, 1.6);
        const bn = fhBinodal(1, N, chi);
        if (!bn) continue;
        solved++;
        left.push([sx(bn[0]), sy(chi)]);
        if (bn[1] <= PMAX) right.push([sx(bn[1]), sy(chi)]);
      }
      if (solved < 55) throw new Error("binodal for N = " + N + " solved at only " + solved + " of 60 points");
      const curve = left.reverse().concat([[sx(pc), sy(cc)]], right);
      b += '<path d="' + pathOf(curve) + '" fill="none" stroke="' + col + '" stroke-width="2.2"/>';
      b += '<circle cx="' + f1(sx(pc)) + '" cy="' + f1(sy(cc)) + '" r="3" fill="' + col + '"/>';
    });
    b += axes(X0, Y0, X1, Y1);
    [0, 0.25, 0.5].forEach((p) => b += text(sx(p), Y1 + 16, String(p), "small dim", ' text-anchor="middle"'));
    [0.5, 0.6, 0.7].forEach((c) => b += text(X0 - 6, sy(c) + 4, c.toFixed(1), "small dim", ' text-anchor="end"'));
    b += text((X0 + X1) / 2, Y1 + 32, "&#966; of polymer in a solvent", "small dim", ' text-anchor="middle"');
    b += text(X0 - 30, Y0 - 12, "&#967;", "small dim");
  }
  // one legend for both panels: line styles, then the chain lengths
  const XL = 606;
  const key = (y, col, dash, w, label) => '<line x1="' + XL + '" y1="' + (y - 4) + '" x2="' + (XL + 20) + '" y2="' + (y - 4) + '" stroke="' + col + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>" + text(XL + 25, y, label, "small");
  b += key(44, "var(--text)", "", 2.2, "binodal");
  b += key(62, "#c45c5c", "5 4", 1.8, "spinodal");
  b += text(XL, 90, "polymer in", "small dim");
  b += text(XL, 104, "solvent:", "small dim");
  b += key(122, VIOLET, "", 2.2, "N = 100");
  b += key(140, BLUE, "", 2.2, "N = 1000");
  b += key(158, GREEN, "", 2.2, "N = 10&#8201;000");
  b += text(XL, 184, "dots mark", "small dim");
  b += text(XL, 198, "critical points", "small dim");
  const N1000 = 1000;
  const caption = "Left: a blend of two chains of equal length N, which needs only one number, &#967;N. The coexisting compositions (binodal) and the limit of stability (spinodal) meet at &#967;N&nbsp;=&nbsp;2, so two polymers of N&nbsp;=&nbsp;" + N1000 + " demix once &#967; passes " + (2 / N1000).toFixed(3) + ", a value almost any chemical difference exceeds. Right: one polymer in a small-molecule solvent, where the diagram is lopsided. As the chains lengthen, the critical point slides toward the solvent-rich side and down toward &#967;&nbsp;=&nbsp;1/2, and the phase that separates out is nearly pure solvent. That is the shape Shultz and Flory measured for polystyrene in cyclohexane, and it is why a theta solvent is defined by the infinitely long chain.";
  const source = "Curves computed from Flory&ndash;Huggins theory by common tangent. Critical point &#966;<sub>c</sub>&nbsp;=&nbsp;1/(1&nbsp;+&nbsp;&radic;N), &#967;<sub>c</sub>&nbsp;=&nbsp;&frac12;(1&nbsp;+&nbsp;1/&radic;N)<sup>2</sup> for a polymer in solvent; experiment: Shultz and Flory, <i>J. Am. Chem. Soc.</i> 74 (1952) 4760.";
  return panel("fh-phase", "Two computed phase diagrams. Left, a symmetric polymer blend in chi N against composition: binodal and spinodal meeting at chi N equal to 2, with a tie line. Right, a polymer in solvent for chain lengths 100, 1000 and 10000: lopsided binodals whose critical points move toward low polymer fraction and toward chi equal to one half as the chains lengthen.", 680, 240, b, caption, source);
}

// ---- 14. Fox, with the page's own copolymer ---------------------------------------
function foxTg() {
  const T1 = -54, T2 = 105, K = 273.15;                      // BA, MMA (deg C)
  const fox = (w) => 1 / ((1 - w) / (T1 + K) + w / (T2 + K)) - K;
  const lin = (w) => (1 - w) * T1 + w * T2;
  const X0 = 58, Y0 = 26, X1 = 430, Y1 = 206, TMIN = -90, TMAX = 130;
  const sx = (w) => X0 + w * (X1 - X0), sy = (t) => Y1 - (t - TMIN) / (TMAX - TMIN) * (Y1 - Y0);
  let b = "";
  [-50, 0, 50, 100].forEach((t) => {
    b += '<line x1="' + X0 + '" y1="' + f1(sy(t)) + '" x2="' + X1 + '" y2="' + f1(sy(t)) + '" stroke="' + BORDER + '" stroke-width="0.8" stroke-dasharray="2 4"/>';
    b += text(X0 - 6, sy(t) + 4, (t < 0 ? "&#8722;" : "") + Math.abs(t), "small dim", ' text-anchor="end"');
  });
  b += axes(X0, Y0, X1, Y1);
  const L = [], F = [];
  for (let i = 0; i <= 100; i++) { const w = i / 100; L.push([sx(w), sy(lin(w))]); F.push([sx(w), sy(fox(w))]); }
  b += '<path d="' + pathOf(L) + '" fill="none" stroke="' + DIM + '" stroke-width="1.6" stroke-dasharray="5 4"/>';
  b += '<path d="' + pathOf(F) + '" fill="none" stroke="' + BLUE + '" stroke-width="2.4"/>';
  const w = 0.6, tf = fox(w), tl = lin(w);
  b += '<line x1="' + f1(sx(w)) + '" y1="' + f1(sy(tl)) + '" x2="' + f1(sx(w)) + '" y2="' + f1(sy(tf)) + '" stroke="var(--text)" stroke-width="1"/>';
  b += '<circle cx="' + f1(sx(w)) + '" cy="' + f1(sy(tf)) + '" r="3.5" fill="' + BLUE + '"/>';
  b += '<circle cx="' + f1(sx(w)) + '" cy="' + f1(sy(tl)) + '" r="3" fill="' + DIM + '"/>';
  // labels sit on the side of each point the curves leave empty
  b += text(sx(w) - 8, sy(tl) - 8, "linear " + tl.toFixed(1) + " &#176;C", "small dim", ' text-anchor="end"');
  b += text(sx(w) + 8, sy(tf) + 16, "Fox " + tf.toFixed(1) + " &#176;C, " + (tl - tf).toFixed(1) + " K lower", "small", tint(BLUE));
  b += text(sx(0) + 6, sy(T1) + 18, "PBA " + "&#8722;" + Math.abs(T1) + " &#176;C", "small");
  b += text(sx(1) - 6, sy(T2) - 10, "PMMA " + T2 + " &#176;C", "small", ' text-anchor="end"');
  [0, 0.2, 0.4, 0.6, 0.8, 1].forEach((v) => {
    b += '<line x1="' + f1(sx(v)) + '" y1="' + Y1 + '" x2="' + f1(sx(v)) + '" y2="' + (Y1 + 4) + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
    b += text(sx(v), Y1 + 16, String(v), "small dim", ' text-anchor="middle"');
  });
  b += text((X0 + X1) / 2, Y1 + 32, "w, weight fraction of methyl methacrylate", "small dim", ' text-anchor="middle"');
  b += text(X0 - 50, Y0 - 12, "T" + sub("g") + ", &#176;C", "small dim");
  // the degrees-Celsius mistake, computed rather than asserted
  const wrong = 1 / ((1 - w) / T1 + w / T2);
  const XR = 466;
  b += text(XR, 50, "1/T" + sub("g") + " = w" + sub("1") + "/T" + sub("g,1") + " + w" + sub("2") + "/T" + sub("g,2"), "small");
  b += text(XR, 72, "with every T in kelvin.", "small dim");
  b += text(XR, 104, "The same sum in &#176;C at", "small dim");
  b += text(XR, 120, "60:40 gives " + (wrong < 0 ? "&#8722;" : "") + Math.abs(wrong).toFixed(0) + " &#176;C, below", "small dim");
  b += text(XR, 136, "absolute zero: a negative", "small dim");
  b += text(XR, 152, "T" + sub("g") + " has no reciprocal", "small dim");
  b += text(XR, 172, "worth adding.", "small dim");
  const caption = "Fox adds reciprocals, not temperatures, which amounts to saying the two components contribute free volume in proportion to their weight. The curve therefore always sags below the straight line between the homopolymers, and the sag grows with the gap between them: here, a 60:40 methyl methacrylate&ndash;butyl acrylate copolymer lands " + (tl - tf).toFixed(1) + "&nbsp;K below linear mixing. Measured copolymers often sit lower still, or above, which is what the Gordon&ndash;Taylor constant is there to absorb.";
  const source = "Fox, <i>Bull. Am. Phys. Soc.</i> 1 (1956) 123. Homopolymer values: PMMA 105&nbsp;&deg;C (Odian, Table 1-3) and poly(butyl acrylate) &minus;54&nbsp;&deg;C, typical of handbook listings.";
  return panel("fox", "Glass transition against weight fraction of methyl methacrylate in a copolymer with butyl acrylate. The Fox curve sags below the straight line of linear mixing; at 60 percent methyl methacrylate it gives 19.9 degrees Celsius against 41.4 for the straight line.", 680, 250, b, caption, source);
}

// ---- 15. universal calibration, with the page's constants -------------------------
// [eta]M is equal at equal elution volume, so with [eta] = K M^a:
//   log M2 = [log(K1/K2) + (1 + a1) log M1] / (1 + a2)
const MH = {   // THF, 25 C; the same values as the page's reference list
  PS: [1.14e-4, 0.716], PMMA: [1.28e-4, 0.69], PI: [1.77e-4, 0.735], PB: [2.36e-4, 0.75]
};
const universal = (M1, s, t) => Math.pow(10, (Math.log10(MH[s][0] / MH[t][0]) + (1 + MH[s][1]) * Math.log10(M1)) / (1 + MH[t][1]));
function gpcUniversal() {
  let b = "";
  // left: two calibration lines and one reading
  {
    const X0 = 50, Y0 = 26, X1 = 280, Y1 = 196, V0 = 12, V1 = 20, LMIN = 3, LMAX = 6.5;
    const sx = (v) => X0 + (v - V0) / (V1 - V0) * (X1 - X0), sy = (l) => Y1 - (l - LMIN) / (LMAX - LMIN) * (Y1 - Y0);
    const ps = (v) => 6.2 - 0.43 * (v - 13);                // an illustrative column bank
    const pb = (v) => Math.log10(universal(Math.pow(10, ps(v)), "PS", "PB"));
    b += axes(X0, Y0, X1, Y1);
    const line = (fn, col, dash) => {
      const pts = [];
      for (let i = 0; i <= 40; i++) { const v = V0 + 0.5 + (V1 - V0 - 1) * i / 40; pts.push([sx(v), sy(fn(v))]); }
      return '<path d="' + pathOf(pts) + '" fill="none" stroke="' + col + '" stroke-width="2.2"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
    };
    b += line(ps, DIM, "5 4") + line(pb, BLUE, "");
    const V = 16;
    const mA = Math.pow(10, ps(V)), mT = Math.pow(10, pb(V));
    b += '<line x1="' + f1(sx(V)) + '" y1="' + Y1 + '" x2="' + f1(sx(V)) + '" y2="' + f1(sy(ps(V))) + '" stroke="var(--text)" stroke-width="1"/>';
    [[ps(V), DIM], [pb(V), BLUE]].forEach(([l, col]) => {
      b += '<line x1="' + X0 + '" y1="' + f1(sy(l)) + '" x2="' + f1(sx(V)) + '" y2="' + f1(sy(l)) + '" stroke="' + col + '" stroke-width="1" stroke-dasharray="2 3"/>';
      b += '<circle cx="' + f1(sx(V)) + '" cy="' + f1(sy(l)) + '" r="3" fill="' + col + '"/>';
    });
    const k = (m) => (m / 1000).toFixed(0) + "k";
    b += text(X0 + 4, sy(ps(V)) - 5, "PS reads " + k(mA), "small dim");
    b += text(X0 + 4, sy(pb(V)) + 13, "polybutadiene is " + k(mT), "small", tint(BLUE));
    b += text(sx(14.1), sy(ps(12.5)) - 1, "PS standards", "small dim");
    [12, 14, 16, 18, 20].forEach((v) => b += text(sx(v), Y1 + 16, String(v), "small dim", ' text-anchor="middle"'));
    [3, 4, 5, 6].forEach((l) => b += text(X0 - 6, sy(l) + 4, "10" + sup(String(l)), "small dim", ' text-anchor="end"'));
    b += text((X0 + X1) / 2, Y1 + 32, "elution volume (mL)", "small dim", ' text-anchor="middle"');
    b += text(X0 - 40, Y0 - 12, "M (g/mol)", "small dim");
  }
  // right: the conversion factor for each polymer in the page's list
  {
    const X0 = 362, Y0 = 26, X1 = 592, Y1 = 196, LMIN = 3, LMAX = 6, RMIN = 0.3, RMAX = 1.3;
    const sx = (l) => X0 + (l - LMIN) / (LMAX - LMIN) * (X1 - X0), sy = (r) => Y1 - (r - RMIN) / (RMAX - RMIN) * (Y1 - Y0);
    [0.5, 1].forEach((r) => b += '<line x1="' + X0 + '" y1="' + f1(sy(r)) + '" x2="' + X1 + '" y2="' + f1(sy(r)) + '" stroke="' + BORDER + '" stroke-width="' + (r === 1 ? 1.2 : 0.8) + '" stroke-dasharray="2 4"/>');
    b += axes(X0, Y0, X1, Y1);
    [["PMMA", GREEN, "PMMA"], ["PI", VIOLET, "polyisoprene"], ["PB", BLUE, "polybutadiene"]].forEach(([t, col, name]) => {
      const pts = [];
      for (let i = 0; i <= 30; i++) { const l = LMIN + (LMAX - LMIN) * i / 30, M = Math.pow(10, l); pts.push([sx(l), sy(universal(M, "PS", t) / M)]); }
      b += '<path d="' + pathOf(pts) + '" fill="none" stroke="' + col + '" stroke-width="2.2"/>';
      const r5 = universal(1e5, "PS", t) / 1e5;
      b += text(X1 + 6, sy(universal(1e6, "PS", t) / 1e6) + 4, name, "small", tint(col));
      b += '<circle cx="' + f1(sx(5)) + '" cy="' + f1(sy(r5)) + '" r="2.6" fill="' + col + '"/>';
      b += text(sx(5) - 6, sy(r5) - 6, r5.toFixed(2), "small", ' text-anchor="end"');
    });
    b += text(X1 + 6, sy(1) + 4, "PS itself", "small dim");
    [3, 4, 5, 6].forEach((l) => b += text(sx(l), Y1 + 16, "10" + sup(String(l)), "small dim", ' text-anchor="middle"'));
    [0.5, 1].forEach((r) => b += text(X0 - 6, sy(r) + 4, r.toFixed(1), "small dim", ' text-anchor="end"'));
    b += text((X0 + X1) / 2, Y1 + 32, "PS-equivalent M (g/mol)", "small dim", ' text-anchor="middle"');
    b += text(X0 - 40, Y0 - 12, "true M / PS-equivalent M", "small dim");
  }
  const caption = "Left: a column sorts by coil size, so a polymer that swells more than polystyrene in THF carries less mass at each elution volume, and its calibration line sits below the standards&rsquo;. Right: how far the conversion moves the answer for each polymer in this page&rsquo;s list, with the ratio at 100&nbsp;kg/mol marked. Poly(methyl methacrylate) is close to polystyrene, about ten percent high; the polydienes, which are much more expanded in THF, carry half to two thirds of the polystyrene-equivalent mass. None of the ratios is flat, which is why a distribution cannot be corrected by multiplying it by one number.";
  const source = "[&#951;]M equal at equal elution volume: Grubi&#353;i&#263;, Rempp and Beno&icirc;t, <i>J. Polym. Sci. B</i> 5 (1967) 753. Mark&ndash;Houwink constants (THF, 25&nbsp;&deg;C) are the page&rsquo;s reference values: PMMA from Wagner, <i>J. Phys. Chem. Ref. Data</i> 16 (1987) 165; the polydienes from Wu (ed.), <i>Handbook of Size Exclusion Chromatography</i> (1995). The column calibration on the left is illustrative.";
  return panel("gpc-universal", "Left: polystyrene and polybutadiene calibration lines of molar mass against elution volume, the polybutadiene line lower, read at one elution volume. Right: the ratio of true to polystyrene-equivalent molar mass against molar mass for PMMA, about 1.1, polyisoprene, about 0.7, and polybutadiene, about 0.5.", 680, 240, b, caption, source);
}

// ---- pages ------------------------------------------------------------------
const JOBS = [
  { file: "copolymer-composition.html", build: copolymer, before: "<h3>Composition calculator</h3>" },
  { file: "chain-dimensions.html", build: chainDimensions, before: "<h3>DNA is the model system, and it is not a coincidence</h3>" },
  { file: "tts-master-curve.html", build: tts, before: "<h3>Build a master curve</h3>" },
  { file: "hydrogel-mesh-size.html", build: hydrogel, before: "<h3>Mesh size from a swelling measurement</h3>" },
  { file: "radical-kinetics.html", build: radical, before: "<h3>Kinetics calculator</h3>" },
  { file: "conversion-monitoring.html", build: nmr, before: "<h3>Kinetics plot</h3>" },
  { file: "dispersity-predictor.html", build: dispersityTerms, before: "<h3>What this model leaves out</h3>" },
  { file: "mwd-simulator.html", build: mwdViews, before: "<h3>Simulate a distribution</h3>" },
  { file: "gpc-trace.html", build: gpcAverages, before: "<h3>Analyze a trace</h3>" },
  { file: "flory-huggins.html", build: floryHuggins, before: null },
  { file: "tg-predictor.html", build: foxTg, before: null },
  { file: "gpc-calibration.html", build: gpcUniversal, before: null }
];

// ---- 16. cis and trans dienes, from Odian Table 8-1 -------------------------
// Transcribed from the page image (book p. 633), data of Brandrup et al. 1999.
const ODIAN_8_1 = [   // name, isomer, Tg (C), Tm (C)
  ["1,4-polybutadiene", "cis", -95, 6], ["1,4-polybutadiene", "trans", -83, 145],
  ["1,4-polyisoprene", "cis", -73, 28], ["1,4-polyisoprene", "trans", -58, 74]
];
function dieneTransitions() {
  const X0 = 150, X1 = 520, Y0 = 34, TMIN = -120, TMAX = 160, ROW = 34;
  const sx = (t) => X0 + (t - TMIN) / (TMAX - TMIN) * (X1 - X0);
  const Y1 = Y0 + ROW * ODIAN_8_1.length + 8;
  let b = "";
  // room temperature band, where these materials are used
  b += '<rect x="' + f1(sx(20)) + '" y="' + (Y0 - 14) + '" width="' + f1(sx(30) - sx(20)) + '" height="' + (Y1 - Y0 + 14) + '" fill="' + GREEN + '" fill-opacity="0.12"/>';
  b += text(sx(25), Y0 - 18, "room temperature", "small dim", ' text-anchor="middle"');
  [-100, -50, 0, 50, 100, 150].forEach((t) => {
    b += '<line x1="' + f1(sx(t)) + '" y1="' + (Y0 - 6) + '" x2="' + f1(sx(t)) + '" y2="' + Y1 + '" stroke="' + BORDER + '" stroke-width="0.8" stroke-dasharray="2 4"/>';
    b += text(sx(t), Y1 + 16, (t < 0 ? "&#8722;" : "") + Math.abs(t), "small dim", ' text-anchor="middle"');
  });
  b += '<line x1="' + X0 + '" y1="' + Y1 + '" x2="' + X1 + '" y2="' + Y1 + '" stroke="' + BORDER + '" stroke-width="1.2"/>';
  b += text((X0 + X1) / 2, Y1 + 32, "temperature (&#176;C)", "small dim", ' text-anchor="middle"');
  ODIAN_8_1.forEach(([name, iso, tg, tm], i) => {
    const y = Y0 + ROW * i + 12, col = iso === "cis" ? BLUE : VIOLET;
    if (i % 2 === 0) b += text(X0 - 12, y + 22, name, "small", ' text-anchor="end"');
    b += text(X1 + 12, y + 4, iso, "small", tint(col));
    b += '<line x1="' + f1(sx(tg)) + '" y1="' + y + '" x2="' + f1(sx(tm)) + '" y2="' + y + '" stroke="' + col + '" stroke-width="5" stroke-linecap="round" stroke-opacity="0.35"/>';
    b += '<circle cx="' + f1(sx(tg)) + '" cy="' + y + '" r="5" fill="var(--bg)" stroke="' + col + '" stroke-width="2"/>';
    b += '<circle cx="' + f1(sx(tm)) + '" cy="' + y + '" r="5" fill="' + col + '"/>';
    b += text(sx(tg) - 9, y + 4, (tg < 0 ? "&#8722;" : "") + Math.abs(tg), "small dim", ' text-anchor="end"');
    b += text(sx(tm) + 9, y + 4, String(tm), "small dim");
  });
  // key
  const XK = 572;
  b += '<circle cx="' + XK + '" cy="52" r="5" fill="var(--bg)" stroke="var(--text-dim)" stroke-width="2"/>' + text(XK + 10, 56, "T" + sub("g"), "small");
  b += '<circle cx="' + XK + '" cy="72" r="5" fill="var(--text-dim)"/>' + text(XK + 10, 76, "T" + sub("m"), "small");
  b += text(XK - 6, 104, "Between the two", "small dim");
  b += text(XK - 6, 118, "the polymer is", "small dim");
  b += text(XK - 6, 132, "rubbery or partly", "small dim");
  b += text(XK - 6, 146, "crystalline.", "small dim");
  const caption = "The double bond left in a 1,4-diene chain has a geometry, and it decides what the material is. Both <em>cis</em> polymers melt near or below room temperature, so in use they are amorphous rubbers well above their glass transition: <em>cis</em>-polyisoprene is natural rubber. Both <em>trans</em> polymers pack better, melt far higher, and are hard semicrystalline solids at room temperature: <em>trans</em>-polyisoprene is gutta-percha. Natural rubber&rsquo;s melting point sitting just above room temperature is also why it crystallizes when stretched, which is much of its strength.";
  const source = "Odian, <i>Principles of Polymerization</i>, 4th ed., Table 8-1 (data of Brandrup et al., <i>Polymer Handbook</i>, 1999). Reported values vary between sources by several degrees.";
  return panel("diene-transitions", "Glass transition and melting temperature for cis and trans 1,4-polybutadiene and 1,4-polyisoprene on one temperature axis. The cis isomers melt at 6 and 28 degrees Celsius, near room temperature; the trans isomers melt at 145 and 74.", 680, Y1 + 44, b, caption, source);
}

// ---- 17. tacticity ---------------------------------------------------------------
// A vinyl chain in planar zigzag, substituents toward the viewer (wedge, drawn
// above) or away (hashed, drawn below). Dyads labelled m (meso, same side) and
// r (racemo, opposite), the IUPAC terms.
function tacticity() {
  const rows = [
    ["isotactic", [1, 1, 1, 1, 1, 1, 1], ["all m dyads", "every X on one side"]],
    ["syndiotactic", [1, 0, 1, 0, 1, 0, 1], ["all r dyads", "X alternates sides"]],
    ["atactic", [1, 1, 0, 1, 0, 0, 1], ["m and r at random", "no pattern to pack"]]
  ];
  const X0 = 116, STEP = 27, AMP = 9, H = 70;
  let b = "";
  rows.forEach(([name, ups, note], r) => {
    const yc = 46 + r * H;
    const n = ups.length * 2 + 1;
    const pts = [];
    for (let k = 0; k < n; k++) pts.push([X0 + k * STEP, yc + (k % 2 ? -AMP : AMP)]);
    b += '<path d="' + pathOf(pts) + '" fill="none" stroke="var(--text)" stroke-width="1.6" stroke-linejoin="round"/>';
    ups.forEach((u, i) => {
      const [cx, cy] = pts[2 * i + 1];                     // the CHX carbons are the upper vertices
      if (u) {
        // wedge: a filled triangle widening toward the substituent, drawn up
        b += '<path d="M' + f1(cx) + "," + f1(cy) + " L" + f1(cx - 3.5) + "," + f1(cy - 17) + " L" + f1(cx + 3.5) + "," + f1(cy - 17) + ' Z" fill="var(--text)"/>';
        b += '<circle cx="' + f1(cx) + '" cy="' + f1(cy - 22) + '" r="5" fill="' + BLUE + '"/>';
      } else {
        // hashed bond, drawn down through the backbone to below it
        for (let h = 1; h <= 5; h++) {
          const yy = cy + h * 4.2, wh = 0.8 + h * 0.6;
          b += '<line x1="' + f1(cx - wh) + '" y1="' + f1(yy) + '" x2="' + f1(cx + wh) + '" y2="' + f1(yy) + '" stroke="var(--text)" stroke-width="1.1"/>';
        }
        b += '<circle cx="' + f1(cx) + '" cy="' + f1(cy + 28) + '" r="5" fill="' + VIOLET + '"/>';
      }
    });
    // dyad labels between neighbouring stereocentres
    for (let i = 0; i < ups.length - 1; i++) {
      const xm = pts[2 * i + 2][0];
      b += text(xm, yc + AMP + 22, ups[i] === ups[i + 1] ? "m" : "r", "small dim", ' text-anchor="middle" font-style="italic"');
    }
    b += text(X0 - 16, yc + 4, name, "small", ' text-anchor="end"');
    b += text(X0 + (n - 1) * STEP + 24, yc - 2, note[0], "small");
    b += text(X0 + (n - 1) * STEP + 24, yc + 14, note[1], "small dim");
  });
  const XK = 120, YK = 46 + 3 * H - 6;
  b += '<circle cx="' + XK + '" cy="' + YK + '" r="5" fill="' + BLUE + '"/>' + text(XK + 10, YK + 4, "X toward you (wedge)", "small");
  b += '<circle cx="' + (XK + 170) + '" cy="' + YK + '" r="5" fill="' + VIOLET + '"/>' + text(XK + 180, YK + 4, "X away from you (hashed)", "small");
  const caption = "Every carbon carrying a substituent in a vinyl chain is a stereocentre, and the sequence of their configurations decides whether the chain can crystallize. Isotactic and syndiotactic chains are regular and can pack: isotactic polypropylene melts at 165&nbsp;&deg;C, and syndiotactic polystyrene at 270&nbsp;&deg;C. An atactic chain has no repeating pattern to pack with, which is why ordinary radical-made polystyrene is a clear glass with no melting point at all. Neighbouring pairs of stereocentres, the dyads, are what NMR counts: tacticity is reported as the fraction of m and r dyads, or of mm, mr and rr triads.";
  const source = "Melting points from Odian, <i>Principles of Polymerization</i>, 4th ed., Secs. 8-2a-1 and 8-11f. Dyad nomenclature: IUPAC, <i>Pure Appl. Chem.</i> 53 (1981) 733.";
  return panel("tacticity", "Three vinyl polymer chains drawn as planar zigzags. Isotactic: every substituent on a wedge on the same side, all meso dyads. Syndiotactic: substituents alternating between wedge and hashed bonds, all racemo dyads. Atactic: a random mixture.", 680, 270, b, caption, source);
}

// Diagrams that live on generated family pages. build-family-pages.js writes
// those pages whole, so it calls these builders itself rather than having this
// script patch its output.
module.exports = { FAMILY_DIAGRAMS: { carothers, ringStrain, blockPhases, dieneTransitions, tacticity } };

if (require.main === module) {
  const check = process.argv.includes("--check");
  let stale = 0;
  JOBS.forEach((job) => {
    const f = path.join(ROOT, job.file);
    let s = fs.readFileSync(f, "utf8");
    const E = s.indexOf("\r\n") !== -1 ? "\r\n" : "\n";
    const html = job.build().split("\n").join(E);
    const name = /diagram:([a-z-]+):start/.exec(html)[1];
    const start = "<!-- diagram:" + name + ":start -->", end = "<!-- diagram:" + name + ":end -->";
    let next;
    const a = s.indexOf(start), z = s.indexOf(end);
    if (a !== -1 && z !== -1) {
      next = s.slice(0, a) + html + s.slice(z + end.length);
    } else {
      // first run: put it at the end of the card that precedes the anchor heading
      const h = s.indexOf(job.before);
      if (h === -1) throw new Error(job.file + ": anchor heading not found");
      const cardOpen = s.lastIndexOf('<div class="card">', h);
      const close = s.lastIndexOf("</div>", cardOpen);
      if (close === -1) throw new Error(job.file + ": could not find the end of the preceding card");
      next = s.slice(0, close) + "  " + html + E + "  " + s.slice(close);
    }
    if (next !== s) {
      stale++;
      if (!check) fs.writeFileSync(f, next);
    }
    console.log((next === s ? "  current " : check ? "  STALE   " : "  wrote   ") + job.file);
  });
  if (check && stale) { console.error(stale + " page(s) out of date: run node scripts/build-diagrams.js"); process.exit(1); }
}
