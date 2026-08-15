// Give the polymer library a crawlable surface.
//
// 908 of the 968 entries in polymer-data.js carry a curated note - 48,000 words
// of original writing - and none of it existed as HTML. It rendered only after
// a visitor typed a query into polymer-search.html, so neither a search crawler
// nor a human reviewer ever saw a word of it. AdSense reviewed the site on
// 13 Aug 2026 and returned "Low value content" against 21 indexed pages holding
// 30,527 words, while a hundred and fifty thousand characters of real polymer
// chemistry sat in a JavaScript array one directory over.
//
// This emits one page per chemical family: a hand-written introduction, then
// every entry in that family with its CAS number, monomer, thermal data and
// note. The partition is strict - each entry appears on exactly one page - so
// that fixing thin content does not create duplicate content instead. For the
// same reason there is deliberately no page-per-polymer: 968 pages each holding
// a 53-word note is scaled content abuse, and would make the verdict worse.
//
// The prose in FAMILIES is the part that cannot be generated. Everything else
// on the page is a projection of polymer-data.js, so run with --check in CI to
// catch the pages going stale the moment an entry is added or reclassified.
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://getpolytechniques.com/";
const CHECK = process.argv.includes("--check");

global.window = {};
require(path.join(ROOT, "polymer-data.js"));
const DB = global.window.POLYMER_DB;

