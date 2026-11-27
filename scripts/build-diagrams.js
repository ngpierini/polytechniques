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
    '    <div class="diagram-panel">\n' +
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

// ---- pages ------------------------------------------------------------------
const JOBS = [
  { file: "copolymer-composition.html", build: copolymer, before: "<h3>Composition calculator</h3>" },
  { file: "chain-dimensions.html", build: chainDimensions, before: "<h3>DNA is the model system, and it is not a coincidence</h3>" },
  { file: "tts-master-curve.html", build: tts, before: "<h3>Build a master curve</h3>" },
  { file: "hydrogel-mesh-size.html", build: hydrogel, before: "<h3>Mesh size from a swelling measurement</h3>" },
  { file: "radical-kinetics.html", build: radical, before: "<h3>Kinetics calculator</h3>" }
];

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
