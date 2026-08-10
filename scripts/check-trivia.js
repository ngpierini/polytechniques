// Checks the daily trivia bank in index.html.
//
// The bank is hand-written, so it drifts in the ways hand-written data always
// does. One of those is not obvious by reading: when questions are written in a
// batch it is natural to put the right answer in the same slot every time, and
// a bank where 114 of 132 answers sit at position B is not a quiz - always
// pressing B wins it. That is checked here alongside the structural rules.
"use strict";

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "index.html");
const src = fs.readFileSync(FILE, "utf8");
const start = src.indexOf("var QUESTIONS = [");
const end = src.indexOf("\n  ];", start);
if (start === -1 || end === -1) {
  console.error("check-trivia: could not find the QUESTIONS array in index.html");
  process.exit(1);
}
const QUESTIONS = new Function(src.slice(start, end + 5) + "; return QUESTIONS;")();

const errors = [];
const seenQ = new Map();
const seenExplain = new Map();

QUESTIONS.forEach(function (q, i) {
  const where = "question #" + i + ' ("' + String(q && q.q).slice(0, 48) + '")';
  if (!q || typeof q.q !== "string" || q.q.trim().length < 10) {
    errors.push(where + ": missing or too-short question text");
    return;
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(where + ": needs exactly 4 options (got " + (q.options ? q.options.length : "none") + ")");
    return;
  }
  if (q.options.some(function (o) { return typeof o !== "string" || !o.trim(); })) {
    errors.push(where + ": every option must be non-empty text");
  }
  const lower = q.options.map(function (o) { return String(o).trim().toLowerCase(); });
  if (new Set(lower).size !== lower.length) {
    errors.push(where + ": two options are the same, so one distractor is unusable");
  }
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) {
    errors.push(where + ': "correct" must be an integer 0-3 (got ' + JSON.stringify(q.correct) + ")");
  }
  // An explanation is what the player is left with, so it has to say something.
  if (typeof q.explain !== "string" || q.explain.trim().length < 40) {
    errors.push(where + ": the explanation is what stays on screen after the answer; write a real sentence");
  }
  const key = q.q.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (seenQ.has(key)) errors.push(where + ": duplicates question #" + seenQ.get(key));
  else seenQ.set(key, i);
  if (typeof q.explain === "string") {
    const ek = q.explain.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seenExplain.has(ek)) errors.push(where + ": its explanation is identical to question #" + seenExplain.get(ek));
    else seenExplain.set(ek, i);
  }
  // An explanation that names a slot breaks as soon as the options are reordered.
  if (typeof q.explain === "string" && /\boption [A-D]\b|\banswer [A-D]\b/i.test(q.explain)) {
    errors.push(where + ": the explanation refers to an option by letter, which breaks if the options are ever reordered");
  }
});

// Answer position must not be predictable. With N questions over 4 slots, a
// fair bank sits near N/4 each; this fails only on a real skew.
if (QUESTIONS.length >= 20) {
  const dist = [0, 0, 0, 0];
  QUESTIONS.forEach(function (q) { if (Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4) dist[q.correct]++; });
  const worst = Math.max.apply(null, dist);
  const share = worst / QUESTIONS.length;
  if (share > 0.40) {
    errors.push("the correct answer sits in one position " + Math.round(share * 100) + "% of the time (" +
      dist.join("/") + ") - a player who always picks that slot wins most days");
  }
}

if (errors.length) {
  console.error("daily trivia failed its check (" + errors.length + " issue" + (errors.length > 1 ? "s" : "") + "):\n");
  errors.slice(0, 15).forEach(function (e) { console.error("  - " + e); });
  if (errors.length > 15) console.error("  ...and " + (errors.length - 15) + " more");
  process.exit(1);
}
const dist = [0, 0, 0, 0];
QUESTIONS.forEach(function (q) { dist[q.correct]++; });
console.log("trivia OK - " + QUESTIONS.length + " questions, answer positions " + dist.join("/") +
  ", no duplicates, every explanation written.");
