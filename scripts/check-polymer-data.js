// CI data-integrity check for polymer-data.js.
//
// Runs on every PR that touches polymer-data.js (both human-authored and
// automated-discovery PRs) and fails the build if an entry is malformed in
// a way that would silently break search or slip bad chemistry into the
// reference database. This is a structural/heuristic check, not a full
// valence engine - it is deliberately generous about edge cases (expanded
// octets, formal charges) so it only fails on genuine mistakes.

"use strict";

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "polymer-data.js");

function loadDb() {
  const code = fs.readFileSync(DATA_FILE, "utf8");
  const fn = new Function("window", code + "\nreturn window.POLYMER_DB;");
  return fn({});
}

// WL-hash now comes from the shared, DOM-free polymer-graph.js module (the
// same code the browser and the search-index build use) instead of a copy
// kept in sync here by hand.
const { wlHash, closedHash } = require("../polymer-graph.js");

// Generous max valence per element (bond-order sum), with slack for formal
// charge. Purpose is to catch obvious mistakes (typo'd bonds, duplicate
// entries), not to referee real edge-case chemistry, so this errs high.
const MAX_VALENCE = {
  H: 1, C: 4, N: 3, O: 2, F: 1, Cl: 1, Br: 1, I: 1,
  S: 6, P: 5, Si: 4, B: 3, Sn: 4
};

const VALID_CLASSES = new Set([
  "Addition (vinyl)", "Addition (acrylate)", "Addition (methacrylate)",
  "Addition (diene)", "Ring-opening", "Ring-opening (silicone)",
  "Ring-opening (polyamide)", "Step-growth (polyamide)", "Step-growth (polyester)"
]);

// --- CAS sanity -----------------------------------------------------------
// The "cas" field must be the CAS RN of the POLYMER, never of the monomer it
// is made from. Twenty-seven auto-generated entries once carried the monomer's
// number instead - poly(caprolactone) had 502-44-3, epsilon-caprolactone,
// rather than 24980-41-4, "2-Oxepanone, homopolymer" - which is a quiet but
// serious error on a page people copy CAS numbers out of. Two independent
// guards below, because either one alone has a blind spot.

// Guard 1: the exact monomer numbers that were previously mis-filed here, each
// confirmed against EPA's Substance Registry Services as a discrete small
// molecule (a bare molecular formula, no "homopolymer" in the CAS index name).
// scripts/discover-polymers.js seeds new entries from monomer data, so these
// are the values most likely to come back.
const KNOWN_MONOMER_CAS = {
  "141-32-2": "n-butyl acrylate", "103-11-7": "2-ethylhexyl acrylate",
  "1663-39-4": "tert-butyl acrylate", "97-88-1": "n-butyl methacrylate",
  "585-07-9": "tert-butyl methacrylate", "2495-37-6": "benzyl methacrylate",
  "106-91-2": "glycidyl methacrylate", "2867-47-2": "2-(dimethylamino)ethyl methacrylate",
  "98-83-9": "alpha-methylstyrene", "622-97-9": "4-methylstyrene",
  "1746-23-2": "4-tert-butylstyrene", "79-38-9": "chlorotrifluoroethylene",
  "2235-00-9": "N-vinylcaprolactam", "105-38-4": "vinyl propionate",
  "107-25-5": "methyl vinyl ether", "109-92-2": "ethyl vinyl ether",
  "13162-05-5": "N-vinylformamide", "513-81-5": "2,3-dimethyl-1,3-butadiene",
  "502-44-3": "epsilon-caprolactone", "502-97-6": "glycolide",
  "95-96-5": "lactide", "542-28-9": "delta-valerolactone",
  "57-57-8": "beta-propiolactone", "2453-03-4": "trimethylene carbonate",
  "106-89-8": "epichlorohydrin", "106-88-7": "1,2-butylene oxide",
  "96-09-3": "styrene oxide",
  // Monomers of entries that were already correct, listed so a future
  // regression on those is caught too.
  "100-42-5": "styrene", "80-62-6": "methyl methacrylate", "74-85-1": "ethylene",
  "115-07-1": "propylene", "75-01-4": "vinyl chloride", "107-13-1": "acrylonitrile",
  "108-05-4": "vinyl acetate", "79-06-1": "acrylamide", "79-10-7": "acrylic acid",
  "88-12-0": "N-vinylpyrrolidone", "126-99-8": "chloroprene", "78-79-5": "isoprene",
  "106-99-0": "1,3-butadiene", "75-21-8": "ethylene oxide", "75-56-9": "propylene oxide",
  "96-33-3": "methyl acrylate", "140-88-5": "ethyl acrylate", "97-63-2": "ethyl methacrylate",
};

