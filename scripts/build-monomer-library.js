// Build monomer-data.js from polymer-data.js.
//
// The monomer library is DERIVED, never typed. Every structure in it came out
// of a polymer repeat unit through polymer-graph.js deriveMonomer, which only
// returns a monomer it could put back together into the polymer it came from.
// So a monomer entry cannot disagree with the polymer that produced it: there
// is one source of truth and this file is a projection of it.
//
// The names come from the library too. Each polymer already records what it is
// made from in its `monomer` field - "ethylene glycol + terephthalic acid" -
// and those are the names used. Nothing here is invented; where no name can be
// matched with confidence the monomer is emitted unnamed rather than guessed at.
//
// Matching a name to a part is the one real problem. A condensation returns two
// molecules in whatever order the graph traversal found them, and the prose
// lists them in whatever order someone wrote them. Assigning by position gets
// it wrong often enough to matter: poly(ethylene 2,5-furandicarboxylate) had
// one structure answering to both "ethylene glycol" and "2,5-furandicarboxylic
// acid", and MDI-butanediol did the same. So both sides are classified by
// functional group and matched on that.
//
//   node scripts/build-monomer-library.js           write monomer-data.js
//   node scripts/build-monomer-library.js --check   fail if it is out of date

"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "monomer-data.js");
const PG = require(path.join(ROOT, "polymer-graph.js"));

const MASS = { C: 12.011, H: 1.008, O: 15.999, N: 14.007, S: 32.06, Si: 28.085,
               F: 18.998, Cl: 35.45, Br: 79.904, I: 126.904, P: 30.974, B: 10.81, Sn: 118.71 };
// Normal valence, used for implicit hydrogens. Sulfur is 2 here, not its
// maximum of 6: a thioether carries no hydrogens it has not earned, and using
// the maximum handed four of them to every -S- in the set.
const NORMAL = { C: 4, N: 3, O: 2, S: 2, Si: 4, P: 5, F: 1, Cl: 1, Br: 1, I: 1, B: 3, Sn: 4 };

function loadDb() {
  const code = fs.readFileSync(path.join(ROOT, "polymer-data.js"), "utf8");
  return new Function("window", code + "\nreturn window.POLYMER_DB;")({});
}

function formulaOf(atoms, bonds) {
  const used = new Map();
  atoms.forEach(a => used.set(a.id, 0));
  bonds.forEach(b => {
    used.set(b.a, (used.get(b.a) || 0) + b.order);
    used.set(b.b, (used.get(b.b) || 0) + b.order);
  });
  const counts = {};
  let h = 0;
  atoms.forEach(a => {
    if (a.el === "*") return;
    counts[a.el] = (counts[a.el] || 0) + 1;
    const n = NORMAL[a.el];
    if (n !== undefined) h += Math.max(0, n + (a.charge || 0) - used.get(a.id));
  });
  if (h) counts.H = h;
  let mass = 0;
  Object.keys(counts).forEach(k => { mass += (MASS[k] || 0) * counts[k]; });
  const order = ["C", "H", "B", "Br", "Cl", "F", "I", "N", "O", "P", "S", "Si", "Sn"];
  const rest = Object.keys(counts).filter(k => order.indexOf(k) === -1).sort();
  const seq = order.filter(k => counts[k]).concat(rest);
  return {
    formula: seq.map(k => k + (counts[k] > 1 ? counts[k] : "")).join(""),
    mass: Math.round(mass * 100) / 100
  };
}

