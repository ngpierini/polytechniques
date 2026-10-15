// Checks each CAS number against the molecular formula the registry holds for
// it, so a number that belongs to a DIFFERENT polymer cannot sit quietly in
// the library.
//
// Why this exists. check-polymer-data.js already guards the failure mode where
// an entry carries its MONOMER's registry number instead of the polymer's. It
// cannot catch the other mistake: a number that is a perfectly good polymer
// CAS, just not this polymer's. Two of those were found by comparing formulas:
//
//   Poly(4-vinylpyridine)   carried 9003-68-3, which is poly(ethylene
//                           terephthalate). The right number is 25232-41-1,
//                           whose registry formula (C7H7N)x matches the
//                           repeat unit drawn here exactly.
//   Poly(methacrylonitrile) carried 25067-02-1, which is a 2-ethylhexyl
//                           acrylate / vinyl acetate copolymer. No replacement
//                           could be confirmed, so that field is null.
//
// Neither is visible by looking at the number. Both are obvious the moment the
// formula is compared.
//
// How it works offline. cas-formula-snapshot.json holds what EPA's Substance
// Registry Services returned for each CAS, so CI needs no network. Refresh it
// with the --refresh flag when entries are added.
//
// A CAS not in the snapshot is NOT a failure - the registry has no record of
// plenty of legitimate polymer numbers, and coverage is not the entry's fault.
// Only a formula that disagrees under every reading fails the build.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SNAP = path.join(__dirname, "cas-formula-snapshot.json");

const VALENCE = { C: 4, N: 3, O: 2, S: 2, P: 3, Si: 4, F: 1, Cl: 1, Br: 1, I: 1, B: 3, H: 1 };

function loadDb() {
  return new Function("window", fs.readFileSync(path.join(ROOT, "polymer-data.js"), "utf8") +
    "\nreturn window.POLYMER_DB;")({});
}

// Formula of the repeat unit as drawn. A bond to a "*" is a chain
// continuation and a real bond, so the atom picks up no hydrogen there.
function repeatUnitFormula(atoms, bonds) {
  const deg = {};
  atoms.forEach(function (a) { deg[String(a.id)] = 0; });
  bonds.forEach(function (b) {
    deg[String(b.a)] = (deg[String(b.a)] || 0) + (b.order || 1);
    deg[String(b.b)] = (deg[String(b.b)] || 0) + (b.order || 1);
  });
  const c = {};
  let unknown = false;
  atoms.forEach(function (a) {
    if (a.el === "*") return;
    if (VALENCE[a.el] === undefined) unknown = true;
    c[a.el] = (c[a.el] || 0) + 1;
    c.H = (c.H || 0) + Math.max(0, (VALENCE[a.el] || 0) - deg[String(a.id)]);
  });
  return unknown ? null : c;
}

