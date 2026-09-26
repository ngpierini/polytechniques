#!/usr/bin/env node
'use strict';

// Find open-access papers that state a value this site needs, and print the
// sentences that state it. A sourcing aid, run by hand; nothing here ships to
// the site and nothing is written into the data files.
//
// Why it exists. Several tools are gated not on code but on numbers with
// citations: the GPC converter has five Mark-Houwink pairs and none for HFIP or
// hot TCB, the Flory-Huggins page runs on a chi the user must supply, and 27
// entries carry a Tg or Tm that tacticity moves without saying which tacticity
// they are. The two local libraries cannot fill those gaps - both are synthesis
// collections, proven to hold no thermal or Mark-Houwink data - and the obvious
// journals are paywalled. What IS reachable is the open-access subset, and it
// is large enough to be worth searching properly rather than by hand.
//
// What it does NOT do: decide anything. It returns candidate sentences with
// their DOI for a human to read and accept or reject. Auto-inserting a number
// scraped from a PDF would defeat the thermal-provenance rule this repo already
// enforces, which exists precisely because an unsourced value costs more than a
// missing one.
//
// Usage:
//   node scripts/find-sources.js "mark-houwink HFIP polyamide" --pattern "K *= *[\\d.]+|alpha *= *0\\.\\d+"
//   node scripts/find-sources.js "Flory-Huggins interaction parameter polystyrene" --rows 20
//   node scripts/find-sources.js "syndiotactic PMMA glass transition" --no-fetch
//
// Flags:
//   --rows N      how many Crossref hits to consider (default 15)
//   --pattern RE  what to look for in the full text (default: numbers near the query words)
//   --no-fetch    metadata and OA status only, download nothing
//   --journals    comma-separated container-title filter, case-insensitive substring
//   --fulltext    search Europe PMC's full text instead of Crossref metadata.
//                 Use this when hunting a VALUE rather than a topic: the query
//                 goes against the body of every open-access paper it holds.
//                 Quote phrases, e.g. --fulltext '"loop fraction of" AND network'

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const CONTACT = 'ngpierini@gmail.com';        // already published on the site
const OUT_DIR = path.join(os.tmpdir(), 'polytechniques-sources');

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  return i === -1 ? fallback : process.argv[i + 1];
}
const HAS = (name) => process.argv.indexOf('--' + name) !== -1;

const query = process.argv[2];
if (!query) {
  console.error('usage: node scripts/find-sources.js "<query>" [--rows N] [--pattern RE] [--journals a,b] [--no-fetch]');
  process.exit(1);
}
const rows = Number(arg('rows', 15));
const journals = (arg('journals', '') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const pattern = arg('pattern', null);

function getJSON(url) {
  // curl rather than fetch: it is already a dependency of how this repo talks
  // to the outside world, and it handles the redirects repositories use.
  const out = execFileSync('curl', [
    '-sL', '--max-time', '40', '-H', 'User-Agent: PolyTechniques/1.0 (mailto:' + CONTACT + ')', url,
  ], { maxBuffer: 32 * 1024 * 1024 }).toString();
  try { return JSON.parse(out); } catch (e) { return null; }
}

// Europe PMC full-text search. Returns the same shape as crossref() plus a
// pmcid, which is a direct route to the body text with no publisher in the way.
function europepmc() {
  const url = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=' +
    encodeURIComponent(query) + '&format=json&pageSize=' + rows + '&resultType=core';
  const j = getJSON(url);
  if (!j || !j.resultList) return [];
  return (j.resultList.result || []).map((r) => ({
    doi: r.doi || '',
    title: r.title || '',
    journal: ((r.journalInfo || {}).journal || {}).title || r.journalTitle || '',
    year: (r.journalInfo || {}).yearOfPublication || r.pubYear,
    author: (r.authorString || '').split(',')[0],
    pmcid: r.pmcid || null,
    vol: (r.journalInfo || {}).volume,
    pages: r.pageInfo,
  })).filter((r) => !journals.length || journals.some((j2) => (r.journal || '').toLowerCase().includes(j2)));
}

// Europe PMC hands back the body as XML. Stripping tags is enough for grepping
// sentences, and it avoids the PDF round trip entirely.
function pmcText(pmcid) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const txt = path.join(OUT_DIR, pmcid + '.txt');
  if (fs.existsSync(txt)) return fs.readFileSync(txt, 'utf8');
  try {
    const xml = execFileSync('curl', ['-sL', '--max-time', '45',
      '-H', 'User-Agent: PolyTechniques/1.0 (mailto:' + CONTACT + ')',
      'https://www.ebi.ac.uk/europepmc/webservices/rest/' + pmcid + '/fullTextXML'],
      { maxBuffer: 64 * 1024 * 1024 }).toString();
    if (xml.length < 2000) return null;
    const plain = xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    fs.writeFileSync(txt, plain);
    return plain;
  } catch (e) { return null; }
}

