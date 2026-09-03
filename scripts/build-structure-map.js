// Project the library's structures onto a two-dimensional map.
//
// This is the one piece of machine learning the data actually supports. The
// site already recorded, in polymer-search.js, why it does NOT predict a glass
// transition: a group-contribution model fitted to the library's own 60
// measured values scored RMSE 58 K against an 84 K "guess the mean" baseline,
// with individual misses over 200 K. Sixty labels cannot train a regressor on a
// property that moves 80 K when a hydrogen becomes a methyl.
//
// This needs no labels at all. It is unsupervised: every structure becomes a
// descriptor vector, the vectors are projected to two dimensions, and the
// result is a picture of how the library's chemistry actually clusters. It
// cannot be wrong the way a predicted number can be, because it asserts nothing
// about any polymer - it only places structures near other structures they
// resemble.
//
// The projection is t-SNE, initialised from PCA. That combination is chosen for
// two measured reasons rather than fashion.
//
// The descriptors are good: in full 30-dimensional space, 54.3% of a structure's
// eight nearest neighbours share its family, against a 13.2% chance baseline - a
// 4.12x lift. Projecting that with plain PCA collapses it to 25.0%, a 1.90x
// lift, because the first two components hold only 32.7% of the variance. The
// features were never the limit; the linear projection was.
//
// t-SNE keeps local neighbourhoods, which is the whole point of the map. It is
// normally stochastic, which would break the --check in CI - a generated file
// that differs on every run can never be current. So the initialisation is the
// PCA embedding rather than a random draw and there is no RNG in the run at
// all: same input, same file, every time. PCA is still computed and its axes
// still reported, because they are what make the broad layout explainable.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CHECK = process.argv.includes("--check");
const EXPLAIN = process.argv.includes("--explain");

global.window = {};
require(path.join(ROOT, "polymer-data.js"));
const PG = require(path.join(ROOT, "polymer-graph.js"));
const DB = global.window.POLYMER_DB;

// --- Descriptors -----------------------------------------------------------
// Chosen to be things a polymer chemist would actually name when asked how two
// repeat units differ, so an axis can be explained afterwards rather than
// merely plotted. Everything is derived from the atoms/bonds graph that is
// already checked in CI - no external featuriser, no SMILES round-trip.
const ELEMENTS = ["C", "O", "N", "S", "Si", "F", "Cl", "Br", "P"];

function descriptors(entry) {
  const atoms = entry.atoms.filter((a) => a.el !== "*");
  const ids = new Set(atoms.map((a) => a.id));
  const bonds = entry.bonds.filter((b) => ids.has(b.a) && ids.has(b.b));
  const n = atoms.length || 1;

  const deg = {};
  atoms.forEach((a) => { deg[a.id] = 0; });
  let single = 0, dbl = 0, triple = 0;
  bonds.forEach((b) => {
    deg[b.a] = (deg[b.a] || 0) + 1;
    deg[b.b] = (deg[b.b] || 0) + 1;
    if (b.order === 2) dbl++;
    else if (b.order === 3) triple++;
    else single++;
  });

  const f = [];
  // Composition: what the unit is made of, as a fraction so size does not
  // dominate the first axis by itself.
  ELEMENTS.forEach((el) => {
    f.push(atoms.filter((a) => a.el === el).length / n);
  });
  // Size still matters chemically, so it goes in once, on its own terms.
  f.push(n);
  // Unsaturation and how the skeleton is joined.
  f.push(dbl / n);
  f.push(triple / n);
  f.push(single / n);
  // Branching: a quaternary carbon behaves nothing like a linear methylene,
  // and this is the cheapest honest measure of it.
  const degs = atoms.map((a) => deg[a.id] || 0);
  [1, 2, 3, 4].forEach((d) => f.push(degs.filter((x) => x === d).length / n));
  // Aromaticity, from the same ring detection the structure search uses.
  let aromatic = 0;
  try {
    const ar = PG.aromaticRingBonds(atoms, bonds);
    aromatic = ar ? (ar.size || ar.length || 0) : 0;
  } catch (e) { aromatic = 0; }
  f.push(aromatic / n);
  // Heteroatom fraction - the single strongest divider in the library, and the
  // thing that separates a polyolefin from a polyester at a glance.
  f.push(atoms.filter((a) => a.el !== "C").length / n);
  // Backbone chemistry, one-hot. This is what the family pages are organised
  // by, so it is the axis a reader will recognise.
  const LINKS = ["all-carbon", "ester", "amide", "ether", "urethane", "siloxane",
                 "carbonate", "sulfide", "amine", "ketone", "aromatic"];
  let links = [];
  try { links = PG.backboneLinkages(atoms, bonds) || []; } catch (e) { links = []; }
  LINKS.forEach((L) => f.push(links.indexOf(L) !== -1 ? 1 : 0));
  return f;
}