function parseFormula(s) {
  const c = {};
  const re = /([A-Z][a-z]?)(\d*)/g;
  let m, any = false;
  while ((m = re.exec(s))) {
    if (!m[1]) continue;
    any = true;
    c[m[1]] = (c[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
  }
  return any ? c : null;
}

function show(c) {
  if (!c) return "?";
  const keys = Object.keys(c).filter(function (k) { return c[k] > 0; });
  keys.sort(function (a, b) {
    if (a === "C") return -1;
    if (b === "C") return 1;
    if (a === "H") return -1;
    if (b === "H") return 1;
    return a < b ? -1 : 1;
  });
  return keys.map(function (k) { return k + (c[k] > 1 ? c[k] : ""); }).join("");
}
function addF(a, b, sign) {
  const o = Object.assign({}, a);
  Object.keys(b).forEach(function (k) { o[k] = (o[k] || 0) + sign * b[k]; });
  return o;
}
function same(a, b) { return !!a && !!b && show(a) === show(b); }

// A condensation polymer loses a small molecule per linkage, and which one
// depends on the chemistry: water for an ester or amide, HCl where a
// dichloride was used, H2 for the oxidative coupling that makes PPO, methanol
// for a transesterification. Scaling covers the case where the registry
// brackets a repeat unit at twice the size this library draws it, which is
// how poly(ether sulfone) legitimately differs.
const LEAVING = [{ H: 2, O: 1 }, { H: 1, Cl: 1 }, { H: 2 }, { C: 1, H: 4, O: 1 }, { H: 1, Br: 1 }];
function reachable(sum) {
  const outs = [sum];
  LEAVING.forEach(function (w) {
    const once = addF(sum, w, -1);
    outs.push(once);
    outs.push(addF(once, w, -1));
  });
  // the same formulas at half size, for a doubled registry bracketing
  const halves = [];
  outs.forEach(function (f) {
    const h = {};
    let ok = true;
    Object.keys(f).forEach(function (k) {
      if (f[k] % 2 !== 0) ok = false;
      h[k] = f[k] / 2;
    });
    if (ok) halves.push(h);
  });
  return outs.concat(halves);
}

function agrees(mine, raw) {
  if (/^unspecified$/i.test(String(raw).trim())) return true;   // not an answer
  const poly = /^\(([^()]+)\)[xn]$/i.exec(String(raw).trim());
  if (poly) {
    const comps = poly[1].split(".").map(function (x) { return parseFormula(x.trim()); });
    if (comps.length === 1 && comps[0]) return reachable(comps[0]).some(function (f) { return same(mine, f); });
    if (comps.length === 2 && comps[0] && comps[1]) {
      return reachable(addF(comps[0], comps[1], 1)).some(function (f) { return same(mine, f); });
    }
    return true;      // three or more components: nothing reliable to compare
  }
  const f = parseFormula(raw);
  if (!f) return true;
  return reachable(f).some(function (g) { return same(mine, g); });
}

// Entries whose repeat unit legitimately cannot match the registry formula,
// each with the reason. Keeping them here rather than loosening the rule means
// a NEW disagreement still fails.
const EXPECTED_DIFFERENCES = {
  "Poly(oligo(ethylene glycol) methyl ether methacrylate)":
    "the side chain is a PEG of unspecified length, so no single formula can match",
  "Poly(vinylidene fluoride-co-hexafluoropropylene)":
    "a copolymer; the entry carries no single repeat unit",
  "Capa 2201A polycaprolactone diol":
    "a telechelic diol: the repeat unit is caprolactone, while the CAS covers the whole neopentyl-glycol-initiated product"
};

const snapshot = JSON.parse(fs.readFileSync(SNAP, "utf8"));
const db = loadDb();

const errors = [];
let checked = 0, skipped = 0, excused = 0;

db.forEach(function (p) {
  if (!p.cas || !p.atoms || !p.bonds) return;
  const rec = snapshot[p.cas];
  if (!rec || !rec.formula) { skipped++; return; }
  const mine = repeatUnitFormula(p.atoms, p.bonds);
  if (!mine) { skipped++; return; }
  if (EXPECTED_DIFFERENCES[p.name]) { excused++; return; }
  checked++;
  if (!agrees(mine, rec.formula)) {
    errors.push(p.name + " (CAS " + p.cas + "): the repeat unit here is " + show(mine) +
      ", but the registry holds " + rec.formula + " for that number" +
      (rec.name ? ", \"" + rec.name + "\"" : "") +
      ".\n    Either the structure is wrong or the CAS belongs to a different substance.");
  }
});

if (errors.length) {
  console.error("CAS/formula disagreements:\n");
  errors.forEach(function (e) { console.error("- " + e); });
  console.error("\nIf a disagreement is genuine chemistry rather than a mistake, add the entry to");
  console.error("EXPECTED_DIFFERENCES in this file with the reason.");
  process.exit(1);
}
console.log("CAS/formula OK: " + checked + " entries agree with the registry formula held for their CAS, " +
  excused + " known exceptions, " + skipped + " with no snapshot entry.");