// Guard 2: structural. CAS put polymers and other substances of indefinite
// composition in the 9000-9099 block, and everything registered from 1965 on
// is 24000-00-0 or higher, which is where the post-1965 polymers land
// (24980-41-4, 26680-10-4, ...). The gap between, 9100-23999, is early-registry
// small molecules. So a polymer RN outside {9000-9099} U {>=24000} is almost
// certainly a monomer. This catches monomers the table above does not list,
// including ones numbered above 9000 such as N-vinylformamide's 13162-05-5,
// which a naive "monomers are low numbers" rule would wave through.
function casLooksLikeMonomer(cas) {
  const first = parseInt(String(cas).split("-")[0], 10);
  if (!isFinite(first)) return false;
  if (first >= 9000 && first <= 9099) return false; // classic polymer block
  if (first >= 24000) return false;                 // modern registry
  return true;
}

function checkEntry(entry, idx, errors) {
  const where = "entry #" + idx + (entry && entry.name ? " (" + entry.name + ")" : "");

  if (!entry || typeof entry !== "object") {
    errors.push(where + ": not an object");
    return;
  }
  if (typeof entry.name !== "string" || !entry.name.trim()) {
    errors.push(where + ": missing or empty \"name\"");
  }
  if (entry.aka !== undefined && !Array.isArray(entry.aka)) {
    errors.push(where + ": \"aka\" must be an array if present");
  }
  if (entry.tags !== undefined && !Array.isArray(entry.tags)) {
    errors.push(where + ": \"tags\" must be an array if present");
  }
  // Copolymer entries have no single repeat unit: they carry a components list
  // of library homopolymer names instead of atoms/bonds. Validate the list and
  // skip the structure/class checks (referential integrity is checked in main).
  if (entry.type === "copolymer") {
    if (!Array.isArray(entry.components) || entry.components.length < 2) {
      errors.push(where + ": copolymer must list 2 or more \"components\"");
    }
    return;
  }
  if (entry.cls !== undefined && !VALID_CLASSES.has(entry.cls)) {
    errors.push(where + ": unrecognized \"cls\" value \"" + entry.cls + "\"");
  }
  if (!Array.isArray(entry.atoms) || !Array.isArray(entry.bonds)) {
    errors.push(where + ": \"atoms\" and \"bonds\" must both be arrays");
    return;
  }

  if (entry.needsStructure) {
    if (entry.atoms.length || entry.bonds.length) {
      errors.push(where + ": flagged needsStructure but already has atoms/bonds - remove the flag or clear the structure");
    }
    return; // metadata-only placeholder, nothing more to validate
  }

  if (entry.atoms.length === 0) {
    errors.push(where + ": no atoms (add a structure, or mark needsStructure: true)");
    return;
  }

  const ids = new Set();
  let s0 = 0, s1 = 0, otherStar = 0;
  entry.atoms.forEach(function (a, i) {
    const awhere = where + ", atom #" + i;
    if (a.id === undefined || a.id === null) errors.push(awhere + ": missing id");
    if (!a.el || typeof a.el !== "string") errors.push(awhere + ": missing element");
    if (ids.has(a.id)) errors.push(awhere + ": duplicate atom id \"" + a.id + "\"");
    ids.add(a.id);
    if (a.id === "S0") { s0++; if (a.el !== "*") errors.push(awhere + ": S0 must have el \"*\""); }
    else if (a.id === "S1") { s1++; if (a.el !== "*") errors.push(awhere + ": S1 must have el \"*\""); }
    else if (a.el === "*") otherStar++;
  });
  if (s0 !== 1 || s1 !== 1) {
    errors.push(where + ": must have exactly one S0 and one S1 open-chain-end pseudo-atom (found S0x" + s0 + ", S1x" + s1 + ")");
  }
  if (otherStar > 0) {
    errors.push(where + ": found " + otherStar + " extra \"*\" atom(s) outside S0/S1");
  }

  const valence = {};
  entry.atoms.forEach(function (a) { valence[a.id] = 0; });
  const endpointBondCount = { S0: 0, S1: 0 };
  entry.bonds.forEach(function (b, i) {
    const bwhere = where + ", bond #" + i;
    if (!ids.has(b.a) || !ids.has(b.b)) {
      errors.push(bwhere + ": references an atom id not in this entry's atoms (" + b.a + " - " + b.b + ")");
      return;
    }
    if (b.a === b.b) errors.push(bwhere + ": self-bond on atom \"" + b.a + "\"");
    if (![1, 2, 3].includes(b.order)) errors.push(bwhere + ": bond order must be 1, 2, or 3 (got " + b.order + ")");
    valence[b.a] = (valence[b.a] || 0) + (b.order || 0);
    valence[b.b] = (valence[b.b] || 0) + (b.order || 0);
    if (b.a === "S0" || b.a === "S1") endpointBondCount[b.a]++;
    if (b.b === "S0" || b.b === "S1") endpointBondCount[b.b]++;
  });
  if (endpointBondCount.S0 !== 1) errors.push(where + ": S0 must connect via exactly one bond (found " + endpointBondCount.S0 + ")");
  if (endpointBondCount.S1 !== 1) errors.push(where + ": S1 must connect via exactly one bond (found " + endpointBondCount.S1 + ")");

  entry.atoms.forEach(function (a) {
    if (a.el === "*") return;
    const max = MAX_VALENCE[a.el];
    if (max === undefined) return; // unrecognized/exotic element - not our call to referee
    const slack = Math.abs(a.charge || 0);
    if ((valence[a.id] || 0) > max + slack) {
      errors.push(where + ": atom \"" + a.id + "\" (" + a.el + ") has bond-order sum " + valence[a.id] + ", exceeds max valence " + max + (slack ? " + charge slack " + slack : ""));
    }
  });
}