const FEATURE_NAMES = ELEMENTS.map((e) => "frac " + e)
  .concat(["atom count", "double/atom", "triple/atom", "single/atom",
           "deg1", "deg2", "deg3", "deg4", "aromatic/atom", "heteroatom frac",
           "all-carbon", "ester", "amide", "ether", "urethane", "siloxane",
           "carbonate", "sulfide", "amine", "ketone", "aromatic backbone"]);

// --- Build the matrix ------------------------------------------------------
const entries = DB.filter((e) => e.atoms && e.atoms.length && e.bonds && e.bonds.length);
const X = entries.map(descriptors);
const d = FEATURE_NAMES.length;
if (X.length && X[0].length !== d) {
  throw new Error("descriptor length " + X[0].length + " does not match " + d + " names");
}

// Standardise: the raw features are fractions, counts and flags, and without
// this the atom count alone would define the first axis by virtue of its units.
const mean = new Array(d).fill(0);
const sd = new Array(d).fill(0);
X.forEach((row) => row.forEach((v, j) => { mean[j] += v; }));
mean.forEach((_, j) => { mean[j] /= X.length; });
X.forEach((row) => row.forEach((v, j) => { sd[j] += (v - mean[j]) ** 2; }));
sd.forEach((_, j) => { sd[j] = Math.sqrt(sd[j] / X.length) || 1; });
const Z = X.map((row) => row.map((v, j) => (v - mean[j]) / sd[j]));

// --- PCA by power iteration ------------------------------------------------
// Deterministic start vector, fixed iteration count, deflation for the second
// component. No randomness anywhere, so the output file is reproducible.
function covariance(Z) {
  const C = Array.from({ length: d }, () => new Array(d).fill(0));
  Z.forEach((row) => {
    for (let i = 0; i < d; i++) {
      if (!row[i]) continue;
      for (let j = i; j < d; j++) C[i][j] += row[i] * row[j];
    }
  });
  for (let i = 0; i < d; i++) {
    for (let j = i; j < d; j++) {
      C[i][j] /= Z.length;
      C[j][i] = C[i][j];
    }
  }
  return C;
}
function topEigenvector(C, iterations) {
  let v = new Array(d).fill(0).map((_, i) => 1 / Math.sqrt(d) * (i % 2 ? 1 : -1));
  for (let it = 0; it < iterations; it++) {
    const w = new Array(d).fill(0);
    for (let i = 0; i < d; i++) {
      let s = 0;
      for (let j = 0; j < d; j++) s += C[i][j] * v[j];
      w[i] = s;
    }
    const norm = Math.sqrt(w.reduce((a, x) => a + x * x, 0)) || 1;
    v = w.map((x) => x / norm);
  }
  let lambda = 0;
  for (let i = 0; i < d; i++) {
    let s = 0;
    for (let j = 0; j < d; j++) s += C[i][j] * v[j];
    lambda += v[i] * s;
  }
  return { v, lambda };
}
function deflate(C, v, lambda) {
  return C.map((row, i) => row.map((x, j) => x - lambda * v[i] * v[j]));
}

const C0 = covariance(Z);
const trace = C0.reduce((a, row, i) => a + row[i], 0);
const pc1 = topEigenvector(C0, 500);
const pc2 = topEigenvector(deflate(C0, pc1.v, pc1.lambda), 500);

const project = (row, v) => row.reduce((a, x, j) => a + x * v[j], 0);

// --- t-SNE -----------------------------------------------------------------
// Textbook implementation, deterministic throughout. The only unusual choice is
// the initialisation: Y starts at the PCA projection, scaled small, instead of
// a random draw. That removes the seed entirely and also gives t-SNE a sensible
// global arrangement to refine, which is the standard remedy for its habit of
// tearing apart structure that PCA gets right.
function pairwiseSq(Z) {
  const n = Z.length, D = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let s2 = 0;
      for (let k = 0; k < Z[i].length; k++) { const t = Z[i][k] - Z[j][k]; s2 += t * t; }
      D[i * n + j] = s2; D[j * n + i] = s2;
    }
  }
  return D;
}

