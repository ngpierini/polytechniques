// Lock down the arithmetic the worked examples publish.
//
// This repo has strong data-integrity CI - structures, valences, CAS numbers,
// thermal libraries, cross-references - and had nothing at all on the maths the
// calculators do. That is the half a visitor actually weighs reagents against.
//
// Every case below is a number already printed on a page as a worked example,
// so a failure here means the site is telling someone something the code no
// longer does. Two of them were additionally checked against the live page's
// own calculator during the session that wrote them: the crosslink-density
// example returns Mc = 6,040 g/mol by the swelling route and 6,011 by the
// modulus route, and both are reproduced here to the digit.
//
// The formulas are re-implemented here rather than imported. app.js and the
// per-page scripts are browser code built around the DOM, and dragging that
// into Node would test the harness more than the maths. The point of a
// regression test on a published figure is that two independent expressions
// agree; if this file and the page drift apart, one of them is wrong and the
// failure says which number stopped matching.
"use strict";

const fs = require("fs");
const path = require("path");

const cases = [];
let failed = 0;

const calHtml = fs.readFileSync(path.join(__dirname, "..", "gpc-calibration.html"), "utf8");

function check(name, actual, expected, tol, unit) {
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) failed++;
  cases.push({
    ok,
    name,
    actual: Number(actual.toPrecision(6)),
    expected,
    tol,
    unit: unit || "",
  });
}

// ---- Fox equation: tg-predictor.html, "A worked example" -------------------
// 70:30 styrene / ethyl acrylate. Polystyrene 100 C, poly(ethyl acrylate) -24 C.
// The page prints 51.5 C, and prints 62.8 C for the rule of mixtures it is
// contrasted against - the gap is the point of the example, so both are pinned.
function foxC(pairs) {
  const inv = pairs.reduce((a, [w, tgC]) => a + w / (tgC + 273.15), 0);
  return 1 / inv - 273.15;
}
function linearC(pairs) {
  return pairs.reduce((a, [w, tgC]) => a + w * tgC, 0);
}
const foxPair = [[0.70, 100], [0.30, -24]];
check("Fox, 70:30 styrene / ethyl acrylate", foxC(foxPair), 51.5, 0.05, "C");
check("rule of mixtures, same feed", linearC(foxPair), 62.8, 0.05, "C");
check("Fox vs linear gap", linearC(foxPair) - foxC(foxPair), 11.3, 0.05, "C");

// ---- Mayo-Lewis drift: copolymer-composition.html --------------------------
// MMA / n-butyl acrylate, r1 = 2.2, r2 = 0.37. The page prints a table of
// instantaneous and cumulative composition against conversion; every row of it
// is checked, because the argument the page makes is the SHAPE of that drift.
function F1(f1, r1, r2) {
  const f2 = 1 - f1;
  return (r1 * f1 * f1 + f1 * f2) / (r1 * f1 * f1 + 2 * f1 * f2 + r2 * f2 * f2);
}
function drift(r1, r2, f0, marks) {
  const dx = 1e-5;
  let f1 = f0, N = 1, n1 = f0, consumed = 0, cum = 0, mi = 0;
  const out = [];
  while (consumed < 0.95 && mi < marks.length) {
    const inst = F1(f1, r1, r2);
    n1 -= inst * dx; N -= dx; consumed += dx; cum += inst * dx;
    f1 = n1 / N;
    if (consumed >= marks[mi]) {
      out.push({ conv: marks[mi], feed: f1, inst: F1(f1, r1, r2), cum: cum / consumed });
      mi++;
    }
  }
  return out;
}
check("Mayo-Lewis F1 at f1 = 0.50 (MMA / nBA)", F1(0.5, 2.2, 0.37), 0.700, 0.001, "mole fraction");
const rows = drift(2.2, 0.37, 0.5, [0.10, 0.25, 0.50, 0.75, 0.90]);
const published = [
  { conv: 0.10, feed: 0.479, inst: 0.683, cum: 0.692 },
  { conv: 0.25, feed: 0.441, inst: 0.651, cum: 0.677 },
  { conv: 0.50, feed: 0.355, inst: 0.569, cum: 0.645 },
  { conv: 0.75, feed: 0.212, inst: 0.401, cum: 0.596 },
  { conv: 0.90, feed: 0.077, inst: 0.178, cum: 0.547 },
];
published.forEach((p, i) => {
  const r = rows[i];
  check(`drift at ${Math.round(p.conv * 100)}% conversion, feed f1`, r.feed, p.feed, 0.002);
  check(`drift at ${Math.round(p.conv * 100)}% conversion, instantaneous F1`, r.inst, p.inst, 0.002);
  check(`drift at ${Math.round(p.conv * 100)}% conversion, cumulative F1`, r.cum, p.cum, 0.002);
});
// Styrene / MMA has an azeotrope; MMA / nBA does not, and the page says so.
const azeo = (r1, r2) => (1 - r2) / (2 - r1 - r2);
check("styrene / MMA azeotrope", azeo(0.52, 0.46), 0.529, 0.001, "f1");
check("F1 at that azeotrope equals the feed", F1(azeo(0.52, 0.46), 0.52, 0.46), 0.529, 0.001, "F1");
if (azeo(2.2, 0.37) >= 0) {
  failed++;
  cases.push({ ok: false, name: "MMA / nBA has no azeotrope (formula must go negative)", actual: azeo(2.2, 0.37), expected: "< 0", tol: 0, unit: "" });
} else {
  cases.push({ ok: true, name: "MMA / nBA has no azeotrope (formula goes negative)", actual: Number(azeo(2.2, 0.37).toPrecision(4)), expected: "< 0", tol: 0, unit: "" });
}

// ---- Flory-Rehner and rubber elasticity: crosslink-density.html ------------
// PDMS in toluene, v2 = 0.25. Both routes are published, and both were checked
// against the page's own calculator: 6,040 from swelling, 6,011 from modulus.
function mcFromSwelling(v2, V1, chi, rho) {
  const lhs = -(Math.log(1 - v2) + v2 + chi * v2 * v2);
  const rhs = V1 * (Math.pow(v2, 1 / 3) - v2 / 2);
  return rho / (lhs / rhs);           // g/mol
}
// rho in kg/m3 and R in J/(mol K) give Mc in kg/mol, so this converts. Getting
// that wrong is what the first run of this file caught - it reported 6.008
// against an expected 6011, which is the same number in the wrong unit.
function mcFromModulus(G_Pa, rho_gcm3, T_K) {
  return ((rho_gcm3 * 1000) * 8.314 * T_K / G_Pa) * 1000;   // g/mol
}
check("Flory-Rehner Mc, PDMS/toluene v2 = 0.25", mcFromSwelling(0.25, 106.3, 0.465, 0.97), 6040, 10, "g/mol");
check("modulus route Mc at G = 0.40 MPa", mcFromModulus(0.40e6, 0.97, 298.15), 6011, 5, "g/mol");
// The chi sensitivity is the argument that page makes; pin both ends of it.
check("Mc at chi = 0.415", mcFromSwelling(0.25, 106.3, 0.415, 0.97), 4430, 15, "g/mol");
check("Mc at chi = 0.515", mcFromSwelling(0.25, 106.3, 0.515, 0.97), 9480, 20, "g/mol");

