#!/usr/bin/env node
'use strict';

// Automated polymer discovery pipeline (see plans/ discussion + PR description
// for full context). Runs in CI only - nothing here ships to the site.
//
// What it does, every run:
//   1. Loads the existing curated polymer-data.js so it knows what's covered.
//   2. Walks scripts/monomer-watchlist.json for candidates not yet covered.
//   3. Looks each one up on PubChem's free PUG REST API (CAS, synonyms, SMILES).
//   4. Attempts to derive the repeat-unit atoms/bonds from the monomer SMILES
//      for the polymerization mechanisms that are safely automatable (vinyl/
//      acrylate/methacrylate addition, conjugated-diene 1,4-addition, and a
//      handful of well-defined ring-opening cases: lactam/lactone/carbonate,
//      epoxide, cyclic siloxane). Anything else - most importantly step-growth
//      condensation polymers, which need a monomer *pair* - is left with the
//      structure flagged for a human to draw by hand in the existing editor.
//   5. Splices any new entries into polymer-data.js and prints a PR-ready
//      summary. Never writes anything except when actually adding new entries.
//
// A wrong bond silently entering a chemistry reference tool is worse than a
// missing entry, so every transform rule below is deliberately narrow: if it
// isn't confident, it returns "not handled" rather than guessing, and the
// candidate gets a manual-structure placeholder instead.

const fs = require('fs');
const path = require('path');
const OCL = require('openchemlib');

const REPO_ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(REPO_ROOT, 'polymer-data.js');
const WATCHLIST_FILE = path.join(__dirname, 'monomer-watchlist.json');
const SUMMARY_FILE = path.join(REPO_ROOT, 'discovery-summary.md');
const DRY_RUN = process.argv.includes('--dry-run');
const PUG_BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

// ---------- Load the existing curated DB ----------
function loadExistingDb() {
  const code = fs.readFileSync(DATA_FILE, 'utf8');
  const sandboxWindow = {};
  // polymer-data.js is a plain `window.POLYMER_DB = [...]` assignment with no
  // other side effects, so a tiny window shim + Function() is enough to load
  // it as data without a bundler or a JSON re-export to keep in sync.
  const fn = new Function('window', code + '\nreturn window.POLYMER_DB;');
  return fn(sandboxWindow);
}

function buildCoverageIndex(db) {
  const names = new Set();
  const cas = new Set();
  db.forEach(function (p) {
    names.add(p.name.toLowerCase());
    (p.aka || []).forEach(function (a) { names.add(a.toLowerCase()); });
    if (p.cas) cas.add(p.cas);
  });
  return { names: names, cas: cas };
}

function isCovered(index, candidate, pubchem) {
  if (index.names.has(candidate.polymerName.toLowerCase())) return true;
  if ((candidate.aka || []).some(function (a) { return index.names.has(a.toLowerCase()); })) return true;
  if (pubchem && pubchem.cas && index.cas.has(pubchem.cas)) return true;
  return false;
}

// ---------- PubChem PUG REST ----------
async function pugGet(pathSuffix) {
  const res = await fetch(PUG_BASE + pathSuffix);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('PubChem request failed (' + res.status + '): ' + pathSuffix);
  }
  return res.json();
}

async function lookupMonomer(name) {
  await sleep(300); // stay well under PubChem's ~5 req/s guidance
  // Note: PubChem's PUG REST renamed "CanonicalSMILES" to "SMILES" /
  // "ConnectivitySMILES" at some point - confirmed empirically (requesting
  // the old name silently returns nothing rather than erroring, so this is
  // easy to get wrong without testing against the live API).
  const propData = await pugGet('/compound/name/' + encodeURIComponent(name) + '/property/MolecularFormula,IUPACName,SMILES/JSON');
  if (!propData) return null;
  const props = propData.PropertyTable.Properties[0];
  await sleep(300);
  const synData = await pugGet('/compound/cid/' + props.CID + '/synonyms/JSON');
  const synonyms = (synData && synData.InformationList && synData.InformationList.Information[0].Synonym) || [];
  const casMatch = synonyms.find(function (s) { return /^\d{2,7}-\d{2}-\d$/.test(s); });
  return {
    cid: props.CID,
    smiles: props.SMILES,
    formula: props.MolecularFormula,
    iupacName: props.IUPACName || null,
    cas: casMatch || null,
    synonyms: synonyms.slice(0, 6)
  };
}

