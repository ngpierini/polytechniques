// CI data-integrity check for thermal-library.js.
//
// thermal-analysis.html renders every entry three ways (DSC, TGA, DMA) from
// this one file, and the renderers fail quietly: an entry with a mistyped
// dma.type or an unhandled tga.special does not throw, it just draws nothing
// or silently takes a default branch. Two real bugs of exactly that shape were
// found by hand rather than by tooling - kel-f-800 stored dma.type "semicry",
// which only worked because it happened to match the renderer's INTERNAL name
// after mapping, and fe2o3 carried tga.special "catalyst", which no renderer
// branch handled at all. This file exists so the next one is caught by CI.
//
// The enums below are not a style guide, they are the set of values the
// renderers in thermal-analysis.html actually branch on. Keep them in sync
// with that file; a value outside them renders wrong rather than loudly.

"use strict";

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "thermal-library.js");

function loadLibrary() {
  const code = fs.readFileSync(DATA_FILE, "utf8");
  const fn = new Function("window", code + "\nreturn window.THERMAL_LIBRARY;");
  return fn({});
}

// --- what the renderers accept ---------------------------------------------

// thermal-analysis.html maps "semicrystalline" -> "semicry" for internal use.
// Authoring the internal name bypasses the mapping and works only by accident,
// so the internal spelling is rejected here with a pointed message.
const VALID_DMA_TYPES = new Set(["linear", "semicrystalline", "network"]);
const INTERNAL_DMA_TYPES = new Set(["semicry"]);

// null is the common case. Every non-null value must have a branch in the TGA
// renderer and in the narrative, or it is dead data.
const VALID_TGA_SPECIAL = new Set(["metal-oxidation", "carbonate", "sublimes"]);

const VALID_CLS = new Set([
  "thermoplastic", "elastomer", "binder", "plasticizer", "additive", "copolymer"
]);

const VALID_CONF = new Set(["high", "medium", "low"]);

// Physically plausible bounds. Deliberately wide - the job is to catch a
// transposed digit or a K/C mix-up, not to referee borderline chemistry.
//
// The ceiling has to depend on class. An organic polymer has decomposed long
// before 700 C, so a tm of 1565 there is a real error; for an inorganic filler
// it is just the melting point of haematite. A single global bound would
// either wave the polymer error through or flag every mineral in the library.
const T_MIN = -200;
const T_MAX_ORGANIC = 700;
const T_MAX_INORGANIC = 3000;
function tMaxFor(cls) { return cls === "additive" ? T_MAX_INORGANIC : T_MAX_ORGANIC; }

function isNum(v) { return typeof v === "number" && isFinite(v); }
function present(v) { return v !== null && v !== undefined; }

