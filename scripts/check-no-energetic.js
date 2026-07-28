// Blocks energetic-materials content from re-entering the repository.
//
// The PBX/PBXN formulation dataset was removed from the site, then from the
// git history, and then GitHub had to be asked to garbage-collect the
// unreferenced commits by hand. That last step is not repeatable on demand -
// GitHub's own reply noted they generally only do it for credentials that
// cannot be rotated - so the cheap moment to catch this is before the commit,
// not after the push.
//
//   node scripts/check-no-energetic.js            # scan tracked files
//   node scripts/check-no-energetic.js --staged   # scan staged content (hook)
//
// Installed as .git/hooks/pre-commit AND run in CI, because a git hook lives
// only in the local clone and does not travel with the repo.

"use strict";

const { execFileSync } = require("child_process");
const path = require("path");

// Deliberately specific. Bare "energetic" is NOT here: thermal-library.js
// legitimately cites the PNAS paper "Energetics of nanocrystalline TiO2", and
// a marker that fires on a real citation would be turned off within a week.
// Every term below was verified to produce zero matches on the current tree.
const MARKERS = [
  /PBXN/i, /PBX-/i, /PBX ?9[45]0[14]/i, /\bLX-\d+/i,
  /Kamlet/i, /detonation/i, /nitramine/i, /nitroplasticizer/i,
  /\bHMX\b/i, /\bRDX\b/i, /\bPETN\b/i, /\bTATB\b/i,
  /explosive/i, /BDNPA/i, /BDNPF/i, /Octol/i, /Cyclotol/i,
  /ammonium perchlorate/i, /thermal-formulations/i, /THERMAL_FORMULATIONS/,
];

// This file necessarily contains every marker it looks for.
const SELF = "scripts/check-no-energetic.js";
const SKIP_DIRS = ["node_modules/", "vendor/", ".git/"];

function git(args) {
  return execFileSync("git", args, { maxBuffer: 1e9, encoding: "buffer" });
}

function shouldSkip(file) {
  const p = file.replace(/\\/g, "/");
  return p === SELF || SKIP_DIRS.some(function (d) { return p.indexOf(d) === 0 || p.indexOf("/" + d) !== -1; });
}

function scan(file, buf) {
  if (buf.includes(0)) return null;                 // binary
  const text = buf.toString("utf8");
  const lines = text.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    for (const re of MARKERS) {
      const m = lines[i].match(re);
      if (m) { hits.push({ line: i + 1, term: m[0], text: lines[i].trim().slice(0, 120) }); break; }
    }
  }
  return hits.length ? hits : null;
}

function main() {
  const staged = process.argv.indexOf("--staged") !== -1;
  let files;
  try {
    files = git(staged ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR"] : ["ls-files"])
      .toString("utf8").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) {
    console.error("check-no-energetic: could not list files - " + e.message);
    process.exit(1);
  }

  const findings = [];
  for (const f of files) {
    if (shouldSkip(f)) continue;
    let buf;
    try {
      // Read the STAGED blob, not the working copy: they can differ, and it is
      // the staged content that is about to become a commit.
      buf = staged ? git(["show", ":" + f]) : git(["show", "HEAD:" + f]);
    } catch (e) {
      try { buf = require("fs").readFileSync(path.join(process.cwd(), f)); } catch (e2) { continue; }
    }
    const hits = scan(f, buf);
    if (hits) findings.push({ file: f, hits: hits });
  }

  if (findings.length) {
    console.error("\nBLOCKED: energetic-materials content found in " + findings.length +
      " file" + (findings.length === 1 ? "" : "s") + ".\n");
    findings.forEach(function (f) {
      console.error("  " + f.file);
      f.hits.slice(0, 5).forEach(function (h) {
        console.error("    line " + h.line + " [" + h.term + "]  " + h.text);
      });
      if (f.hits.length > 5) console.error("    ...and " + (f.hits.length - 5) + " more");
    });
    console.error("\nThis content was purged from the site, from git history, and from GitHub's");
    console.error("unreferenced objects by a support request. Getting it out again is not cheap.");
    console.error("If a match is a false positive, narrow the term in " + SELF + ".\n");
    process.exit(1);
  }

  console.log("check-no-energetic: clean (" + files.length + " file" + (files.length === 1 ? "" : "s") + " scanned).");
}

main();