// ---------- SMILES graph helpers (via openchemlib) ----------
function molToGraph(mol) {
  const nAtoms = mol.getAllAtoms();
  const atoms = [];
  for (let i = 0; i < nAtoms; i++) atoms.push({ el: mol.getAtomLabel(i) });
  const nBonds = mol.getAllBonds();
  const bonds = [];
  for (let j = 0; j < nBonds; j++) {
    bonds.push({
      a: mol.getBondAtom(0, j),
      b: mol.getBondAtom(1, j),
      order: mol.getBondOrder(j),
      ring: mol.isRingBond(j)
    });
  }
  return { atoms: atoms, bonds: bonds };
}

function degreeOf(graph, atomIdx) {
  return graph.bonds.filter(function (bd) { return bd.a === atomIdx || bd.b === atomIdx; }).length;
}

function uniqueRingAtoms(ringBonds) {
  const seen = new Set();
  ringBonds.forEach(function (bd) { seen.add(bd.a); seen.add(bd.b); });
  return Array.from(seen);
}

// ---------- Mechanism-specific bond-finding rules ----------
// Each rule returns null if the pattern doesn't confidently match, or a
// description of what to do (bonds to reorder, atoms to attach `*` to).

function findVinylBond(graph) {
  const candidates = graph.bonds.filter(function (bd) {
    return bd.order === 2 && !bd.ring && graph.atoms[bd.a].el === 'C' && graph.atoms[bd.b].el === 'C';
  });
  if (candidates.length !== 1) return null;
  return { kind: 'vinyl', bond: candidates[0] };
}

function findConjugatedDiene(graph) {
  const dbonds = graph.bonds.filter(function (bd) {
    return bd.order === 2 && !bd.ring && graph.atoms[bd.a].el === 'C' && graph.atoms[bd.b].el === 'C';
  });
  if (dbonds.length !== 2) return null;
  const d1 = dbonds[0], d2 = dbonds[1];
  const d1Atoms = [d1.a, d1.b], d2Atoms = [d2.a, d2.b];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const x = d1Atoms[i], y = d2Atoms[j];
      const link = graph.bonds.find(function (bd) {
        return bd.order === 1 && !bd.ring && ((bd.a === x && bd.b === y) || (bd.a === y && bd.b === x));
      });
      if (link) {
        return { kind: 'diene', d1: d1, d2: d2, link: link, outerA: d1Atoms[1 - i], outerD: d2Atoms[1 - j] };
      }
    }
  }
  return null;
}

// Lactam (ring N-C(=O)) / lactone or carbonate (ring O-C(=O)): the acyl-
// heteroatom bond that actually breaks in ring-opening polymerization.
function findRingAcylHeteroatomBond(graph) {
  const candidates = [];
  graph.bonds.forEach(function (bd) {
    if (!bd.ring) return;
    [[bd.a, bd.b], [bd.b, bd.a]].forEach(function (pair) {
      const xIdx = pair[0], cIdx = pair[1];
      const xEl = graph.atoms[xIdx].el, cEl = graph.atoms[cIdx].el;
      if ((xEl === 'N' || xEl === 'O') && cEl === 'C') {
        const hasExocyclicCarbonyl = graph.bonds.some(function (ob) {
          if (ob.ring || ob.order !== 2) return false;
          const other = ob.a === cIdx ? ob.b : (ob.b === cIdx ? ob.a : null);
          return other !== null && graph.atoms[other].el === 'O';
        });
        if (hasExocyclicCarbonyl) candidates.push(bd);
      }
    });
  });
  if (!candidates.length) return null;
  return { kind: 'ring-acyl', bond: candidates[0] }; // symmetric cases (e.g. lactide) are equivalent either way
}