// ---- Free-radical kinetics: radical-kinetics.html --------------------------
// Styrene with AIBN at 60 C. The published claim is not only the numbers but
// the square-root law: 4x initiator gives exactly 2x rate and half the Mn.
function frp(I, { kp = 341, kt = 6.0e7, kd = 9.63e-6, f = 0.6, M = 8.7, M0 = 104.15 } = {}) {
  const radical = Math.sqrt(f * kd * I / kt);
  const Rp = kp * M * radical;
  const nu = Rp / (2 * f * kd * I);
  const DP = 2 * nu;                       // styrene terminates by combination
  return { radical, Rp, nu, DP, Mn: DP * M0, tTo10pct: -Math.log(0.9) / (Rp / M) };
}
const a = frp(0.01), b = frp(0.04);
check("styrene/AIBN radical concentration", a.radical * 1e9, 31.0, 0.5, "nM");
check("styrene/AIBN Rp at [I] = 0.01 M", a.Rp * 1e5, 9.21, 0.05, "1e-5 mol/L/s");
check("styrene/AIBN kinetic chain length", a.nu, 797, 2, "");
check("styrene/AIBN Mn at [I] = 0.01 M", a.Mn / 1000, 166, 1, "kg/mol");
check("styrene/AIBN time to 10% conversion", a.tTo10pct / 3600, 2.77, 0.02, "h");
check("4x initiator multiplies rate by sqrt(4)", b.Rp / a.Rp, 2.00, 0.005, "x");
check("4x initiator halves Mn", b.Mn / a.Mn, 0.50, 0.005, "x");

// ---- Universal calibration: gpc-calibration.html ---------------------------
// PMMA against polystyrene standards in THF. The page prints a table of true
// vs apparent molecular weight, and argues the correction is NOT a constant.
function trueMw(Mapp, Ks, as, Kp, ap) {
  return Math.pow((Ks / Kp) * Math.pow(Mapp, 1 + as), 1 / (1 + ap));
}
const gpc = (M) => trueMw(M, 1.14e-4, 0.716, 0.80e-4, 0.70);

// The rows are read out of the page rather than restated here. A figure copied
// into this file can drift from the one on the page without either side
// complaining, which is how the 137,300 in this test outlived the 137,000 that
// replaced it on the page.
const gpcRows = [...calHtml.matchAll(
  /<tr><td class="num">([\d,]+)<\/td><td class="num">([\d,]+)<\/td><td class="num">([\d.]+)<\/td><\/tr>/g
)].map((m) => m.slice(1).map((v) => Number(v.replace(/,/g, ""))));

if (gpcRows.length !== 5) {
  failed++;
  cases.push({ ok: false, name: "GPC worked-example table has 5 rows to check", actual: gpcRows.length, expected: 5, tol: 0, unit: "rows" });
}

// The page shows three significant figures because the result is not worth
// more - shifting each alpha by 0.02 opens a band of roughly -22% to +29%.
// So the published figure must BE the 3-sf rounding of the maths, exactly.
const sf3 = (n) => Number(n.toPrecision(3));

gpcRows.forEach(([app, published, ratio]) => {
  const exact = gpc(app);
  if (sf3(exact) !== published) {
    failed++;
    cases.push({ ok: false, name: `GPC row ${app.toLocaleString()}: page prints ${published.toLocaleString()}`,
      actual: published, expected: sf3(exact), tol: 0, unit: "g/mol (3 s.f. of " + Math.round(exact) + ")" });
  }
  check(`GPC ratio published for PS-equivalent ${app}`, exact / app, ratio, 0.005, "x");
});
const lowRatio = gpc(10000) / 10000, highRatio = gpc(250000) / 250000;
check("correction ratio at 10 kg/mol", lowRatio, 1.34, 0.01, "x");
check("correction ratio at 250 kg/mol", highRatio, 1.38, 0.01, "x");
if (!(highRatio > lowRatio)) {
  failed++;
  cases.push({ ok: false, name: "correction must drift upward with molecular weight", actual: highRatio - lowRatio, expected: "> 0", tol: 0, unit: "" });
}

// ---- Slice summation: gpc-trace.html ---------------------------------------
// The trace analyser ships a demo chromatogram generated from an EXACT
// log-normal, which is the whole point of it: the right answer is known before
// the page computes anything, so the worked example can state the gap between
// the right answer and the reported one as a measurement.
//
// That only holds while the published table and the page agree. The table is
// therefore recomputed here from the same generator and the same summation,
// and compared against the figures the page prints - which are read out of the
// page, not restated, for the reason the GPC rows above were.
//
// For lnM ~ N(mu, s2): Mn = exp(mu + s2/2) and Mw/Mn = exp(s2). The WEIGHT
// distribution in lnM is Gaussian with the same s2 centred at mu + s2, and an
// RI detector reads dW/dV, so with a log-linear calibration the chromatogram
// IS that Gaussian. The first assertion below is that identity: integrate the
// untruncated trace and the summation must return the generator's own numbers.
const traceHtml = fs.readFileSync(path.join(__dirname, "..", "gpc-trace.html"), "utf8");

const TR_MN = 20000, TR_D = 1.30;
const trS2 = Math.log(TR_D);
const trMuW = Math.log(TR_MN) - trS2 / 2 + trS2;
const trM = (V) => Math.pow(10, 10.5 - 0.70 * V);

const trRows = [];
for (let V = 6.5; V <= 11.0 + 1e-9; V += 0.025) {
  const x = Math.log(trM(V));
  const g = Math.exp(-Math.pow(x - trMuW, 2) / (2 * trS2));
  trRows.push([Number(V.toFixed(3)), Number((g + 0.002 + 0.0015 * (V - 6.5)).toFixed(5))]);
}

function trBaseline(rows) {
  const k = Math.max(3, Math.round(rows.length * 0.1));
  const pts = rows.slice(0, k).concat(rows.slice(rows.length - k));
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  pts.forEach(([x, y]) => { sx += x; sy += y; sxx += x * x; sxy += x * y; });
  const m = pts.length, b = (m * sxy - sx * sy) / (m * sxx - sx * sx), a = (sy - b * sx) / m;
  return (V) => a + b * V;
}
function trAnalyse(rows, lo, hi, base) {
  let s0 = 0, sInv = 0, sM = 0;
  for (let i = lo; i <= hi; i++) {
    const V = rows[i][0], h = rows[i][1] - base(V);
    if (h <= 0) continue;
    const wLo = i === lo ? 0 : rows[i][0] - rows[i - 1][0];
    const wHi = i === hi ? 0 : rows[i + 1][0] - rows[i][0];
    const w = h * (wLo + wHi) / 2, M = trM(V);
    s0 += w; sInv += w / M; sM += w * M;
  }
  return { Mn: s0 / sInv, Mw: sM / s0, D: (sM / s0) / (s0 / sInv) };
}
function trLimits(rows, base, frac) {
  let best = -Infinity, pk = 0;
  rows.forEach((r, i) => { const h = r[1] - base(r[0]); if (h > best) { best = h; pk = i; } });
  const thr = best * frac;
  let lo = pk, hi = pk;
  while (lo > 0 && rows[lo][1] - base(rows[lo][0]) > thr) lo--;
  while (hi < rows.length - 1 && rows[hi][1] - base(rows[hi][0]) > thr) hi++;
  return [lo, hi];
}

