// CI data-integrity check for chain-data.js.
//
// The valuable check here is not shape, it is the CROSS-CHECK: for a simple
// aliphatic backbone the characteristic ratio predicts the persistence length
// geometrically, so a C_inf and a measured lp that disagree by more than a
// modest factor mean one of the two is wrong. That is a real error the eye does
// not catch, because both numbers look perfectly reasonable on their own.
//
// The same arithmetic is what tells you where the route does NOT apply.
// Bisphenol-A polycarbonate has C_inf 2.4, which the formula turns into 0.22 nm
// against a measured 1.0 nm - not because either number is wrong, but because
// the ratio is defined per backbone bond and a polycarbonate repeat is not the
// tetrahedral C-C the geometry assumes. Those entries carry geom.simple = false
// and are exempt.

"use strict";

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "chain-data.js");

function loadData() {
  const code = fs.readFileSync(DATA_FILE, "utf8");
  return new Function("window", code + "\nreturn window.CHAIN_DATA;")({});
}

const VALID_CLS = new Set(["flexible", "semiflexible", "rigid", "aromatic"]);
const VALID_CONF = new Set(["high", "medium", "low"]);

// Bounds are wide on purpose: this library legitimately spans polyethylene at
// 0.35 nm to an actin filament at 17 micrometres.
const LP_MIN = 0.1, LP_MAX = 1e7;          // nm
const PREDICTION_TOLERANCE = 1.5;           // factor, either direction

function isNum(v) { return typeof v === "number" && isFinite(v); }
function present(v) { return v !== null && v !== undefined; }

// b = C_inf * l / cos(theta/2), theta = 180 - backbone angle; lp = b/2.
function predictLp(cInf, geom) {
  const theta = 180 - geom.angle;
  const b = cInf * geom.bond / Math.cos((theta / 2) * Math.PI / 180);
  return b / 2;
}