// 3-membered ring, exactly 2 carbons + 1 oxygen, no carbonyl (an epoxide).
// Ring-opens by breaking the O bond to the *less substituted* carbon
// (matches the existing hand-drawn Poly(propylene oxide) entry). Looks for
// this specific 3-atom triangle anywhere in the molecule, rather than
// assuming the whole monomer is just the epoxide ring - a monomer like
// styrene oxide also has a separate (larger) aromatic ring elsewhere.
function findEpoxideBond(graph) {
  const ringBonds = graph.bonds.filter(function (bd) { return bd.ring; });
  for (const bd of ringBonds) {
    const aNb = ringBonds.filter(function (x) { return x.a === bd.a || x.b === bd.a; }).map(function (x) { return x.a === bd.a ? x.b : x.a; });
    const bNb = ringBonds.filter(function (x) { return x.a === bd.b || x.b === bd.b; }).map(function (x) { return x.a === bd.b ? x.b : x.a; });
    const commonThird = aNb.filter(function (n) { return n !== bd.b && bNb.indexOf(n) !== -1; });
    for (const c of commonThird) {
      const triangle = [bd.a, bd.b, c];
      const els = triangle.map(function (i) { return graph.atoms[i].el; });
      if (els.filter(function (e) { return e === 'O'; }).length !== 1) continue;
      if (els.filter(function (e) { return e === 'C'; }).length !== 2) continue;
      const oIdx = triangle[els.indexOf('O')];
      const cIdxs = triangle.filter(function (i) { return graph.atoms[i].el === 'C'; });
      const lessSubstituted = cIdxs.slice().sort(function (x, y) { return degreeOf(graph, x) - degreeOf(graph, y); })[0];
      const bond = ringBonds.find(function (x) {
        return (x.a === oIdx && x.b === lessSubstituted) || (x.b === oIdx && x.a === lessSubstituted);
      });
      if (bond) return { kind: 'epoxide', bond: bond };
    }
  }
  return null;
}

// Cyclic siloxane (D3/D4-style Si-O ring): breaks any one Si-O ring bond
// (symmetric).
function findSiloxaneBond(graph) {
  const ringBonds = graph.bonds.filter(function (bd) { return bd.ring; });
  const ringAtoms = uniqueRingAtoms(ringBonds);
  if (!ringAtoms.length) return null;
  const hasSi = ringAtoms.some(function (i) { return graph.atoms[i].el === 'Si'; });
  const hasO = ringAtoms.some(function (i) { return graph.atoms[i].el === 'O'; });
  const onlySiOrO = ringAtoms.every(function (i) { return graph.atoms[i].el === 'Si' || graph.atoms[i].el === 'O'; });
  if (!hasSi || !hasO || !onlySiOrO) return null;
  const bond = ringBonds.find(function (bd) {
    const elA = graph.atoms[bd.a].el, elB = graph.atoms[bd.b].el;
    return (elA === 'Si' && elB === 'O') || (elA === 'O' && elB === 'Si');
  });
  if (!bond) return null;
  return { kind: 'siloxane', bond: bond };
}

// ---------- Apply a rule's result to produce our atoms/bonds schema ----------
function finalizeEntry(graph, bonds, starAttach, mechanism) {
  const atoms = graph.atoms.map(function (a, i) { return { id: i + 1, el: a.el }; });
  const outBonds = bonds.map(function (bd) { return { a: bd.a + 1, b: bd.b + 1, order: bd.order }; });
  atoms.push({ id: 'S0', el: '*' });
  atoms.push({ id: 'S1', el: '*' });
  outBonds.unshift({ a: 'S0', b: starAttach[0] + 1, order: 1 });
  outBonds.push({ a: starAttach[1] + 1, b: 'S1', order: 1 });
  return { ok: true, atoms: atoms, bonds: outBonds, mechanism: mechanism };
}