// Read the page's own generator constants back, so CI's copy cannot drift
// from the page's without a failure. See the note above on why it is a copy.
const trConst = {
  moments: /var Mn = (\d+), D = ([\d.]+)/.exec(traceHtml),
  calibration: /Math\.pow\(10, ([\d.]+) - ([\d.]+) \* V\)/.exec(traceHtml),
  sampling: /for \(var V = ([\d.]+); V <= ([\d.]+) \+ 1e-9; V \+= ([\d.]+)\)/.exec(traceHtml),
  baseline: /\+ ([\d.]+) \+ ([\d.]+) \* \(V - ([\d.]+)\)\)\.toFixed/.exec(traceHtml),
};
const trExpect = {
  moments: ["20000", "1.30"],
  calibration: ["10.5", "0.70"],
  sampling: ["6.5", "11.0", "0.025"],
  baseline: ["0.002", "0.0015", "6.5"],
};
Object.keys(trExpect).forEach((k) => {
  const m = trConst[k];
  const got = m ? m.slice(1) : null;
  if (!got || got.join(",") !== trExpect[k].join(",")) {
    failed++;
    cases.push({
      ok: false,
      name: 'gpc-trace demo generator "' + k + '" differs from the one the published table was computed from',
      actual: got ? got.join(",") : "not found",
      expected: trExpect[k].join(","),
      tol: 0, unit: "",
    });
  }
});

const trBase = trBaseline(trRows);
const trFull = trAnalyse(trRows, 0, trRows.length - 1, trBase);

// The generator's own numbers must come back out. If this fails, either the
// summation is wrong or the demo trace no longer is what the page says it is.
check("trace analyser recovers the generator's Mn", trFull.Mn, TR_MN, 1, "g/mol");
check("trace analyser recovers the generator's Mw", trFull.Mw, TR_MN * TR_D, 1, "g/mol");
check("trace analyser recovers the generator's Đ", trFull.D, TR_D, 0.0001, "");

// Now the published table. Clipping can only ever narrow a distribution, so
// the direction of each error is itself an assertion: Mn high, Đ low, always.
const trPublished = [...traceHtml.matchAll(
  /<tr><td>[^<]*<\/td><td class="num">([\d,]+)<\/td><td class="num">([\d,]+)<\/td><td class="num">(1\.\d{4})<\/td>/g
)].map((m) => [Number(m[1].replace(/,/g, "")), Number(m[2].replace(/,/g, "")), Number(m[3])]);

if (trPublished.length !== 6) {
  failed++;
  cases.push({ ok: false, name: "gpc-trace.html worked example has 6 rows to check", actual: trPublished.length, expected: 6, tol: 0, unit: "rows" });
}

const trThresholds = [0.10, 0.05, 0.02, 0.01, 0.005];
trThresholds.forEach((f, i) => {
  const [lo, hi] = trLimits(trRows, trBase, f);
  const r = trAnalyse(trRows, lo, hi, trBase);
  const pub = trPublished[i];
  if (!pub) return;
  if (sf3(r.Mn) !== pub[0] || sf3(r.Mw) !== pub[1]) {
    failed++;
    cases.push({ ok: false, name: "gpc-trace row " + (f * 100) + "%: page prints Mn " + pub[0] + ", Mw " + pub[1],
      actual: pub[0] + "/" + pub[1], expected: sf3(r.Mn) + "/" + sf3(r.Mw), tol: 0, unit: "g/mol" });
  }
  check("gpc-trace Đ published at " + (f * 100) + "%", r.D, pub[2], 0.00005, "");
  // Direction, not just magnitude.
  if (!(r.Mn > TR_MN && r.D < TR_D)) {
    failed++;
    cases.push({ ok: false, name: "clipping at " + (f * 100) + "% must raise Mn and lower Đ",
      actual: "Mn " + Math.round(r.Mn) + ", Đ " + r.D.toFixed(4), expected: "Mn > 20000, Đ < 1.3", tol: 0, unit: "" });
  }
});

// And the claim the page argues from: Đ takes roughly twice the hit Mn does.
const tr2 = trAnalyse(trRows, ...trLimits(trRows, trBase, 0.10), trBase);
const ratio = Math.abs(tr2.D / TR_D - 1) / Math.abs(tr2.Mn / TR_MN - 1);
check("Đ error is about twice the Mn error at 10%", ratio, 1.95, 0.25, "x");

// ---- Converted dispersity: gpc-calibration.html ----------------------------
// Both moments go through the same transform, so the ratio between them has a
// closed form containing no K: D_true = D_app^((1+a_std)/(1+a_sample)). The page
// prints that expression and reasons from it that an error in either K shifts
// every molecular weight while leaving dispersity exactly alone. If the
// conversion ever stopped obeying it, the page would be arguing from an
// identity that no longer holds.
const dispClosed = (Dapp, as, ap) => Math.pow(Dapp, (1 + as) / (1 + ap));
const dispConverted = (Mn, Mw, Ks, as, Kp, ap) =>
  trueMw(Mw, Ks, as, Kp, ap) / trueMw(Mn, Ks, as, Kp, ap);

check("converted Đ matches the closed form",
  dispConverted(35000, 45500, 1.14e-4, 0.716, 0.80e-4, 0.70),
  dispClosed(45500 / 35000, 0.716, 0.70), 1e-9, "");
check("page's worked example: Đ 1.30 converts to 1.303",
  dispConverted(35000, 45500, 1.14e-4, 0.716, 0.80e-4, 0.70), 1.303, 0.0005, "");
check("page's broad-sample case: Đ 5.0 at alpha 0.60 converts to 5.6",
  dispClosed(5.0, 0.716, 0.60), 5.62, 0.01, "");

// K independence, stated on the page as the reason Đ is the one number here a
// reader can take at face value. Two wildly different K pairs, same Đ.
check("Đ is untouched by K",
  dispConverted(35000, 45500, 9.9e-4, 0.716, 0.13e-4, 0.70) -
  dispConverted(35000, 45500, 1.14e-4, 0.716, 0.80e-4, 0.70), 0, 1e-12, "");

// And the sensitivity claim the band is built on: alpha beats K by more than 2x.
const mBase = trueMw(35000, 1.14e-4, 0.716, 0.80e-4, 0.70);
const dAlpha = Math.abs(trueMw(35000, 1.14e-4, 0.716, 0.80e-4, 0.72) / mBase - 1);
const dK = Math.abs(trueMw(35000, 1.14e-4, 0.716, 0.88e-4, 0.70) / mBase - 1);
check("0.02 in alpha moves M by", 100 * dAlpha, 11.8, 0.2, "%");
check("10% in K moves M by", 100 * dK, 5.5, 0.2, "%");
if (!(dAlpha > 2 * dK)) {
  failed++;
  cases.push({ ok: false, name: "alpha must dominate K, which is why the band perturbs only alpha",
    actual: (dAlpha / dK).toFixed(2), expected: "> 2", tol: 0, unit: "x" });
}

// ---- Distribution simulator: mwd-simulator.html ----------------------------
const mwdHtml = fs.readFileSync(path.join(__dirname, "..", "mwd-simulator.html"), "utf8");