function crossref() {
  const url = 'https://api.crossref.org/works?query.bibliographic=' + encodeURIComponent(query) +
    '&rows=' + rows + '&mailto=' + encodeURIComponent(CONTACT) +
    '&filter=' + encodeURIComponent('type:journal-article') +
    '&select=' + encodeURIComponent('DOI,title,container-title,issued,author');
  const j = getJSON(url);
  if (!j || j.status !== 'ok') return [];
  return (j.message.items || []).map((it) => ({
    doi: it.DOI,
    title: (it.title || [''])[0],
    journal: (it['container-title'] || [''])[0],
    year: ((it.issued || {})['date-parts'] || [[null]])[0][0],
    author: ((it.author || [])[0] || {}).family || '',
  })).filter((r) => !journals.length || journals.some((j2) => (r.journal || '').toLowerCase().includes(j2)));
}

// Unpaywall answers "is there a legally free copy, and where". Only those are
// fetched; a paywalled DOI is reported and left alone.
function oaLocations(doi) {
  const j = getJSON('https://api.unpaywall.org/v2/' + encodeURIComponent(doi) + '?email=' + encodeURIComponent(CONTACT));
  if (!j || !j.is_oa) return [];
  const all = (j.oa_locations || []).slice();
  if (j.best_oa_location && !all.includes(j.best_oa_location)) all.unshift(j.best_oa_location);
  // Repositories first. Unpaywall's "best" location is the publisher's, and for
  // ACS that URL is behind bot protection - curl receives a 5.5 kB challenge
  // page rather than the paper. PubMed Central and institutional repositories
  // hold the same article and serve it.
  const rank = (l) => (l.host_type === 'repository' ? 0 : 1) +
    (/pmc\.ncbi|europepmc/.test(l.url_for_pdf || l.url || '') ? -0.5 : 0);
  return all
    .filter((l) => l && (l.url_for_pdf || l.url))
    .sort((a, b) => rank(a) - rank(b))
    .map((l) => ({ url: l.url_for_pdf || l.url, host: l.host_type, license: l.license || 'unspecified' }));
}

function fetchText(locs, doi) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stem = doi.replace(/[^\w.-]/g, '_');
  const pdf = path.join(OUT_DIR, stem + '.pdf');
  const txt = path.join(OUT_DIR, stem + '.txt');
  if (fs.existsSync(txt)) return { text: fs.readFileSync(txt, 'utf8'), from: '(cached)' };
  for (let i = 0; i < locs.length; i++) {
    try {
      execFileSync('curl', ['-sL', '--max-time', '60', '-o', pdf,
        '-H', 'User-Agent: PolyTechniques/1.0 (mailto:' + CONTACT + ')', locs[i].url], { stdio: 'ignore' });
      if (!fs.existsSync(pdf)) continue;
      // A challenge page is small and is not a PDF. Check both.
      const head = fs.readFileSync(pdf).slice(0, 5).toString('latin1');
      if (fs.statSync(pdf).size < 20000 || head.indexOf('%PDF') !== 0) continue;
      execFileSync('pdftotext', ['-layout', pdf, txt], { stdio: 'ignore' });
      if (fs.existsSync(txt)) return { text: fs.readFileSync(txt, 'utf8'), from: locs[i].host };
    } catch (e) { /* try the next location */ }
  }
  return null;
}