function deriveRepeatUnit(smiles) {
  let mol;
  try {
    mol = OCL.Molecule.fromSmiles(smiles);
  } catch (e) {
    return { ok: false, reason: 'SMILES did not parse: ' + e.message };
  }
  const graph = molToGraph(mol);

  const vinyl = findVinylBond(graph);
  if (vinyl) {
    const bonds = graph.bonds.map(function (bd) {
      return { a: bd.a, b: bd.b, order: bd === vinyl.bond ? 1 : bd.order };
    });
    return finalizeEntry(graph, bonds, [vinyl.bond.a, vinyl.bond.b], 'vinyl addition (single non-ring C=C)');
  }

  const diene = findConjugatedDiene(graph);
  if (diene) {
    const bonds = graph.bonds.map(function (bd) {
      let order = bd.order;
      if (bd === diene.d1 || bd === diene.d2) order = 1;
      else if (bd === diene.link) order = 2;
      return { a: bd.a, b: bd.b, order: order };
    });
    return finalizeEntry(graph, bonds, [diene.outerA, diene.outerD], 'conjugated diene, 1,4-addition');
  }

  const ringAcyl = findRingAcylHeteroatomBond(graph);
  if (ringAcyl) {
    const bonds = graph.bonds.filter(function (bd) { return bd !== ringAcyl.bond; })
      .map(function (bd) { return { a: bd.a, b: bd.b, order: bd.order }; });
    return finalizeEntry(graph, bonds, [ringAcyl.bond.a, ringAcyl.bond.b], 'ring-opening (lactam/lactone/carbonate)');
  }

  const epoxide = findEpoxideBond(graph);
  if (epoxide) {
    const bonds = graph.bonds.filter(function (bd) { return bd !== epoxide.bond; })
      .map(function (bd) { return { a: bd.a, b: bd.b, order: bd.order }; });
    return finalizeEntry(graph, bonds, [epoxide.bond.a, epoxide.bond.b], 'ring-opening (epoxide)');
  }

  const siloxane = findSiloxaneBond(graph);
  if (siloxane) {
    const bonds = graph.bonds.filter(function (bd) { return bd !== siloxane.bond; })
      .map(function (bd) { return { a: bd.a, b: bd.b, order: bd.order }; });
    return finalizeEntry(graph, bonds, [siloxane.bond.a, siloxane.bond.b], 'ring-opening (cyclic siloxane)');
  }

  return { ok: false, reason: 'No recognized single-monomer polymerization pattern (likely step-growth, or an unsupported ring-opening type) - needs a hand-drawn structure.' };
}

// ---------- Serialize a DB entry back to polymer-data.js's JS style ----------
function jsStr(s) { return JSON.stringify(s); }

function serializeAtoms(atoms) {
  return '[' + atoms.map(function (a) {
    return '{ id: ' + (typeof a.id === 'string' ? jsStr(a.id) : a.id) + ', el: ' + jsStr(a.el) + ' }';
  }).join(', ') + ']';
}

function serializeBonds(bonds) {
  return '[' + bonds.map(function (b) {
    return '{ a: ' + (typeof b.a === 'string' ? jsStr(b.a) : b.a) + ', b: ' + (typeof b.b === 'string' ? jsStr(b.b) : b.b) + ', order: ' + b.order + ' }';
  }).join(', ') + ']';
}

function serializeEntry(entry) {
  const lines = [];
  lines.push('  {');
  if (entry.autoGenerated) lines.push('    // AUTO-GENERATED by scripts/discover-polymers.js (' + entry.mechanism + ') - verify structure before trusting');
  if (entry.needsStructure) lines.push('    // NEEDS STRUCTURE - metadata only, draw the repeat unit by hand in the structure editor');
  lines.push('    name: ' + jsStr(entry.name) + ', aka: [' + entry.aka.map(jsStr).join(', ') + '], monomer: ' + jsStr(entry.monomer) + ',');
  lines.push('    cls: ' + jsStr(entry.cls) + (entry.cas ? ', cas: ' + jsStr(entry.cas) : '') + ',');
  lines.push('    tags: [' + entry.tags.map(jsStr).join(', ') + '],');
  if (entry.autoGenerated) lines.push('    verified: false,');
  if (entry.needsStructure) lines.push('    needsStructure: true,');
  lines.push('    atoms: ' + serializeAtoms(entry.atoms) + ',');
  lines.push('    bonds: ' + serializeBonds(entry.bonds));
  lines.push('  }');
  return lines.join('\n');
}

function spliceIntoDataFile(newEntriesText) {
  const code = fs.readFileSync(DATA_FILE, 'utf8');
  const marker = '\n];';
  const idx = code.lastIndexOf(marker);
  if (idx === -1) throw new Error('Could not find the closing "];" in polymer-data.js - format may have changed.');
  const before = code.slice(0, idx);
  const after = code.slice(idx);
  const updated = before + ',\n' + newEntriesText + after;
  fs.writeFileSync(DATA_FILE, updated, 'utf8');
}