// Binary search each point's Gaussian width for the target perplexity, which is
// what lets one setting suit both a dense cluster of acrylates and an isolated
// bottlebrush.
function affinities(D, n, perplexity) {
  const P = new Float64Array(n * n);
  const logU = Math.log(perplexity);
  for (let i = 0; i < n; i++) {
    let lo = -Infinity, hi = Infinity, beta = 1;
    const row = new Float64Array(n);
    for (let tries = 0; tries < 60; tries++) {
      let sum = 0, H = 0;
      for (let j = 0; j < n; j++) {
        row[j] = i === j ? 0 : Math.exp(-D[i * n + j] * beta);
        sum += row[j];
      }
      if (sum === 0) sum = 1e-12;
      for (let j = 0; j < n; j++) {
        const p = row[j] / sum;
        if (p > 1e-12) H -= p * Math.log(p);
      }
      const diff = H - logU;
      if (Math.abs(diff) < 1e-5) break;
      if (diff > 0) { lo = beta; beta = hi === Infinity ? beta * 2 : (beta + hi) / 2; }
      else { hi = beta; beta = lo === -Infinity ? beta / 2 : (beta + lo) / 2; }
    }
    let sum = 0;
    for (let j = 0; j < n; j++) sum += row[j];
    if (sum === 0) sum = 1e-12;
    for (let j = 0; j < n; j++) P[i * n + j] = row[j] / sum;
  }
  // Symmetrise and normalise to a joint distribution.
  const out = new Float64Array(n * n);
  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = (P[i * n + j] + P[j * n + i]) / (2 * n);
      out[i * n + j] = v; total += v;
    }
  }
  if (total > 0) for (let k = 0; k < out.length; k++) out[k] /= total;
  return out;
}

function tsne(Z, init, opts) {
  const n = Z.length;
  const perplexity = Math.min(opts.perplexity, Math.floor((n - 1) / 3));
  const D = pairwiseSq(Z);
  const P = affinities(D, n, perplexity);

  // Start from PCA, scaled to the small spread t-SNE expects.
  let Y = init.map((p) => [p[0] * opts.initScale, p[1] * opts.initScale]);
  const dY = Y.map(() => [0, 0]);
  const gains = Y.map(() => [1, 1]);
  const Q = new Float64Array(n * n);

  for (let iter = 0; iter < opts.iterations; iter++) {
    // Early exaggeration pulls true neighbours together before the layout
    // settles; without it t-SNE tends to one undifferentiated blob.
    const exag = iter < opts.exaggerateFor ? opts.exaggeration : 1;
    const momentum = iter < 250 ? 0.5 : 0.8;

    let sumQ = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = Y[i][0] - Y[j][0], dy = Y[i][1] - Y[j][1];
        const q = 1 / (1 + dx * dx + dy * dy);
        Q[i * n + j] = q; Q[j * n + i] = q;
        sumQ += 2 * q;
      }
    }
    if (sumQ === 0) sumQ = 1e-12;

    for (let i = 0; i < n; i++) {
      let gx = 0, gy = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const q = Q[i * n + j];
        const mult = (exag * P[i * n + j] - q / sumQ) * q;
        gx += mult * (Y[i][0] - Y[j][0]);
        gy += mult * (Y[i][1] - Y[j][1]);
      }
      gx *= 4; gy *= 4;

      // Jacobs adaptive gains: step up where the gradient keeps its sign.
      gains[i][0] = Math.max(0.01, Math.sign(gx) === Math.sign(dY[i][0]) ? gains[i][0] * 0.8 : gains[i][0] + 0.2);
      gains[i][1] = Math.max(0.01, Math.sign(gy) === Math.sign(dY[i][1]) ? gains[i][1] * 0.8 : gains[i][1] + 0.2);
      dY[i][0] = momentum * dY[i][0] - opts.learningRate * gains[i][0] * gx;
      dY[i][1] = momentum * dY[i][1] - opts.learningRate * gains[i][1] * gy;
      Y[i][0] += dY[i][0];
      Y[i][1] += dY[i][1];
    }

    // Re-centre so the embedding cannot drift, which keeps the emitted
    // coordinates stable run to run.
    let mx = 0, my = 0;
    for (let i = 0; i < n; i++) { mx += Y[i][0]; my += Y[i][1]; }
    mx /= n; my /= n;
    for (let i = 0; i < n; i++) { Y[i][0] -= mx; Y[i][1] -= my; }
  }
  return Y;
}

const pcaInit = Z.map((row) => [project(row, pc1.v), project(row, pc2.v)]);
const Y = tsne(Z, pcaInit, {
  perplexity: 30,
  iterations: 600,
  exaggeration: 4,
  exaggerateFor: 150,
  learningRate: 120,
  initScale: 0.01,
});
let pts = entries.map((e, i) => ({ e, x: Y[i][0], y: Y[i][1] }));

