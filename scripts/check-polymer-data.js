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

  if (errors.length) {
    console.error("polymer-data.js failed integrity check (" + errors.length + " issue" + (errors.length === 1 ? "" : "s") + "):\n");
    errors.forEach(function (e) { console.error("  - " + e); });
    process.exit(1);
  }

  console.log("polymer-data.js OK - " + db.length + " entries, no integrity issues found.");
}

main();