function checkEntry(e, idx, errors, warnings) {
  const where = "entry #" + idx + (e && e.id ? " (" + e.id + ")" : "");

  if (!e || typeof e !== "object") { errors.push(where + ": not an object"); return; }

  // ---- identity ----
  ["id", "name", "abbr", "cls", "note", "conf", "src"].forEach(function (k) {
    if (typeof e[k] !== "string" || !e[k].trim()) {
      errors.push(where + ": \"" + k + "\" must be a non-empty string");
    }
  });
  if (typeof e.id === "string" && !/^[a-z0-9][a-z0-9-]*$/.test(e.id)) {
    errors.push(where + ": \"id\" must be lower-case kebab-case (got \"" + e.id + "\")");
  }
  if (typeof e.cls === "string" && !VALID_CLS.has(e.cls)) {
    errors.push(where + ": unknown cls \"" + e.cls + "\" - expected one of " + [...VALID_CLS].join(", "));
  }
  if (typeof e.conf === "string" && !VALID_CONF.has(e.conf)) {
    errors.push(where + ": conf must be high, medium or low (got \"" + e.conf + "\")");
  }

  // ---- scalar temperatures and enthalpies ----
  const tMax = tMaxFor(e.cls);
  ["tg", "tg2", "tm", "tcc", "tc", "transT", "decompT"].forEach(function (k) {
    if (!present(e[k])) return;
    if (!isNum(e[k])) { errors.push(where + ": \"" + k + "\" must be a number or null"); return; }
    if (e[k] < T_MIN || e[k] > tMax) {
      errors.push(where + ": \"" + k + "\" = " + e[k] + " °C is outside the plausible range " + T_MIN + ".." + tMax +
        " for cls \"" + e.cls + "\" - a Kelvin value or a transposed digit?");
    }
  });
  ["dCp", "dHm", "dHm0", "transH", "decompH"].forEach(function (k) {
    if (!present(e[k])) return;
    if (!isNum(e[k]) || e[k] < 0) errors.push(where + ": \"" + k + "\" must be a non-negative number or null");
  });

  // ---- cross-field physics ----
  // Each of these encodes a claim the charts rely on. A violation does not
  // crash the page, it draws a thermogram that cannot exist.
  if (present(e.tg) && present(e.tm) && e.tg >= e.tm) {
    errors.push(where + ": tg (" + e.tg + ") must be below tm (" + e.tm + ")");
  }
  if (present(e.tm) && present(e.decompT) && e.decompT <= e.tm) {
    errors.push(where + ": decompT (" + e.decompT + ") must be above tm (" + e.tm + ") - it melts before it decomposes");
  }
  if (present(e.tcc)) {
    if (!present(e.tm)) errors.push(where + ": tcc is set but tm is null - cold crystallisation with nothing to melt");
    if (present(e.tg) && e.tcc <= e.tg) errors.push(where + ": tcc (" + e.tcc + ") must be above tg (" + e.tg + ")");
    if (present(e.tm) && e.tcc >= e.tm) errors.push(where + ": tcc (" + e.tcc + ") must be below tm (" + e.tm + ")");
  }
  if (present(e.dHm) && !present(e.tm)) {
    errors.push(where + ": dHm is set but tm is null - a heat of fusion with no melt");
  }
  // tc is the OPTIONAL measured crystallisation-on-cooling temperature. It is
  // distinct from tcc (cold crystallisation, on heating, above Tg). When absent
  // the cooling view models it below Tm and says so, so an entry never needs
  // this field - but a value here must be a real supercooled one, i.e. below
  // the melt it comes from.
  if (present(e.tc)) {
    if (!present(e.tm)) {
      errors.push(where + ": tc is set but tm is null - crystallisation on cooling with nothing that melts");
    } else if (e.tc >= e.tm) {
      errors.push(where + ": tc (" + e.tc + ") must be below tm (" + e.tm + ") - crystallisation on cooling is always supercooled");
    }
    if (present(e.tg) && e.tc <= e.tg) {
      errors.push(where + ": tc (" + e.tc + ") must be above tg (" + e.tg + ") - chains cannot crystallise once the glass is frozen");
    }
  }
  if (present(e.dHm0) && !present(e.tm)) {
    errors.push(where + ": dHm0 is set but tm is null - the crystallinity tile needs a melt to divide into");
  }
  if (present(e.dHm) && present(e.dHm0) && e.dHm > e.dHm0) {
    errors.push(where + ": dHm (" + e.dHm + ") exceeds dHm0 (" + e.dHm0 + "), i.e. crystallinity above 100%");
  }
  if (present(e.tg2) && !present(e.tg)) {
    errors.push(where + ": tg2 is set but tg is null - a second glass transition with no first");
  }
  if (present(e.dCp) && !present(e.tg)) {
    errors.push(where + ": dCp is set but tg is null - a step height for a step that is never drawn");
  }
  if (present(e.decompH) && !present(e.decompT)) {
    errors.push(where + ": decompH is set but decompT is null - an enthalpy with no exotherm to attach it to");
  }
  // A solid-solid transition happens in the crystal, so it has to sit below the
  // melt that destroys it (PTFE's 19 C triclinic-to-hexagonal against Tm 327).
  if (present(e.transH) && !present(e.transT)) {
    errors.push(where + ": transH is set but transT is null - an enthalpy with no transition to attach it to");
  }
  if (present(e.transT)) {
    if (!present(e.tm)) {
      errors.push(where + ": transT is set but tm is null - a crystal-crystal transition in a material with no crystal");
    } else if (e.transT >= e.tm) {
      errors.push(where + ": transT (" + e.transT + ") must be below tm (" + e.tm + ") - the melt destroys the crystal the transition happens in");
    }
  }
  // decompT drives an EXOTHERM in the DSC renderer. Ordinary chain scission is
  // endothermic and is already carried by the TGA trace, so this field is for
  // genuinely exothermic reaction events only (PAN cyclisation is the one case
  // here). Flagging the overlap catches someone filing a TGA onset in it.
  if (present(e.decompT) && Array.isArray(e.tga && e.tga.steps) && e.tga.steps.length) {
    const firstStep = e.tga.steps[0].t;
    if (isNum(firstStep) && Math.abs(firstStep - e.decompT) > 150) {
      warnings.push(where + " (" + (e.abbr || e.name) + "): decompT " + e.decompT + " °C is more than 150 °C from the first TGA step at " +
        firstStep + " °C - confirm it is a real DSC exotherm and not a mis-filed TGA onset");
    }
  }

  // ---- dma ----
  if (!e.dma || typeof e.dma !== "object") {
    errors.push(where + ": \"dma\" must be an object (use { type: null } if DMA does not apply)");
  } else {
    const t = e.dma.type;
    // An entry with no DMA trace is dropped from the DMA material picker
    // entirely, so it vanishes when you switch tabs. That is often correct - a
    // filler powder has nothing to clamp - but it has to SAY so, or the gap
    // reads as an oversight and the next contributor "fixes" it by inventing
    // moduli. PGA already lost a fabricated pair that way.
    if (!present(t) && (typeof e.dma.na !== "string" || !e.dma.na.trim())) {
      errors.push(where + ": no dma.type, so it is absent from the DMA picker - add \"na\" explaining why " +
        "(e.g. a powder with no specimen to clamp, or moduli that could not be substantiated)");
    }
    if (present(t)) {
      if (INTERNAL_DMA_TYPES.has(t)) {
        errors.push(where + ": dma.type \"" + t + "\" is the renderer's INTERNAL name - author it as \"semicrystalline\"; " +
          "the internal spelling only works by accident and will break if the mapping changes");
      } else if (!VALID_DMA_TYPES.has(t)) {
        errors.push(where + ": unknown dma.type \"" + t + "\" - expected one of " + [...VALID_DMA_TYPES].join(", "));
      }
      if (!isNum(e.dma.glassy) || e.dma.glassy <= 0) {
        errors.push(where + ": dma.glassy must be a positive modulus in Pa when dma.type is set");
      }
      if (present(e.dma.rubbery)) {
        if (!isNum(e.dma.rubbery) || e.dma.rubbery <= 0) {
          errors.push(where + ": dma.rubbery must be a positive modulus in Pa or null");
        } else if (isNum(e.dma.glassy) && e.dma.rubbery >= e.dma.glassy) {
          errors.push(where + ": dma.rubbery (" + e.dma.rubbery + ") must be below dma.glassy (" + e.dma.glassy +
            ") - the modulus falls through the glass transition");
        }
      }
      if (present(e.dma.na)) {
        errors.push(where + ": dma has both a type and an \"na\" reason - a material either has a DMA trace or a reason it does not");
      }
      // dmaOk() also requires a tg, so a typed entry without one still draws nothing.
      if (!present(e.tg)) {
        errors.push(where + ": dma.type is set but tg is null, so dmaOk() rejects it and the DMA chart stays blank");
      }
    }
  }

  // ---- tga ----
  if (!e.tga || typeof e.tga !== "object") {
    errors.push(where + ": \"tga\" must be an object");
    return;
  }
  if (present(e.tga.special) && !VALID_TGA_SPECIAL.has(e.tga.special)) {
    errors.push(where + ": unknown tga.special \"" + e.tga.special + "\" - no renderer branch handles it, so it is dead data. " +
      "Expected one of " + [...VALID_TGA_SPECIAL].join(", ") + ", or null");
  }
  const steps = e.tga.steps;
  if (present(steps) && !Array.isArray(steps)) {
    errors.push(where + ": tga.steps must be an array or null");
  } else if (Array.isArray(steps)) {
    let lastT = -Infinity;
    steps.forEach(function (s, si) {
      const sw = where + " tga.steps[" + si + "]";
      if (!s || typeof s !== "object") { errors.push(sw + ": not an object"); return; }
      if (!isNum(s.t) || s.t < T_MIN || s.t > tMax) errors.push(sw + ": \"t\" must be a temperature in " + T_MIN + ".." + tMax);
      if (!isNum(s.f) || s.f <= 0 || s.f > 1) errors.push(sw + ": \"f\" must be a mass fraction in (0, 1], got " + s.f);
      if (typeof s.l !== "string" || !s.l.trim()) errors.push(sw + ": \"l\" must be a non-empty label");
      if (isNum(s.t)) {
        if (s.t < lastT) errors.push(sw + ": steps must be ordered by ascending temperature (" + s.t + " follows " + lastT + ")");
        lastT = s.t;
      }
    });

    // Mass balance: everything that leaves plus what stays must be the whole
    // sample. This is the check that makes a TGA trace physically meaningful.
    if (present(e.tga.charN2)) {
      if (!isNum(e.tga.charN2) || e.tga.charN2 < 0 || e.tga.charN2 > 1) {
        errors.push(where + ": tga.charN2 must be a fraction in [0, 1]");
      } else if (steps.every(function (s) { return isNum(s.f); })) {
        const lost = steps.reduce(function (a, s) { return a + s.f; }, 0);
        const total = lost + e.tga.charN2;
        if (Math.abs(total - 1) > 0.005) {
          errors.push(where + ": TGA mass balance does not close - steps (" + lost.toFixed(3) +
            ") + charN2 (" + e.tga.charN2.toFixed(3) + ") = " + total.toFixed(3) + ", expected 1.000");
        }
      }
    }
  }
  if (present(e.tga.ashAir) && (!isNum(e.tga.ashAir) || e.tga.ashAir < 0 || e.tga.ashAir > 1)) {
    errors.push(where + ": tga.ashAir must be a fraction in [0, 1]");
  }

  // ---- renderability ----
  // Mirrors dscOk/tgaOk/dmaOk in thermal-analysis.html. An entry that no chart
  // can draw is invisible everywhere and almost certainly a mistake; one that
  // is missing from a single chart is usually deliberate (a filler powder has
  // no DMA) so it is reported as a warning, not a failure.
  const dscOk = present(e.tg) || present(e.tm) || present(e.decompT);
  const tgaOk = (Array.isArray(steps) && steps.length > 0) || e.tga.special === "metal-oxidation";
  const dmaOk = !!(e.dma && present(e.dma.type) && present(e.dma.glassy) && present(e.tg));
  if (!dscOk && !tgaOk && !dmaOk) {
    errors.push(where + ": renders in none of DSC, TGA or DMA - the entry is invisible on every chart");
  } else {
    const missing = [];
    if (!dscOk) missing.push("DSC");
    if (!tgaOk) missing.push("TGA");
    // A DMA gap with a stated reason is a documented editorial decision, not a
    // hole, so it is not worth repeating on every run.
    if (!dmaOk && !(e.dma && e.dma.na)) missing.push("DMA");
    if (missing.length) {
      warnings.push(where + " (" + (e.abbr || e.name) + "): no " + missing.join(" or ") + " trace");
    }
  }
}