// --- The families ---------------------------------------------------------
// `match` must partition the library: every entry on exactly one page, checked
// below. `intro` and `design` are hand-written and are the reason these pages
// are worth indexing at all; keep them specific to the family. Numbers quoted
// in prose must agree with the data - the checker at the bottom re-reads every
// Tg cited here against the entry it names.
const FAMILIES = [
  {
    slug: "acrylate-polymers",
    title: "Acrylate polymers",
    nav: "Acrylates",
    lede: "The soft half of the acrylics - why an acrylate sits eighty degrees below the methacrylate that looks just like it",
    match: e => e.cls === "Addition (acrylate)",
    intro: [
      "An acrylate repeat unit is about as simple as a vinyl polymer gets: a two-carbon backbone with an ester hanging off every other carbon, &ndash;CH<sub>2</sub>&ndash;CH(CO<sub>2</sub>R)&ndash;. Everything that distinguishes one acrylate from the next is in R, and the range that single substituent covers is remarkable. The same backbone gives you a hard coating resin, a pressure-sensitive adhesive that tacks at room temperature, a water-soluble thickener, a fluorinated release layer, and a superabsorbent.",
      "The defining structural fact is what an acrylate <em>lacks</em>. Replace the hydrogen on the substituted backbone carbon with a methyl group and you have a methacrylate, and the glass transition jumps by roughly eighty to a hundred degrees &ndash; poly(methyl acrylate) sits at 10&nbsp;&deg;C while poly(methyl methacrylate) sits at 105&nbsp;&deg;C. That extra methyl crowds the backbone and freezes out the rotation that lets an acrylate chain move. It is the single largest structure&ndash;property lever in the acrylic family, and it is why formulators reach for acrylates when they want something soft and methacrylates when they want something rigid.",
    ],
    design: [
      "Within the acrylates, the ester group is the tuning knob, and it works in two opposing directions. Lengthening a linear alkyl ester plasticises the polymer internally: the side chain holds neighbouring backbones apart and lowers T<sub>g</sub> steeply, which is the trip from poly(methyl acrylate) at 10&nbsp;&deg;C down to poly(ethyl acrylate) at &minus;24&nbsp;&deg;C and onward to the butyl and 2-ethylhexyl esters that make up most adhesive formulations. Keep going, though, and the trend reverses: once the side chain is long enough to pack against its neighbours it begins to crystallise on its own, and the polymer stiffens again for an entirely different reason. Branching in the ester works the other way from length &ndash; a <em>tert</em>-butyl ester is much stiffer than the n-butyl isomer of identical molecular weight.",
      "Acrylates also behave differently from methacrylates in the reactor, which matters if you are trying to control one. The propagating radical on an acrylate is secondary rather than tertiary, so it is more reactive and less stable: propagation is fast, but the same radical readily abstracts a hydrogen from its own backbone, forming a mid-chain radical that goes on to give short-chain branches and, eventually, &beta;-scission. That backbiting is strongly temperature-dependent and is the usual explanation when an acrylate polymerisation gives a broader distribution or a lower-than-expected molecular weight at high temperature.",
    ],
    related: [
      ["methacrylate-polymers.html", "Methacrylate polymers &ndash; the same ester series with the &alpha;-methyl in place"],
      ["tg-predictor.html", "Tg predictor &ndash; estimate a copolymer T<sub>g</sub> from these homopolymer values"],
      ["calculator.html#atrp", "ATRP and RAFT calculators &ndash; target a molecular weight for these monomers"],
    ],
  },
  {
    slug: "methacrylate-polymers",
    title: "Methacrylate polymers",
    nav: "Methacrylates",
    lede: "One extra methyl group on the backbone, and the whole family turns rigid",
    match: e => e.cls === "Addition (methacrylate)",
    intro: [
      "A methacrylate is an acrylate carrying a methyl group on the substituted backbone carbon: &ndash;CH<sub>2</sub>&ndash;C(CH<sub>3</sub>)(CO<sub>2</sub>R)&ndash;. That one substituent is responsible for most of what the family is used for. It sits directly on the chain, and a backbone carbon bearing both a methyl and an ester cannot rotate past its neighbours without a large energy penalty, so the chain is stiff and the glass transition is high.",
      "Poly(methyl methacrylate) is the reference point at 105&nbsp;&deg;C: hard, glass-clear, weatherable, and rigid enough to be sold as a sheet glazing material. The acrylate with the identical ester, poly(methyl acrylate), is a soft solid at 10&nbsp;&deg;C. Nothing distinguishes them but that methyl.",
    ],
    design: [
      "The ester series behaves the way it does in the acrylates, just displaced upward. Poly(methyl methacrylate) at 105&nbsp;&deg;C falls to poly(ethyl methacrylate) at 65&nbsp;&deg;C, and continues down through the butyl and hexyl esters into the rubbery range. Ring-containing esters push the other way by adding their own stiffness &ndash; poly(cyclohexyl methacrylate) recovers to about 92&nbsp;&deg;C. Polar esters raise T<sub>g</sub> through interchain attraction rather than sterics: poly(2-hydroxyethyl methacrylate) sits at 55&nbsp;&deg;C dry despite a flexible two-carbon ester, and poly(methacrylic acid) reaches 185&nbsp;&deg;C dry because every repeat unit can hydrogen-bond to its neighbour.",
      "The same crowding that raises T<sub>g</sub> also makes methacrylates unusual at high temperature. A methacrylate propagating radical is tertiary and comparatively stabilised, which lowers the propagation rate relative to an acrylate and largely suppresses the backbiting that broadens acrylate distributions &ndash; helpful for controlled polymerisation, and part of why methacrylates were among the first monomers polymerised well by ATRP and RAFT. It also lowers the ceiling temperature. Heated far enough, poly(methyl methacrylate) unzips cleanly back to monomer rather than charring, which is the basis of the depolymerisation route used to recycle acrylic sheet.",
    ],
    related: [
      ["acrylate-polymers.html", "Acrylate polymers &ndash; the same esters without the &alpha;-methyl"],
      ["tg-predictor.html", "Tg predictor &ndash; estimate a copolymer T<sub>g</sub> from these homopolymer values"],
      ["thermal-analysis.html", "Thermal analysis &ndash; measuring these transitions by DSC and DMA"],
    ],
  },
  {
    slug: "silicone-polymers",
    title: "Silicones and siloxanes",
    nav: "Silicones",
    lede: "An inorganic backbone with the lowest glass transition and the highest gas permeability in common use",
    match: e => e.cls === "Ring-opening (silicone)",
    intro: [
      "A siloxane chain is not a carbon backbone at all. Alternating silicon and oxygen atoms, &ndash;[Si(R<sub>2</sub>)&ndash;O]&ndash;, give the family a set of properties no organic polymer matches, and the reasons are all geometric. The Si&ndash;O bond is longer than C&ndash;C (about 1.64&nbsp;&Aring; against 1.54&nbsp;&Aring;), the Si&ndash;O&ndash;Si angle is far wider than a tetrahedral carbon's (roughly 140&deg; against 109.5&deg;), and the barrier to rotation about the bond is close to nothing. The chain is exceptionally limber.",
      "Poly(dimethylsiloxane) shows what that buys. Its glass transition is &minus;125&nbsp;&deg;C &ndash; the lowest of any polymer in ordinary use &ndash; so it stays rubbery through the whole range a terrestrial application will ever see. Its gas permeability is the highest of the common polymers, which is why it turns up as a membrane material and in oxygen-permeable contact lenses. Its surface energy is very low, which is what makes it a release coating, an antifoam, and a mould-making rubber. And the Si&ndash;O bond is strong enough that the family tolerates heat and oxidation that would degrade a hydrocarbon.",
    ],
    design: [
      "Most siloxanes are made by ring-opening the cyclic oligomers rather than by condensing silanols: the tetramer D<sub>4</sub> and trimer D<sub>3</sub> are opened under acid or base catalysis. The distinction matters in practice. Anionic ring-opening of the strained trimer can be run as a living polymerisation and gives a defined molecular weight and narrow distribution; equilibration of the unstrained tetramer instead settles into a thermodynamic mixture of chains and rings, giving a broad product that always contains residual cyclics.",
      "The two substituents on each silicon are where the family diversifies. Replacing methyl with phenyl stiffens the chain, raises the refractive index, and improves radiation resistance. A trifluoropropyl group buys resistance to fuels and hydrocarbon oils that a dimethyl silicone swells in badly. Hydride and vinyl substituents are reactive handles rather than property modifiers: a hydride on silicon adds across a vinyl on another chain under a platinum catalyst, and that hydrosilylation is the addition cure behind most two-part silicone rubbers. Aminopropyl, epoxy and polyether substituents make the chain compatible with organic resins or with water, which is how silicone surfactants and copolymer coatings are built.",
    ],
    related: [
      ["crosslink-density.html", "Crosslink density &ndash; network calculations for cured silicone rubber"],
      ["polymer-search.html", "Structure search &ndash; draw a siloxane repeat unit to identify it"],
      ["chain-dimensions.html", "Chain dimensions &ndash; PDMS is the textbook flexible chain"],
    ],
  },
];

