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
[[10000, 13400], [25000, 33900], [45500, 62000], [100000, 137300], [250000, 346100]]
  .forEach(([app, exp]) => check(`GPC true M for PS-equivalent ${app}`, gpc(app), exp, 100, "g/mol"));
const lowRatio = gpc(10000) / 10000, highRatio = gpc(250000) / 250000;
check("correction ratio at 10 kg/mol", lowRatio, 1.34, 0.01, "x");
check("correction ratio at 250 kg/mol", highRatio, 1.38, 0.01, "x");
if (!(highRatio > lowRatio)) {
  failed++;
  cases.push({ ok: false, name: "correction must drift upward with molecular weight", actual: highRatio - lowRatio, expected: "> 0", tol: 0, unit: "" });
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
const calHtml = fs.readFileSync(path.join(__dirname, "..", "gpc-calibration.html"), "utf8");

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