// --- functional-group classification -------------------------------------
// Deliberately coarse. It exists to tell a diol from a diacid from a
// diisocyanate so a name can be attached to the right half of a pair, not to
// be a naming system in its own right.
function classify(atoms, bonds) {
  const by = {}, adj = {};
  atoms.forEach(a => { by[a.id] = a.el; adj[a.id] = []; });
  bonds.forEach(b => { if (adj[b.a] && adj[b.b]) { adj[b.a].push(b); adj[b.b].push(b); } });
  const other = (b, id) => (b.a === id ? b.b : b.a);
  let acid = 0, isocyanate = 0, amine = 0, alcohol = 0, alkene = 0, alkyne = 0, epoxide = 0, thiol = 0;
  atoms.forEach(a => {
    const nb = adj[a.id] || [];
    if (a.el === "C") {
      const dblO = nb.filter(b => b.order === 2 && by[other(b, a.id)] === "O");
      const dblN = nb.filter(b => b.order === 2 && by[other(b, a.id)] === "N");
      if (dblO.length && dblN.length) isocyanate++;
      else if (dblO.length) {
        // -OH on the same carbon makes it a carboxylic acid
        const oh = nb.filter(b => b.order === 1 && by[other(b, a.id)] === "O" && adj[other(b, a.id)].length === 1);
        if (oh.length) acid++;
      }
      if (nb.some(b => b.order === 2 && by[other(b, a.id)] === "C")) alkene++;
      if (nb.some(b => b.order === 3 && by[other(b, a.id)] === "C")) alkyne++;
    }
    if (a.el === "N" && nb.length === 1 && nb[0].order === 1) amine++;
    if (a.el === "S" && nb.length === 1 && nb[0].order === 1) thiol++;
    if (a.el === "O" && nb.length === 1 && nb[0].order === 1) {
      const c = other(nb[0], a.id);
      if (!(adj[c] || []).some(b => b.order === 2 && by[other(b, c)] === "O")) alcohol++;
    }
    if (a.el === "O" && nb.length === 2 && PG.inSameRing(atoms, bonds, nb[0]) && PG.inSameRing(atoms, bonds, nb[1])) {
      // three-membered ring containing oxygen
      const c1 = other(nb[0], a.id), c2 = other(nb[1], a.id);
      if ((adj[c1] || []).some(b => other(b, c1) === c2)) epoxide++;
    }
  });
  return { acid, isocyanate, amine, alcohol, alkene, alkyne, epoxide, thiol };
}
function roleOf(c) {
  if (c.isocyanate) return c.isocyanate > 1 ? "diisocyanate" : "isocyanate";
  if (c.acid && c.alcohol) return "hydroxy acid";
  if (c.acid && c.amine) return "amino acid";
  if (c.acid) return c.acid > 1 ? "diacid" : "acid";
  if (c.amine) return c.amine > 1 ? "diamine" : "amine";
  if (c.epoxide) return "epoxide";
  if (c.thiol) return c.thiol > 1 ? "dithiol" : "thiol";
  if (c.alcohol) return c.alcohol > 1 ? "diol" : "alcohol";
  if (c.alkyne) return "alkyne";
  if (c.alkene) return "alkene";
  return "other";
}
// What a written name claims to be, by the words in it.
function roleOfName(s) {
  const n = " " + String(s).toLowerCase() + " ";
  if (/isocyanate/.test(n)) return "isocyanate";
  // an acid chloride or anhydride reverses to the acid, so it counts as one
  if (/acid|chloride|anhydride|carboxyl/.test(n)) return "acid";
  if (/amine|diamin/.test(n)) return "amine";
  if (/glycol|diol|inositol|glycerol|pentaerythritol|[a-z]ol\b/.test(n)) return "alcohol";
  if (/thiol|mercapt/.test(n)) return "thiol";
  if (/oxide|oxirane|epoxide|glycidyl/.test(n)) return "epoxide";
  return "other";
}
// Reduce the structural role to the same vocabulary a name can express.
function coarse(role) {
  if (role === "diisocyanate" || role === "isocyanate") return "isocyanate";
  if (role === "diacid" || role === "acid") return "acid";
  if (role === "diamine" || role === "amine") return "amine";
  if (role === "diol" || role === "alcohol") return "alcohol";
  if (role === "dithiol" || role === "thiol") return "thiol";
  if (role === "epoxide") return "epoxide";
  return "other";
}

// --- names ----------------------------------------------------------------
function splitField(s) {
  return String(s || "").split(/\s+\+\s+/).map(x => x.trim()).filter(Boolean);
}
// Strip the process notes the polymer's monomer field carries. "ethylene oxide
// grown on pentaerythritol" is a route, not a compound, and the compound is
// what belongs in a monomer library.
const PROCESS = /\s*(\(|,\s)(grown on|from |via |by |usually|with |then |ring-opening|coordination|stereospecific|metallocene|non-stereospecific|free-radical|trans-|cis-|radiation|chemically|catalys|high pressure|peroxide|silane)[^)]*\)?\s*$/i;
function cleanName(s) {
  let n = String(s).trim();
  for (let i = 0; i < 3; i++) {
    const next = n.replace(PROCESS, "").trim().replace(/[,;]$/, "");
    if (next === n) break;
    n = next;
  }
  // a leading capital on a common noun is an artefact of the prose field
  if (/^[A-Z][a-z]/.test(n) && !/^[A-Z]{2,}/.test(n)) n = n[0].toLowerCase() + n.slice(1);
  return n;
}
function nameLooksUsable(n) {
  if (!n || n.length < 2 || n.length > 60) return false;
  if (/\bor\b|\band\b|macromonomer|derivative|hydrolysis|crosslinked/i.test(n)) return false;
  return true;
}

