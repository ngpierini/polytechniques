// Fails if a generated diagram in a page no longer matches its generator.
//
// The curves in scripts/build-diagrams.js are computed from the same relations
// the calculators use, which is only worth anything if the pages carry what
// the generator produces. A hand edit to the SVG in a page, or a change to the
// generator without regenerating, would let a diagram drift away from its
// physics while still looking plausible. This regenerates in memory and
// compares; it writes nothing.
//
// It also inherits the generator's own refusal to emit a non-finite point,
// which is how a 0/0 in Mayo-Lewis once deleted a whole curve without error.
"use strict";
const { execFileSync } = require("child_process");
const path = require("path");
try {
  execFileSync(process.execPath, [path.join(__dirname, "build-diagrams.js"), "--check"], { stdio: "pipe" });
  console.log("Diagrams OK: every generated diagram matches scripts/build-diagrams.js.");
} catch (e) {
  process.stderr.write(String(e.stdout || "") + String(e.stderr || ""));
  console.error("\nA generated diagram is out of date or failed to build. Run: node scripts/build-diagrams.js");
  process.exit(1);
}
