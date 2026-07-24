#!/usr/bin/env node
"use strict";

// Build-time search index for the polymer library.
//
// The runtime (polymer-search.js) currently recomputes a WL hash and element
// profile for every entry on page load, and scans the raw array for name
// matches. That is fine for ~60 entries; it does not scale to thousands. This
// script moves that work to build time and emits a static search-index.json:
//
//   - fingerprints: WL hash + element profile per entry, keyed by name, so a
//     structure search is a hash lookup instead of N graph hashings per load.
//   - nameTokens:  an inverted index (token -> entry indices) over name, aka,
//     monomer, cas and tags, so a name search is a token lookup instead of a
//     substring scan of every field.
//
// It ships as a plain JSON file served from the CDN like any other asset, so
// name and structure search scale with the library without a search server.
// Nothing here runs in the browser; it runs in CI and the output is committed.

const fs = require("fs");
const path = require("path");
const PolymerGraph = require("../polymer-graph.js");

const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "polymer-data.js");
const OUT_FILE = path.join(ROOT, "search-index.json");

function loadDb() {
  const code = fs.readFileSync(DATA_FILE, "utf8");
  const fn = new Function("window", code + "\nreturn window.POLYMER_DB;");
  const db = fn({});
  if (!Array.isArray(db)) throw new Error("polymer-data.js did not export an array via window.POLYMER_DB");
  return db;
}

// Same tokenization the index and a future query path would share: lowercase,
// split on any run of non-alphanumeric characters, drop empties. Kept trivial
// on purpose so the browser can reproduce it exactly for lookups.
function tokenize(str) {
  return String(str || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function build(db) {
  const fingerprints = {};
  const nameTokens = {};

  db.forEach(function (entry, idx) {
    // structure fingerprint, keyed by name so it survives reordering of the DB.
    // chash is the framing-invariant key (closed-graph hash); hash stays as
    // the open-graph fallback for malformed queries.
    fingerprints[entry.name] = {
      hash: PolymerGraph.wlHash(entry.atoms, entry.bonds),
      chash: PolymerGraph.closedHash(entry.atoms, entry.bonds),
      profile: PolymerGraph.elementProfile(entry.atoms),
      bondCount: entry.bonds.length
    };

    // name/text tokens -> entry indices
    const fields = []
      .concat(entry.name || [])
      .concat(entry.aka || [])
      .concat(entry.monomer || [])
      .concat(entry.cas || [])
      .concat(entry.tags || []);
    const seen = {};
    fields.forEach(function (f) {
      tokenize(f).forEach(function (tok) {
        if (seen[tok]) return;
        seen[tok] = 1;
        (nameTokens[tok] || (nameTokens[tok] = [])).push(idx);
      });
    });
  });

  return {
    version: 1,
    builtAt: new Date().toISOString().slice(0, 10),
    entryCount: db.length,
    names: db.map(function (e) { return e.name; }),
    fingerprints: fingerprints,
    nameTokens: nameTokens
  };
}

function main() {
  const db = loadDb();
  const index = build(db);
  const json = JSON.stringify(index, null, 0) + "\n";

  // --check mode: fail (non-zero exit) if the committed index is stale, so CI
  // can enforce that search-index.json was regenerated after a data change.
  if (process.argv.indexOf("--check") !== -1) {
    const current = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : "";
    if (current !== json) {
      console.error("search-index.json is out of date. Run: npm run build-index");
      process.exit(1);
    }
    console.log("search-index.json is up to date (" + index.entryCount + " entries).");
    return;
  }

  fs.writeFileSync(OUT_FILE, json, "utf8");
  console.log("Wrote " + path.relative(ROOT, OUT_FILE) + ": " + index.entryCount +
    " entries, " + Object.keys(index.nameTokens).length + " tokens.");
}

main();