// Sentences that both mention the subject and carry a number are what a human
// needs to see; everything else is noise at this stage.
function snippets(text, re) {
  const out = [];
  // Europe PMC returns the whole body as a single line, so a newline split
  // finds one enormous "line" and matches nothing useful. Split on sentence
  // ends too, which is the unit a reader wants to see anyway.
  const lines = text.split(/\r?\n/).flatMap((l) => (l.length > 600 ? l.split(/(?<=\.)\s+(?=[A-Z])/) : [l]));
  for (let i = 0; i < lines.length && out.length < 6; i++) {
    const L = lines[i].trim();
    if (L.length < 25 || L.length > 400) continue;
    if (re.test(L)) out.push(L.replace(/\s+/g, ' '));
  }
  return out;
}

const terms = query.split(/\s+/).filter((w) => w.length > 3).map((w) => w.replace(/[^\w]/g, ''));
const defaultRe = new RegExp('(' + terms.join('|') + ')[^.]{0,80}\\d', 'i');
const re = pattern ? new RegExp(pattern, 'i') : defaultRe;

const useFT = HAS('fulltext');
const hits = useFT ? europepmc() : crossref();
console.log('query: ' + query);
console.log(hits.length + ' articles from ' + (useFT ? "Europe PMC full text" : 'Crossref metadata') +
  (journals.length ? ' (filtered to ' + journals.join(', ') + ')' : '') + '\n');

let oaCount = 0, readCount = 0;
hits.forEach((h) => {
  let body = null, source = null;
  if (h.pmcid) { body = pmcText(h.pmcid); if (body) source = 'Europe PMC ' + h.pmcid; }
  const locs = body ? [] : oaLocations(h.doi);
  const oa = locs[0] || null;
  const tag = body ? 'OPEN (Europe PMC full text)'
    : (oa ? 'OPEN (' + locs.length + ' location' + (locs.length === 1 ? '' : 's') + ', ' + oa.license + ')' : 'paywalled');
  console.log('- ' + (h.author || '?') + ' ' + (h.year || '') + ', ' + (h.journal || '?') +
    (h.vol ? ' ' + h.vol : '') + (h.pages ? ', ' + h.pages : ''));
  console.log('  ' + (h.title || '').replace(/<[^>]+>/g, '').slice(0, 110));
  console.log('  ' + (h.doi || '(no doi)') + '   ' + tag);
  if (oa || body) oaCount++;
  if ((!oa && !body) || HAS('no-fetch')) { console.log(''); return; }
  readCount++;
  let text = body;
  if (!text) {
    const got = fetchText(locs, h.doi);
    if (!got) { console.log('  (open access, but no location served a readable PDF)\n'); return; }
    text = got.text; source = got.from;
  }
  console.log('  read from: ' + source);
  const found = snippets(text, re);
  if (!found.length) { console.log('  (full text read, nothing matched the pattern)\n'); return; }
  found.forEach((s) => console.log('    > ' + s.slice(0, 230)));
  console.log('');
});

// Counted apart on purpose: an earlier version incremented one counter only
// when it fetched, so a --no-fetch run reported "0 of 3 were open access" for a
// search that had found two CC-BY papers.
console.log(oaCount + ' of ' + hits.length + ' open access' + (HAS('no-fetch') ? ' (none fetched: --no-fetch)' : ', ' + readCount + ' read') + '.');
console.log('Cached under ' + OUT_DIR);
console.log('\nThese are CANDIDATES. Read the paper before any number here goes into the library.');
