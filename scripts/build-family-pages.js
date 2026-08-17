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
  {
    slug: "vinyl-polymers",
    title: "Vinyl polymers",
    nav: "Vinyl",
    lede: "One backbone, every property &ndash; what hangs off the chain decides whether you get a bag, a pipe, or a non-stick pan",
    // "Copolymer (addition, diene)" also matches the loose prefix, and SBR and
    // nitrile rubber are diene rubbers whatever else they contain, so the diene
    // page claims them.
    match: e => e.cls === "Addition (vinyl)" || e.cls === "Copolymer (addition)"
      || e.cls === "Copolymer (addition, vinyl)" || e.cls === "Terpolymer (addition)"
      || e.cls === "Addition (alkyne)",
    intro: [
      "Every polymer on this page is built the same way: a carbon&ndash;carbon double bond opens and adds to the growing chain, leaving a saturated &ndash;CH<sub>2</sub>&ndash;CHX&ndash; backbone behind. The backbone is therefore identical in all of them. Everything that distinguishes polyethylene from PVC from PTFE is the substituent X, and the span that one variable covers is the widest in polymer science &ndash; from a material that melts at 130&nbsp;&deg;C and is sold by the tonne as film, to one that survives 327&nbsp;&deg;C and nothing sticks to.",
      "The commodity plastics cluster here because the chemistry is cheap and tolerant: free-radical initiation, no rigorous exclusion of water, monomers that come straight off a cracker. That is also why the family is where most controlled-polymerisation methods were developed and tested, and why so many of the entries below are specialty monomers made to give a familiar backbone one unfamiliar property.",
    ],
    design: [
      "Three things about the substituent set the properties. Size and stiffness govern T<sub>g</sub>: hydrogen leaves the chain free to rotate and polyethylene sits at &minus;110&nbsp;&deg;C, a methyl group raises polypropylene to &minus;10&nbsp;&deg;C, and a phenyl ring raises polystyrene to 100&nbsp;&deg;C. Polarity adds interchain attraction on top &ndash; chlorine is not much larger than a methyl group, but poly(vinyl chloride) reaches 80&nbsp;&deg;C because the C&ndash;Cl dipoles pull neighbouring chains together. Hydrogen bonding does more again: poly(vinyl alcohol) reaches 85&nbsp;&deg;C and poly(N-vinylpyrrolidone) 175&nbsp;&deg;C dry.",
      "Regularity decides whether the polymer can crystallise at all, and that is a question about stereochemistry rather than about the substituent. Any carbon carrying X is a stereocentre, so an ordinary radical polymerisation gives an atactic chain that cannot pack &ndash; which is why commercial polystyrene is a transparent glass with no melting point, while the isotactic form crystallises. Polypropylene is the commercial case that matters: atactic polypropylene is a tacky material of no structural use, and isotactic polypropylene, melting at 165&nbsp;&deg;C, is one of the most-produced plastics on earth. Nothing separates them but the arrangement of successive units.",
      "Two entries here are made by a route the drawing does not reveal. Poly(vinyl alcohol) cannot be made from vinyl alcohol, which tautomerises to acetaldehyde faster than it could ever polymerise; it is made by polymerising vinyl acetate and then hydrolysing the ester, so the degree of hydrolysis is a formulation variable and commercial grades are really vinyl alcohol&ndash;vinyl acetate copolymers. Fluorinated members behave unusually for a different reason: fluorine is small enough not to disrupt the chain but forms a continuous sheath around it, which is why polytetrafluoroethylene melts at 327&nbsp;&deg;C, dissolves in nothing, and has the lowest surface energy of any bulk polymer.",
    ],
    related: [
      ["radical-kinetics.html", "FRP kinetics &ndash; rate and chain length for these monomers"],
      ["diene-elastomers.html", "Diene elastomers &ndash; the addition polymers that keep a double bond"],
      ["mechanisms.html", "Mechanisms &ndash; how radical, ATRP and RAFT polymerisation of these monomers runs"],
    ],
  },
  {
    slug: "diene-elastomers",
    title: "Diene elastomers",
    nav: "Dienes",
    lede: "The rubbers &ndash; and the reason natural rubber and gutta-percha, chemically identical, are a tyre and a golf ball shell",
    match: e => e.cls === "Addition (diene)" || e.cls === "Copolymer (addition, diene)",
    intro: [
      "A 1,3-diene has two double bonds, and polymerisation consumes only one of them. Add across carbons 1 and 4 and the remaining double bond ends up in the backbone; add across 1 and 2 and it ends up as a pendant vinyl group. Every polymer on this page therefore keeps unsaturation that the vinyl polymers do not have, and that surviving double bond is the whole story of the family &ndash; it is what lets these materials be vulcanised into rubbers, and it is also what makes them age.",
      "The double bond in the chain has a geometry, and the difference between the two options is startling. <em>cis</em>-1,4-polyisoprene has a glass transition of &minus;70&nbsp;&deg;C and melts at 28&nbsp;&deg;C: it is natural rubber, soft and highly elastic at room temperature. <em>trans</em>-1,4-polyisoprene is gutta-percha, a hard horn-like solid that melts at 74&nbsp;&deg;C. The molecular formula, the repeat unit, and the molecular weight can all be identical. The <em>cis</em> kink prevents the chain from packing; the <em>trans</em> chain is straight and crystallises readily.",
    ],
    design: [
      "The same split runs through polybutadiene. The <em>cis</em>-1,4 polymer has a T<sub>g</sub> of &minus;100&nbsp;&deg;C, the lowest of the hydrocarbon rubbers and the reason it is blended into tyre treads for cold-weather grip; the <em>trans</em>-1,4 polymer sits at &minus;83&nbsp;&deg;C and melts at 145&nbsp;&deg;C, behaving like a semicrystalline plastic instead. Controlling that ratio &ndash; and the fraction of 1,2 addition alongside it &ndash; is the central problem of diene polymerisation, and is why the catalyst matters far more here than in an ordinary vinyl polymerisation. Substituting the diene shifts the whole set: the chlorine in polychloroprene raises T<sub>g</sub> to &minus;43&nbsp;&deg;C and buys the oil and weather resistance that makes it a sealant and wetsuit rubber.",
      "Because the backbone double bonds survive, these polymers can be crosslinked through them, which is what vulcanisation does &ndash; sulfur bridges struck between chains at the alkene sites, converting a tacky flowing material into an elastic network. A rubber's useful properties are properties of that network rather than of the chain, so crosslink density, not molecular weight, is the design variable. The same reactivity is the family's weakness: an alkene is attacked by ozone and by oxygen, so diene rubbers crack and harden on exposure unless they are protected by antiozonants, and the saturated elastomers on other pages exist largely to sidestep that.",
    ],
    related: [
      ["crosslink-density.html", "Crosslink density &ndash; the network calculations behind a vulcanisate"],
      ["vinyl-polymers.html", "Vinyl polymers &ndash; the addition polymers with no double bond left over"],
      ["block-copolymers.html", "Block copolymers &ndash; SBS and the thermoplastic elastomers built from these blocks"],
    ],
  },
  {
    slug: "polyesters",
    title: "Polyesters",
    nav: "Polyesters",
    lede: "An ester in the backbone &ndash; rigid enough for a bottle, hydrolysable enough for a dissolving suture",
    match: e => e.cls === "Step-growth (polyester)" || e.cls === "Copolymer (ring-opening, polyester)",
    intro: [
      "A polyester carries the ester group &ndash;C(=O)O&ndash; in the main chain rather than hanging off it, which is the distinction that separates this family from the acrylates. Put the linkage in the backbone and it stops being a side group that modifies the chain and becomes a structural member of it: every property below follows from what sits between successive esters, and from the fact that the linkage itself can be hydrolysed apart.",
      "Most of these are made by step-growth &ndash; a diol and a diacid (or its ester) condensed with removal of water or a small alcohol. That mechanism has consequences the chain-growth families do not share. High molecular weight arrives only at very high conversion, so stoichiometry has to be near-exact and the condensate has to be stripped continuously; and because the reaction is an equilibrium, it also runs backwards. Wet poly(ethylene terephthalate) melt-processed without drying will hydrolyse in the extruder and come out with a lower molecular weight than it went in with, which is why drying is not an optional step.",
    ],
    design: [
      "Backbone rigidity sets the thermal properties, and an aromatic ring is the stiffest thing you can put between two esters. Poly(ethylene terephthalate) has a T<sub>g</sub> of 75&nbsp;&deg;C and melts at 260&nbsp;&deg;C; replace the benzene with the larger fused naphthalene unit and poly(ethylene naphthalate) rises to 120&nbsp;&deg;C and 265&nbsp;&deg;C. Take the ring out entirely and everything collapses: poly(ethylene adipate), an all-aliphatic polyester of the same ester density, has a T<sub>g</sub> of &minus;50&nbsp;&deg;C and melts at 50&nbsp;&deg;C. That is the whole aromatic&ndash;aliphatic divide in the family, and it is why the aromatic polyesters are engineering plastics and fibres while the aliphatic ones are soft segments, adhesives and degradable materials.",
      "Lengthening the diol softens the chain without changing the chemistry, and does something more useful besides. Poly(butylene terephthalate) sits at 40&nbsp;&deg;C and 225&nbsp;&deg;C against PET's 75 and 260 &ndash; but the extra flexibility also lets it crystallise far faster, which is why PBT is the injection-moulding grade and PET, which can be quenched to a clear amorphous solid, is the bottle and fibre grade. The same two polymers, differing by two methylene groups, end up in entirely different processes for reasons of crystallisation kinetics rather than of equilibrium properties.",
      "The ester link is hydrolysable, and that is a feature as often as a liability. It is why the aliphatic polyesters dominate degradable medicine &ndash; polylactide, polyglycolide, poly(caprolactone) and their copolymers, whose degradation rate is tuned by the ratio &ndash; and why polyester-based polyurethane soft segments fail in humid service where a polyether would survive. Those lactone-derived polyesters are made by ring-opening rather than condensation and so live on the <a href=\"ring-opening-polymers.html\">ring-opening page</a>, even though the linkage is identical.",
    ],
    related: [
      ["ring-opening-polymers.html", "Ring-opening polymers &ndash; the lactone route to the same ester linkage"],
      ["polyamides.html", "Polyamides &ndash; the same step-growth with an amide in place of the ester"],
      ["calculator.html#sg", "Step-growth calculator &ndash; conversion, stoichiometry and the gel point"],
    ],
  },
  {
    slug: "polyamides",
    title: "Polyamides",
    nav: "Polyamides",
    lede: "Hydrogen bonds across every repeat unit &ndash; the nylons, and why they take up water",
    match: e => e.cls === "Step-growth (polyamide)" || e.cls === "Ring-opening (polyamide)",
    intro: [
      "Swap the oxygen of a polyester's ester for an N&ndash;H and you have a polyamide, and the properties change out of all proportion to the size of the edit. An ester oxygen accepts hydrogen bonds; an amide N&ndash;H both accepts and donates. Every repeat unit can therefore tie itself to the chain alongside it, and a polyamide behaves as though it were lightly crosslinked in a way the corresponding polyester is not. Nylon 6,6 melts at 265&nbsp;&deg;C where poly(hexamethylene adipate), the polyester with the identical carbon skeleton, is a low-melting wax.",
      "That interchain bonding is the source of everything the nylons are used for &ndash; the melting points, the toughness, the abrasion resistance that puts them in gears and bearings, and the tensile strength that made nylon a fibre before it was a plastic. It is also the source of the one property that has to be designed around, because water hydrogen-bonds too.",
    ],
    design: [
      "The numbering encodes the synthesis. A single number &ndash; nylon 6, nylon 11, nylon 12 &ndash; means an AB monomer, one molecule carrying both an amine and an acid (or the lactam that ring-opens to it), so the chain is built from one feedstock and stoichiometry looks after itself. Two numbers &ndash; nylon 6,6, nylon 6,10 &ndash; mean an AABB pair, a diamine of the first count condensed with a diacid of the second, where the ratio has to be controlled precisely for the chain to grow. The digits are simply the carbon counts.",
      "Amide density sets the thermal properties, and diluting it with hydrocarbon lowers everything together. Nylon 6 melts at 220&nbsp;&deg;C and nylon 6,6 at 265&nbsp;&deg;C; stretch the diacid and nylon 6,10 falls to 215&nbsp;&deg;C; go to the long single-monomer nylons and nylon 11 melts at 190&nbsp;&deg;C and nylon 12 at 178&nbsp;&deg;C. The glass transitions move far less &ndash; they sit in a narrow band from about 41&nbsp;&deg;C to 57&nbsp;&deg;C across that whole range &ndash; because T<sub>g</sub> reflects local backbone mobility while T<sub>m</sub> reflects how well the crystal packs.",
      "The same hydrogen bonds absorb water from the air, and absorbed water sits between chains and plasticises them. A dry nylon 6,6 moulding and the same moulding conditioned to equilibrium in a humid room are measurably different materials: the conditioned one is tougher and less brittle but lower in modulus and dimensionally larger. Nylons are therefore specified conditioned rather than dry, and the long-chain nylons 11 and 12 are chosen where dimensional stability matters precisely because their lower amide density takes up much less water. The aromatic polyamides at the far end of the family &ndash; the aramids &ndash; hydrogen-bond so effectively between rigid rods that they do not melt at all and have to be spun from solution.",
    ],
    related: [
      ["polyesters.html", "Polyesters &ndash; the same step-growth with an ester in place of the amide"],
      ["calculator.html#sg", "Step-growth calculator &ndash; conversion, stoichiometry and the gel point"],
      ["thermal-analysis.html", "Thermal analysis &ndash; measuring T<sub>m</sub> and crystallinity by DSC"],
    ],
  },
  {
    slug: "ring-opening-polymers",
    title: "Polyethers, lactones and other ring-opening polymers",
    nav: "Ring-opening",
    lede: "Strain in a ring, spent to build a chain &ndash; and the route to almost every end-functional prepolymer",
    match: e => e.cls === "Ring-opening",
    intro: [
      "Ring-opening polymerisation gets its driving force from somewhere the other families do not: the strain in a cyclic monomer. Open a three-membered epoxide or a four-membered lactone and the relief of bond-angle strain pays for the polymerisation, which is why these reactions run under mild conditions and why ring size predicts reactivity so well. Five- and six-membered rings are nearly strain-free and are correspondingly reluctant &ndash; six-membered lactones barely polymerise at all, while the strained three- and four-membered rings go readily.",
      "The linkages produced are not new. A lactone opens to an ester, so poly(caprolactone) and polylactide are polyesters by a different route; an oxazoline opens to an amide. What ring-opening changes is the control you get on the way there, and that is the reason this family carries most of the library's prepolymers.",
    ],
    design: [
      "Many of these polymerisations can be run as living systems, with every chain initiated at once and no inherent termination. That gives a narrow distribution and, more usefully, a chain end that is still active when the monomer runs out &ndash; so molecular weight is set by the monomer-to-initiator ratio, blocks can be added in sequence, and the ends can be capped with whatever functional group the next step needs. Nearly every telechelic and multi-arm prepolymer in this library comes from here for that reason: the poly(ethylene glycol) diols, thiols, azides, maleimides and 4- and 8-arm stars used to build hydrogels are all ring-opened ethylene oxide with a defined end group installed deliberately.",
      "Backbone flexibility across the family is unusually high, because an ether oxygen in the chain has a low rotational barrier and no substituent at all. Poly(ethylene oxide) has a T<sub>g</sub> of &minus;60&nbsp;&deg;C and melts at 65&nbsp;&deg;C; poly(tetrahydrofuran), with three more methylenes between oxygens, falls to &minus;84&nbsp;&deg;C. Symmetry decides whether the chain crystallises: poly(ethylene oxide) is regular and crystalline, while poly(propylene oxide) &ndash; identical but for a methyl on every repeat, which also creates a stereocentre &ndash; is an amorphous liquid at the same T<sub>g</sub>. That pairing is why PEO is the water-soluble crystalline block and PPO the hydrophobic amorphous one in the Pluronic surfactants.",
      "Poly(ethylene oxide) is also the family's naming trap. Above roughly 20,000&nbsp;g/mol it is conventionally called poly(ethylene oxide) and below it poly(ethylene glycol), for the same polymer &ndash; the older name simply reflects that short chains were made as glycols. Both names appear in this library against the entries the trade uses them for.",
    ],
    related: [
      ["polyesters.html", "Polyesters &ndash; the condensation route to the same ester linkage"],
      ["block-copolymers.html", "Block copolymers &ndash; what living ring-opening is usually used to build"],
      ["crosslink-density.html", "Crosslink density &ndash; network calculations for PEG hydrogels"],
    ],
  },
  {
    slug: "conjugated-polymers",
    title: "Conjugated and high-performance polymers",
    nav: "Conjugated",
    lede: "Aromatic rings linked ring-to-ring &ndash; conduct electricity if the conjugation is continuous, survive 300 &deg;C if it is not",
    match: e => e.cls === "Step-growth (coupling)" || !e.cls,
    intro: [
      "The polymers here are built by joining aromatic rings to each other rather than by adding across a double bond, and the resulting backbone is a chain of rings instead of a chain of sp<sup>3</sup> carbons. That makes them stiff, and stiffness is what they have in common. What separates them into two very different technologies is whether the connection between rings preserves conjugation.",
      "Link the rings directly, carbon to carbon, and the p-orbitals overlap continuously along the chain. The result is a delocalised &pi; system running the length of the backbone &ndash; a one-dimensional semiconductor, which on oxidation or reduction becomes a conductor. That discovery, on doped polyacetylene, took the 2000 Nobel Prize in Chemistry. Put an oxygen, a sulfur or a sulfone between the rings instead and the conjugation is broken at every linkage: the chain keeps the rigidity and the thermal stability but is an insulator. Those are the high-performance engineering thermoplastics, and they occupy the other half of this page.",
    ],
    design: [
      "The conducting members share one practical problem: a rigid, planar, strongly interacting backbone is neither soluble nor fusible, and unsubstituted polythiophene or poly(<em>p</em>-phenylene) is an intractable powder. Nearly every processable conjugated polymer in this list is therefore a substituted one, where flexible side chains have been hung off the ring for no electronic reason at all &ndash; poly(3-hexylthiophene) is the canonical case, and the alkyl series from butyl to dodecyl here maps how much solubilising chain is needed against how much it dilutes the active material. Poly(3,4-ethylenedioxythiophene) solves the same problem differently, dispersed as a complex with a polyanion to give the transparent conductor used in displays and antistatic coatings. Polyaniline is the outlier: it is switched between insulating and conducting forms by protonation rather than by redox doping, so its conductivity depends on pH.",
      "The non-conjugated half trades that electronic behaviour for temperature. Poly(ether ether ketone) melts at 343&nbsp;&deg;C with a T<sub>g</sub> of 143&nbsp;&deg;C, and is semicrystalline, so it keeps useful stiffness well above the glass transition &ndash; the reason it is machined into aerospace and implant components. Poly(<em>p</em>-phenylene sulfide) melts at 285&nbsp;&deg;C and crystallises readily. The amorphous members go higher in T<sub>g</sub> but have no crystal to fall back on: poly(ether sulfone) reaches 225&nbsp;&deg;C and poly(2,6-dimethyl-1,4-phenylene oxide) 210&nbsp;&deg;C, both transparent and both used up to but not beyond that transition. In each case the aryl rings supply the rigidity and the linking heteroatom supplies just enough rotational freedom to let the polymer be processed at all.",
    ],
    related: [
      ["thermal-analysis.html", "Thermal analysis &ndash; measuring these transitions by DSC and DMA"],
      ["polymer-search.html", "Structure search &ndash; draw a conjugated repeat unit to identify it"],
      ["mechanisms.html", "Mechanisms &ndash; the coupling polymerisations that build these chains"],
    ],
  },
  {
    slug: "block-copolymers",
    title: "Block copolymers",
    nav: "Blocks",
    lede: "Two incompatible polymers tied together, unable to separate &ndash; so they organise instead",
    match: e => /^Block copolymer|^Segmented block/.test(e.cls || ""),
    intro: [
      "Almost all pairs of polymers are immiscible. Blend two of them and they separate into domains large enough to see, and the blend is weak at every interface. Join the same two chemistries end to end with a covalent bond and they still try to separate &ndash; but a junction point cannot travel, so the separation can only run as far as the length of a single chain. What would have been a macroscopic phase split becomes microphase separation, into domains of ten to a hundred nanometres.",
      "That constraint is the whole subject. A block copolymer gives you both chemistries in one material, at a domain size set by molecular weight and a morphology set by composition, arranged periodically without anyone having to pattern it.",
    ],
    design: [
      "Which morphology you get is governed by the volume fraction of the blocks: a small minority block forms spheres in a matrix of the major block, a larger one forms hexagonally packed cylinders, and a roughly equal split gives alternating lamellae, with the gyroid appearing in between. Whether the material orders at all is governed by the product of the interaction parameter and the degree of polymerisation &ndash; strongly incompatible blocks separate at low molecular weight, marginally incompatible ones need long chains or will simply mix.",
      "The engineering payoff is clearest in the thermoplastic elastomers. In a glassy&ndash;rubbery&ndash;glassy triblock such as styrene&ndash;butadiene&ndash;styrene, the polystyrene end blocks collect into hard domains that anchor both ends of every rubbery midblock, so the material behaves as a crosslinked elastomer at room temperature. The difference from a vulcanised rubber is that these crosslinks are physical: heat the material above the polystyrene glass transition and the domains soften, the network dissolves, and it flows and can be moulded or recycled. Cool it and the network reassembles. The segmented polyurethanes reach the same end by a different architecture, with hard segments that hydrogen-bond rather than vitrify.",
      "In solution the same immiscibility drives self-assembly. An amphiphilic block copolymer in water buries its insoluble block and forms micelles, worms or vesicles depending on the same volume-fraction argument, which is the basis of most polymeric drug carriers here. The Pluronic-type PEO&ndash;PPO&ndash;PEO triblocks add a temperature axis: the propylene oxide block becomes less soluble as it warms, so these solutions gel on heating and liquefy on cooling, the reverse of an ordinary gel.",
    ],
    related: [
      ["ring-opening-polymers.html", "Ring-opening polymers &ndash; the living chemistry these are usually built with"],
      ["calculator.html#block", "Block copolymer builder &ndash; design a two-block recipe"],
      ["bottlebrush-polymers.html", "Bottlebrush polymers &ndash; the other architecture that changes properties without changing chemistry"],
    ],
  },
  {
    slug: "bottlebrush-polymers",
    title: "Bottlebrush polymers",
    nav: "Bottlebrush",
    lede: "A side chain on every backbone unit, crowded enough that the molecule stops behaving like a chain",
    match: e => /^Bottlebrush/.test(e.cls || ""),
    intro: [
      "A bottlebrush carries a polymeric side chain on every repeat unit of its backbone, and the consequence is steric rather than chemical. The side chains are anchored too densely to avoid one another, so they push the backbone straight simply to make room. A linear chain of the same molecular weight is a random coil; a bottlebrush is an extended cylinder whose persistence length is far larger, set by how long and how dense the side chains are rather than by anything about backbone bond angles.",
      "Nothing about the chemistry has changed &ndash; a poly(lactide) bottlebrush is made of the same ester as a linear poly(lactide). The architecture alone changes the physics, which is what makes this family interesting: it is a way to reach properties that are not otherwise available from the monomers you already have.",
    ],
    design: [
      "The most useful consequence is that bottlebrushes barely entangle. Entanglement requires chains to thread past one another, and a thick, stiff cylinder cannot easily thread through its neighbours, so the entanglement molecular weight rises by orders of magnitude. A melt or network of bottlebrushes is therefore far softer than the same chemistry linear and crosslinked &ndash; soft enough to reach the moduli of biological tissue without adding any solvent, where a conventional elastomer would have to be swollen with oil that can leach out. That is the basis of the supersoft and solvent-free elastomer entries here.",
      "The other consequence is size. Because the molecule is a cylinder tens of nanometres across, bottlebrush block copolymers microphase-separate at a spacing comparable to the wavelength of visible light, and self-assemble into photonic materials that reflect colour structurally rather than by pigment. The same bulk means a single molecule can carry a large, defined payload, which is what the drug-delivery and nucleic-acid conjugates in this list use it for.",
      "Three synthetic routes appear here and the distinction matters when you read the entries. Grafting-through polymerises a macromonomer that already carries the side chain, most often by ROMP, and so guarantees exactly one side chain per backbone unit &ndash; the reason it dominates when the architecture has to be well defined. Grafting-from grows the side chains out of a backbone carrying an initiator on every unit, usually by ATRP, which reaches higher backbone molecular weights but leaves the grafting density to be measured rather than assumed. Grafting-to attaches finished chains to a reactive backbone, and is limited by how crowded the surface becomes as the reaction proceeds.",
    ],
    related: [
      ["block-copolymers.html", "Block copolymers &ndash; microphase separation in the linear case"],
      ["chain-dimensions.html", "Chain dimensions &ndash; persistence length and coil size for linear chains"],
      ["polymer-search.html", "Structure search &ndash; draw a bracketed side chain to search these"],
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
  h += '<link rel="stylesheet" href="style.css?v=87">\n';
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
  h += '<link rel="stylesheet" href="style.css?v=87">\n';
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
  // vinyl
  ["Polyethylene", "tg", "-110 °C"],
  ["Polyethylene", "tm", "130 °C (HDPE)"],
  ["Polypropylene", "tg", "-10 °C"],
  ["Polypropylene", "tm", "165 °C (isotactic)"],
  ["Polystyrene", "tg", "100 °C"],
  ["Poly(vinyl chloride)", "tg", "80 °C"],
  ["Poly(vinyl alcohol)", "tg", "85 °C"],
  ["Poly(N-vinylpyrrolidone)", "tg", "175 °C (dry)"],
  ["Polytetrafluoroethylene", "tm", "327 °C"],
  // dienes
  ["Polyisoprene (cis-1,4)", "tg", "-70 °C"],
  ["Polyisoprene (cis-1,4)", "tm", "28 °C"],
  ["Polyisoprene (trans-1,4)", "tm", "74 °C"],
  ["Polybutadiene (cis-1,4)", "tg", "-100 °C"],
  ["Polybutadiene (trans-1,4)", "tg", "-83 °C"],
  ["Polybutadiene (trans-1,4)", "tm", "145 °C"],
  ["Polychloroprene", "tg", "-43 °C"],
  // polyesters
  ["Poly(ethylene terephthalate)", "tg", "75 °C"],
  ["Poly(ethylene terephthalate)", "tm", "260 °C"],
  ["Poly(ethylene naphthalate)", "tg", "120 °C"],
  ["Poly(ethylene naphthalate)", "tm", "265 °C"],
  ["Poly(ethylene adipate)", "tg", "-50 °C"],
  ["Poly(ethylene adipate)", "tm", "50 °C"],
  ["Poly(butylene terephthalate)", "tg", "40 °C"],
  ["Poly(butylene terephthalate)", "tm", "225 °C"],
  // polyamides
  ["Nylon 6", "tm", "220 °C"],
  ["Nylon 6,6", "tm", "265 °C"],
  ["Nylon 6,10", "tm", "215 °C"],
  ["Nylon 11", "tm", "190 °C"],
  ["Nylon 12", "tm", "178 °C"],
  ["Nylon 12", "tg", "41 °C"],
  ["Nylon 6,6", "tg", "57 °C"],
  // ring-opening
  ["Poly(ethylene oxide)", "tg", "-60 °C"],
  ["Poly(ethylene oxide)", "tm", "65 °C"],
  ["Poly(tetrahydrofuran)", "tg", "-84 °C"],
  ["Poly(propylene oxide)", "tg", "-60 °C"],
  // conjugated / high-performance
  ["Poly(ether ether ketone)", "tg", "143 °C"],
  ["Poly(ether ether ketone)", "tm", "343 °C"],
  ["Poly(p-phenylene sulfide)", "tm", "285 °C"],
  ["Poly(ether sulfone)", "tg", "225 °C"],
  ["Poly(2,6-dimethyl-1,4-phenylene oxide)", "tg", "210 °C"],
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
const pending = [];

// Render everything first and write nothing until the whole set has been
// validated. An earlier version wrote as it went and only then reported a
// bad partition, which left the failing run's pages on disk - a build that
// fails and still publishes is worse than one that simply fails.
FAMILIES.forEach(fam => {
  const entries = DB.filter(fam.match).slice().sort((a, b) => {
    const ka = indexKey(a.name), kb = indexKey(b.name);
    if (ka !== kb) return ka < kb ? -1 : 1;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
  if (!entries.length) { problems.push(fam.slug + " matched no entries"); return; }
  groups.push({ fam, entries });
  written.push([fam.slug, entries.length]);
  pending.push([fam.slug, pageHtml(fam, entries)]);
});
pending.push(["polymer-families", hubHtml(groups)]);

if (problems.length) {
  console.error("build-family-pages: " + problems.length + " problem(s), nothing written");
  problems.forEach(p => console.error("  - " + p));
  process.exit(1);
}

pending.forEach(([slug, html]) => {
  const file = path.join(ROOT, slug + ".html");
  const old = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (old !== html) {
    changed++;
    if (!CHECK) fs.writeFileSync(file, html);
  }
});

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