function lnGammaC(z) {
  const L = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGammaC(1 - z);
  z -= 1;
  let x = L[0];
  for (let i = 1; i < 9; i++) x += L[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
// Weight fraction per unit ln M, the form the page plots and integrates.
function szW(M, Mn, k) {
  if (!(M > 0)) return 0;
  const y = k * M / Mn;
  if (y > 700) return 0;
  const lnw = (k + 1) * Math.log(y) - y - lnGammaC(k + 1);
  return lnw < -700 ? 0 : Math.exp(lnw);
}

const MWD_DL = 0.01;
const MWD_GRID = [];
for (let l = Math.log(10); l <= Math.log(2e8); l += MWD_DL) MWD_GRID.push(Math.exp(l));

function mwdMoments(w) {
  let s0 = 0, sInv = 0, sM = 0, sM2 = 0;
  for (let i = 0; i < MWD_GRID.length; i++) {
    if (!(w[i] > 0)) continue;
    const M = MWD_GRID[i], m = w[i] * MWD_DL;
    s0 += m; sInv += m / M; sM += m * M; sM2 += m * M * M;
  }
  return { Mn: s0 / sInv, Mw: sM / s0, Mz: sM2 / sM, D: (sM / s0) / (s0 / sInv) };
}

// 1. k = 1/(D-1) must give back D. Three decades of dispersity.
[1.02, 1.05, 1.30, 1.50].forEach((D) => {
  const m = mwdMoments(MWD_GRID.map((M) => szW(M, 20024, 1 / (D - 1))));
  check("Schulz-Zimm with k = 1/(D-1) returns D = " + D, m.D, D, 0.0005, "");
});
// k = 1 is the Flory most-probable distribution: D = 2 and Mz/Mw = 3/2 exactly.
{
  const m = mwdMoments(MWD_GRID.map((M) => szW(M, 20024, 1)));
  check("Flory most-probable (k=1) has D = 2", m.D, 2, 0.001, "");
  check("Flory most-probable (k=1) has Mz/Mw = 1.5", m.Mz / m.Mw, 1.5, 0.001, "");
}

// 2. Band broadening multiplies dispersity by exp(sigma^2), independent of the
//    sample. That independence is the claim the page's table rests on, so it is
//    checked ACROSS samples rather than at one.
function mwdBroaden(w, sigma) {
  const half = Math.ceil(4 * sigma / MWD_DL), kern = [];
  let ks = 0;
  for (let i = -half; i <= half; i++) {
    const v = Math.exp(-(i * MWD_DL) * (i * MWD_DL) / (2 * sigma * sigma));
    kern.push(v); ks += v;
  }
  return w.map((_, i) => {
    let acc = 0;
    for (let j = -half; j <= half; j++) {
      const ix = i + j;
      if (ix >= 0 && ix < w.length) acc += w[ix] * kern[j + half];
    }
    return acc / ks;
  });
}
function logNormalW(D) {
  const s2 = Math.log(D), muW = Math.log(20024) + s2 / 2;
  return MWD_GRID.map((M) => Math.exp(-Math.pow(Math.log(M) - muW, 2) / (2 * s2)));
}
[0.10, 0.20].forEach((sig) => {
  [1.02, 1.30, 2.00].forEach((Dt) => {
    const m = mwdMoments(mwdBroaden(logNormalW(Dt), sig));
    check("broadening sigma " + sig + " on D " + Dt + " gives D*exp(s^2)",
      m.D / Dt, Math.exp(sig * sig), 0.002, "x");
  });
});

// The published table, read out of the page rather than restated here.
const mwdTable = [...mwdHtml.matchAll(
  /<tr><td>(1\.\d\d|2\.00)<\/td><td class="num">(\d\.\d{3})<\/td><td class="num">[\d.]+<\/td><td class="num">[\d.]+<\/td><td class="num">(\d+)%<\/td><\/tr>/g
)].map((m) => [Number(m[1]), Number(m[2]), Number(m[3])]);
if (mwdTable.length !== 5) {
  failed++;
  cases.push({ ok: false, name: "mwd-simulator broadening table has 5 rows", actual: mwdTable.length, expected: 5, tol: 0, unit: "rows" });
}
const MWD_SIGMA = 0.20, MWD_FACTOR = Math.exp(MWD_SIGMA * MWD_SIGMA);
mwdTable.forEach(([Dtrue, Dobs, infl]) => {
  check("published D_obs for true D " + Dtrue, Dtrue * MWD_FACTOR, Dobs, 0.0006, "");
  check("published excess inflation for true D " + Dtrue,
    ((Dtrue * MWD_FACTOR - 1) / (Dtrue - 1) - 1) * 100, infl, 0.6, "%");
});

// 3. The dead-chain figures quoted in prose. The sweep is floored at one
//    monomer unit; without that floor the number-average of the dead population
//    diverges logarithmically and the answer moves with the grid, which is how
//    the prose and the page disagreed the first time.
function mwdWithDead(Dliving, fDead, dpn, M0, NX) {
  const k = 1 / (Dliving - 1), Mn = M0 * dpn;
  const live = MWD_GRID.map((M) => szW(M, Mn, k));
  const dead = new Array(MWD_GRID.length).fill(0);
  const xFloor = Math.min(0.5, 1 / dpn);
  for (let j = 0; j < NX; j++) {
    const x = xFloor + (1 - xFloor) * (j + 0.5) / NX;
    for (let i = 0; i < MWD_GRID.length; i++) dead[i] += szW(MWD_GRID[i], Mn * x, k) / NX;
  }
  const num = (w) => {
    const n = w.map((v, i) => v / MWD_GRID[i]);
    let t = 0;
    for (let i = 0; i < n.length; i++) t += n[i] * MWD_DL;
    return n.map((v) => v / t);
  };
  const nl = num(live), nd = num(dead);
  return {
    live: mwdMoments(live),
    total: mwdMoments(MWD_GRID.map((M, i) => ((1 - fDead) * nl[i] + fDead * nd[i]) * M)),
  };
}
{
  const r = mwdWithDead(1.05, 0.10, 200, 100.12, 120);
  check("10% dead chains takes D from 1.05 to", r.total.D, 1.131, 0.001, "");
  check("10% dead chains drops Mn by", (1 - r.total.Mn / r.live.Mn) * 100, 8.1, 0.15, "%");
  check("10% dead chains barely touches Mw", (1 - r.total.Mw / r.live.Mw) * 100, 1.0, 0.15, "%");
  // The floor is what makes that stable. Re-run with 4x the conversion slices:
  // the answer must not move, or the model is reporting its own discretisation.
  const fine = mwdWithDead(1.05, 0.10, 200, 100.12, 480);
  check("dead-chain result is converged in NX", fine.total.D, r.total.D, 0.002, "");
}

// 4. The living-chain dispersity must still be the dispersity predictor's
//    equation. Two pages describing one reaction have to describe it the same
//    way; if they ever diverge, nobody can tell which is wrong from the outside.
const dispHtml = fs.readFileSync(path.join(__dirname, "..", "dispersity-predictor.html"), "utf8");
const sharedTerm = "C * (2 / p - 1)";
if (dispHtml.indexOf(sharedTerm) === -1) {
  failed++;
  cases.push({ ok: false, name: "dispersity-predictor.html no longer contains the shared exchange term",
    actual: "not found", expected: sharedTerm, tol: 0, unit: "" });
}
if (mwdHtml.indexOf("1 + 1 / dpn + C * (2 / p - 1)") === -1) {
  failed++;
  cases.push({ ok: false, name: "mwd-simulator.html no longer uses the predictor's dispersity equation",
    actual: "not found", expected: "1 + 1 / dpn + C * (2 / p - 1)", tol: 0, unit: "" });
}
// The floor itself has to still be in the page. CI re-implements the sweep, so
// deleting the floor there would leave these checks passing against a model the
// page no longer runs - and the symptom would be a dispersity that quietly
// depends on the grid again.
if (mwdHtml.indexOf("var xFloor = Math.min(0.5, 1 / dpn);") === -1) {
  failed++;
  cases.push({ ok: false, name: "mwd-simulator.html lost the one-monomer floor on the dead-chain sweep",
    actual: "not found", expected: "var xFloor = Math.min(0.5, 1 / dpn);", tol: 0, unit: "" });
}

// And numerically, at the page's own defaults.
check("living D at DP 200, p 0.9, Cex 20", 1 + 1 / 180 + (1 / 20) * (2 / 0.9 - 1), 1.0667, 0.0002, "");

// ---- Flory-Huggins: flory-huggins.html -------------------------------------
const fhHtml = fs.readFileSync(path.join(__dirname, "..", "flory-huggins.html"), "utf8");

const fhF = (p, N1, N2, x) => (p / N1) * Math.log(p) + ((1 - p) / N2) * Math.log(1 - p) + x * p * (1 - p);
const fhMu1 = (p, N1, N2, x) => Math.log(p) + (1 - N1 / N2) * (1 - p) + x * N1 * (1 - p) * (1 - p);
const fhMu2 = (p, N1, N2, x) => Math.log(1 - p) + (1 - N2 / N1) * p + x * N2 * p * p;
const fhChiSp = (p, N1, N2) => 0.5 * (1 / (N1 * p) + 1 / (N2 * (1 - p)));
const fhChiC = (N1, N2) => 0.5 * Math.pow(1 / Math.sqrt(N1) + 1 / Math.sqrt(N2), 2);
const fhPhiC = (N1, N2) => Math.sqrt(N2) / (Math.sqrt(N1) + Math.sqrt(N2));

// The three textbook limits of one expression.
check("chi_c for two small molecules (N=1)", fhChiC(1, 1), 2, 1e-12, "");
check("phi_c for two small molecules", fhPhiC(1, 1), 0.5, 1e-12, "");
check("chi_c for a symmetric blend is 2/N", fhChiC(1000, 1000), 2 / 1000, 1e-15, "");
check("chi_c for a long polymer in solvent tends to 1/2", fhChiC(1, 1e8), 0.5, 1e-3, "");

// The closed form must BE the minimum of the spinodal curve. Independent route.
[[1, 1], [1, 500], [100, 400], [1000, 1000], [50, 5000]].forEach(([N1, N2]) => {
  let best = Infinity, at = 0;
  for (let i = 1; i < 200000; i++) {
    const p = i / 200000;
    const c = fhChiSp(p, N1, N2);
    if (c < best) { best = c; at = p; }
  }
  check("spinodal minimum = chi_c for N " + N1 + "/" + N2, best, fhChiC(N1, N2), 1e-7, "");
  check("spinodal minimum sits at phi_c for N " + N1 + "/" + N2, at, fhPhiC(N1, N2), 1e-4, "");
});

// The binodal, by the page's own method: lower convex hull then Newton polish.
function fhGrid(n) {
  const g = [];
  for (let i = 1; i < n; i++) g.push(1 / (1 + Math.exp(-(-18 + 36 * i / n))));
  return g;
}
const FH_GRID = fhGrid(3000);
function fhBinodal(N1, N2, chi) {
  if (!(chi > fhChiC(N1, N2))) return null;
  const F = FH_GRID.map((p) => fhF(p, N1, N2, chi));
  const hull = [];
  for (let i = 0; i < FH_GRID.length; i++) {
    while (hull.length >= 2) {
      const p1 = hull[hull.length - 2], p2 = hull[hull.length - 1];
      if ((p2[1] - p1[1]) * (FH_GRID[i] - p1[0]) - (F[i] - p1[1]) * (p2[0] - p1[0]) >= 0) hull.pop();
      else break;
    }
    hull.push([FH_GRID[i], F[i], i]);
  }
  let best = null, width = 0;
  for (let i = 0; i + 1 < hull.length; i++) {
    if (hull[i + 1][2] - hull[i][2] > 1 && hull[i + 1][0] - hull[i][0] > width) {
      width = hull[i + 1][0] - hull[i][0];
      best = [hull[i][0], hull[i + 1][0]];
    }
  }
  if (!best) return null;
  let a = best[0], b = best[1];
  const G = (x, y) => [fhMu1(x, N1, N2, chi) - fhMu1(y, N1, N2, chi), fhMu2(x, N1, N2, chi) - fhMu2(y, N1, N2, chi)];
  for (let it = 0; it < 80; it++) {
    const f0 = G(a, b);
    if (!isFinite(f0[0]) || !isFinite(f0[1])) break;
    if (Math.abs(f0[0]) < 1e-14 && Math.abs(f0[1]) < 1e-14) break;
    const ha = Math.max(1e-13, a * 1e-7), hb = Math.max(1e-13, (1 - b) * 1e-7);
    const fa = G(a + ha, b), fb = G(a, b + hb);
    const J00 = (fa[0] - f0[0]) / ha, J01 = (fb[0] - f0[0]) / hb;
    const J10 = (fa[1] - f0[1]) / ha, J11 = (fb[1] - f0[1]) / hb;
    const det = J00 * J11 - J01 * J10;
    if (!isFinite(det) || det === 0) break;
    const da = -(f0[0] * J11 - f0[1] * J01) / det;
    const db = -(-f0[0] * J10 + f0[1] * J00) / det;
    let t = 1;
    while (t > 1e-12 && (a + t * da <= 0 || b + t * db >= 1 || a + t * da >= b + t * db)) t /= 2;
    if (t <= 1e-12) break;
    a += t * da; b += t * db;
  }
  return a < b ? [a, b] : null;
}

// A symmetric pair must coexist at compositions summing to exactly 1. This is
// the check that catches a solver sitting on the trivial a = b root, which
// would also "sum to 1" - so the separation is asserted too.
[1.05, 1.5, 3, 8].forEach((mult) => {
  const N = 1000, chi = fhChiC(N, N) * mult;
  const b = fhBinodal(N, N, chi);
  if (!b) {
    failed++;
    cases.push({ ok: false, name: "symmetric binodal at chi/chi_c " + mult, actual: "none", expected: "a pair", tol: 0, unit: "" });
    return;
  }
  check("symmetric binodal pair sums to 1 at chi/chi_c " + mult, b[0] + b[1], 1, 1e-12, "");
  if (!(b[1] - b[0] > 0.01)) {
    failed++;
    cases.push({ ok: false, name: "binodal at chi/chi_c " + mult + " collapsed onto the critical point",
      actual: (b[1] - b[0]).toExponential(2), expected: "> 0.01 apart", tol: 0, unit: "" });
  }
});

// Binodal outside spinodal, across the cases that broke the earlier solvers.
function fhSpinRoots(N1, N2, chi) {
  const pc = fhPhiC(N1, N2);
  let lo = 1e-300, hi = pc, i, m;
  for (i = 0; i < 400; i++) {
    m = Math.exp((Math.log(lo) + Math.log(hi)) / 2);
    if (fhChiSp(m, N1, N2) > chi) lo = m; else hi = m;
  }
  const left = hi;
  lo = pc; hi = 1 - 1e-15;
  for (i = 0; i < 400; i++) {
    m = (lo + hi) / 2;
    if (fhChiSp(m, N1, N2) < chi) lo = m; else hi = m;
  }
  return [left, lo];
}
[[200, 800], [100, 1000], [1, 500], [1, 10000], [50, 5000]].forEach(([N1, N2]) => {
  [1.05, 1.5, 3].forEach((mult) => {
    const chi = fhChiC(N1, N2) * mult;
    const b = fhBinodal(N1, N2, chi), sp = fhSpinRoots(N1, N2, chi);
    if (!b) {
      failed++;
      cases.push({ ok: false, name: "binodal for N " + N1 + "/" + N2 + " at chi/chi_c " + mult, actual: "none", expected: "a pair", tol: 0, unit: "" });
      return;
    }
    if (!(b[0] < sp[0] && b[1] > sp[1])) {
      failed++;
      cases.push({ ok: false, name: "binodal must lie outside the spinodal, N " + N1 + "/" + N2 + " at chi/chi_c " + mult,
        actual: b[0].toExponential(2) + "/" + b[1].toFixed(6), expected: "outside " + sp[0].toExponential(2) + "/" + sp[1].toFixed(6), tol: 0, unit: "" });
    }
  });
});

// And below chi_c there must be no tie-line at all.
[[1000, 1000], [1, 500], [200, 800]].forEach(([N1, N2]) => {
  if (fhBinodal(N1, N2, fhChiC(N1, N2) * 0.9)) {
    failed++;
    cases.push({ ok: false, name: "no phase separation below chi_c for N " + N1 + "/" + N2,
      actual: "found a tie-line", expected: "none", tol: 0, unit: "" });
  }
});

// CI runs its own copy of the binodal solver, so the page could switch back to
// a naive Newton solve - which converges on the trivial a = b root and silently
// reports every mixture as miscible - without any of this failing. Require the
// page to still carry the hull construction that makes that impossible.
["function binodal(", "lower convex hull", "hull.pop()"].forEach((needle) => {
  if (fhHtml.indexOf(needle) === -1) {
    failed++;
    cases.push({ ok: false, name: "flory-huggins.html lost its convex-hull binodal (missing: " + needle + ")",
      actual: "not found", expected: needle, tol: 0, unit: "" });
  }
});

// The published 2/N table, read out of the page.
const fhTable = [...fhHtml.matchAll(/<tr><td>([\d,]+)<\/td><td class="num">([\d.]+)<\/td>/g)]
  .map((m) => [Number(m[1].replace(/,/g, "")), Number(m[2])]);
if (fhTable.length !== 4) {
  failed++;
  cases.push({ ok: false, name: "flory-huggins 2/N table has 4 rows", actual: fhTable.length, expected: 4, tol: 0, unit: "rows" });
}
fhTable.forEach(([N, chic]) => check("published chi_c for symmetric N = " + N, fhChiC(N, N), chic, 1e-9, ""));

// The diblock contrast the page argues from: a blend of two N/2 homopolymers
// demixes at chi*N = 4, the diblock orders at 10.495, so the diblock needs
// 2.62x more. If either number moves the sentence stops being true.
check("blend of two N/2 chains demixes at chi*N", fhChiC(500, 500) * 1000, 4, 1e-12, "");
check("diblock needs this much more than the blend", 10.495 / 4, 2.62, 0.005, "x");
if (fhHtml.indexOf("10.495") === -1) {
  failed++;
  cases.push({ ok: false, name: "flory-huggins.html no longer states the ODT value", actual: "not found", expected: "10.495", tol: 0, unit: "" });
}

// ---- Time-temperature superposition: tts-master-curve.html -----------------
const ttsHtml = fs.readFileSync(path.join(__dirname, "..", "tts-master-curve.html"), "utf8");

const TTS_C1 = 12.5, TTS_C2 = 65.0, TTS_TREF = 373.15;
const ttsLogA = (T) => -TTS_C1 * (T - TTS_TREF) / (TTS_C2 + (T - TTS_TREF));

// The same generator the page ships, at the same settings.
const ttsSets = [];
for (let T = TTS_TREF - 15; T <= TTS_TREF + 60.001; T += 5) {
  const la = ttsLogA(T), pts = [];
  for (let lw = -2; lw <= 2.0001; lw += 0.2) {
    pts.push([lw, 5.5 + 2.6 / (1 + Math.exp(-((lw + la) + 1.5) / 2.2))]);
  }
  ttsSets.push({ T: Number(T.toFixed(2)), pts: pts });
}

function ttsResid(A, B, sh) {
  const xs = A.map((p) => p[0]), ys = A.map((p) => p[1]);
  let n = 0, acc = 0;
  for (const p of B) {
    const x = p[0] + sh;
    if (x < xs[0] || x > xs[xs.length - 1]) continue;
    let lo = 0, hi = xs.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (xs[mid] <= x) lo = mid; else hi = mid; }
    const i = lo;
    const d = xs[i + 1] - xs[i];
    const t = d === 0 ? 0 : (x - xs[i]) / d;
    acc += Math.pow(p[1] - (ys[i] + t * (ys[i + 1] - ys[i])), 2);
    n++;
  }
  const need = Math.max(5, Math.floor(Math.min(A.length, B.length) * 0.5));
  return n < need ? Infinity : acc / n;
}
function ttsPairShift(A, B) {
  const lo = A[0][0] - B[B.length - 1][0], hi = A[A.length - 1][0] - B[0][0];
  let best = null, bv = Infinity;
  // Mirrors the page: a 400-step coarse pass, then ternary refinement.
  const STEPS = 400;
  for (let i = 0; i <= STEPS; i++) {
    const sh = lo + (hi - lo) * i / STEPS;
    const v = ttsResid(A, B, sh);
    if (v < bv) { bv = v; best = sh; }
  }
  if (best === null || !isFinite(bv)) return null;
  let a = best - (hi - lo) / STEPS, b = best + (hi - lo) / STEPS;
  for (let i = 0; i < 200; i++) {
    const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3;
    if (ttsResid(A, B, m1) < ttsResid(A, B, m2)) b = m2; else a = m1;
  }
  return (a + b) / 2;
}
function ttsFit(iRef) {
  const shifts = new Array(ttsSets.length).fill(null);
  shifts[iRef] = 0;
  let i;
  for (i = iRef - 1; i >= 0; i--) {
    const d = ttsPairShift(ttsSets[i + 1].pts, ttsSets[i].pts);
    if (d === null) break;
    shifts[i] = shifts[i + 1] + d;
  }
  for (i = iRef + 1; i < ttsSets.length; i++) {
    const d = ttsPairShift(ttsSets[i - 1].pts, ttsSets[i].pts);
    if (d === null) break;
    shifts[i] = shifts[i - 1] + d;
  }
  const Tref = ttsSets[iRef].T;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, n = 0;
  ttsSets.forEach((S, ix) => {
    const dT = S.T - Tref;
    if (Math.abs(dT) < 1e-9 || shifts[ix] === null) return;
    const x = 1 / dT, y = 1 / shifts[ix];
    sx += x; sy += y; sxx += x * x; sxy += x * y; n++;
  });
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const icpt = (sy - slope * sx) / n;
  return { C1: -1 / icpt, C2: slope / icpt, shifts: shifts, Tref: Tref, unshifted: shifts.filter((v) => v === null).length };
}

// Every sweep must shift. A version of this that silently dropped the ones it
// could not align would still fit a plausible-looking WLF to what remained.
{
  const iGen = ttsSets.findIndex((S) => Math.abs(S.T - TTS_TREF) < 1e-9);
  const r = ttsFit(iGen);
  check("every demo sweep shifts", r.unshifted, 0, 0, "unshifted");
  check("TTS recovers the generating C1", r.C1, TTS_C1, 0.02, "");
  check("TTS recovers the generating C2", r.C2, TTS_C2, 0.15, "K");
  // And every individual shift factor, not just the fitted summary - a fit can
  // absorb a lot of per-point error.
  let worst = 0;
  ttsSets.forEach((S, ix) => {
    if (r.shifts[ix] === null) return;
    worst = Math.max(worst, Math.abs(r.shifts[ix] - ttsLogA(S.T)));
  });
  check("worst individual shift factor error", worst, 0, 0.01, "decades");
}

// The reference conversion the page argues from, exactly, and the published
// table of it.
const ttsConv = (d) => ({ C1: TTS_C1 * TTS_C2 / (TTS_C2 + d), C2: TTS_C2 + d });
[0, 10, 25].forEach((d) => {
  const iRef = ttsSets.findIndex((S) => Math.abs(S.T - (TTS_TREF + d)) < 1e-9);
  if (iRef < 0) return;
  const r = ttsFit(iRef), e = ttsConv(d);
  check("TTS C1 at reference +" + d + " K", r.C1, e.C1, Math.max(0.08, e.C1 * 0.012), "");
  check("TTS C2 at reference +" + d + " K", r.C2, e.C2, Math.max(0.3, e.C2 * 0.012), "K");
});
// C1*C2 is invariant under a change of reference. This is the content-bearing
// part of the identity, so it is asserted directly rather than inferred.
[0, 10, 25, -10].forEach((d) => {
  const e = ttsConv(d);
  check("C1*C2 is invariant at reference shift " + d, e.C1 * e.C2, TTS_C1 * TTS_C2, 1e-9, "");
});

// The published reference table.
const ttsTable = [...ttsHtml.matchAll(
  /<tr><td>([\d.]+) K[^<]*<\/td><td class="num">([\d.]+)<\/td><td class="num">([\d.]+)<\/td><td class="num">([\d.]+)<\/td><td class="num">([\d.]+)<\/td><\/tr>/g
)].map((m) => m.slice(1).map(Number));
if (ttsTable.length !== 3) {
  failed++;
  cases.push({ ok: false, name: "tts-master-curve reference table has 3 rows", actual: ttsTable.length, expected: 3, tol: 0, unit: "rows" });
}
ttsTable.forEach(([T, , , c1ex, c2ex]) => {
  const e = ttsConv(T - TTS_TREF);
  check("published exact C1 at " + T + " K", e.C1, c1ex, 0.006, "");
  check("published exact C2 at " + T + " K", e.C2, c2ex, 0.06, "K");
});

// The apparent activation energy the page quotes for the universal constants.
// Ea = 2.303 R C1 C2 T^2 / (C2 + dT)^2.
{
  const R = 8.314, uC1 = 17.44, uC2 = 51.6, Tg = 373;
  const Ea = (dT) => 2.303 * R * uC1 * uC2 * (Tg + dT) * (Tg + dT) / Math.pow(uC2 + dT, 2) / 1000;
  check("apparent Ea at Tg with universal constants", Ea(0), 900, 12, "kJ/mol");
  check("apparent Ea at Tg+50", Ea(50), 300, 12, "kJ/mol");
  // The page's claim is the RATIO - a threefold fall over 50 K.
  check("Ea falls threefold over 50 K", Ea(0) / Ea(50), 3.0, 0.15, "x");
}

// The coarse pass was 3000 steps with a linear-scan interpolation, which cost
// 569 ms per keystroke on a desktop. 400 steps with a binary search is 8 ms and
// returns the same constants to the published precision. Require both halves
// to stay, since either one alone would bring most of the lag back.
if (ttsHtml.indexOf("var STEPS = 400;") === -1 || ttsHtml.indexOf("var mid = (lo + hi) >> 1;") === -1) {
  failed++;
  cases.push({ ok: false, name: "tts-master-curve.html lost the fast shift search (400-step pass + binary interpolation)",
    actual: "not found", expected: "STEPS = 400 and binary search", tol: 0, unit: "" });
}

// CI runs its own copy of the shifting algorithm, so require the page to still
// shift onto the NEIGHBOUR. Shifting onto the accumulated master curve is the
// bug this replaced, and it produced shift factors sitting on the search bound.
if (ttsHtml.indexOf("pairShift(work[i + 1].pts, work[i].pts)") === -1 ||
    ttsHtml.indexOf("pairShift(work[i - 1].pts, work[i].pts)") === -1) {
  failed++;
  cases.push({ ok: false, name: "tts-master-curve.html no longer shifts onto the adjacent sweep",
    actual: "not found", expected: "pairwise shifting", tol: 0, unit: "" });
}

// ---- Network formation: network-formation.html -----------------------------
const nfHtml = fs.readFileSync(path.join(__dirname, "..", "network-formation.html"), "utf8");

// E[f-1] averaged over GROUPS, not molecules - the recursion arrives through a
// group, so a trifunctional monomer gets three chances to be entered.
const nfExpected = (list) => {
  const tot = list.reduce((a, c) => a + c.groups, 0);
  return list.reduce((a, c) => a + (c.groups / tot) * (c.f - 1), 0);
};
const nfComp = (f, n) => ({ f: f, n: n, groups: f * n, M: 100 });

function nfSolve(A, B, pA, pB) {
  const aTot = A.reduce((a, c) => a + c.groups, 0);
  const bTot = B.reduce((a, c) => a + c.groups, 0);
  let PA = 0, PB = 0;
  for (let i = 0; i < 20000; i++) {
    const nA = (1 - pA) + pA * B.reduce((a, c) => a + (c.groups / bTot) * Math.pow(PB, c.f - 1), 0);
    const nB = (1 - pB) + pB * A.reduce((a, c) => a + (c.groups / aTot) * Math.pow(PA, c.f - 1), 0);
    if (Math.abs(nA - PA) < 1e-15 && Math.abs(nB - PB) < 1e-15) { PA = nA; PB = nB; break; }
    PA = nA; PB = nB;
  }
  return { PA: Math.min(1, PA), PB: Math.min(1, PB) };
}

// 1. Reduction to Flory-Stockmayer, balanced stoichiometry.
[[3, 2], [4, 2], [5, 2], [3, 3], [4, 4], [6, 2]].forEach(([f, g]) => {
  const A = [nfComp(f, 1)], B = [nfComp(g, f / g)];
  const prod = nfExpected(A) * nfExpected(B);
  const pc = Math.sqrt(1 / prod);
  check("A" + f + "+B" + g + " gels at the Flory-Stockmayer point", pc, 1 / Math.sqrt((f - 1) * (g - 1)), 1e-12, "");
});
// A2 + B2 has a branching product of exactly 1: no gel at any conversion.
{
  const A = [nfComp(2, 1)], B = [nfComp(2, 1)];
  check("A2+B2 branching product is exactly 1", nfExpected(A) * nfExpected(B), 1, 1e-15, "");
}

// 2. A MIXTURE of functionalities, which is the reason this page exists. Group
//    weighting is what makes it right; molecule weighting would give a
//    different and wrong answer, so both are computed and required to differ.
{
  // Two-thirds triol, one-third diol, by moles, cured with a diisocyanate.
  const A = [nfComp(3, 2), nfComp(2, 1)];
  const B = [nfComp(2, 4)];   // 8 A groups, 8 B groups
  const byGroup = nfExpected(A);
  const molTot = A.reduce((a, c) => a + c.n, 0);
  const byMolecule = A.reduce((a, c) => a + (c.n / molTot) * (c.f - 1), 0);
  // 6 of 8 A groups are on the triol: E[f-1] = 6/8*2 + 2/8*1 = 1.75
  check("mixed functionality E[f-1] weighted by groups", byGroup, 1.75, 1e-12, "");
  check("weighting by molecules instead would give", byMolecule, 5 / 3, 1e-12, "");
  if (Math.abs(byGroup - byMolecule) < 1e-6) {
    failed++;
    cases.push({ ok: false, name: "the group/molecule weighting distinction collapsed - the test is not testing anything",
      actual: byGroup, expected: "different from " + byMolecule, tol: 0, unit: "" });
  }
  check("mixed triol/diol network gels at", Math.sqrt(1 / (byGroup * nfExpected(B))), 0.7559, 0.0002, "");
}

// 3. Off-stoichiometry. A3 + B2 at a group ratio of 0.5 gels EXACTLY at full
//    conversion, which is the boundary the page publishes a table around.
[[1.0, 0.70711], [0.9, 0.74536], [0.8, 0.79057], [0.7, 0.84515], [0.6, 0.91287], [0.5, 1.0]].forEach(([r, expect]) => {
  const A = [nfComp(3, r)], B = [nfComp(2, 1.5)];
  const prod = nfExpected(A) * nfExpected(B);
  // pB = pA * r, so pA^2 * r * prod = 1.
  check("A3+B2 gel point at group ratio " + r, Math.sqrt(1 / (prod * r)), expect, 0.00002, "");
});

// The published off-stoichiometry table, read out of the page.
const nfTable = [...nfHtml.matchAll(/<tr><td>(\d\.\d\d)[^<]*<\/td><td class="num">(\d\.\d{4})/g)]
  .map((m) => [Number(m[1]), Number(m[2])]);
if (nfTable.length !== 6) {
  failed++;
  cases.push({ ok: false, name: "network-formation stoichiometry table has 6 rows", actual: nfTable.length, expected: 6, tol: 0, unit: "rows" });
}
nfTable.forEach(([r, pub]) => {
  const A = [nfComp(3, r)], B = [nfComp(2, 1.5)];
  check("published gel point at group ratio " + r, Math.sqrt(1 / (nfExpected(A) * nfExpected(B) * r)), pub, 0.00006, "");
});

// 4. Sol fraction: exactly 1 at and below the gel point, monotonically falling
//    past it. The published figures for the balanced triol system are checked
//    against the recursion.
{
  const A = [nfComp(3, 1)], B = [nfComp(2, 1.5)];
  const pc = Math.sqrt(1 / (nfExpected(A) * nfExpected(B)));
  const solAt = (p) => {
    const r = nfSolve(A, B, p, p);
    const mass = 100 * 1 + 100 * 1.5;
    return (100 * 1 * Math.pow(r.PA, 3) + 100 * 1.5 * Math.pow(r.PB, 2)) / mass;
  };
  check("sol fraction is 1 below the gel point", solAt(pc * 0.9), 1, 1e-9, "");
  check("sol fraction 1% past the gel point", solAt(pc * 1.01), 0.890, 0.004, "");
  check("sol fraction 5% past the gel point", solAt(pc * 1.05), 0.553, 0.004, "");
  check("sol fraction 20% past the gel point", solAt(pc * 1.20), 0.070, 0.004, "");
  let prev = 1.0000001;
  for (let m = 1.0; m <= 1.4; m += 0.02) {
    const v = solAt(Math.min(1, pc * m));
    if (v > prev + 1e-9) {
      failed++;
      cases.push({ ok: false, name: "sol fraction must fall monotonically past the gel point",
        actual: v.toFixed(6) + " after " + prev.toFixed(6), expected: "non-increasing", tol: 0, unit: "" });
      break;
    }
    prev = v;
  }
}

// 5. The page must still distinguish "cannot gel" from "gels at full
//    conversion". A2+B2 returns p = 1 from the formula and is NOT a gel; the
//    headline said 1.0000 while the note beneath said it could not gel.
if (nfHtml.indexOf("var canGel = prod > 1 && pGelLim <= 1;") === -1) {
  failed++;
  cases.push({ ok: false, name: "network-formation.html lost the branching test that separates 'never gels' from 'gels at p=1'",
    actual: "not found", expected: "canGel = prod > 1 && pGelLim <= 1", tol: 0, unit: "" });
}

// ---- The converter's reference table has to stay checkable -----------------
// gpc-calibration.html refuses to convert between two polymers characterised in
// different eluents, because universal calibration equates hydrodynamic volume
// between chains in the same liquid and has nothing to say across two. That
// refusal reads a structured "eluent" key. Before it existed the solvent was
// free text, and a polystyrene-in-THF standard would convert against a
// PEG-in-water sample and print a 0.652x factor without a word of complaint.
//
// An entry added with only the old free-text "solvent" would reintroduce that
// silently: its eluent would be undefined, undefined matches nothing in ELUENT,
// and the comparison stops meaning anything. So every row must carry an eluent
// that ELUENT actually names, plus the temperature bounds the softer caution
// reads.

const eluentBlock = calHtml.match(/var ELUENT = \{([\s\S]*?)\};/);
const refBlock = calHtml.match(/var REF = \[([\s\S]*?)\n  \];/);
if (!eluentBlock || !refBlock) {
  failed++;
  cases.push({ ok: false, name: "gpc-calibration.html still declares ELUENT and REF", actual: "not found", expected: "both present", tol: 0, unit: "" });
} else {
  const known = new Set([...eluentBlock[1].matchAll(/^\s*(\w+):/gm)].map((m) => m[1]));
  const rows = refBlock[1].split("\n").map((l) => l.trim()).filter((l) => l.startsWith("{"));

  // Without this, a regex that stopped matching would sail through: zero rows
  // to inspect reads exactly like zero problems found.
  if (!rows.length) {
    failed++;
    cases.push({ ok: false, name: "REF parsed to zero entries - the check is not looking at anything", actual: 0, expected: "> 0", tol: 0, unit: "entries" });
  }

  rows.forEach((row) => {
    const name = (row.match(/name:\s*"([^"]+)"/) || [])[1] || row.slice(0, 40);
    const eluent = (row.match(/eluent:\s*"([^"]+)"/) || [])[1];
    const tLo = Number((row.match(/tLo:\s*(-?[\d.]+)/) || [])[1]);
    const tHi = Number((row.match(/tHi:\s*(-?[\d.]+)/) || [])[1]);
    let problem = null;
    if (!eluent) problem = 'no "eluent" key, so the cross-solvent guard cannot see it';
    else if (!known.has(eluent)) problem = 'eluent "' + eluent + '" is not declared in ELUENT';
    else if (!Number.isFinite(tLo) || !Number.isFinite(tHi)) problem = "missing tLo/tHi temperature bounds";
    else if (tHi < tLo) problem = "tHi is below tLo";
    if (problem) {
      failed++;
      cases.push({ ok: false, name: "REF entry " + name + ": " + problem, actual: "invalid", expected: "eluent in ELUENT, tLo <= tHi", tol: 0, unit: "" });
    }
  });
}

// ---- Controlled polymerisation targets: calculator.html --------------------
// The relation behind every tab, and the end-group term the page argues is only
// safe to drop when the chains are long.
const mnFrom = (dp, M0, Mend) => dp * M0 + Mend;
check("DP 200 MMA from EBiB", mnFrom(200, 100.12, 195.05), 20219, 1, "g/mol");
check("DP 20 MMA from EBiB", mnFrom(20, 100.12, 195.05), 2197.5, 1, "g/mol");
check("end group as % of Mn at DP 20", 100 * 195.05 / mnFrom(20, 100.12, 195.05), 8.9, 0.1, "%");
check("end group as % of Mn at DP 500", 100 * 195.05 / mnFrom(500, 100.12, 195.05), 0.39, 0.01, "%");
// The recipe-scaling worked example: ratios must survive scaling exactly.
const scale = (mmolMonomer, mmolInit, factor) => (mmolMonomer * factor) / (mmolInit * factor);
check("DP unchanged by scaling x20", scale(49.94, 0.25, 20), 199.8, 0.1, "");
check("DP unchanged by scaling x0.02", scale(49.94, 0.25, 0.02), 199.8, 0.1, "");

// ---- report ---------------------------------------------------------------
cases.forEach((c) => {
  const mark = c.ok ? "  ok  " : "  FAIL";
  const exp = typeof c.expected === "number" ? c.expected : c.expected;
  console.log(`${mark} ${c.name}: ${c.actual} ${c.unit}`.trimEnd() +
    (c.ok ? "" : `   expected ${exp} +/- ${c.tol}`));
});
console.log("");
if (failed) {
  console.error(`${failed} of ${cases.length} calculator checks FAILED.`);
  console.error("A failure here means a worked example on the site no longer matches the maths.");
  process.exit(1);
}
console.log(`All ${cases.length} calculator checks pass.`);