// Scale to a stable 0-1000 box so the renderer needs no knowledge of the data,
// and rounding keeps the emitted file small and diff-friendly.
// Scale on the 2nd-98th percentile rather than the extremes. t-SNE leaves a
// handful of genuinely isolated structures far from everything else, and
// scaling to those compressed the middle 96% of the library into 60% of the
// canvas, with the interquartile range down to 13% - a dense blob nobody can
// read. The trade is that the few outliers clamp onto the border instead of
// sitting at their true distance, which overstates how close they are to each
// other; the alternative was making 700 points unreadable to place 15 of them
// precisely.
const pct = (arr, p) => { const a = arr.slice().sort((m, n) => m - n); return a[Math.floor((a.length - 1) * p)]; };
const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
const x0 = pct(xs, 0.02), x1 = pct(xs, 0.98);
const y0 = pct(ys, 0.02), y1 = pct(ys, 0.98);
const norm = (v, lo, hi) => Math.max(0, Math.min(1000, Math.round(((v - lo) / ((hi - lo) || 1)) * 1000)));

// Family, so the map can be coloured by the same grouping the family pages use.
const FAMILY = [
  ["Acrylates", (e) => e.cls === "Addition (acrylate)"],
  ["Methacrylates", (e) => e.cls === "Addition (methacrylate)"],
  ["Vinyl", (e) => e.cls === "Addition (vinyl)" || /^Copolymer \(addition\)|^Copolymer \(addition, vinyl\)|^Terpolymer/.test(e.cls || "") || e.cls === "Addition (alkyne)"],
  ["Dienes", (e) => e.cls === "Addition (diene)" || e.cls === "Copolymer (addition, diene)"],
  ["Silicones", (e) => e.cls === "Ring-opening (silicone)"],
  ["Polyesters", (e) => e.cls === "Step-growth (polyester)" || e.cls === "Copolymer (ring-opening, polyester)"],
  ["Polyamides", (e) => e.cls === "Step-growth (polyamide)" || e.cls === "Ring-opening (polyamide)"],
  ["Ring-opening", (e) => e.cls === "Ring-opening"],
  ["Conjugated", (e) => e.cls === "Step-growth (coupling)" || !e.cls],
  ["Block", (e) => /^Block copolymer|^Segmented block/.test(e.cls || "")],
  ["Bottlebrush", (e) => /^Bottlebrush/.test(e.cls || "")],
];
const familyOf = (e) => {
  for (let i = 0; i < FAMILY.length; i++) if (FAMILY[i][1](e)) return i;
  return -1;
};

const points = pts.map((p) => ({
  n: p.e.name,
  x: norm(p.x, x0, x1),
  y: norm(p.y, y0, y1),
  f: familyOf(p.e),
  t: p.e.tg ? 1 : 0,
}));

// --- What the axes mean ----------------------------------------------------
// A map whose axes cannot be described is a decoration. These are printed into
// the emitted file so the page can say what it is showing.
function describe(v) {
  return v.map((w, j) => ({ name: FEATURE_NAMES[j], w }))
    .sort((a, b) => Math.abs(b.w) - Math.abs(a.w))
    .slice(0, 5)
    .map((t) => (t.w > 0 ? "+" : "−") + " " + t.name);
}
const axes = {
  x: { variance: +(pc1.lambda / trace * 100).toFixed(1), drivers: describe(pc1.v) },
  y: { variance: +(pc2.lambda / trace * 100).toFixed(1), drivers: describe(pc2.v) },
};

if (EXPLAIN) {
  console.log("structures: " + entries.length + " of " + DB.length);
  console.log("descriptors: " + d);
  console.log("");
  console.log("PC1 explains " + axes.x.variance + "% of variance");
  describe(pc1.v).forEach((t) => console.log("   " + t));
  console.log("PC2 explains " + axes.y.variance + "% of variance");
  describe(pc2.v).forEach((t) => console.log("   " + t));
  process.exit(0);
}

const out =
  "// GENERATED by scripts/build-structure-map.js - do not edit.\n" +
  "//\n" +
  "// A t-SNE projection (initialised from PCA, so it is deterministic) of " + entries.length + "\n" +
  "// repeat-unit structures, from " + d + " descriptors read off the atoms/bonds graph. It is\n" +
  "// unsupervised - no property is used to build it - so it asserts nothing about\n" +
  "// any polymer; it only places structures near the ones they resemble.\n" +
  "window.STRUCTURE_MAP = " +
  JSON.stringify({
    families: FAMILY.map((f) => f[0]),
    axes,
    points,
  }) + ";\n";

const file = path.join(ROOT, "structure-map.js");
const old = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;

if (CHECK) {
  if (old !== out) {
    console.error("structure-map.js is out of date with polymer-data.js.");
    console.error("Run: node scripts/build-structure-map.js");
    process.exit(1);
  }
  console.log("structure-map.js is current (" + entries.length + " structures).");
} else {
  fs.writeFileSync(file, out);
  console.log("structure-map.js written: " + entries.length + " structures, " +
    d + " descriptors, PC1 " + axes.x.variance + "% / PC2 " + axes.y.variance + "%");
}