// ---------- Main ----------
async function main() {
  const watchlist = JSON.parse(fs.readFileSync(WATCHLIST_FILE, 'utf8')).monomers;
  const existingDb = loadExistingDb();
  const coverage = buildCoverageIndex(existingDb);

  const added = [];
  const flagged = [];
  const skippedCovered = [];
  const errors = [];

  for (const candidate of watchlist) {
    if (isCovered(coverage, candidate, null)) {
      skippedCovered.push(candidate.polymerName);
      continue;
    }

    let pubchem;
    try {
      pubchem = await lookupMonomer(candidate.monomer);
    } catch (e) {
      errors.push(candidate.monomer + ': PubChem lookup failed - ' + e.message);
      continue;
    }
    if (!pubchem) {
      errors.push(candidate.monomer + ': not found on PubChem (checked /compound/name/' + candidate.monomer + ')');
      continue;
    }
    if (isCovered(coverage, candidate, pubchem)) {
      skippedCovered.push(candidate.polymerName + ' (matched by CAS ' + pubchem.cas + ')');
      continue;
    }

    const derived = deriveRepeatUnit(pubchem.smiles);
    const baseEntry = {
      name: candidate.polymerName,
      aka: candidate.aka || [],
      monomer: candidate.monomer,
      cls: candidate.cls,
      cas: pubchem.cas,
      tags: candidate.tags || []
    };

    if (derived.ok) {
      const entry = Object.assign({}, baseEntry, {
        autoGenerated: true,
        mechanism: derived.mechanism,
        atoms: derived.atoms,
        bonds: derived.bonds
      });
      added.push({ entry: entry, pubchem: pubchem });
    } else {
      const entry = Object.assign({}, baseEntry, {
        needsStructure: true,
        atoms: [],
        bonds: []
      });
      flagged.push({ entry: entry, pubchem: pubchem, reason: derived.reason });
    }
  }

  const allNew = added.concat(flagged).map(function (x) { return x.entry; });

  if (!allNew.length) {
    console.log('No new candidates this run. Covered/skipped: ' + skippedCovered.length + ', errors: ' + errors.length);
    errors.forEach(function (e) { console.log('  - ' + e); });
    if (!DRY_RUN) fs.writeFileSync(SUMMARY_FILE, '# Polymer discovery run\n\nNo new candidates found this run.\n');
    return;
  }

  const newEntriesText = allNew.map(serializeEntry).join(',\n');

  console.log('=== Discovery results ===');
  console.log('Auto-generated structures: ' + added.length);
  added.forEach(function (x) { console.log('  + ' + x.entry.name + ' (' + x.entry.mechanism + ', CAS ' + x.entry.cas + ')'); });
  console.log('Flagged for manual structure: ' + flagged.length);
  flagged.forEach(function (x) { console.log('  ? ' + x.entry.name + ' - ' + x.reason); });
  if (errors.length) {
    console.log('Errors: ' + errors.length);
    errors.forEach(function (e) { console.log('  ! ' + e); });
  }

  const summaryLines = [
    '# Automated polymer discovery',
    '',
    'Every entry below needs review before merging - auto-generated structures are a best-effort chemistry heuristic, not verified.',
    '',
    '## Auto-generated structures (' + added.length + ')',
    ''
  ];
  added.forEach(function (x) {
    summaryLines.push('- **' + x.entry.name + '** (' + (x.entry.aka.join(', ') || 'no aka') + ') - CAS ' + x.entry.cas + ', mechanism: ' + x.entry.mechanism + ', from monomer SMILES `' + x.pubchem.smiles + '`');
  });
  summaryLines.push('', '## Flagged for manual structure (' + flagged.length + ')', '');
  flagged.forEach(function (x) {
    summaryLines.push('- **' + x.entry.name + '** - ' + x.reason + (x.pubchem.smiles ? ' (monomer SMILES `' + x.pubchem.smiles + '`)' : ''));
  });
  if (errors.length) {
    summaryLines.push('', '## Lookup errors (' + errors.length + ')', '');
    errors.forEach(function (e) { summaryLines.push('- ' + e); });
  }

  if (DRY_RUN) {
    console.log('\n--dry-run: not writing polymer-data.js or ' + path.basename(SUMMARY_FILE));
    console.log('\nGenerated entry text:\n' + newEntriesText);
  } else {
    spliceIntoDataFile(newEntriesText);
    fs.writeFileSync(SUMMARY_FILE, summaryLines.join('\n') + '\n');
    console.log('\nUpdated ' + DATA_FILE);
    console.log('Wrote ' + SUMMARY_FILE);
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