// --- helpers --------------------------------------------------------------
const esc = s => String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;")
  .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Notes are prose written for a reader, so let the few HTML entities they
// contain through, but nothing else.
const escNote = s => esc(s);

const anchorFor = name => "p-" + name.toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Alphabetise the way a chemical index does: on the parent name, ignoring the
// leading "poly" and any locants or stereo descriptors in front of it. Sorting
// on the raw string files poly(2-hydroxyethyl methacrylate) under "2" along
// with every other substituted ester, which puts a quarter of the library in
// one meaningless bucket. Only the unambiguous prefixes are stripped - "iso",
// "d", "l" and friends are left alone because they begin real words too.
function indexKey(name) {
  let k = name.toLowerCase().replace(/^poly[\s(\-]*/, "");
  for (;;) {
    const before = k;
    k = k.replace(/^[\d,'’′\-\s()[\]]+/, "");
    k = k.replace(/^(n|o|s|p|alpha|beta|gamma|omega|cis|trans|tert|sec|ortho|meta|para)[\-,]\s*/, "");
    if (k === before) break;
  }
  return k || name.toLowerCase();
}

const letterFor = name => (indexKey(name).charAt(0).toUpperCase() || "#");

function entryHtml(e) {
  const meta = [];
  if (e.aka && e.aka.length) meta.push(esc(e.aka.join(", ")));
  if (e.cas) meta.push("CAS " + esc(e.cas));
  if (e.monomer) meta.push("from " + esc(e.monomer));
  if (e.tg) meta.push("T<sub>g</sub> " + esc(e.tg));
  if (e.tm) meta.push("T<sub>m</sub> " + esc(e.tm));

  let h = '    <div class="fam-entry" id="' + anchorFor(e.name) + '">\n';
  h += "      <h4>" + esc(e.name) + "</h4>\n";
  if (meta.length) h += '      <p class="fam-meta">' + meta.join(" &middot; ") + "</p>\n";
  if (e.note) h += "      <p>" + escNote(e.note) + "</p>\n";
  h += "    </div>\n";
  return h;
}

function pageHtml(fam, entries) {
  const url = SITE + fam.slug + ".html";
  const withNote = entries.filter(e => e.note).length;
  const withCas = entries.filter(e => e.cas).length;
  const desc = entries.length + " " + fam.title.toLowerCase() + " with CAS numbers, monomers and "
    + "notes on structure and properties. " + fam.lede.charAt(0).toUpperCase() + fam.lede.slice(1) + ".";

  const letters = [];
  entries.forEach(e => {
    const L = letterFor(e.name);
    if (letters.indexOf(L) === -1) letters.push(L);
  });

  let h = "";
  h += "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n";
  h += '<meta charset="UTF-8">\n';
  h += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  h += "<title>" + esc(fam.title) + ": PolyTechniques</title>\n";
  h += '<meta name="description" content="' + esc(desc) + '">\n';
  h += '<link rel="canonical" href="' + url + '">\n';
  h += '<meta property="og:type" content="article">\n';
  h += '<meta property="og:site_name" content="PolyTechniques">\n';
  h += '<meta property="og:title" content="' + esc(fam.title) + ': PolyTechniques">\n';
  h += '<meta property="og:description" content="' + esc(desc) + '">\n';
  h += '<meta property="og:url" content="' + url + '">\n';
  h += '<meta property="og:image" content="' + SITE + 'og-image.png">\n';
  h += '<meta property="og:image:width" content="1200">\n';
  h += '<meta property="og:image:height" content="628">\n';
  h += '<meta name="twitter:card" content="summary_large_image">\n';
  h += '<meta name="twitter:title" content="' + esc(fam.title) + ': PolyTechniques">\n';
  h += '<meta name="twitter:description" content="' + esc(desc) + '">\n';
  h += '<meta name="twitter:image" content="' + SITE + 'og-image.png">\n';
  h += '<script type="application/ld+json">\n' + JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fam.title,
    url: url,
    description: desc,
    author: { "@type": "Person", name: "Nicholas Pierini" },
    publisher: { "@type": "Organization", name: "PolyTechniques" },
  }, null, 2) + "\n<\/script>\n";
  h += '<script src="theme.js?v=1"><\/script>\n';
  h += '<script src="nav.js?v=23" defer><\/script>\n';
  h += '<link rel="icon" type="image/svg+xml" href="favicon.svg">\n';
  h += '<link rel="manifest" href="manifest.json">\n';
  h += '<meta name="theme-color" content="#5b8def">\n';
  h += '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n';
  h += '<link rel="stylesheet" href="style.css?v=81">\n';
  h += '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9553775926809206" crossorigin="anonymous"><\/script>\n';
  h += "</head>\n<body>\n\n";

  h += '<header class="topbar">\n  <div class="topbar-inner topbar-row">\n    <div>\n';
  h += "      <h1>" + esc(fam.title) + "</h1>\n";
  h += '      <p class="subtitle">' + fam.lede + "</p>\n";
  h += "    </div>\n  </div>\n</header>\n\n";

  h += '<main id="guide">\n\n';

  // Introduction - the hand-written part.
  h += '  <div class="card">\n    <h3>About this family</h3>\n';
  fam.intro.forEach(p => { h += "    <p>" + p + "</p>\n"; });
  h += "  </div>\n\n";

  h += '  <div class="card">\n    <h3>What sets the properties</h3>\n';
  fam.design.forEach(p => { h += "    <p>" + p + "</p>\n"; });
  h += "  </div>\n\n";

  // The library itself.
  h += '  <div class="card">\n';
  h += "    <h3>All " + entries.length + " in the library</h3>\n";
  h += '    <p class="guide-note">Sorted by parent name, ignoring the leading "poly" and any locants &ndash; so '
    + "poly(2-hydroxyethyl methacrylate) files under H. " + withNote + " of the " + entries.length
    + " carry a note, and every one is searchable by drawn structure on the "
    + '<a href="polymer-search.html">structure search</a> page. ' + withCas + " have a CAS registry number "
    + "for the <em>polymer</em>; most specialty polymers have never been assigned one, and the number you find "
    + "in a catalogue is usually the monomer's, which is why the field is blank rather than borrowed here.</p>\n";
  h += '    <p class="fam-index">' + letters.map(L =>
    '<a href="#letter-' + L + '">' + L + "</a>").join(" ") + "</p>\n";
  h += "  </div>\n\n";

  let lastLetter = null;
  entries.forEach(e => {
    const L = letterFor(e.name);
    if (L !== lastLetter) {
      if (lastLetter !== null) h += "  </div>\n\n";
      h += '  <div class="card" id="letter-' + L + '">\n';
      h += "    <h3>" + L + "</h3>\n";
      lastLetter = L;
    }
    h += entryHtml(e);
  });
  if (lastLetter !== null) h += "  </div>\n\n";

  // Cross-links.
  h += '  <div class="card">\n    <h3>Related</h3>\n    <ul>\n';
  fam.related.forEach(([href, label]) => {
    h += '      <li><a href="' + href + '">' + label + "</a></li>\n";
  });
  h += "    </ul>\n  </div>\n\n";

  h += "</main>\n\n";
  h += '<footer class="footer">\n  <p>Structures and registry numbers are curated by hand and checked in CI; '
    + 'thermal values are typical literature figures for the ordinary form of each polymer, not specifications. '
    + 'Report an error on the <a href="founder.html">contact page</a>.</p>\n</footer>\n\n';
  h += '<script>\nif ("serviceWorker" in navigator) {\n'
    + '  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }); });\n'
    + "}\n<\/script>\n</body>\n</html>\n";
  return h;
}

// The hub. One nav entry has to stand in for the whole set, and a reader who
// does not already know whether their polymer is a "step-growth polyester" or a
// "ring-opening" one needs somewhere to start.
function hubHtml(groups) {
  const total = groups.reduce((a, g) => a + g.entries.length, 0);
  const url = SITE + "polymer-families.html";
  const desc = "A reference to " + total + " polymers grouped by chemical family - acrylates, "
    + "methacrylates, silicones and more - each with CAS numbers, monomers, thermal data and notes on structure and properties.";

  let h = "";
  h += "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n";
  h += '<meta charset="UTF-8">\n';
  h += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  h += "<title>Polymer families: PolyTechniques</title>\n";
  h += '<meta name="description" content="' + esc(desc) + '">\n';
  h += '<link rel="canonical" href="' + url + '">\n';
  h += '<meta property="og:type" content="website">\n';
  h += '<meta property="og:site_name" content="PolyTechniques">\n';
  h += '<meta property="og:title" content="Polymer families: PolyTechniques">\n';
  h += '<meta property="og:description" content="' + esc(desc) + '">\n';
  h += '<meta property="og:url" content="' + url + '">\n';
  h += '<meta property="og:image" content="' + SITE + 'og-image.png">\n';
  h += '<meta property="og:image:width" content="1200">\n';
  h += '<meta property="og:image:height" content="628">\n';
  h += '<meta name="twitter:card" content="summary_large_image">\n';
  h += '<meta name="twitter:title" content="Polymer families: PolyTechniques">\n';
  h += '<meta name="twitter:description" content="' + esc(desc) + '">\n';
  h += '<meta name="twitter:image" content="' + SITE + 'og-image.png">\n';
  h += '<script src="theme.js?v=1"><\/script>\n';
  h += '<script src="nav.js?v=23" defer><\/script>\n';
  h += '<link rel="icon" type="image/svg+xml" href="favicon.svg">\n';
  h += '<link rel="manifest" href="manifest.json">\n';
  h += '<meta name="theme-color" content="#5b8def">\n';
  h += '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n';
  h += '<link rel="stylesheet" href="style.css?v=81">\n';
  h += '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9553775926809206" crossorigin="anonymous"><\/script>\n';
  h += "</head>\n<body>\n\n";

  h += '<header class="topbar">\n  <div class="topbar-inner topbar-row">\n    <div>\n';
  h += "      <h1>Polymer families</h1>\n";
  h += '      <p class="subtitle">' + total + " polymers grouped by the chemistry that makes them</p>\n";
  h += "    </div>\n  </div>\n</header>\n\n";

  h += '<main id="guide">\n\n';
  h += '  <div class="card">\n    <h3>How this is organised</h3>\n';
  h += "    <p>The library behind the <a href=\"polymer-search.html\">structure search</a> holds "
    + DB.length + " polymers. These pages lay it out by family, so you can read a whole class at once "
    + "rather than querying it one structure at a time &ndash; useful when you are choosing between "
    + "esters in a series, or want to see what else shares a backbone with the polymer you have.</p>\n";
  h += "    <p>Grouping is by polymerisation chemistry rather than by application, because that is what "
    + "the structure&ndash;property arguments actually turn on: every acrylate answers to the same rules "
    + "about ester length and backbone rotation, whether it ends up in an adhesive or a photoresist. "
    + "Each polymer appears on exactly one page.</p>\n";
  h += "  </div>\n\n";

  h += '  <div class="card">\n    <h3>Families</h3>\n';
  groups.forEach(g => {
    h += '    <div class="fam-entry">\n';
    h += '      <h4><a href="' + g.fam.slug + '.html">' + esc(g.fam.title) + "</a></h4>\n";
    h += '      <p class="fam-meta">' + g.entries.length + " polymers</p>\n";
    h += "      <p>" + g.fam.lede + ".</p>\n";
    h += "    </div>\n";
  });
  h += "  </div>\n\n";

  h += '  <div class="card">\n    <h3>Related</h3>\n    <ul>\n';
  h += '      <li><a href="polymer-search.html">Structure search</a> &ndash; draw a repeat unit and identify it against this library</li>\n';
  h += '      <li><a href="glossary.html">Glossary</a> &ndash; the terms used throughout these pages</li>\n';
  h += '      <li><a href="mechanisms.html">Mechanisms</a> &ndash; how each polymerisation in this list actually runs</li>\n';
  h += "    </ul>\n  </div>\n\n";

  h += "</main>\n\n";
  h += '<footer class="footer">\n  <p>Structures and registry numbers are curated by hand and checked in CI. '
    + 'Report an error on the <a href="founder.html">contact page</a>.</p>\n</footer>\n\n';
  h += '<script>\nif ("serviceWorker" in navigator) {\n'
    + '  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }); });\n'
    + "}\n<\/script>\n</body>\n</html>\n";
  return h;
}

// --- build ----------------------------------------------------------------
const problems = [];

// The partition has to be strict, or these pages create the duplicate content
// they are meant to cure.
const owner = new Map();
FAMILIES.forEach(fam => {
  DB.filter(fam.match).forEach(e => {
    if (owner.has(e.name)) {
      problems.push('"' + e.name + '" is claimed by both ' + owner.get(e.name) + " and " + fam.slug);
    }
    owner.set(e.name, fam.slug);
  });
});

// Every Tg or Tm quoted in the prose must still be what the entry says.
const CITED = [
  ["Poly(methyl acrylate)", "tg", "10 °C"],
  ["Poly(ethyl acrylate)", "tg", "-24 °C"],
  ["Poly(methyl methacrylate)", "tg", "105 °C"],
  ["Poly(ethyl methacrylate)", "tg", "65 °C"],
  ["Poly(cyclohexyl methacrylate)", "tg", "~92 °C"],
  ["Poly(2-hydroxyethyl methacrylate)", "tg", "55 °C"],
  ["Poly(methacrylic acid)", "tg", "185 °C (dry)"],
  ["Poly(dimethylsiloxane)", "tg", "-125 °C"],
];
CITED.forEach(([name, field, expect]) => {
  const e = DB.find(x => x.name === name);
  if (!e) { problems.push("prose cites " + name + ", which is not in the library"); return; }
  if (e[field] !== expect) {
    problems.push("prose cites " + name + " " + field + "=" + expect + ", but the data says " + e[field]);
  }
});

let changed = 0;
const written = [];
const groups = [];

function emit(slug, html) {
  const file = path.join(ROOT, slug + ".html");
  const old = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (old !== html) {
    changed++;
    if (!CHECK) fs.writeFileSync(file, html);
  }
}

FAMILIES.forEach(fam => {
  const entries = DB.filter(fam.match).slice().sort((a, b) => {
    const ka = indexKey(a.name), kb = indexKey(b.name);
    if (ka !== kb) return ka < kb ? -1 : 1;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
  if (!entries.length) { problems.push(fam.slug + " matched no entries"); return; }
  groups.push({ fam, entries });
  written.push([fam.slug, entries.length]);
  emit(fam.slug, pageHtml(fam, entries));
});

emit("polymer-families", hubHtml(groups));

if (problems.length) {
  console.error("build-family-pages: " + problems.length + " problem(s)");
  problems.forEach(p => console.error("  - " + p));
  process.exit(1);
}

written.forEach(([slug, n]) => {
  console.log("  " + slug.padEnd(24) + String(n).padStart(4) + " entries");
});
console.log("  " + "polymer-families".padEnd(24) + "   (hub)");

if (CHECK) {
  if (changed) {
    console.error("\n" + changed + " family page(s) are out of date with polymer-data.js.");
    console.error("Run: node scripts/build-family-pages.js");
    process.exit(1);
  }
  console.log("\nAll " + FAMILIES.length + " family pages are current.");
} else {
  console.log("\n" + FAMILIES.length + " family pages written (" + changed + " changed).");
}
