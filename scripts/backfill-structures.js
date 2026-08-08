#!/usr/bin/env node
"use strict";

// Backfill repeat-unit structures for entries that are already in the library
// but were never drawn.
//
// 242 of 654 entries carry metadata only, which means they are invisible to
// every structure search on the site - you can find them by name, but drawing
// the thing itself finds nothing. discover-polymers.js already knows how to
// turn a monomer SMILES into a repeat unit for the mechanisms that are safely
// automatable; this points that same chemistry at the entries that exist,
// instead of at a watchlist of ones that don't.
//
// The rule this script is built around: A DERIVED STRUCTURE IS A CLAIM, AND
// EVERY CLAIM IS CHECKED BEFORE IT IS KEPT. Addition and ring-opening
// polymerization are both isomerizations - the repeat unit has exactly the
// monomer's molecular formula - so the derived graph is re-expanded to a
// formula and compared against PubChem's for the monomer. Anything that
// doesn't match is dropped, not adjusted. That single check catches a
// misidentified double bond, a ring opened in the wrong place, a bad SMILES
// parse and a wrong PubChem hit, none of which are things to discover later on
// a page someone is trusting.
//
// Nothing is written without --write. Run --dry-run first and read the table.

const fs = require("fs");
const path = require("path");
const { deriveRepeatUnit, lookupMonomer, serializeAtoms, serializeBonds } = require("./discover-polymers.js");
const { closedHash } = require("../polymer-graph.js");

const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "polymer-data.js");
const WRITE = process.argv.includes("--write");
const LIMIT = (function () {
  const i = process.argv.indexOf("--limit");
  return i !== -1 ? parseInt(process.argv[i + 1], 10) : Infinity;
})();
const ONLY = (function () {
  const i = process.argv.indexOf("--only");
  return i !== -1 ? process.argv[i + 1].toLowerCase() : null;
})();

// Standard valences, used only to count implicit hydrogens for the formula
// check. Anything not listed makes the check inconclusive, and inconclusive
// means the entry is skipped rather than trusted.
const VALENCE = { C: 4, N: 3, O: 2, S: 2, F: 1, Cl: 1, Br: 1, I: 1, Si: 4, P: 3, B: 3, Sn: 4, H: 1 };

function loadDb() {
  const code = fs.readFileSync(DATA_FILE, "utf8");
  return new Function("window", code + "\nreturn window.POLYMER_DB;")({});
}

// Hill notation: C first, H second, everything else alphabetical.
function formulaOf(atoms, bonds) {
  const sum = {};
  atoms.forEach(function (a) { sum[a.id] = 0; });
  for (const b of bonds) {
    if (sum[b.a] === undefined || sum[b.b] === undefined) return null;
    sum[b.a] += b.order;
    sum[b.b] += b.order;
  }
  const count = {};
  for (const a of atoms) {
    if (a.el === "*") continue;                 // chain ends are not atoms
    const v = VALENCE[a.el];
    if (v === undefined) return null;           // can't count H: inconclusive
    count[a.el] = (count[a.el] || 0) + 1;
    const h = v - sum[a.id];
    if (h < 0) return null;                     // over-valent: the graph is wrong
    count.H = (count.H || 0) + h;
  }
  const els = Object.keys(count).filter(function (e) { return e !== "C" && e !== "H"; }).sort();
  const order = [].concat(count.C ? ["C"] : [], count.H ? ["H"] : [], els);
  return order.map(function (e) { return e + (count[e] > 1 ? count[e] : ""); }).join("");
}

// The monomer field is prose, not a database key: "propylene (stereospecific
// catalysis)", "ethylene + vinyl acetate, then hydrolysis". A parenthetical is
// commentary and can go; anything naming a SECOND monomer means step-growth or
// a copolymer, which needs a pair and a human, so it is refused outright rather
// than looked up on its first half.
function monomerQuery(raw) {
  if (!raw) return { skip: "no monomer field" };
  let s = String(raw).trim();
  if (/[+/]|,\s|\band\b|\bthen\b|\bwith\b/i.test(s.replace(/\([^)]*\)/g, ""))) {
    return { skip: "names more than one monomer - needs a hand-drawn pair" };
  }
  s = s.replace(/\([^)]*\)/g, "").trim();
  if (!s) return { skip: "monomer field is only a parenthetical" };
  if (s.split(/\s+/).length > 4) return { skip: "monomer field is prose, not a name: " + JSON.stringify(s) };
  return { name: s };
}