function main() {
  let db;
  try {
    db = loadDb();
  } catch (e) {
    console.error("Failed to load polymer-data.js:", e.message);
    process.exit(1);
  }
  if (!Array.isArray(db)) {
    console.error("polymer-data.js did not export an array via window.POLYMER_DB");
    process.exit(1);
  }

  const errors = [];
  const namesSeen = new Map();
  const casSeen = new Map();
  const hashSeen = new Map();
  const chashSeen = new Map();

  db.forEach(function (entry, idx) {
    checkEntry(entry, idx, errors);

    if (entry && typeof entry.name === "string" && entry.name.trim()) {
      const key = entry.name.trim().toLowerCase();
      if (namesSeen.has(key)) {
        errors.push("entry #" + idx + " (" + entry.name + "): duplicate name, already used by entry #" + namesSeen.get(key));
      } else {
        namesSeen.set(key, idx);
      }
    }

    if (entry && entry.cas && typeof entry.cas === "string") {
      const key = entry.cas.trim().toLowerCase();
      if (key && key !== "n/a" && key !== "not assigned") {
        if (KNOWN_MONOMER_CAS[key]) {
          errors.push("entry #" + idx + " (" + entry.name + "): \"cas\" " + entry.cas +
            " is the CAS number of " + KNOWN_MONOMER_CAS[key] + ", the monomer - " +
            "this field must hold the POLYMER registry number (set it to null if none can be substantiated)");
        } else if (casLooksLikeMonomer(key)) {
          errors.push("entry #" + idx + " (" + entry.name + "): \"cas\" " + entry.cas +
            " is outside the ranges CAS uses for polymers (9000-9099, or 24000-00-0 and up), " +
            "so it looks like a monomer number - verify it names the polymer, not the monomer");
        }
        if (casSeen.has(key)) {
          errors.push("entry #" + idx + " (" + entry.name + "): duplicate CAS \"" + entry.cas + "\", already used by entry #" + casSeen.get(key));
        } else {
          casSeen.set(key, idx);
        }
      }
    }

    if (entry && !entry.needsStructure && Array.isArray(entry.atoms) && entry.atoms.length && Array.isArray(entry.bonds)) {
      const h = wlHash(entry.atoms, entry.bonds);
      if (hashSeen.has(h)) {
        errors.push("entry #" + idx + " (" + entry.name + "): structure is identical (WL-hash match) to entry #" + hashSeen.get(h) + " - same repeat unit listed twice");
      } else {
        hashSeen.set(h, idx);
      }
      // The framing-invariant key must also be unique: a collision here means
      // two entries are the same polymer cut at different points, which the
      // open hash above cannot see.
      const ch = closedHash(entry.atoms, entry.bonds);
      if (ch == null) {
        errors.push("entry #" + idx + " (" + entry.name + "): repeat unit could not be closed (closedHash returned null) - malformed chain ends");
      } else if (chashSeen.has(ch)) {
        errors.push("entry #" + idx + " (" + entry.name + "): same polymer as entry #" + chashSeen.get(ch) + " cut at a different point (closed-graph hash match)");
      } else {
        chashSeen.set(ch, idx);
      }
    }
  });

  // Referential integrity: every copolymer component must name a real entry.
  db.forEach(function (entry, idx) {
    if (entry && entry.type === "copolymer" && Array.isArray(entry.components)) {
      entry.components.forEach(function (c) {
        if (!namesSeen.has(String(c).trim().toLowerCase())) {
          errors.push("entry #" + idx + " (" + entry.name + "): component \"" + c + "\" is not a library polymer name");
        }
      });
    }
  });

  // Tag consistency. The Explore filter narrows (every selected tag must
  // apply), so a tag applied to only some of the entries that qualify reads as
  // "the library only has these two" rather than "the tagging is incomplete".
  // "methacrylate" was on 2 of 11 methacrylates before this check existed.
  // "methacrylate" means "this polymer IS a methacrylate", so it is a rule about
  // homopolymers only. A block copolymer whose NAME contains "methacrylate"
  // (Polystyrene-b-poly(methyl methacrylate)) has a methacrylate block, which is
  // a different claim, and forcing the tag on it would silently redefine it.
  const TAG_RULES = [
    { tag: "methacrylate", homopolymerOnly: true, when: function (e) { return /methacrylate/i.test(e.name || ""); } },
    { tag: "block", when: function (e) { return e.arch === "block"; } }
  ];
  db.forEach(function (entry, idx) {
    if (!entry || !entry.name) return;
    const tags = entry.tags || [];
    TAG_RULES.forEach(function (rule) {
      if (rule.homopolymerOnly && entry.type === "copolymer") return;
      const qualifies = rule.when(entry);
      if (qualifies && tags.indexOf(rule.tag) === -1) {
        errors.push("entry #" + idx + " (" + entry.name + "): qualifies for the \"" + rule.tag + "\" tag but does not carry it");
      }
      if (!qualifies && tags.indexOf(rule.tag) !== -1) {
        errors.push("entry #" + idx + " (" + entry.name + "): carries the \"" + rule.tag + "\" tag but does not qualify");
      }
    });
  });

  if (errors.length) {
    console.error("polymer-data.js failed integrity check (" + errors.length + " issue" + (errors.length === 1 ? "" : "s") + "):\n");
    errors.forEach(function (e) { console.error("  - " + e); });
    process.exit(1);
  }

  console.log("polymer-data.js OK - " + db.length + " entries, no integrity issues found.");
}

main();