function checkEntry(e, idx, errors, warnings) {
  const where = "entry #" + idx + (e && e.id ? " (" + e.id + ")" : "");
  if (!e || typeof e !== "object") { errors.push(where + ": not an object"); return; }

  ["id", "name", "abbr", "cls", "note", "conf", "src"].forEach(function (k) {
    if (typeof e[k] !== "string" || !e[k].trim()) errors.push(where + ": \"" + k + "\" must be a non-empty string");
  });
  if (typeof e.id === "string" && !/^[a-z0-9][a-z0-9-]*$/.test(e.id)) {
    errors.push(where + ": \"id\" must be lower-case kebab-case (got \"" + e.id + "\")");
  }
  if (typeof e.cls === "string" && !VALID_CLS.has(e.cls)) {
    errors.push(where + ": unknown cls \"" + e.cls + "\" - expected one of " + [...VALID_CLS].join(", "));
  }
  if (typeof e.conf === "string" && !VALID_CONF.has(e.conf)) {
    errors.push(where + ": conf must be high, medium or low");
  }

  // ---- contour geometry ----
  if (!isNum(e.M0) || e.M0 <= 0) errors.push(where + ": M0 must be a positive molar mass per repeat unit");
  if (!isNum(e.lm) || e.lm <= 0) errors.push(where + ": lm must be a positive contour length per repeat, in nm");
  if (present(e.cInf) && (!isNum(e.cInf) || e.cInf <= 0)) {
    errors.push(where + ": cInf must be a positive characteristic ratio or null");
  }

  if (!e.geom || typeof e.geom !== "object") {
    errors.push(where + ": \"geom\" must be an object (use simple:false where the C_inf route does not apply)");
    return;
  }
  if (typeof e.geom.simple !== "boolean") {
    errors.push(where + ": geom.simple must be true or false - it decides whether a prediction is offered at all");
  }

  if (e.geom.simple) {
    if (!isNum(e.geom.bond) || e.geom.bond <= 0) errors.push(where + ": geom.bond (nm) is required when geom.simple is true");
    if (!isNum(e.geom.angle) || e.geom.angle <= 60 || e.geom.angle >= 180) {
      errors.push(where + ": geom.angle must be a backbone bond angle in degrees, 60 to 180");
    }
    if (!Number.isInteger(e.geom.perRepeat) || e.geom.perRepeat < 1) {
      errors.push(where + ": geom.perRepeat must be the whole number of backbone bonds per repeat unit");
    }
    // A repeat cannot be longer fully extended than its bonds laid end to end.
    if (isNum(e.geom.bond) && Number.isInteger(e.geom.perRepeat) && isNum(e.lm)) {
      const maxLm = e.geom.bond * e.geom.perRepeat;
      if (e.lm > maxLm + 1e-9) {
        errors.push(where + ": lm " + e.lm + " nm exceeds " + maxLm.toFixed(4) +
          " nm, the length of its " + e.geom.perRepeat + " backbone bonds laid colinear - a repeat cannot be longer than fully stretched");
      }
    }
    if (!present(e.cInf)) {
      warnings.push(where + " (" + (e.abbr || e.name) + "): geom.simple is true but cInf is null, so no prediction can be made anyway");
    }
  }

  // ---- measured persistence lengths ----
  if (!Array.isArray(e.lp) || !e.lp.length) {
    errors.push(where + ": \"lp\" must be a non-empty array of measurements");
    return;
  }
  e.lp.forEach(function (m, mi) {
    const mw = where + " lp[" + mi + "]";
    if (!m || typeof m !== "object") { errors.push(mw + ": not an object"); return; }
    if (!isNum(m.value) || m.value < LP_MIN || m.value > LP_MAX) {
      errors.push(mw + ": value must be a persistence length in nm between " + LP_MIN + " and " + LP_MAX + " (got " + m.value + ")");
    }
    // Persistence length is a property of chain AND conditions, so a value
    // without its solvent is not a measurement, it is a rumour.
    if (typeof m.solvent !== "string" || !m.solvent.trim()) {
      errors.push(mw + ": \"solvent\" is required - a persistence length without its solvent is not interpretable");
    }
    if (!isNum(m.T)) errors.push(mw + ": \"T\" (temperature, degrees C) is required");
    if (typeof m.method !== "string" || !m.method.trim()) errors.push(mw + ": \"method\" is required");
    if (typeof m.conf !== "string" || !VALID_CONF.has(m.conf)) errors.push(mw + ": per-measurement conf must be high, medium or low");
  });

  // ---- the cross-check ----
  if (e.geom.simple && present(e.cInf) && isNum(e.geom.bond) && isNum(e.geom.angle)) {
    const pred = predictLp(e.cInf, e.geom);
    e.lp.forEach(function (m, mi) {
      if (!isNum(m.value)) return;
      const ratio = pred > m.value ? pred / m.value : m.value / pred;
      if (ratio > PREDICTION_TOLERANCE) {
        errors.push(where + " lp[" + mi + "]: C_inf " + e.cInf + " predicts " + pred.toFixed(2) +
          " nm but the measured value is " + m.value + " nm in " + (m.solvent || "?") +
          ", off by " + ratio.toFixed(1) + "x. Either the ratio or the measurement is wrong, or this backbone " +
          "is not the tetrahedral case the geometry assumes - in which case set geom.simple to false.");
      }
    });
  }
}

function main() {
  let data;
  try { data = loadData(); }
  catch (err) { console.error("chain-data.js could not be parsed: " + err.message); process.exit(1); }
  if (!Array.isArray(data) || !data.length) {
    console.error("chain-data.js did not produce a non-empty CHAIN_DATA array");
    process.exit(1);
  }

  const errors = [], warnings = [];
  const ids = new Map(), names = new Map();
  data.forEach(function (e, idx) {
    checkEntry(e, idx, errors, warnings);
    if (e && typeof e.id === "string") {
      const k = e.id.trim().toLowerCase();
      if (ids.has(k)) errors.push("entry #" + idx + " (" + e.id + "): duplicate id, already used by entry #" + ids.get(k));
      else ids.set(k, idx);
    }
    if (e && typeof e.name === "string") {
      const k = e.name.trim().toLowerCase();
      if (names.has(k)) errors.push("entry #" + idx + " (" + e.name + "): duplicate name, already used by entry #" + names.get(k));
      else names.set(k, idx);
    }
  });

  if (warnings.length) {
    console.log("chain-data.js notes (" + warnings.length + "):\n");
    warnings.forEach(function (w) { console.log("  ~ " + w); });
    console.log("");
  }
  if (errors.length) {
    console.error("chain-data.js failed integrity check (" + errors.length + " issue" + (errors.length === 1 ? "" : "s") + "):\n");
    errors.forEach(function (e) { console.error("  - " + e); });
    process.exit(1);
  }

  const measurements = data.reduce(function (a, e) { return a + (Array.isArray(e.lp) ? e.lp.length : 0); }, 0);
  console.log("chain-data.js OK - " + data.length + " entries, " + measurements + " measurements, no integrity issues found.");
}

main();