// --- build ----------------------------------------------------------------
function build() {
  const db = loadDb();
  const uniq = new Map();   // hash -> record

  db.forEach(p => {
    if (!p || !Array.isArray(p.atoms) || !p.atoms.length || p.noScheme) return;
    let m = null;
    try { m = PG.deriveMonomer(p.atoms, p.bonds, p.cls); } catch (e) { return; }
    if (!m) return;
    const parts = (m.parts && m.parts.length) ? m.parts : [{ atoms: m.atoms, bonds: m.bonds }];
    const names = splitField(p.monomer);

    // Match names to parts by functional group. Position is not reliable.
    let assign = parts.map(() => null);
    if (names.length === parts.length) {
      if (parts.length === 1) {
        assign = [names[0]];
      } else {
        const partRoles = parts.map(pt => coarse(roleOf(classify(pt.atoms, pt.bonds))));
        const nameRoles = names.map(roleOfName);
        // try every one-to-one assignment; accept only if exactly one fits
        const perms = permutations(names.length);
        const fits = perms.filter(perm => perm.every((ni, pi) =>
          partRoles[pi] === "other" || nameRoles[ni] === "other" || partRoles[pi] === nameRoles[ni]));
        // prefer assignments where every pair agrees on a real (non-other) role
        const strict = fits.filter(perm => perm.every((ni, pi) =>
          partRoles[pi] !== "other" && nameRoles[ni] !== "other" && partRoles[pi] === nameRoles[ni]));
        const chosen = strict.length === 1 ? strict[0] : (fits.length === 1 ? fits[0] : null);
        if (chosen) assign = chosen.map(ni => names[ni]);
      }
    }

    parts.forEach((pt, i) => {
      // Deduplicate Kekule-blind: the same aromatic compound drawn with the
      // alternation started at a different bond is one monomer, not two. It
      // was two - poly(ethylene naphthalate) and poly(butylene naphthalate)
      // each contributed their own 2,6-naphthalenedicarboxylic acid.
      const h = PG.aromaticBlindHash(pt.atoms, pt.bonds);
      if (!uniq.has(h)) {
        const f = formulaOf(pt.atoms, pt.bonds);
        uniq.set(h, {
          hash: h, atoms: pt.atoms, bonds: pt.bonds,
          formula: f.formula, mass: f.mass,
          role: roleOf(classify(pt.atoms, pt.bonds)),
          kinds: new Set(), names: new Map(), polymers: []
        });
      }
      const rec = uniq.get(h);
      rec.kinds.add(m.kind);
      rec.polymers.push(p.name);
      const raw = assign[i];
      if (raw) {
        const c = cleanName(raw);
        if (nameLooksUsable(c)) rec.names.set(c, (rec.names.get(c) || 0) + 1);
      }
    });
  });

  // Canonical name: the one the most polymers agree on, shortest as tiebreak.
  const out = [];
  uniq.forEach(rec => {
    const ranked = [...rec.names.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length);
    out.push({
      name: ranked.length ? ranked[0][0] : null,
      aka: ranked.slice(1).map(x => x[0]),
      formula: rec.formula, mass: rec.mass,
      role: rec.role,
      kind: [...rec.kinds].sort().join("/"),
      polymers: rec.polymers.slice().sort(),
      atoms: rec.atoms, bonds: rec.bonds
    });
  });
  out.sort((a, b) => (b.polymers.length - a.polymers.length) || String(a.name).localeCompare(String(b.name)));
  return out;
}

function permutations(n) {
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(i);
  const res = [];
  (function rec(cur, left) {
    if (!left.length) { res.push(cur.slice()); return; }
    for (let i = 0; i < left.length; i++) {
      rec(cur.concat(left[i]), left.slice(0, i).concat(left.slice(i + 1)));
    }
  })([], idx);
  return res;
}

function render(list) {
  const q = s => JSON.stringify(s);
  const body = list.map(m => {
    return "  {\n" +
      "    name: " + q(m.name) + ", aka: " + JSON.stringify(m.aka) + ",\n" +
      "    formula: " + q(m.formula) + ", mass: " + m.mass + ", role: " + q(m.role) + ", kind: " + q(m.kind) + ",\n" +
      "    polymers: " + JSON.stringify(m.polymers) + ",\n" +
      "    atoms: " + JSON.stringify(m.atoms) + ",\n" +
      "    bonds: " + JSON.stringify(m.bonds) + "\n" +
      "  }";
  }).join(",\n");
  return "// GENERATED by scripts/build-monomer-library.js - do not edit by hand.\n" +
    "//\n" +
    "// Every structure here was derived from a polymer repeat unit in\n" +
    "// polymer-data.js and verified by rebuilding that polymer from it, so a\n" +
    "// monomer cannot disagree with the polymer it came from. The names come from\n" +
    "// each polymer's own `monomer` field, matched to the right half of a pair by\n" +
    "// functional group rather than by the order they happen to be written in.\n" +
    "// A monomer with name: null is one no polymer named unambiguously.\n" +
    "window.MONOMER_DB = [\n" + body + "\n];\n";
}

function main() {
  const list = build();
  const text = render(list);
  const check = process.argv.indexOf("--check") !== -1;
  const named = list.filter(m => m.name).length;
  const summary = list.length + " monomers, " + named + " named, " + (list.length - named) + " unnamed";
  if (check) {
    let current = null;
    try { current = fs.readFileSync(OUT, "utf8"); } catch (e) {}
    if (current !== text) {
      console.error("monomer-data.js is out of date - run: node scripts/build-monomer-library.js");
      process.exit(1);
    }
    console.log("monomer-data.js is up to date (" + summary + ").");
    return;
  }
  fs.writeFileSync(OUT, text);
  console.log("Wrote monomer-data.js: " + summary + ".");
  const byRole = {};
  list.forEach(m => { byRole[m.role] = (byRole[m.role] || 0) + 1; });
  console.log("  " + Object.entries(byRole).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => k + " " + v).join(", "));
}
main();