async function main() {
  const db = loadDb();

  // Every hash already in the library, so a derived structure that collides
  // with a drawn one is caught here rather than by the CI check afterwards.
  const taken = new Map();
  db.forEach(function (e) {
    if (!Array.isArray(e.atoms) || !e.atoms.length) return;
    const h = closedHash(e.atoms, e.bonds);
    if (h != null) taken.set(h + "|" + (e.tacticity || "-"), e.name);
  });

  let targets = db.filter(function (e) {
    return (!Array.isArray(e.atoms) || !e.atoms.length) && e.type !== "copolymer";
  });
  if (ONLY) targets = targets.filter(function (e) { return e.name.toLowerCase().indexOf(ONLY) !== -1; });
  targets = targets.slice(0, LIMIT);

  console.log("candidates without a structure: " + targets.length + (ONLY ? " (filtered by --only " + ONLY + ")" : ""));
  console.log("");

  const accepted = [], rejected = [], skipped = [];

  for (const entry of targets) {
    const q = monomerQuery(entry.monomer);
    if (q.skip) { skipped.push({ name: entry.name, why: q.skip }); continue; }

    let pc = null;
    try { pc = await lookupMonomer(q.name); }
    catch (e) { rejected.push({ name: entry.name, why: "PubChem error: " + e.message }); continue; }
    if (!pc || !pc.smiles) { rejected.push({ name: entry.name, why: 'PubChem has no compound named "' + q.name + '"' }); continue; }

    const derived = deriveRepeatUnit(pc.smiles);
    if (!derived.ok) { skipped.push({ name: entry.name, why: derived.reason }); continue; }

    // THE CHECK. Addition and ring-opening are isomerizations: the repeat unit
    // must weigh exactly what the monomer weighs, atom for atom.
    const got = formulaOf(derived.atoms, derived.bonds);
    if (got === null) {
      rejected.push({ name: entry.name, why: "formula could not be computed (exotic element or bad valence)" });
      continue;
    }
    if (got !== pc.formula) {
      rejected.push({ name: entry.name, why: "formula mismatch: repeat unit " + got + " vs monomer " + pc.formula + " (" + derived.mechanism + ")" });
      continue;
    }

    const h = closedHash(derived.atoms, derived.bonds);
    if (h == null) { rejected.push({ name: entry.name, why: "repeat unit would not close - malformed chain ends" }); continue; }
    const key = h + "|" + (entry.tacticity || "-");
    if (taken.has(key)) {
      rejected.push({ name: entry.name, why: "same repeat unit as " + JSON.stringify(taken.get(key)) + " already in the library" });
      continue;
    }
    taken.set(key, entry.name);

    accepted.push({ entry: entry, atoms: derived.atoms, bonds: derived.bonds, mechanism: derived.mechanism,
                    formula: got, cid: pc.cid, smiles: pc.smiles, query: q.name });
    console.log("  OK   " + entry.name.padEnd(44) + got.padEnd(12) + derived.mechanism);
  }

  console.log("");
  console.log("accepted:  " + accepted.length);
  console.log("rejected:  " + rejected.length + "  (looked up, failed a check)");
  console.log("skipped:   " + skipped.length + "  (no automatable route)");

  if (rejected.length) {
    console.log("\n--- rejected ---");
    rejected.forEach(function (r) { console.log("  " + r.name.padEnd(44) + r.why); });
  }
  const skipCounts = {};
  skipped.forEach(function (s) {
    const k = /needs a hand-drawn pair/.test(s.why) ? "names more than one monomer"
            : /No recognized single-monomer/.test(s.why) ? "no automatable mechanism"
            : s.why.slice(0, 44);
    skipCounts[k] = (skipCounts[k] || 0) + 1;
  });
  console.log("\n--- skipped, by reason ---");
  Object.entries(skipCounts).sort(function (a, b) { return b[1] - a[1]; })
    .forEach(function (e) { console.log("  " + String(e[1]).padStart(4) + "  " + e[0]); });

  fs.writeFileSync(path.join(ROOT, "backfill-report.json"),
    JSON.stringify({ accepted: accepted.map(function (a) {
      return { name: a.entry.name, monomer: a.query, cid: a.cid, smiles: a.smiles,
               formula: a.formula, mechanism: a.mechanism, atoms: a.atoms, bonds: a.bonds };
    }), rejected: rejected, skipped: skipped }, null, 1) + "\n");
  console.log("\nwrote backfill-report.json");

  if (!WRITE) { console.log("(dry run - pass --write to splice these into polymer-data.js)"); return; }
  writeInto(accepted);
}

// Splice atoms/bonds into each accepted entry in place, keeping everything
// else about it untouched. Matched on the entry's own `name:` line so the
// edit lands on exactly one entry.
function writeInto(accepted) {
  let src = fs.readFileSync(DATA_FILE, "utf8");
  const nl = src.indexOf("\r\n") !== -1 ? "\r\n" : "\n";
  let done = 0;
  accepted.forEach(function (a) {
    const marker = "name: " + JSON.stringify(a.entry.name) + ",";
    const at = src.indexOf(marker);
    if (at === -1) { console.error("  ! could not locate " + a.entry.name); return; }
    const end = src.indexOf(nl + "  },", at);
    let body = src.slice(at, end);
    if (!/atoms: \[\], bonds: \[\],/.test(body)) { console.error("  ! unexpected shape for " + a.entry.name); return; }
    body = body
      .replace("    atoms: [], bonds: [],", "    atoms: " + serializeAtoms(a.atoms) + "," + nl + "    bonds: " + serializeBonds(a.bonds) + ",")
      .replace("    needsStructure: true," + nl, "")
      .replace("    // NEEDS STRUCTURE - metadata only, draw the repeat unit by hand in the structure editor" + nl, "");
    src = src.slice(0, at) + body + src.slice(end);
    done++;
  });
  fs.writeFileSync(DATA_FILE, src);
  console.log("\nspliced " + done + " structures into polymer-data.js");
}

main().catch(function (e) { console.error(e); process.exit(1); });