function main() {
  let lib;
  try {
    lib = loadLibrary();
  } catch (err) {
    console.error("thermal-library.js could not be parsed: " + err.message);
    process.exit(1);
  }
  if (!Array.isArray(lib) || !lib.length) {
    console.error("thermal-library.js did not produce a non-empty THERMAL_LIBRARY array");
    process.exit(1);
  }

  const errors = [];
  const warnings = [];
  const idsSeen = new Map();
  const namesSeen = new Map();

  lib.forEach(function (e, idx) {
    checkEntry(e, idx, errors, warnings);
    if (e && typeof e.id === "string") {
      const k = e.id.trim().toLowerCase();
      if (idsSeen.has(k)) errors.push("entry #" + idx + " (" + e.id + "): duplicate id, already used by entry #" + idsSeen.get(k));
      else idsSeen.set(k, idx);
    }
    if (e && typeof e.name === "string") {
      const k = e.name.trim().toLowerCase();
      if (namesSeen.has(k)) errors.push("entry #" + idx + " (" + e.name + "): duplicate name, already used by entry #" + namesSeen.get(k));
      else namesSeen.set(k, idx);
    }
  });

  if (warnings.length) {
    console.log("thermal-library.js coverage notes (" + warnings.length + "):\n");
    warnings.forEach(function (w) { console.log("  ~ " + w); });
    console.log("");
  }

  if (errors.length) {
    console.error("thermal-library.js failed integrity check (" + errors.length + " issue" + (errors.length === 1 ? "" : "s") + "):\n");
    errors.forEach(function (e) { console.error("  - " + e); });
    process.exit(1);
  }

  console.log("thermal-library.js OK - " + lib.length + " entries, no integrity issues found.");
}

main();
