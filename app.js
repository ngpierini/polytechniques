/* The pure recipe math (feed-ratio/Mn engine, stock-solution planner, and its
   ladders) lives in polymer-calc-core.js, loaded before this file, so the same
   code can run in Node, a test, or a future API. app.js only wires it to the
   DOM. */
const { computeCore, planStockSolution, STOCK_MASS_LADDER_MG, STOCK_VOL_LADDER_ML } = window.PolymerCalcCore;

/* ---------------------------------------------------------------------
   Reference reagent data. MW values (g/mol) are literature reference
   values for convenience only — verify against your reagent's COA.
--------------------------------------------------------------------- */

const VINYL_MONOMERS = [
  { name: "Styrene", mw: 104.15, density: 0.909 },
  { name: "Methyl methacrylate (MMA)", mw: 100.12, density: 0.940 },
  { name: "Methyl acrylate (MA)", mw: 86.09, density: 0.953 },
  { name: "Ethyl acrylate (EA)", mw: 100.12, density: 0.917 },
  { name: "n-Butyl acrylate (BA)", mw: 128.17, density: 0.898 },
  { name: "n-Butyl methacrylate (BMA)", mw: 142.20, density: 0.894 },
  { name: "2-Hydroxyethyl methacrylate (HEMA)", mw: 130.14, density: 1.073 },
  { name: "2-Hydroxyethyl acrylate (HEA)", mw: 116.12, density: 1.106 },
  { name: "Glycidyl methacrylate (GMA)", mw: 142.15, density: 1.042 },
  { name: "N-Isopropylacrylamide (NIPAM)", mw: 113.16, density: null },
  { name: "Acrylamide", mw: 71.08, density: null },
  { name: "N,N-Dimethylacrylamide (DMA)", mw: 99.13, density: 0.963 },
  { name: "Acrylic acid (AA)", mw: 72.06, density: 1.051 },
  { name: "Methacrylic acid (MAA)", mw: 86.09, density: 1.015 },
  { name: "tert-Butyl acrylate (tBA)", mw: 128.17, density: 0.879 },
  { name: "tert-Butyl methacrylate (tBMA)", mw: 142.20, density: 0.870 },
  { name: "Vinyl acetate (VAc)", mw: 86.09, density: 0.934 },
  { name: "4-Vinylpyridine (4VP)", mw: 105.14, density: 0.975 },
  { name: "Acrylonitrile (AN)", mw: 53.06, density: 0.806 },
  { name: "2-(Dimethylamino)ethyl methacrylate (DMAEMA)", mw: 157.21, density: 0.933 },
  { name: "Oligo(ethylene glycol) methyl ether methacrylate (OEGMA, ~300 avg)", mw: 300, density: 1.05 },
];

const CYCLIC_MONOMERS = [
  { name: "Norbornene (NB)", mw: 94.15, density: null },
  { name: "Dicyclopentadiene (DCPD)", mw: 132.20, density: 0.979 },
  { name: "1,5-Cyclooctadiene (COD)", mw: 108.18, density: 0.880 },
  { name: "Cyclopentene", mw: 68.12, density: 0.772 },
  { name: "Cyclooctene", mw: 110.20, density: 0.848 },
];

const ATRP_INITIATORS = [
  { name: "Ethyl 2-bromoisobutyrate (EBiB)", mw: 195.05 },
  { name: "Methyl 2-bromopropionate (MBrP)", mw: 167.00 },
  { name: "Ethyl 2-bromopropionate (EBrP)", mw: 181.03 },
  { name: "Methyl 2-bromoisobutyrate (MBriB)", mw: 181.03 },
  { name: "1-Phenylethyl bromide", mw: 185.06 },
  { name: "Benzyl bromide", mw: 171.04 },
  { name: "Methyl 2-chloropropionate", mw: 122.55 },
];

const ATRP_CU_SOURCES = [
  { name: "CuBr", mw: 143.45 },
  { name: "CuCl", mw: 99.00 },
  { name: "CuBr2", mw: 223.35 },
  { name: "CuCl2", mw: 134.45 },
];

const ATRP_LIGANDS = [
  { name: "PMDETA", mw: 173.30 },
  { name: "2,2'-Bipyridine (bpy)", mw: 156.22 },
  { name: "Me6TREN", mw: 230.39 },
  { name: "4,4'-Dinonyl-2,2'-bipyridine (dNbpy)", mw: 408.66 },
  { name: "Tris(2-pyridylmethyl)amine (TPMA)", mw: 290.36 },
];

const RAFT_CTAS = [
  { name: "4-Cyano-4-(phenylcarbonothioylthio)pentanoic acid (CPADB)", mw: 279.37 },
  { name: "CDTPA", mw: 403.66 },
  { name: "DDMAT", mw: 364.63 },
  { name: "Cumyl dithiobenzoate (CDB)", mw: 272.42 },
  { name: "2-Cyano-2-propyl benzodithioate (CPDB)", mw: 221.32 },
];

/* ---------------------------------------------------------------------
   RAFT agent chooser data, distilled from Moad & Rizzardo (eds.), RAFT
   Polymerization: Methods, Synthesis and Applications (Wiley-VCH, 2022),
   ch. 3 (Postma & Skidmore), Table 3.1 and Figure 3.2, and the
   monomer-class discussions in sections 3.4-3.7.
--------------------------------------------------------------------- */
const RAFT_MONOMER_CLASSES = {
  methacrylate: {
    label: "Methacrylates (MMA, HEMA, GMA, PEGMA…)", short: "methacrylate",
    family: "Tertiary more-activated monomer (MAM)", rank: 3,
    best: "A tertiary-cyanoalkyl R group is required: 2-cyano-2-propyl benzodithioate (CPDB) or the trithiocarbonate CDTPA (4-cyano-4-[(dodecylsulfanylthiocarbonyl)sulfanyl]pentanoic acid).",
    avoid: "Any agent with a primary or secondary R group (benzyl, CH(CH₃)-based), xanthates, and N,N-dialkyl dithiocarbamates give little or no control.",
    caveats: "Carboxy-tertiary R groups (DDMAT type) give only partial control over methacrylates; prefer the cyanoalkyl-R agents. Dithiobenzoates are the most hydrolysis-prone class in aqueous or protic media.",
    conditions: "Solution polymerization at 60–90 °C with an azo initiator is typical.",
  },
  methacrylamide: {
    label: "Methacrylamides (HPMA…)", short: "methacrylamide",
    family: "Tertiary more-activated monomer (MAM)", rank: 3,
    best: "Same requirement as methacrylates: tertiary-cyanoalkyl R agents such as CPDB or CDTPA; fewer agents rate as excellent here than for methacrylates.",
    avoid: "Secondary-R agents, xanthates, and dialkyl dithiocarbamates.",
    caveats: "Aqueous work favors the acid-functional trithiocarbonates (CDTPA, CPADB) with a water-soluble azo initiator (ACVA).",
    conditions: "Water or water/alcohol at 60–70 °C with ACVA is common.",
  },
  acrylate: {
    label: "Acrylates (MA, BA, tBA, PEGA…)", short: "acrylate",
    family: "Secondary more-activated monomer (MAM)", rank: 2,
    best: "Trithiocarbonates give the best control: DDMAT, DoPAT (2-(dodecylthiocarbonothioylthio)propanoic acid), or CDTPA. Dithiobenzoates also work.",
    avoid: "Xanthates and N,N-dialkyl dithiocarbamates.",
    caveats: "Dithiobenzoates cause retardation or inhibition with acrylates at low temperature or high agent concentration; keep temperatures up or switch to a trithiocarbonate.",
    conditions: "Solution at 60–70 °C with AIBN is typical.",
  },
  acrylamide: {
    label: "Acrylamides (DMA, NIPAM, acrylamide…)", short: "acrylamide",
    family: "Secondary more-activated monomer (MAM)", rank: 2,
    best: "Trithiocarbonates (CDTPA, DDMAT, DoPAT) or CPDB; acid-functional agents dissolve well in the aqueous media these monomers favor.",
    avoid: "Xanthates and dialkyl dithiocarbamates.",
    caveats: "In water, thiocarbonylthio groups hydrolyze slowly (dithiobenzoates fastest); avoid prolonged heating after conversion plateaus, and avoid primary-amine-containing media entirely (aminolysis kills the chain end).",
    conditions: "Water or dioxane at 60–70 °C with ACVA or AIBN.",
  },
  styrenic: {
    label: "Styrenics (styrene, 4-methylstyrene…)", short: "styrenic",
    family: "Secondary more-activated monomer (MAM)", rank: 2,
    best: "The widest tolerance of any family: dithiobenzoates (CDB, CPDB) and trithiocarbonates (DDMAT, DoPAT, dibenzyl trithiocarbonate for telechelics) all rate excellent.",
    avoid: "Xanthates and N,N-dialkyl dithiocarbamates.",
    caveats: "Styrene self-initiates above ~100 °C, so bulk thermal polymerization at 100–110 °C needs no added initiator. RAFT emulsion polymerization of styrene fails with simple ab-initio recipes; use an amphiphilic macro-CTA or feed strategy.",
    conditions: "Bulk at 100–110 °C (thermal), or 60–80 °C with AIBN.",
  },
  vinylester: {
    label: "Vinyl esters (vinyl acetate, vinyl benzoate…)", short: "vinyl ester",
    family: "Less-activated monomer (LAM)", rank: 1,
    best: "Xanthates (O-ethyl xanthates such as Rhodixan A1) or N,N-dialkyl dithiocarbamates (e.g. cyanomethyl methyl(phenyl) dithiocarbamate).",
    avoid: "Dithiobenzoates and trithiocarbonates inhibit vinyl ester polymerization outright; the poorly stabilized propagating radical adds to them and never fragments back out.",
    caveats: "The reactive chain end also makes vinyl esters prone to head-to-tail defects; expect somewhat broader dispersities than MAM systems.",
    conditions: "Bulk or ethyl acetate solution at 60 °C with AIBN.",
  },
  vinylamide: {
    label: "Vinyl amides (NVP, NVC, N-vinylcaprolactam…)", short: "vinyl amide",
    family: "Less-activated monomer (LAM)", rank: 1,
    best: "Xanthates or dithiocarbamates, the same classes as vinyl esters.",
    avoid: "Dithiobenzoates and trithiocarbonates (inhibition).",
    caveats: "An NVP-terminal chain end hydrolyzes readily in water; aqueous NVP polymerizations work best at ambient temperature with redox initiation instead of hot azo initiators.",
    conditions: "Solution (dioxane, ethyl acetate) at 60 °C with AIBN, or ambient/redox in water.",
  },
};

function raftChooserAdvice(monoKey, blockKey) {
  const mono = RAFT_MONOMER_CLASSES[monoKey];
  if (!mono) return "";
  let html = `
    <div class="stat" style="margin-top:10px;"><div class="label">Monomer family</div>
      <div style="font-size:var(--fs-sm);">${mono.family}</div></div>
    <p class="guide-note"><strong>Use:</strong> ${mono.best}</p>
    <p class="guide-note"><strong>Avoid:</strong> ${mono.avoid}</p>
    <p class="guide-note"><strong>Watch out:</strong> ${mono.caveats}</p>
    <p class="guide-note"><strong>Typical conditions:</strong> ${mono.conditions}</p>`;
  const block = RAFT_MONOMER_CLASSES[blockKey];
  if (block) {
    if (mono.rank >= 2 && block.rank === 1) {
      html += `<p class="guide-note"><strong>Block order (${mono.label.split(" (")[0]} → ${block.label.split(" (")[0]}):</strong> crossing from a MAM to a LAM defeats every conventional agent: a LAM-capable agent loses control of the MAM and vice versa. Use a switchable N-(4-pyridinyl)-N-methyl dithiocarbamate: polymerize the MAM block first with the agent protonated (add a strong acid such as TsOH), then neutralize and grow the LAM block. The MAM block must come first regardless.</p>`;
    } else if (mono.rank < block.rank) {
      html += `<p class="guide-note"><strong>Block order warning:</strong> grow the ${block.short} block <em>first</em>. ${/^[aeiou]/i.test(mono.short) ? "An" : "A"} ${mono.short}-terminal chain is a poor homolytic leaving group against a ${block.short} propagating radical, so chain extension in your stated order gives slow, incomplete reinitiation and a dead-chain shoulder. The general rule: the block whose propagating radical is the better leaving group (methacrylates > acrylates/styrenics > vinyl esters/amides) goes first.</p>`;
    } else if (mono.rank === 1 && block.rank >= 2) {
      html += `<p class="guide-note"><strong>Block order warning:</strong> a LAM-first sequence into a MAM does not work: the LAM macro-CTA has a very low transfer constant in MAM polymerization. Make the MAM block first (with a switchable dithiocarbamate if you need control over both).</p>`;
    } else {
      html += `<p class="guide-note"><strong>Block order:</strong> this pairing works in the order stated${mono.rank > block.rank ? " (your first block's propagating radical is the better leaving group, which is exactly what a macro-CTA needs)" : ", and either order is workable since the two families have comparable leaving-group ability. Pick an agent rated excellent for both"}.</p>`;
    }
  }
  html += `<p class="guide-note" style="font-size:var(--fs-xs);">Guidance distilled from Moad &amp; Rizzardo (eds.), <em>RAFT Polymerization</em> (Wiley-VCH, 2022), ch. 3, Table 3.1/Fig. 3.2. Classic agents (dithiobenzoates, the common trithiocarbonates, simple xanthates) are off-patent; some newer switchable agents remain under CSIRO licence for commercial use.</p>`;
  return html;
}

const RADICAL_INITIATORS = [
  { name: "AIBN", mw: 164.21 },
  { name: "4,4'-Azobis(4-cyanovaleric acid) (V-501 / ACVA)", mw: 280.28 },
  { name: "Benzoyl peroxide (BPO)", mw: 242.23 },
  { name: "V-70", mw: 308.42 },
  { name: "Potassium persulfate (KPS)", mw: 270.32 },
  { name: "Ammonium persulfate (APS)", mw: 228.20 },
  { name: "V-50", mw: 271.19 },
];

/* PET-RAFT photocatalysts. Loadings are in ppm (molar) versus monomer;
   organic dyes typically run 10 to 100 ppm, Ir/Ru complexes 1 to 5 ppm
   (Xu, Shanmugam, Duong, Boyer, Polym. Chem. 2015, 6, 5615). Each entry
   carries the light source it responds to for the generated procedure. */
const PET_PHOTOCATALYSTS = [
  { name: "Eosin Y", mw: 647.89, ppm: 50, light: "green (~530 nm) or blue LED" },
  { name: "Fluorescein", mw: 332.31, ppm: 50, light: "blue (~460 nm) LED" },
  { name: "Ru(bpy)₃Cl₂·6H₂O", mw: 748.62, ppm: 5, light: "blue (~460 nm) LED" },
  { name: "fac-Ir(ppy)₃", mw: 654.78, ppm: 2, light: "blue (~435 nm) LED" },
  { name: "Zinc tetraphenylporphyrin (ZnTPP)", mw: 678.12, ppm: 100, light: "red (~635 nm) LED" },
];

const ROMP_CATALYSTS = [
  { name: "Grubbs 1st Generation", mw: 822.96 },
  { name: "Grubbs 2nd Generation", mw: 848.97 },
  { name: "Grubbs 3rd Generation (bispyridine)", mw: 726.76 },
  { name: "Hoveyda-Grubbs 1st Generation", mw: 596.52 },
  { name: "Hoveyda-Grubbs 2nd Generation", mw: 626.61 },
];

/* ---------------------------------------------------------------------
   Tab configuration
--------------------------------------------------------------------- */

const TYPES = [
  {
    id: "atrp",
    label: "ATRP",
    full: "Atom Transfer Radical Polymerization",
    monomers: VINYL_MONOMERS,
    monomerLabel: "Monomer",
    agentLabel: "Initiator (R–X)",
    agents: ATRP_INITIATORS,
    secondary: "atrp",
    macroTerm: "macroinitiator",
    typicalDj: "1.05 to 1.30",
    dispersityNote: "Well controlled ATRP with fast, reversible deactivation. Runs broader with low catalyst loading, high conversion, or termination.",
    assumptions: [
      "Theoretical Mn = ([M]₀/[I]₀) × conversion × MW(monomer) + MW(initiator), assuming one growing chain per initiator molecule and 100% initiator efficiency.",
      "Actual Mn will run higher than theoretical if initiator efficiency is below 1, or if termination/transfer occurs.",
      "Catalyst (Cu source) and ligand amounts are calculated as user set molar equivalents relative to the initiator/chain. Adjust these for ARGET/ICAR/SARA ATRP, which typically use substoichiometric Cu, often at ppm levels versus monomer.",
      "Oxygen consumes the Cu(I) activator before it consumes your chains, so the regeneration variants tolerate some air in a sealed vessel at the cost of an inhibition period. That is not the same as an open flask; see the oxygen tolerance section of the air-free guide.",
      "For block copolymers, chain extending from a macroinitiator uses its Mₙ in place of the small molecule initiator's MW, assuming quantitative retention of the halide chain end. Use the Block Copolymer tab to design multiblock sequences.",
    ],
  },
  {
    id: "raft",
    label: "RAFT",
    full: "Reversible Addition Fragmentation chain Transfer polymerization",
    monomers: VINYL_MONOMERS,
    monomerLabel: "Monomer",
    agentLabel: "Chain Transfer Agent (CTA)",
    agents: RAFT_CTAS,
    secondary: "raft",
    macroTerm: "macro CTA",
    typicalDj: "1.05 to 1.30",
    dispersityNote: "Depends heavily on the CTA's transfer constant for your monomer. A poorly matched CTA/monomer pair can give Đ well above 1.5.",
    assumptions: [
      "Theoretical Mn = ([M]₀/[CTA]₀) × conversion × MW(monomer) + MW(CTA), assuming every chain is initiated by a CTA molecule (high CTA efficiency, minimal initiator-derived chains).",
      "The radical initiator should be present at a low fraction of the CTA (commonly [CTA]/[initiator] ≈ 5 to 10) to keep the fraction of dead, initiator-derived chains small.",
      "Higher [initiator]/[CTA] ratios or long reaction times increase the proportion of chains not bearing a CTA end group.",
      "For block copolymers, chain extending from a macro CTA uses its Mₙ in place of the small molecule CTA's MW, assuming quantitative retention of the thiocarbonylthio chain end. Use the Block Copolymer tab to design multiblock sequences.",
      "In PET-RAFT mode the photocatalyst is dosed in molar ppm versus monomer and is not consumed; chain count still equals CTA moles, and the Mₙ math is unchanged. With no azo initiator there are essentially no initiator-derived chains.",
    ],
  },
  {
    id: "romp",
    label: "ROMP",
    full: "Ring Opening Metathesis Polymerization",
    monomers: CYCLIC_MONOMERS,
    monomerLabel: "Cyclic olefin monomer",
    agentLabel: "Catalyst",
    agents: ROMP_CATALYSTS,
    secondary: "romp",
    macroTerm: "macroinitiator",
    typicalDj: "1.05 to 1.20",
    dispersityNote: "Narrowest with fast initiating catalysts (Grubbs 3rd gen) where initiation outpaces propagation. Slow initiating catalysts broaden this.",
    assumptions: [
      "Theoretical Mn = ([M]₀/[cat]₀) × conversion × MW(monomer) + MW(catalyst derived end group, approximated here by catalyst MW).",
      "Assumes fast, quantitative initiation relative to propagation (living ROMP behavior), one chain per catalyst molecule, and negligible chain transfer.",
      "Catalyst loading is commonly reported in mol% relative to monomer, equal to 100 / target DP.",
      "Chain extending from a preformed macroinitiator (an isolated living chain end) is uncommon for ROMP. Most ROMP block copolymers are made by sequential monomer addition to the same living catalyst without isolating an intermediate. The Block Copolymer tab models that sequential addition case directly.",
      "Catalyst death, not radical termination, is the practical limit in ROMP, and it is worst under the monomer-starved conditions at the end of a block. Expect clean diblocks but increasing difficulty at triblock and beyond; adding the next monomer before the previous block is fully starved helps.",
    ],
  },
  {
    id: "frp",
    label: "FRP",
    full: "Free Radical Polymerization",
    monomers: VINYL_MONOMERS,
    monomerLabel: "Monomer",
    agentLabel: "Initiator",
    agents: RADICAL_INITIATORS,
    secondary: "frp",
    macroTerm: "macroinitiator",
    typicalDj: "1.5 to 2.5+",
    dispersityNote: "No dormant/active equilibrium limits chain growth, so Đ approaches 1.5 (combination termination) to 2.0+ (disproportionation/transfer dominated), sometimes much higher.",
    assumptions: [
      "Free radical polymerization is not a living/controlled process: the true number average degree of polymerization depends on kinetics (kp, kt, initiator decomposition rate, temperature, chain transfer), not simply on the monomer/initiator feed ratio.",
      "This calculator gives a simplified theoretical estimate only, treating the feed ratio the same way as a controlled polymerization (one chain per initiator molecule at the stated conversion). Real Mn in FRP is usually set by the kinetic chain length and can differ substantially from this estimate.",
      "Use this as a rough starting point recipe, not a predictive model. Verify Mn experimentally (e.g. by GPC/SEC).",
      "True macroinitiator based block synthesis (e.g. polymeric azo or peroxide initiators) is possible in FRP but inefficient and nonquantitative; treat any macroinitiator based estimate here as a rough approximation only.",
    ],
  },
];

/* ---------------------------------------------------------------------
   Predicted dispersity (ideal floor)
--------------------------------------------------------------------- */

// Ideal-model dispersity for the controlled mechanisms, matching the Đ
// predictor page: Đ = 1 + 1/DPn + C·(2/p − 1), with DPn = ratio × conversion.
// C is a representative well-matched exchange coefficient per mechanism
// (RAFT Cex ≈ 30; ATRP with ample deactivator; ROMP fast-initiating ≈ living).
// This is a lower bound: real Đ runs higher (termination, slow initiation,
// transfer), which is why the tile is labelled an ideal floor and links to the
// full predictor. FRP is not a living process, so it has no entry and keeps its
// literature range instead. DISP_MECH maps each tab to the predictor's own
// mechanism keys (ROMP has no controlled-radical analog, so it maps to ideal).
const DISP_C = { atrp: 1e-4, raft: 1 / 30, romp: 0 };
const DISP_MECH = { atrp: "atrp", raft: "raft", romp: "ideal" };

function predictDispersityFloor(id, R, conv) {
  if (!(R > 0) || !(conv > 0) || !(id in DISP_C)) return null;
  const dpn = R * conv;
  if (!(dpn > 0)) return null;
  return 1 + 1 / dpn + DISP_C[id] * (2 / conv - 1);
}

/* ---------------------------------------------------------------------
   Formatting helpers
--------------------------------------------------------------------- */

function fmtNum(num, sig = 4) {
  if (num === null || num === undefined || !isFinite(num)) return "n/a";
  if (num === 0) return "0";
  const abs = Math.abs(num);
  if (abs < 1e-4 || abs >= 1e6) return num.toExponential(3);
  const magnitude = Math.floor(Math.log10(abs));
  const decimals = Math.max(sig - magnitude - 1, 0);
  let rounded = Number(num.toFixed(Math.min(decimals, 10)));
  return rounded.toString();
}

function chooseMolUnit(mol) {
  const abs = Math.abs(mol);
  if (abs >= 1) return { v: mol, u: "mol" };
  if (abs >= 1e-3) return { v: mol * 1e3, u: "mmol" };
  return { v: mol * 1e6, u: "µmol" };
}
function chooseMassUnit(g) {
  const abs = Math.abs(g);
  if (abs >= 1) return { v: g, u: "g" };
  if (abs >= 1e-3) return { v: g * 1e3, u: "mg" };
  return { v: g * 1e6, u: "µg" };
}
function chooseVolUnit(mL) {
  const abs = Math.abs(mL);
  if (abs >= 1000) return { v: mL / 1000, u: "L" };
  return { v: mL, u: "mL" };
}
function fmtMol(mol) { const u = chooseMolUnit(mol); return `${fmtNum(u.v)} ${u.u}`; }
function fmtMass(g) { const u = chooseMassUnit(g); return `${fmtNum(u.v)} ${u.u}`; }
function fmtVol(mL) { const u = chooseVolUnit(mL); return `${fmtNum(u.v)} ${u.u}`; }

/* Molecular weight display units: g/mol (as computed) or kg/mol.
   Display-layer only - every calculation stays in g/mol. Stats keep their
   original g/mol text in data attributes so the toggle can flip both ways,
   and a MutationObserver reapplies the preference after every recalc
   re-render. Writes are guarded by value comparison so identical rewrites
   don't retrigger the observer. */
const MW_UNIT_KEY = "polytechniques_mw_unit";
function mwUnitPref() {
  try { return localStorage.getItem(MW_UNIT_KEY) === "kg" ? "kg" : "g"; } catch (e) { return "g"; }
}
function applyMwUnitDisplay() {
  const pref = mwUnitPref();
  document.querySelectorAll("#app .stat").forEach((stat) => {
    const sub = stat.querySelector(".sub");
    const val = stat.querySelector(".value");
    if (!sub || !val) return;
    const origSub = sub.dataset.origSub || sub.textContent;
    if (!/^g\/mol/.test(origSub)) return;
    if (!sub.dataset.origSub) {
      sub.dataset.origSub = origSub;
      val.dataset.origVal = val.textContent;
    }
    let targetVal, targetSub;
    if (pref === "kg") {
      const n = parseFloat(val.dataset.origVal);
      if (!isFinite(n)) return;
      targetVal = fmtNum(n / 1000);
      targetSub = origSub.replace(/^g\/mol/, "kg/mol");
    } else {
      targetVal = val.dataset.origVal;
      targetSub = origSub;
    }
    if (val.textContent !== targetVal) val.textContent = targetVal;
    if (sub.textContent !== targetSub) sub.textContent = targetSub;
  });
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s || "";
  return d.innerHTML;
}

/* ---------------------------------------------------------------------
   DOM building
--------------------------------------------------------------------- */

function optionsHTML(list, selectedIdx = 0) {
  return list
    .map((item, i) => `<option value="${i}" ${i === selectedIdx ? "selected" : ""}>${item.name} (${item.mw} g/mol)</option>`)
    .join("") + `<option value="custom">Custom…</option>`;
}

function panelTemplate(cfg) {
  const id = cfg.id;

  let secondaryHTML = "";
  if (cfg.secondary === "atrp") {
    secondaryHTML = `
      <div class="card">
        <h3>Catalyst system (relative to initiator)</h3>
        <label class="checkbox-row">
          <input type="checkbox" id="${id}-cat-enable" checked>
          Include catalyst &amp; ligand in recipe
        </label>
        <div id="${id}-cat-fields" class="subsection">
          <div class="grid">
            <div class="field">
              <label>Cu source</label>
              <select id="${id}-cat-select">${optionsHTML(ATRP_CU_SOURCES)}</select>
            </div>
            <div class="field">
              <label>Cu source MW (g/mol)</label>
              <input type="number" id="${id}-cat-mw" value="${ATRP_CU_SOURCES[0].mw}" step="any">
            </div>
            <div class="field">
              <label>Cu equivalents (per initiator)</label>
              <input type="number" id="${id}-cat-eq" value="1" step="any" min="0">
            </div>
          </div>
          <div class="grid" style="margin-top:12px;">
            <div class="field">
              <label>Ligand</label>
              <select id="${id}-lig-select">${optionsHTML(ATRP_LIGANDS)}</select>
            </div>
            <div class="field">
              <label>Ligand MW (g/mol)</label>
              <input type="number" id="${id}-lig-mw" value="${ATRP_LIGANDS[0].mw}" step="any">
            </div>
            <div class="field">
              <label>Ligand equivalents (per initiator)</label>
              <input type="number" id="${id}-lig-eq" value="1" step="any" min="0">
            </div>
          </div>
        </div>
      </div>`;
  } else if (cfg.secondary === "raft") {
    secondaryHTML = `
      <div class="card">
        <h3>Radical source</h3>
        <label class="checkbox-row">
          <input type="checkbox" id="${id}-pet-toggle">
          PET-RAFT: visible light photocatalyst instead of a thermal initiator
        </label>
        <div id="${id}-thermal-wrap">
          <label class="checkbox-row">
            <input type="checkbox" id="${id}-cat-enable" checked>
            Include a radical initiator in recipe
          </label>
          <div id="${id}-cat-fields" class="subsection">
            <div class="grid">
              <div class="field">
                <label>Initiator</label>
                <select id="${id}-cat-select">${optionsHTML(RADICAL_INITIATORS)}</select>
              </div>
              <div class="field">
                <label>Initiator MW (g/mol)</label>
                <input type="number" id="${id}-cat-mw" value="${RADICAL_INITIATORS[0].mw}" step="any">
              </div>
              <div class="field">
                <label>[CTA] : [Initiator] ratio</label>
                <input type="number" id="${id}-cat-ratio" value="5" step="any" min="0.01">
                <span class="hint">Typically 5 to 10</span>
              </div>
            </div>
          </div>
        </div>
        <div id="${id}-pet-fields" class="subsection" style="display:none;">
          <div class="grid">
            <div class="field">
              <label>Photocatalyst</label>
              <select id="${id}-pet-select">${optionsHTML(PET_PHOTOCATALYSTS)}</select>
            </div>
            <div class="field">
              <label>Photocatalyst MW (g/mol)</label>
              <input type="number" id="${id}-pet-mw" value="${PET_PHOTOCATALYSTS[0].mw}" step="any">
            </div>
            <div class="field">
              <label>Loading (ppm vs monomer, molar)</label>
              <input type="number" id="${id}-pet-ppm" value="${PET_PHOTOCATALYSTS[0].ppm}" step="any" min="0.01">
              <span class="hint">Organic dyes 10 to 100 ppm; Ir/Ru complexes 1 to 5 ppm</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="panel-head">
      <div>
        <h2>${cfg.label}</h2>
        <p>${cfg.full}</p>
      </div>
      <button type="button" class="copy-btn print-btn" onclick="window.print()">&#128424; Print recipe</button>
    </div>

    ${presetBarHTML(id)}

    <div class="calc-inputs">
    <!-- Hidden until /api/recipe is fixed. The endpoint 502s at the edge on
         every deploy while /api/ask, /api/health and /api/recognize all respond,
         and the cause is not visible from the client - see the commit history.
         The client half is finished and tested; remove the hidden attribute to
         turn it back on once the Function loads. A button that always fails is
         worse than no button. -->
    <div class="card" id="${id}-paste-card" hidden>
      <h3>Read a procedure</h3>
      <p class="guide-note">Paste the synthesis paragraph from a paper or its SI. The reagents and amounts are read out of the text; every ratio, degree of polymerisation and concentration below is then computed here from those amounts, not taken from the paper.</p>
      <textarea id="${id}-paste" class="recipe-paste" rows="3" maxlength="6000" spellcheck="false"
                aria-label="Paste a synthesis procedure to fill these fields"
                placeholder="e.g. MMA (5.0 g, 50 mmol), EBiB (48.8 mg, 0.25 mmol), CuBr (35.9 mg, 0.25 mmol) and PMDETA (43.3 mg, 0.25 mmol) in anisole (5 mL) at 60 &deg;C&hellip;"></textarea>
      <div class="actions" style="justify-content:flex-start; margin-top:8px; gap:8px;">
        <button type="button" class="copy-btn" id="${id}-paste-btn">Fill from this text</button>
        <span id="${id}-paste-status" class="guide-note recipe-paste-status" role="status" aria-live="polite"></span>
      </div>
    </div>
    <div class="card">
      <h3>${cfg.monomerLabel}</h3>
      <div class="grid">
        <div class="field">
          <label>${cfg.monomerLabel}</label>
          <select id="${id}-monomer-select">${optionsHTML(cfg.monomers)}</select>
        </div>
        <div class="field">
          <label>MW (g/mol)</label>
          <input type="number" id="${id}-monomer-mw" value="${cfg.monomers[0].mw}" step="any">
        </div>
        <div class="field">
          <label>Density (g/mL)</label>
          <input type="number" id="${id}-monomer-density" value="${cfg.monomers[0].density != null ? cfg.monomers[0].density : ""}" step="any" placeholder="optional">
          <span class="hint">Used to compute monomer/solvent volumes</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Target</h3>
      <div class="field" style="margin-bottom:12px;">
        <label>Target basis</label>
        <div class="radio-row">
          <label class="radio-opt"><input type="radio" name="${id}-target-mode" value="mn" checked> Target Mₙ (g/mol, at full conversion)</label>
          <label class="radio-opt"><input type="radio" name="${id}-target-mode" value="dp"> Target degree of polymerization (DP)</label>
        </div>
      </div>
      <div class="grid">
        <div class="field">
          <label id="${id}-target-value-label">Target Mₙ (g/mol)</label>
          <input type="number" id="${id}-target-value" value="20000" step="any" min="0">
        </div>
        <div class="field">
          <label>Conversion for predicted Mₙ (%)</label>
          <input type="number" id="${id}-conversion" value="100" step="any" min="0" max="100">
          <span class="hint">Feed ratio targets Mₙ at full conversion; this reports Mₙ at a given conversion</span>
        </div>
      </div>
      <div class="field" style="margin-top:12px;">
        <label for="${id}-ratio">Recipe ratio</label>
        <input type="text" id="${id}-ratio" class="ratio-input" spellcheck="false" autocomplete="off" inputmode="text">
        <span class="hint" id="${id}-ratio-hint"></span>
      </div>
    </div>

    <div class="card">
      <h3>${cfg.agentLabel}</h3>
      <label class="checkbox-row">
        <input type="checkbox" id="${id}-agent-macro-toggle">
        Chain extend from an existing ${cfg.macroTerm} (block copolymer)
      </label>
      <div id="${id}-agent-normal-fields" class="grid">
        <div class="field">
          <label>${cfg.agentLabel}</label>
          <select id="${id}-agent-select">${optionsHTML(cfg.agents)}</select>
        </div>
        <div class="field">
          <label>MW (g/mol)</label>
          <input type="number" id="${id}-agent-mw" value="${cfg.agents[0].mw}" step="any">
        </div>
      </div>
      <div id="${id}-agent-macro-fields" class="grid" style="display:none;">
        <div class="field">
          <label>${cap(cfg.macroTerm)} name (optional)</label>
          <input type="text" id="${id}-agent-macro-name" placeholder="e.g. PEG113-Br">
        </div>
        <div class="field">
          <label>${cap(cfg.macroTerm)} Mₙ (g/mol)</label>
          <input type="number" id="${id}-agent-macro-mn" value="5000" step="any" min="0">
          <span class="hint">Mₙ of the existing chain (GPC/NMR), including its reactive end group</span>
        </div>
      </div>
    </div>

    ${secondaryHTML}

    <div class="card">
      <h3>Scale &amp; concentration</h3>
      <div class="field" style="margin-bottom:12px;">
        <label>Set scale by</label>
        <div class="radio-row">
          <label class="radio-opt"><input type="radio" name="${id}-scale-mode" value="mass" checked> Mass of monomer</label>
          <label class="radio-opt"><input type="radio" name="${id}-scale-mode" value="moles"> Moles of monomer</label>
          <label class="radio-opt"><input type="radio" name="${id}-scale-mode" value="conc"> Target concentration + volume</label>
        </div>
      </div>
      <div class="grid">
        <div class="field" id="${id}-scale-mass-field">
          <label>Monomer mass (g)</label>
          <input type="number" id="${id}-scale-mass" value="1" step="any" min="0">
        </div>
        <div class="field" id="${id}-scale-moles-field" style="display:none;">
          <label>Monomer amount (mmol)</label>
          <input type="number" id="${id}-scale-moles" value="10" step="any" min="0">
        </div>
        <div class="field" id="${id}-scale-conc-vol-field" style="display:none;">
          <label>Total reaction volume (mL)</label>
          <input type="number" id="${id}-scale-volume" value="10" step="any" min="0">
        </div>
        <div class="field" id="${id}-target-conc-field">
          <label id="${id}-target-conc-label">Target [monomer] (mol/L)</label>
          <input type="number" id="${id}-target-conc" value="1" step="any" min="0" placeholder="optional">
          <span class="hint" id="${id}-target-conc-hint">Optional, also computes total volume &amp; solvent needed</span>
        </div>
      </div>
    </div>

    </div><!-- /.calc-inputs -->

    <div class="calc-output">
    <div class="card" id="${id}-results">
      <h3>Results</h3>
      <div id="${id}-results-body"></div>
    </div>

    ${cfg.id === "raft" ? `
    <div class="card" id="raft-chooser-card">
      <h3>RAFT agent chooser</h3>
      <p class="guide-note">Pick your monomer family (and the next block, if you're planning one) for agent-class guidance: what to use, what to avoid, and which block has to come first.</p>
      <div class="grid">
        <div class="field">
          <label for="raft-chooser-monomer">Monomer family</label>
          <select id="raft-chooser-monomer">
            <option value="">Choose a family&hellip;</option>
            ${Object.keys(RAFT_MONOMER_CLASSES).map((k) => `<option value="${k}">${RAFT_MONOMER_CLASSES[k].label}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="raft-chooser-block">Next block (optional)</label>
          <select id="raft-chooser-block">
            <option value="">No block planned</option>
            ${Object.keys(RAFT_MONOMER_CLASSES).map((k) => `<option value="${k}">${RAFT_MONOMER_CLASSES[k].label}</option>`).join("")}
          </select>
        </div>
      </div>
      <div id="raft-chooser-out"></div>
    </div>` : ""}

    <details class="assumptions">
      <summary>Formulas &amp; assumptions</summary>
      <div class="body">
        <ul>${cfg.assumptions.map((a) => `<li>${a}</li>`).join("")}</ul>
      </div>
    </details>
    </div><!-- /.calc-output -->
  `;
}

/* ---------------------------------------------------------------------
   Calculation engine
--------------------------------------------------------------------- */

/* computeCore lives in polymer-calc-core.js (aliased at the top of this file). */

/* ---------------------------------------------------------------------
   Panel wiring
--------------------------------------------------------------------- */

function $(id) { return document.getElementById(id); }

/* ---------------------------------------------------------------------
   Saved recipe presets (generic engine, reused by every tab)
--------------------------------------------------------------------- */

/* Folded shut: this sat between the panel title and the first input, so the
   first thing you met was a feature you can only use after you have already
   used the calculator once. The saved count in the summary is what makes it
   worth opening, so it is the only thing on show. */
function presetBarHTML(tabId) {
  return `
    <details class="card preset-bar">
      <summary>
        <span class="preset-bar-title">Saved recipes</span>
        <span class="preset-bar-count" id="${tabId}-preset-count"></span>
      </summary>
      <div class="preset-row">
        <select id="${tabId}-preset-select" class="preset-select">
          <option value="">Load a saved recipe</option>
        </select>
        <button type="button" class="copy-btn" id="${tabId}-preset-load-btn">Load</button>
        <button type="button" class="copy-btn" id="${tabId}-preset-delete-btn">Delete</button>
      </div>
      <div class="preset-row">
        <input type="text" id="${tabId}-preset-name" class="preset-name-input" placeholder="Name this recipe…">
        <button type="button" class="copy-btn" id="${tabId}-preset-save-btn">Save current as…</button>
      </div>
    </details>
  `;
}

function collectPanelState(panelId) {
  const panel = $(`panel-${panelId}`);
  const state = { fields: {}, radios: {} };
  panel.querySelectorAll("input[id], select[id]").forEach((el) => {
    if (el.closest(".preset-bar")) return;
    if (el.type === "checkbox") state.fields[el.id] = el.checked;
    else if (el.type !== "radio") state.fields[el.id] = el.value;
  });
  const radioNames = new Set();
  panel.querySelectorAll('input[type="radio"]').forEach((el) => {
    if (!el.closest(".preset-bar")) radioNames.add(el.name);
  });
  radioNames.forEach((name) => {
    const checked = panel.querySelector(`input[name="${name}"]:checked`);
    if (checked) state.radios[name] = checked.value;
  });
  return state;
}

function applyPanelState(panelId, state, panelRecalc) {
  const panel = $(`panel-${panelId}`);

  function applyFieldsAndRadios() {
    Object.keys(state.fields || {}).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === "checkbox") el.checked = state.fields[id];
      else el.value = state.fields[id];
    });
    Object.keys(state.radios || {}).forEach((name) => {
      const el = panel.querySelector(`input[name="${name}"][value="${CSS.escape(state.radios[name])}"]`);
      if (el) el.checked = true;
    });
  }

  applyFieldsAndRadios();
  // Re-fire radio/checkbox change handlers (field visibility, labels) without
  // touching <select> change handlers, which would clobber any MW/density the
  // user customized away from the reagent database default. Some of these
  // handlers reset a value to a hardcoded default as a side effect (e.g. the
  // target-mode radio resetting the target value) — reapply the saved values
  // afterward so the restore always wins.
  panel.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]').forEach((el) => {
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
  applyFieldsAndRadios();
  if (panelRecalc) panelRecalc();
}

// tabId -> {collect, apply}, populated by wirePresetBar. Used by both the
// preset save/load bar and the share-link feature.
const STATE_REGISTRY = {};

function wirePresetBar(tabId, collectFn, applyFn) {
  STATE_REGISTRY[tabId] = { collect: collectFn, apply: applyFn };
  const storageKey = "polytechniques_presets_" + tabId;

  function getStore() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch (e) { return {}; }
  }
  function setStore(store) { try { localStorage.setItem(storageKey, JSON.stringify(store)); } catch (e) { /* storage blocked */ } }

  function refreshSelect() {
    const store = getStore();
    const select = $(`${tabId}-preset-select`);
    const names = Object.keys(store).sort();
    const current = select.value;
    select.innerHTML = '<option value="">Load a saved recipe</option>' +
      names.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
    if (names.includes(current)) select.value = current;
    const count = $(`${tabId}-preset-count`);
    if (count) count.textContent = names.length ? `${names.length} saved` : "none yet";
  }
  refreshSelect();

  $(`${tabId}-preset-save-btn`).addEventListener("click", () => {
    const nameInput = $(`${tabId}-preset-name`);
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    const store = getStore();
    store[name] = collectFn();
    setStore(store);
    refreshSelect();
    $(`${tabId}-preset-select`).value = name;
    nameInput.value = "";
  });

  $(`${tabId}-preset-load-btn`).addEventListener("click", () => {
    const name = $(`${tabId}-preset-select`).value;
    if (!name) return;
    const store = getStore();
    if (store[name]) applyFn(store[name]);
  });

  $(`${tabId}-preset-delete-btn`).addEventListener("click", () => {
    const name = $(`${tabId}-preset-select`).value;
    if (!name) return;
    const store = getStore();
    delete store[name];
    setStore(store);
    refreshSelect();
  });
}

function bindDbSelect(selectEl, mwEl, densityEl, list, onChange) {
  selectEl.addEventListener("change", () => {
    const v = selectEl.value;
    if (v === "custom") return;
    const item = list[Number(v)];
    mwEl.value = item.mw;
    if (densityEl) densityEl.value = item.density != null ? item.density : "";
    if (onChange) onChange();
  });
}

function updateRadioStyles(radios) {
  radios.forEach((r) => {
    const opt = r.closest(".radio-opt");
    if (opt) opt.classList.toggle("checked", r.checked);
  });
}

function applyScaleModeGeneric(prefix) {
  const checkedEl = document.querySelector(`input[name="${prefix}-scale-mode"]:checked`);
  const checkedVal = checkedEl ? checkedEl.value : "mass";
  $(`${prefix}-scale-mass-field`).style.display = checkedVal === "mass" ? "" : "none";
  $(`${prefix}-scale-moles-field`).style.display = checkedVal === "moles" ? "" : "none";
  $(`${prefix}-scale-conc-vol-field`).style.display = checkedVal === "conc" ? "" : "none";
  const concLabel = $(`${prefix}-target-conc-label`);
  const concHint = $(`${prefix}-target-conc-hint`);
  const concInput = $(`${prefix}-target-conc`);
  if (checkedVal === "conc") {
    concLabel.textContent = "Target [monomer] (mol/L)";
    concHint.textContent = "Required for this scale mode";
    concInput.placeholder = "";
  } else {
    concLabel.textContent = "Target [monomer] (mol/L), optional";
    concHint.textContent = "Also computes total volume & solvent needed";
    concInput.placeholder = "optional";
  }
}

function wirePanel(cfg) {
  const id = cfg.id;
  const el = (suffix) => $(`${id}-${suffix}`);

  bindDbSelect(el("monomer-select"), el("monomer-mw"), el("monomer-density"), cfg.monomers, recalc);
  bindDbSelect(el("agent-select"), el("agent-mw"), null, cfg.agents, recalc);

  if (cfg.secondary === "atrp") {
    bindDbSelect(el("cat-select"), el("cat-mw"), null, ATRP_CU_SOURCES, recalc);
    bindDbSelect(el("lig-select"), el("lig-mw"), null, ATRP_LIGANDS, recalc);
  } else if (cfg.secondary === "raft") {
    bindDbSelect(el("cat-select"), el("cat-mw"), null, RADICAL_INITIATORS, recalc);
    const petToggle = el("pet-toggle");
    const petSelect = el("pet-select");
    if (petToggle) {
      petToggle.addEventListener("change", () => {
        el("thermal-wrap").style.display = petToggle.checked ? "none" : "";
        el("pet-fields").style.display = petToggle.checked ? "" : "none";
        recalc();
      });
      // picking a photocatalyst loads both its MW and its typical ppm dose
      petSelect.addEventListener("change", () => {
        const item = PET_PHOTOCATALYSTS[Number(petSelect.value)];
        if (item) {
          el("pet-mw").value = item.mw;
          el("pet-ppm").value = item.ppm;
        }
        recalc();
      });
    }
    const chooserMono = $("raft-chooser-monomer");
    const chooserBlock = $("raft-chooser-block");
    const chooserOut = $("raft-chooser-out");
    if (chooserMono && chooserBlock && chooserOut) {
      const updateChooser = () => {
        chooserOut.innerHTML = chooserMono.value ? raftChooserAdvice(chooserMono.value, chooserBlock.value) : "";
      };
      chooserMono.addEventListener("change", updateChooser);
      chooserBlock.addEventListener("change", updateChooser);
    }
  }

  // macroinitiator toggle
  const macroToggle = el("agent-macro-toggle");
  macroToggle.addEventListener("change", () => {
    el("agent-normal-fields").style.display = macroToggle.checked ? "none" : "";
    el("agent-macro-fields").style.display = macroToggle.checked ? "" : "none";
    recalc();
  });
  el("agent-macro-name").addEventListener("input", recalc);

  // radio: target mode
  const targetModeRadios = document.querySelectorAll(`input[name="${id}-target-mode"]`);
  targetModeRadios.forEach((r) => {
    r.addEventListener("change", () => {
      const label = el("target-value-label");
      if (r.checked && r.value === "mn") {
        label.textContent = "Target Mₙ (g/mol)";
        el("target-value").value = 20000;
      } else if (r.checked && r.value === "dp") {
        label.textContent = "Target DP (repeat units)";
        el("target-value").value = 200;
      }
      updateRadioStyles(targetModeRadios);
      recalc();
    });
  });

  // radio: scale mode
  const scaleModeRadios = document.querySelectorAll(`input[name="${id}-scale-mode"]`);
  scaleModeRadios.forEach((r) => {
    r.addEventListener("change", () => {
      applyScaleModeGeneric(id);
      updateRadioStyles(scaleModeRadios);
      recalc();
    });
  });

  updateRadioStyles(targetModeRadios);
  updateRadioStyles(scaleModeRadios);
  applyScaleModeGeneric(id);

  // checkbox toggles for secondary panels
  if (cfg.secondary === "atrp" || cfg.secondary === "raft") {
    const enableBox = el("cat-enable");
    const fields = el("cat-fields");
    enableBox.addEventListener("change", () => {
      fields.style.opacity = enableBox.checked ? "1" : "0.4";
      fields.querySelectorAll("input,select").forEach((i) => (i.disabled = !enableBox.checked));
      recalc();
    });
  }

  // any other input change triggers recalc
  const panelRoot = $(`panel-${id}`);
  panelRoot.addEventListener("input", (e) => {
    if (e.target.matches('input[type="number"]')) recalc();
  });
  panelRoot.addEventListener("change", (e) => {
    if (e.target.matches("select")) recalc();
  });

  function getTargetMode() {
    return document.querySelector(`input[name="${id}-target-mode"]:checked`).value;
  }

  /* ---- Recipe ratio -------------------------------------------------------
     A recipe is written [M]:[I]:[Cu]:[L] = 200:1:1:1 in every paper and every
     notebook, but the three numbers behind it lived in three different cards
     here: the DP in Target, the copper and ligand equivalents down in the
     catalyst section. You could set them, but never read the recipe back in
     the form you would actually quote it, and never paste one in.

     This is both directions at once - a readout that follows the fields, and
     an input that drives them. Each component knows how to read itself out of
     the panel and how to write itself back, because the relationship is not
     the same for all of them: ATRP stores equivalents per initiator directly,
     while RAFT stores [CTA]:[Initiator], which is the reciprocal of the
     initiator's position in the ratio. */
  function ratioSpec() {
    // Position 1 is always the monomer (the DP); position 2 is always the
    // species that defines a chain, and is 1 by construction.
    const parts = [
      { label: "[M]", read: () => dpFromPanel(), write: (v) => setDpOnPanel(v) },
      { label: cfg.secondary === "raft" ? "[CTA]" : "[I]", read: () => 1, write: () => {} },
    ];
    if (cfg.secondary === "atrp") {
      parts.push({ label: "[Cu]", read: () => parseFloat(el("cat-eq").value),
        write: (v) => { el("cat-eq").value = trimNum(v); } });
      parts.push({ label: "[L]", read: () => parseFloat(el("lig-eq").value),
        write: (v) => { el("lig-eq").value = trimNum(v); } });
    } else if (cfg.secondary === "raft") {
      // The field is [CTA]:[Initiator], so the initiator's share of the ratio
      // is its reciprocal - 5 in that box means 0.2 initiator per CTA.
      const enabled = () => { const c = el("cat-enable"); return !c || c.checked; };
      const pet = () => { const p = el("pet-toggle"); return p && p.checked; };
      if (!pet()) {
        parts.push({ label: "[Initiator]",
          read: () => (enabled() ? 1 / parseFloat(el("cat-ratio").value) : null),
          write: (v) => { if (v > 0 && enabled()) el("cat-ratio").value = trimNum(1 / v); } });
      }
    }
    return parts;
  }

  function trimNum(v) {
    if (!isFinite(v)) return "";
    return parseFloat(v.toFixed(6)).toString();
  }

  // Display precision, which is not the same as stored precision. A 20,000
  // g/mol target on a 104.15 monomer is a DP of 190.157945, and printing that
  // into a field labelled like a recipe invites someone to copy it into a
  // notebook. Nobody weighs to the seventh significant figure of a DP.
  function fmtRatio(v) {
    if (!isFinite(v)) return "";
    const a = Math.abs(v);
    if (a >= 100) return String(Math.round(v));
    if (a >= 10) return parseFloat(v.toFixed(1)).toString();
    if (a >= 1) return parseFloat(v.toFixed(2)).toString();
    return parseFloat(v.toPrecision(3)).toString();
  }

  // The ratio speaks in DP whichever basis the Target radio is on, so an Mn
  // target has to be converted through the same relation the calculator uses:
  // Mn = DP x MW(monomer) + MW(chain-carrier).
  function dpFromPanel() {
    const v = parseFloat(el("target-value").value);
    if (!isFinite(v)) return null;
    if (getTargetMode() === "dp") return v;
    const mwM = parseFloat(el("monomer-mw").value);
    const macroMode = el("agent-macro-toggle").checked;
    const mwX = macroMode ? parseFloat(el("agent-macro-mn").value) : parseFloat(el("agent-mw").value);
    if (!isFinite(mwM) || mwM <= 0 || !isFinite(mwX)) return null;
    return (v - mwX) / mwM;
  }

  // Writing a DP back switches the basis to DP rather than solving for the Mn
  // that would produce it. Typing "200:1:1:1" means a DP of 200; quietly
  // rewriting the Mn box to 20,232 would be a surprising thing to watch happen.
  function setDpOnPanel(dp) {
    const dpRadio = document.querySelector(`input[name="${id}-target-mode"][value="dp"]`);
    if (dpRadio && !dpRadio.checked) {
      dpRadio.checked = true;
      dpRadio.dispatchEvent(new Event("change", { bubbles: true }));
    }
    el("target-value").value = trimNum(dp);
  }

  function syncRatioField(force) {
    const input = el("ratio");
    if (!input) return;
    const parts = ratioSpec();
    const vals = parts.map((p) => p.read());
    if (vals.some((v) => v === null || !isFinite(v))) {
      input.value = "";
      el("ratio-hint").textContent = "Enter a ratio like 200:1 to set the target from a recipe.";
      return;
    }
    // Do not fight the user mid-keystroke - but do repaint once they commit,
    // which is what `force` is for. Without it a recipe typed as 800:2:0.1:1
    // stays on screen as typed while the panel underneath holds the normalised
    // 400:1:0.05:0.5, and the two disagree until something else redraws.
    if (force || document.activeElement !== input) {
      input.value = vals.map((v) => fmtRatio(v)).join(" : ");
    }
    el("ratio-hint").innerHTML = parts.map((p) => p.label).join(" : ") +
      " &mdash; edit to set them all at once";
  }

  function applyRatioField() {
    const input = el("ratio");
    if (!input) return;
    const parts = ratioSpec();
    const nums = input.value.split(/[:\s,]+/).filter(Boolean).map(Number);
    if (nums.length < 2 || nums.some((n) => !isFinite(n) || n < 0) || !(nums[1] > 0)) {
      el("ratio-hint").textContent = "Need at least two positive numbers, e.g. 200:1";
      return;
    }
    // Normalise so the chain-carrier is 1: a recipe quoted as 400:2:2:2 is the
    // same reaction as 200:1:1:1, and someone scaling one up in their head
    // should not get a different answer for typing it that way.
    const base = nums[1];
    for (let i = 0; i < parts.length && i < nums.length; i++) {
      parts[i].write(nums[i] / base);
    }
    recalc();
    syncRatioField(true);
  }
  function getScaleMode() {
    return document.querySelector(`input[name="${id}-scale-mode"]:checked`).value;
  }

  function recalc() {
    const mwM = parseFloat(el("monomer-mw").value);
    const densityM = parseFloat(el("monomer-density").value) || null;
    const macroMode = el("agent-macro-toggle").checked;
    const mwX = macroMode ? parseFloat(el("agent-macro-mn").value) : parseFloat(el("agent-mw").value);
    const targetMode = getTargetMode();
    const targetValue = parseFloat(el("target-value").value);
    const conversionPct = parseFloat(el("conversion").value);
    const scaleMode = getScaleMode();

    let scaleValue = null;
    if (scaleMode === "mass") scaleValue = parseFloat(el("scale-mass").value);
    else if (scaleMode === "moles") scaleValue = parseFloat(el("scale-moles").value);

    const targetConcRaw = el("target-conc") ? parseFloat(el("target-conc").value) : NaN;
    const targetConc = isFinite(targetConcRaw) ? targetConcRaw : null;
    const totalVolumeML = scaleMode === "conc" ? parseFloat(el("scale-volume").value) : null;

    const core = computeCore({
      mwM, densityM, mwX, targetMode, targetValue, conversionPct,
      scaleMode, scaleValue, targetConc, totalVolumeML,
    });

    renderResults(cfg, core, { mwM, densityM, mwX, macroMode });
    syncRatioField();
  }

  /* ---- Read a procedure ---------------------------------------------------
     The endpoint reports what the paragraph says was weighed out. Everything
     derived from those amounts is computed HERE, by the same code that runs
     when the fields are typed by hand - moles from mass and molar mass, DP
     from the mole ratio, then the full recalc.

     That split is the point. If the reader returned a DP it would land in the
     Target box looking exactly like the calculator's own output, and someone
     would weigh reagents against a number no part of this page had checked.
     Reading "48.8 mg" off a page is the model's job; dividing by it is not. */
  function pasteStatus(msg, busy) {
    const el = document.getElementById(`${id}-paste-status`);
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-busy", !!busy);
  }

  // mmol, preferring what the text stated outright over anything reconstructed.
  function mmolOf(moles, grams, molarMass) {
    if (moles != null && isFinite(moles) && moles > 0) return moles;
    if (grams != null && molarMass != null && isFinite(grams) && isFinite(molarMass) && molarMass > 0) {
      return (grams / molarMass) * 1000;
    }
    return null;
  }

  function applyRecipe(r) {
    const notes = [];

    // The technique decides which panel should be showing. Filling the ATRP
    // fields from a RAFT procedure would silently produce a plausible recipe
    // for the wrong chemistry.
    if (r.technique && r.technique !== "unknown" && r.technique !== id) {
      const target = document.querySelector(`.tab-btn[data-target="${r.technique}"]`);
      if (target) {
        switchTab(r.technique);
        const panel = document.getElementById(`panel-${r.technique}`);
        const box = document.getElementById(`${r.technique}-paste`);
        if (box) { box.value = document.getElementById(`${id}-paste`).value; }
        if (panel && panel._applyRecipe) { panel._applyRecipe(r); return; }
      }
      notes.push(`the text reads as ${r.technique.toUpperCase()}, not ${id.toUpperCase()}`);
    }

    if (r.monomerMolarMass != null && isFinite(r.monomerMolarMass)) {
      el("monomer-mw").value = r.monomerMolarMass;
    }
    if (r.carrierMolarMass != null && isFinite(r.carrierMolarMass)) {
      el("agent-mw").value = r.carrierMolarMass;
    }

    // DP is computed here, from the two amounts, never taken from the text.
    const mMon = mmolOf(r.monomerMolesMmol, r.monomerMassGram, parseFloat(el("monomer-mw").value));
    const mCar = mmolOf(r.carrierMolesMmol, r.carrierMassGram, parseFloat(el("agent-mw").value));
    if (mMon && mCar && mCar > 0) {
      setDpOnPanel(mMon / mCar);
    } else {
      notes.push("not enough amounts to set a target - fill the Target box yourself");
    }

    // ATRP equivalents, again as a ratio computed from the reported amounts.
    if (mCar && mCar > 0) {
      if (r.catalystMolesMmol != null && el("cat-eq")) el("cat-eq").value = trimNum(r.catalystMolesMmol / mCar);
      if (r.ligandMolesMmol != null && el("lig-eq")) el("lig-eq").value = trimNum(r.ligandMolesMmol / mCar);
    }

    // Scale: the monomer mass the procedure actually used.
    if (r.monomerMassGram != null && isFinite(r.monomerMassGram) && el("scale-mass")) {
      const massRadio = document.querySelector(`input[name="${id}-scale-mode"][value="mass"]`);
      if (massRadio && !massRadio.checked) {
        massRadio.checked = true;
        massRadio.dispatchEvent(new Event("change", { bubbles: true }));
      }
      el("scale-mass").value = r.monomerMassGram;
    }

    recalc();

    const said = [];
    if (r.monomerName) said.push(r.monomerName);
    if (r.carrierName) said.push(r.carrierName);
    const lead = said.length ? `Read ${said.join(" and ")}.` : "Read the procedure.";
    const extra = [r.missing, notes.join("; ")].filter(Boolean).join(" ");
    pasteStatus(`${lead}${extra ? " " + extra : ""} Check the fields against your source.`);
  }
  panelRoot._applyRecipe = applyRecipe;

  let pasteInFlight = false;
  function runPaste() {
    const box = document.getElementById(`${id}-paste`);
    const btn = document.getElementById(`${id}-paste-btn`);
    if (!box || pasteInFlight) return;
    const text = box.value.trim();
    if (!text) { pasteStatus(""); return; }

    pasteInFlight = true;
    if (btn) btn.disabled = true;
    pasteStatus("Reading the procedure…", true);

    fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((r) => r.json()).then((res) => {
      if (!res || !res.ok) {
        pasteStatus((res && res.error) || "That did not work. The fields still work by hand.");
        return;
      }
      const r = res.recipe || {};
      if (r.unusable) {
        pasteStatus(r.missing || "That does not read as a polymerisation procedure.");
        return;
      }
      applyRecipe(r);
    }).catch(() => {
      pasteStatus("Could not reach the reader. The fields still work by hand.");
    }).then(() => {
      pasteInFlight = false;
      if (btn) btn.disabled = false;
      const el2 = document.getElementById(`${id}-paste-status`);
      if (el2) el2.classList.remove("is-busy");
    });
  }

  const pasteBtn = document.getElementById(`${id}-paste-btn`);
  if (pasteBtn) pasteBtn.addEventListener("click", runPaste);

  // The ratio box is the one input that must NOT recalc on every keystroke:
  // "200:1:1:1" passes through "2", "20", "200:", each of which is a valid but
  // wrong ratio, and applying them would rewrite the DP three times and fight
  // the typist. It commits on Enter or on blur instead.
  const ratioInput = el("ratio");
  if (ratioInput) {
    ratioInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); applyRatioField(); ratioInput.blur(); }
    });
    ratioInput.addEventListener("blur", applyRatioField);
  }

  // expose for initial call
  panelRoot._recalc = recalc;
  recalc();

  wirePresetBar(id, () => collectPanelState(id), (state) => applyPanelState(id, state, panelRoot._recalc));
}

/* ---------------------------------------------------------------------
   Stock solutions
   Low-loading components (ppm photocatalysts, ARGET-scale copper, the CTA
   in a high-Mn target) routinely come out at masses no balance can weigh.
   The fix every bench chemist reaches for is a stock solution, so the
   calculator does that arithmetic instead of leaving it as an exercise:
   weigh an amount you actually can, dissolve it in a round volume, and
   deliver a pipettable aliquot.
--------------------------------------------------------------------- */

const STOCK_PREFS_KEY = "polytechniques_stock_prefs";
// Round numbers a person would actually weigh out and actually measure into.
/* STOCK_MASS_LADDER_MG / STOCK_VOL_LADDER_ML come from polymer-calc-core.js. */

function getStockPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(STOCK_PREFS_KEY));
    if (p && p.minWeighMg > 0 && p.aliquotUL > 0) {
      return { minWeighMg: p.minWeighMg, aliquotUL: p.aliquotUL, mode: p.mode === "all" ? "all" : "auto" };
    }
  } catch (e) {}
  return { minWeighMg: 10, aliquotUL: 100, mode: "auto" };
}
function setStockPrefs(p) {
  try { localStorage.setItem(STOCK_PREFS_KEY, JSON.stringify(p)); } catch (e) {}
}

/* planStockSolution lives in polymer-calc-core.js (aliased at the top). */

function fmtUL(uL) {
  return uL >= 1000 ? `${fmtNum(uL / 1000)} mL` : `${fmtNum(uL)} µL`;
}

/* panelId scopes the DOM ids: every technique panel is in the document at
   once, so a fixed id here would collide and the preference inputs would
   bind to whichever tab happened to render first. */
function stockSolutionsHTML(panelId, components, prefs, volTotalL) {
  const allMode = prefs.mode === "all";
  const plans = [];
  const neat = [];
  components.forEach((c) => {
    // A neat liquid (density known) is delivered by syringe in all-stocks
    // mode rather than dissolved, since making a "stock" of it is pointless.
    if (allMode && c.neatVolML != null) { neat.push(c); return; }
    const plan = planStockSolution(c.massG, prefs, allMode);
    if (plan) plans.push({ name: c.name, massG: c.massG, plan });
  });

  const settings = `
    <div class="grid" style="margin-top:10px;">
      <div class="field">
        <label for="${panelId}-stock-mode">What to prepare as stocks</label>
        <select id="${panelId}-stock-mode">
          <option value="auto"${allMode ? "" : " selected"}>Only what's too small to weigh</option>
          <option value="all"${allMode ? " selected" : ""}>Every reagent (work entirely from stocks)</option>
        </select>
        <span class="hint">${allMode ? "Whole reaction assembled by pipette" : "Default: weigh what you can"}</span>
      </div>
      <div class="field">
        <label for="${panelId}-stock-min-weigh">Smallest mass you'll weigh (mg)</label>
        <input type="number" id="${panelId}-stock-min-weigh" value="${prefs.minWeighMg}" step="any" min="0.1">
        <span class="hint">${allMode ? "Also the floor for each stock itself" : "Anything below this gets a stock solution"}</span>
      </div>
      <div class="field">
        <label for="${panelId}-stock-aliquot">Preferred aliquot (µL)</label>
        <input type="number" id="${panelId}-stock-aliquot" value="${prefs.aliquotUL}" step="any" min="1">
        <span class="hint">Aim for a volume your pipette handles well</span>
      </div>
    </div>`;

  if (!plans.length) {
    return `
      <details class="assumptions" id="${panelId}-stock-solutions">
        <summary>Stock solutions</summary>
        <div class="body">
          <p class="guide-note">Every component in this recipe is above your weighing threshold of ${fmtNum(prefs.minWeighMg)} mg, so no stock solution is needed. Switch to "every reagent" below if you'd rather assemble the whole reaction by pipette.</p>
          ${settings}
        </div>
      </details>`;
  }

  const rows = plans.map((p) => `
    <tr>
      <td>${p.name}</td>
      <td class="num">${fmtMass(p.massG)}</td>
      <td class="num">${fmtNum(p.plan.massMg)} mg</td>
      <td class="num">${fmtNum(p.plan.volML)} mL</td>
      <td class="num">${fmtNum(p.plan.concMgML)} mg/mL</td>
      <td class="num"><strong>${fmtUL(p.plan.aliquotUL)}</strong></td>
    </tr>`).join("");

  const totalAliquotUL = plans.reduce((s, p) => s + p.plan.aliquotUL, 0);
  const totalAliquotML = totalAliquotUL / 1000;

  let volNote;
  if (volTotalL == null) {
    volNote = ` Remember each aliquot brings its own solvent into the reaction.`;
  } else if (totalAliquotML > volTotalL * 1000) {
    volNote = ` <strong>The aliquots come to ${fmtUL(totalAliquotUL)}, more than the ${fmtVol(volTotalL * 1000)} reaction volume itself.</strong> Use more concentrated stocks (raise the weighed mass or lower the stock volume), or run at a larger scale.`;
  } else {
    volNote = ` The aliquots add ${fmtUL(totalAliquotUL)} of solvent in total, which is part of your ${fmtVol(volTotalL * 1000)} reaction volume, not on top of it, so subtract it from the solvent you add separately.`;
  }

  const lead = allMode
    ? `Every reagent below is prepared as a stock solution, so the reaction is assembled entirely by pipette. This costs more solvent and setup time, but it is far more reproducible at small scale and makes parallel screening practical.`
    : `${plans.length === 1 ? "One component is" : `${plans.length} components are`} below ${fmtNum(prefs.minWeighMg)} mg, too little to weigh accurately. Make ${plans.length === 1 ? "this stock solution" : "these stock solutions"} instead and deliver the aliquot by pipette.`;

  const neatNote = neat.length
    ? `<p class="guide-note">Added neat by syringe rather than as a stock: ${neat.map((c) => `${c.name} (${fmtVol(c.neatVolML)})`).join(", ")}. Dissolving a bulk liquid in solvent only to redilute it wastes volume you need for the reaction.</p>`
    : "";

  return `
    <div class="card" id="${panelId}-stock-solutions">
      <h3>Stock solutions</h3>
      <p class="guide-note">${lead}${volNote}</p>
      <div class="table-scroll">
        <table class="recipe recipe-data">
          <thead><tr><th>Component</th><th>Needed</th><th>Weigh</th><th>Dissolve in</th><th>Concentration</th><th>Deliver</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${neatNote}
      ${settings}
    </div>`;
}

/* Re-bound after every render, since the results body is rewritten. */
function wireStockPrefInputs(panelId, onChange) {
  const minEl = $(`${panelId}-stock-min-weigh`);
  const aliEl = $(`${panelId}-stock-aliquot`);
  const modeEl = $(`${panelId}-stock-mode`);
  if (!minEl || !aliEl || !modeEl) return;
  const apply = () => {
    const minWeighMg = parseFloat(minEl.value);
    const aliquotUL = parseFloat(aliEl.value);
    if (!(minWeighMg > 0) || !(aliquotUL > 0)) return;
    setStockPrefs({ minWeighMg, aliquotUL, mode: modeEl.value });
    onChange();
  };
  minEl.addEventListener("change", apply);
  aliEl.addEventListener("change", apply);
  modeEl.addEventListener("change", apply);
}

/* On a phone the answer sits roughly three screens below the inputs, so the
   two numbers that matter ride along in a fixed bar while you are still
   editing the recipe. It steps out of the way as soon as the Results card
   itself is on screen, and never appears on the two-column desktop layout. */
const summaryBar = (function () {
  let bar = null;
  let card = null;      // the Results card the bar is standing in for
  let scrollHooked = false;
  let queued = false;

  function setVisible(on) {
    if (!bar) return;
    bar.hidden = !on;
    document.body.classList.toggle("has-calc-summary", on);
  }

  // Measured rather than observed. An earlier version drove this from an
  // IntersectionObserver, which meant visibility was only ever recomputed
  // when a callback happened to fire: if the bar was left hidden and the
  // card was already being watched, nothing could bring it back. Reading
  // the rect is cheap and always tells the truth.
  function resultsOnScreen() {
    if (!card) return false;
    const r = card.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  function apply() {
    setVisible(!!card && !resultsOnScreen());
  }

  function hookScroll() {
    if (scrollHooked) return;
    scrollHooked = true;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; apply(); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // rAF is parked while the tab is hidden, so any scrolling that happened
    // in the meantime never reached apply(). Resync on the way back.
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) apply();
    });
  }

  function refresh() {
    const panel = document.querySelector(".panel.active");
    const tiles = panel ? panel.querySelectorAll(".stat--primary[data-bar]") : [];
    if (!tiles.length || window.matchMedia("(min-width: 1000px)").matches) {
      card = null;
      setVisible(false);
      return;
    }

    if (!bar) {
      bar = document.createElement("div");
      bar.className = "calc-summary-bar";
      bar.hidden = true;
      document.body.appendChild(bar);
    }

    const shown = Array.prototype.slice.call(tiles, 0, 2);
    bar.innerHTML =
      shown.map((t) => {
        const v = t.querySelector(".value");
        return `<div class="csb-item">
            <div class="csb-label">${escapeHtml(t.dataset.bar)}</div>
            <div class="csb-value">${escapeHtml(v ? v.textContent : "")}</div>
          </div>`;
      }).join("") +
      `<button type="button" class="csb-jump">Results</button>`;

    card = shown[0].closest(".card");
    bar.querySelector(".csb-jump").addEventListener("click", () => {
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    hookScroll();
    apply();
  }

  return { refresh: refresh };
})();

function renderResults(cfg, core, ctx) {
  const id = cfg.id;
  const body = $(`${id}-results-body`);

  if (core.error) {
    body.innerHTML = `<div class="error-msg">${core.error}</div>`;
    summaryBar.refresh();
    return;
  }

  let secondaryRows = "";
  let secondaryStats = "";
  let sec = null;
  const stockComponents = [];   // everything weighable, checked for tiny masses

  if (cfg.secondary === "atrp") {
    const enable = $(`${id}-cat-enable`).checked;
    if (enable) {
      const catMw = parseFloat($(`${id}-cat-mw`).value);
      const catEq = parseFloat($(`${id}-cat-eq`).value) || 0;
      const ligMw = parseFloat($(`${id}-lig-mw`).value);
      const ligEq = parseFloat($(`${id}-lig-eq`).value) || 0;
      const catName = $(`${id}-cat-select`).options[$(`${id}-cat-select`).selectedIndex].text.split(" (")[0];
      const ligName = $(`${id}-lig-select`).options[$(`${id}-lig-select`).selectedIndex].text.split(" (")[0];
      const nCat = core.nX_mol * catEq;
      const mCat = nCat * catMw;
      const nLig = core.nX_mol * ligEq;
      const mLig = nLig * ligMw;
      secondaryRows += `<tr><td>${catName}</td><td class="num">${fmtMol(nCat)}</td><td class="num">${fmtMass(mCat)}</td><td class="num">n/a</td></tr>`;
      secondaryRows += `<tr><td>${ligName}</td><td class="num">${fmtMol(nLig)}</td><td class="num">${fmtMass(mLig)}</td><td class="num">n/a</td></tr>`;
      sec = { catName, mCat, ligName, mLig };
      stockComponents.push({ name: catName, massG: mCat }, { name: ligName, massG: mLig });
    }
  } else if (cfg.secondary === "raft") {
    const petOn = $(`${id}-pet-toggle`) && $(`${id}-pet-toggle`).checked;
    if (petOn) {
      const petMw = parseFloat($(`${id}-pet-mw`).value);
      const ppm = parseFloat($(`${id}-pet-ppm`).value) || 0;
      const petIdx = Number($(`${id}-pet-select`).value);
      const petItem = PET_PHOTOCATALYSTS[petIdx];
      const petName = $(`${id}-pet-select`).options[$(`${id}-pet-select`).selectedIndex].text.split(" (")[0];
      const nPet = core.nM_mol * ppm / 1e6;
      const mPet = nPet * petMw;
      secondaryRows += `<tr><td>${petName} (photocatalyst)</td><td class="num">${fmtMol(nPet)}</td><td class="num">${fmtMass(mPet)}</td><td class="num">n/a</td></tr>`;
      sec = {
        petName, mPet, petPpm: ppm,
        petLight: petItem ? petItem.light : "an appropriate visible LED",
        petStock: planStockSolution(mPet, getStockPrefs()),
      };
      stockComponents.push({ name: `${petName} (photocatalyst)`, massG: mPet });
    } else if ($(`${id}-cat-enable`).checked) {
      const initMw = parseFloat($(`${id}-cat-mw`).value);
      const ratio = parseFloat($(`${id}-cat-ratio`).value) || 1;
      const initName = $(`${id}-cat-select`).options[$(`${id}-cat-select`).selectedIndex].text.split(" (")[0];
      const nInit = core.nX_mol / ratio;
      const mInit = nInit * initMw;
      secondaryRows += `<tr><td>${initName}</td><td class="num">${fmtMol(nInit)}</td><td class="num">${fmtMass(mInit)}</td><td class="num">n/a</td></tr>`;
      sec = { initName, mInit };
      stockComponents.push({ name: initName, massG: mInit });
    }
  } else if (cfg.secondary === "romp") {
    const loadingPct = 100 / core.R;
    secondaryStats += `
      <div class="stat">
        <div class="label">Catalyst loading</div>
        <div class="value">${fmtNum(loadingPct)} mol%</div>
        <div class="sub">relative to monomer</div>
      </div>`;
  }

  const monomerName = $(`${id}-monomer-select`).options[$(`${id}-monomer-select`).selectedIndex].text.split(" (")[0];
  const agentName = ctx.macroMode
    ? ($(`${id}-agent-macro-name`).value.trim() || cap(cfg.macroTerm))
    : $(`${id}-agent-select`).options[$(`${id}-agent-select`).selectedIndex].text.split(" (")[0];

  const monomerVolRow = ctx.densityM
    ? `<td class="num">${fmtVol((core.massM_g / ctx.densityM))}</td>`
    : `<td class="num">n/a</td>`;

  // Predicted Đ tile. Controlled mechanisms get a live ideal-floor estimate
  // and a deep link that prefills the target DP and conversion in the full
  // predictor; FRP keeps its literature range (the feed ratio does not set Đ).
  const Dfloor = predictDispersityFloor(id, core.R, core.conversion);
  const dispTile = Dfloor != null
    ? `
      <div class="stat stat--muted" title="${escapeHtml("Ideal lower bound from the exchange model. Real Đ usually runs higher (typically " + cfg.typicalDj + "). " + cfg.dispersityNote)}">
        <div class="label">Predicted Đ (ideal floor)</div>
        <div class="value">&asymp; ${Dfloor < 1.1 ? Dfloor.toFixed(3) : Dfloor.toFixed(2)}</div>
        <div class="sub"><a href="dispersity-predictor.html?mech=${DISP_MECH[id]}&dp=${Math.round(core.R)}&conv=${core.conversion.toFixed(2)}">refine for your agent &rarr;</a></div>
      </div>`
    : `
      <div class="stat stat--muted" title="${escapeHtml(cfg.dispersityNote)}">
        <div class="label">Typical Đ (dispersity)</div>
        <div class="value">${cfg.typicalDj}</div>
        <div class="sub">set by kinetics, not the feed ratio</div>
      </div>`;

  // Hierarchy: the two numbers that answer the question lead, the feed ratio
  // supports them, and the tiles that are context rather than results
  // (a predicted dispersity, a concentration you supplied) recede.
  const statGrid = `
    <div class="stat-grid">
      <div class="stat stat--primary" data-bar="Predicted Mₙ">
        <div class="label">Predicted Mₙ at ${fmtNum(core.conversion * 100)}% conv.</div>
        <div class="value">${fmtNum(core.predictedMn)}</div>
        <div class="sub">g/mol</div>
      </div>
      <div class="stat stat--primary" data-bar="Ratio [M]:[X]">
        <div class="label">Target ratio [M]:[X]</div>
        <div class="value">${fmtNum(core.R)} : 1</div>
        <div class="sub">DP at full conversion</div>
      </div>
      <div class="stat">
        <div class="label">Mₙ at full conversion</div>
        <div class="value">${fmtNum(core.theoreticalMnFull)}</div>
        <div class="sub">g/mol</div>
      </div>
      ${ctx.macroMode ? `
      <div class="stat">
        <div class="label">New block Mₙ added</div>
        <div class="value">${fmtNum(core.predictedMn - ctx.mwX)}</div>
        <div class="sub">g/mol, at stated conversion</div>
      </div>` : ""}
      ${core.actualConc != null ? `
      <div class="stat stat--muted">
        <div class="label">Monomer concentration</div>
        <div class="value">${fmtNum(core.actualConc)}</div>
        <div class="sub">mol/L</div>
      </div>` : ""}
      ${dispTile}
      ${secondaryStats}
    </div>
  `;

  const volumeRows = core.volTotalL != null ? `
    <tr>
      <td>Solvent (to volume)</td>
      <td class="num">n/a</td>
      <td class="num">n/a</td>
      <td class="num">${fmtVol(core.solventVolumeML)}</td>
    </tr>
    <tr>
      <td><strong>Total reaction volume</strong></td>
      <td class="num">n/a</td>
      <td class="num">n/a</td>
      <td class="num"><strong>${fmtVol(core.volTotalL * 1000)}</strong></td>
    </tr>
  ` : "";

  // The agent can also land below weighing range when targeting a high Mn,
  // so it goes through the same check. The monomer only matters in
  // all-reagents mode, and carries its neat volume so a liquid can be called
  // out as syringe-delivered instead of being pointlessly dissolved.
  if (!ctx.macroMode) stockComponents.unshift({ name: agentName, massG: core.massX_g });
  stockComponents.unshift({
    name: monomerName,
    massG: core.massM_g,
    neatVolML: ctx.densityM ? core.massM_g / ctx.densityM : null,
  });

  const stockPrefs = getStockPrefs();
  const stockHTML = stockSolutionsHTML(id, stockComponents, stockPrefs, core.volTotalL);

  const recipeText = buildRecipeText(cfg, core, ctx, monomerName, agentName, secondaryRows, stockComponents, stockPrefs);
  const procedureSteps = techniqueProcedureSteps(cfg, core, ctx, { monomer: monomerName, agent: agentName }, sec);

  body.innerHTML = `
    ${statGrid}
    <div class="table-scroll">
    <table class="recipe recipe-data">
      <thead><tr><th>Component</th><th>Amount</th><th>Mass</th><th>Volume</th></tr></thead>
      <tbody>
        <tr><td>${monomerName}</td><td class="num">${fmtMol(core.nM_mol)}</td><td class="num">${fmtMass(core.massM_g)}</td>${monomerVolRow}</tr>
        <tr><td>${agentName}</td><td class="num">${fmtMol(core.nX_mol)}</td><td class="num">${fmtMass(core.massX_g)}</td><td class="num">n/a</td></tr>
        ${secondaryRows}
        ${volumeRows}
      </tbody>
    </table>
    </div>
    ${stockHTML}
    ${procedureBlock(cfg.label, procedureSteps, false)}
    <div class="actions">
      <button class="copy-btn" id="${id}-copy-btn">Copy recipe as text</button>
    </div>
  `;

  // recalc lives in wirePanel's closure, not here; the panel element carries
  // a reference to it so the re-render can be triggered from this scope.
  wireStockPrefInputs(id, () => {
    const panel = $(`panel-${id}`);
    if (panel && panel._recalc) panel._recalc();
  });

  const copyBtn = $(`${id}-copy-btn`);
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(recipeText).then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy recipe as text"), 1400);
    });
  });

  summaryBar.refresh();
}

function buildRecipeText(cfg, core, ctx, monomerName, agentName, secondaryRowsHTML, stockComponents, stockPrefs) {
  const lines = [];
  lines.push(`${cfg.label} recipe, target Mₙ ${fmtNum(core.theoreticalMnFull)} g/mol (ratio ${fmtNum(core.R)}:1)`);
  lines.push(`Predicted Mₙ at ${fmtNum(core.conversion * 100)}% conversion: ${fmtNum(core.predictedMn)} g/mol`);
  lines.push("");
  lines.push(`${monomerName}: ${fmtMol(core.nM_mol)}, ${fmtMass(core.massM_g)}${ctx.densityM ? `, ${fmtVol(core.massM_g / ctx.densityM)}` : ""}`);
  lines.push(`${agentName}: ${fmtMol(core.nX_mol)}, ${fmtMass(core.massX_g)}`);
  const tmp = document.createElement("div");
  tmp.innerHTML = secondaryRowsHTML;
  tmp.querySelectorAll("tr").forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    lines.push(`${tds[0].textContent}: ${tds[1].textContent}, ${tds[2].textContent}`);
  });
  if (core.volTotalL != null) {
    lines.push(`Solvent (to volume): ${fmtVol(core.solventVolumeML)}`);
    lines.push(`Total reaction volume: ${fmtVol(core.volTotalL * 1000)}`);
  }
  if (stockComponents && stockPrefs) {
    const allMode = stockPrefs.mode === "all";
    const stockLines = [];
    const neatLines = [];
    stockComponents.forEach((c) => {
      if (allMode && c.neatVolML != null) {
        neatLines.push(`${c.name}: ${fmtVol(c.neatVolML)} neat by syringe`);
        return;
      }
      const plan = planStockSolution(c.massG, stockPrefs, allMode);
      if (!plan) return;
      stockLines.push(`${c.name}: dissolve ${fmtNum(plan.massMg)} mg in ${fmtNum(plan.volML)} mL (${fmtNum(plan.concMgML)} mg/mL), deliver ${fmtUL(plan.aliquotUL)}`);
    });
    if (stockLines.length) {
      lines.push("");
      lines.push(allMode
        ? "Stock solutions (all reagents):"
        : `Stock solutions (components below ${fmtNum(stockPrefs.minWeighMg)} mg):`);
      stockLines.forEach((l) => lines.push(`  ${l}`));
      neatLines.forEach((l) => lines.push(`  ${l}`));
    }
  }
  return lines.join("\n");
}

/* ---------------------------------------------------------------------
   Suggested experimental procedures
   Rendered under each recipe. These are deliberately generic starting
   points - the disclaimer below is part of the deliverable, not
   boilerplate, and must stay attached wherever a procedure is shown
   (including print).
--------------------------------------------------------------------- */

function disclaimerHTML(extraLead) {
  return `
    <div class="procedure-disclaimer">
      <strong>&#9888;&#65039; Safety &amp; disclaimer:</strong> ${extraLead ? extraLead + " " : ""}This auto-generated outline is a
      generic starting point for planning, provided &ldquo;as is&rdquo; without warranty of any
      kind. It is not a validated procedure, and it knows nothing about the specific hazards
      of your reagents, solvents, scale, or equipment. Before any lab work: read the SDS for
      every chemical involved, follow your institution's safety protocols and waste-disposal
      rules, and have your plan reviewed by someone qualified in your lab. Work in a fume
      hood with appropriate PPE. PolyTechniques and its author accept no liability for how
      this information is used.
    </div>`;
}

function disclaimerCompactHTML() {
  return `
    <div class="procedure-disclaimer procedure-disclaimer-compact">
      <strong>&#9888;&#65039;</strong> Guidance only, provided &ldquo;as is&rdquo;. Verify against
      the SDS and your institution's safety protocols before any lab work.
    </div>`;
}

/* Collapsed by default: the procedure is reference material you read once,
   not something you rescan on every recalculation, and at ~9 steps plus the
   safety block it was pushing the numbers off screen. The step count sits in
   the summary so it still advertises itself. */
function procedureBlock(titleNote, steps, compact, extraLead) {
  return `
    <details class="procedure procedure-fold">
      <summary>
        <span class="procedure-title">Suggested starting procedure${titleNote ? ` <span class="procedure-note">(${titleNote})</span>` : ""}</span>
        <span class="procedure-count">${steps.length} steps</span>
      </summary>
      <ol class="procedure-steps">${steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      ${compact ? disclaimerCompactHTML() : disclaimerHTML(extraLead)}
    </details>`;
}

/* A collapsed <details> does not print its contents, and the procedure is
   exactly the part people carry to the bench. Open everything for printing,
   then put it back so the screen state is unchanged. */
(function keepDetailsInPrint() {
  let reopened = [];
  window.addEventListener("beforeprint", () => {
    reopened = Array.prototype.slice.call(document.querySelectorAll("details:not([open])"));
    reopened.forEach((d) => (d.open = true));
  });
  window.addEventListener("afterprint", () => {
    reopened.forEach((d) => (d.open = false));
    reopened = [];
  });
})();

function techniqueProcedureSteps(cfg, core, ctx, names, sec) {
  const monomerAmt = `${fmtMass(core.massM_g)}${ctx.densityM ? ` (${fmtVol(core.massM_g / ctx.densityM)})` : ""} of ${names.monomer}`;
  const agentAmt = `${fmtMass(core.massX_g)} of ${names.agent}`;
  const solventStep = core.volTotalL != null
    ? `Add solvent to a total reaction volume of ${fmtVol(core.volTotalL * 1000)} (roughly ${fmtVol(core.solventVolumeML)} of solvent).`
    : `Add your reaction solvent now if running in solution (this recipe was calculated without a set volume; bulk is also common).`;
  const convTarget = fmtNum(core.conversion * 100);
  const monitorStep = `Pull small aliquots periodically and track conversion against an internal standard (see <a href="conversion-monitoring.html">monitoring conversion</a>); this recipe assumes stopping near ${convTarget}% conversion.`;
  const workupStep = `Precipitate the polymer into a suitable non-solvent, filter or decant, and dry to constant mass under vacuum.`;
  const charStep = `Characterize: M<sub>n</sub> and &ETH; by GPC, composition and end groups by NMR.`;

  if (cfg.id === "atrp") {
    return [
      `Charge a dry Schlenk flask (or septum-capped vial at small scale) with a stir bar${sec && sec.mCat != null ? `, ${fmtMass(sec.mCat)} of ${sec.catName}, and ${fmtMass(sec.mLig)} of ${sec.ligName}` : " and your copper catalyst / ligand system"}.`,
      ctx.macroMode
        ? `Add ${monomerAmt} (inhibitor removed) and ${agentAmt}, dissolved together.`
        : `Add ${monomerAmt} (inhibitor removed).`,
      solventStep,
      `Seal and degas thoroughly. Three freeze-pump-thaw cycles is standard for ATRP (see the <a href="air-free-technique.html">air-free guide</a>), then backfill with inert gas.`,
      ctx.macroMode
        ? `Place the flask in a bath preheated to your chosen reaction temperature and stir.`
        : `Under positive inert pressure, add ${agentAmt} (separately degassed) by syringe, then place the flask in a bath preheated to your chosen reaction temperature.`,
      monitorStep,
      `Stop the reaction by cooling and exposing to air (oxidizes the Cu(I) activator).`,
      `Remove the copper catalyst by passing a THF or DCM solution of the polymer through a short neutral alumina plug, or stirring with an appropriate resin.`,
      workupStep,
      charStep,
    ];
  }
  if (cfg.id === "raft" && sec && sec.petName) {
    return [
      sec.petStock
        ? `Prepare a photocatalyst stock solution: at ${fmtNum(sec.petPpm)} ppm versus monomer you need ${fmtMass(sec.mPet)} of ${sec.petName}, far too little to weigh. Dissolve ${fmtNum(sec.petStock.massMg)} mg in ${fmtNum(sec.petStock.volML)} mL of your reaction solvent (${fmtNum(sec.petStock.concMgML)} mg/mL) and deliver ${fmtUL(sec.petStock.aliquotUL)} of that stock. Stock solutions of the dyes keep for a while in the dark but make them fresh if precision matters.`
        : `Weigh ${fmtMass(sec.mPet)} of ${sec.petName} (${fmtNum(sec.petPpm)} ppm versus monomer).`,
      `Charge a septum-capped vial with a stir bar, ${agentAmt}, and the photocatalyst aliquot. No thermal initiator is used; the radicals come from photoactivation of the CTA itself, which is why end-group fidelity is so high in PET-RAFT.`,
      `Add ${monomerAmt} (inhibitor removal recommended). Avoid primary amines in the system, with one deliberate exception: adding a tertiary amine such as triethylamine enables a reductive quenching cycle that consumes residual oxygen, letting eosin Y systems run without rigorous degassing.`,
      solventStep,
      `Degas by sparging with nitrogen or argon for 15&ndash;20 min, or skip it entirely if you took the amine route: eosin Y with triethylamine polymerizes fully open to air under ordinary blue or green LEDs. Keep the vial shielded from light until you mean to start. See the <a href="air-free-technique.html#oxygen-tolerant">oxygen tolerance guide</a>.`,
      `Irradiate with ${sec.petLight} at room temperature with stirring, positioning the vial a few centimeters from the source. Chain growth only happens while the light is on, so switching it off pauses the polymerization cleanly and switching back on resumes it.`,
      monitorStep,
      `Stop by switching the light off and exposing to air.`,
      workupStep + ` A retained thiocarbonylthio end group usually leaves the polymer pale yellow to pink, which is normal.`,
      charStep,
    ];
  }
  if (cfg.id === "raft") {
    return [
      `Charge a flask or septum-capped vial with a stir bar, ${agentAmt}${sec && sec.mInit != null ? `, and ${fmtMass(sec.mInit)} of ${sec.initName}` : `, and your radical initiator (CTA : initiator around 5&nbsp;:&nbsp;1 to 10&nbsp;:&nbsp;1 is typical)`}. Azo initiators are the safe default; peroxides and persulfates can oxidize the thiocarbonylthio group.`,
      `Add ${monomerAmt} (inhibitor removal recommended). Avoid primary amines anywhere in the system (monomer functionality, solvent, additives): they cleave the CTA chain end by aminolysis.`,
      solventStep,
      `Degas: sparge with nitrogen or argon for 20&ndash;30 min, or freeze-pump-thaw for more rigor (see the <a href="air-free-technique.html">air-free guide</a>).`,
      `Place in a bath preheated to the initiator's working temperature (60&nbsp;&ndash;&nbsp;70&nbsp;&deg;C is typical for AIBN) and stir.`,
      monitorStep,
      `Stop by cooling and exposing to air. Don't leave the reaction hot long after conversion plateaus; continued radical generation with no monomer left degrades the thiocarbonylthio end groups and accumulates dead chains.`,
      workupStep + ` A retained thiocarbonylthio end group usually leaves the polymer pale yellow to pink, which is normal.`,
      charStep,
    ];
  }
  if (cfg.id === "romp") {
    return [
      `In a glovebox, or on a Schlenk line under inert gas, dissolve ${monomerAmt} in dry, degassed solvent (DCM and THF are common). ${core.volTotalL != null ? `Target a total volume near ${fmtVol(core.volTotalL * 1000)}.` : ""}`,
      `Separately dissolve ${agentAmt} in a small amount of the same dry, degassed solvent.`,
      `Add the catalyst solution to the stirred monomer solution in one quick portion at room temperature.`,
      `Monitor conversion. ROMP of strained monomers is often complete within minutes to an hour (see <a href="conversion-monitoring.html">monitoring conversion</a>).`,
      `Quench with a large excess of ethyl vinyl ether (roughly 100 equivalents versus catalyst) and stir 15&ndash;30 min to cap the chain ends.`,
      workupStep,
      charStep,
    ];
  }
  // FRP
  return [
    `Charge a flask with a stir bar, ${monomerAmt} (inhibitor removed), and ${agentAmt}.`,
    solventStep,
    `Degas by sparging with nitrogen or argon for 15&ndash;30 min (freeze-pump-thaw for more rigor).`,
    `Heat to the initiator's decomposition temperature (60&ndash;70&nbsp;&deg;C for AIBN, 70&ndash;85&nbsp;&deg;C for BPO) with stirring.`,
    monitorStep + ` Watch the exotherm in bulk or concentrated runs, since conventional FRP can autoaccelerate (Trommsdorff effect).`,
    `Stop by cooling and exposing to air.`,
    workupStep,
    charStep,
  ];
}

/* ---------------------------------------------------------------------
   Polyurethane (two-step prepolymer route)
   Step 1 caps a polyol with excess diisocyanate at a set NCO:OH ratio;
   step 2 doses a chain extender against the prepolymer's %NCO. All the
   arithmetic is equivalents-based, and step 2 accepts a measured %NCO
   (e.g. from in-line IR against a calibration) in place of the theoretical value.
--------------------------------------------------------------------- */

const PU_NCO_MW = 42.02; // molecular weight of one NCO group
const PU_KOH = 56100;    // mg KOH per mol, for OH-number conversion

const PU_POLYOLS = [
  { name: "PTMEG 2000", ohn: 56.1, f: 2 },
  { name: "PTMEG 1000", ohn: 112.2, f: 2 },
  { name: "PPG 2000", ohn: 56.1, f: 2 },
  { name: "PPG 1000", ohn: 112.2, f: 2 },
  { name: "PCL diol 2000", ohn: 56.1, f: 2 },
  { name: "Polyester adipate diol 2000", ohn: 56.1, f: 2 },
  { name: "PEG 1000", ohn: 112.2, f: 2 },
  { name: "HTPB (R-45 type)", ohn: 46.6, f: 2.4 },
  { name: "Custom (enter values below)", ohn: null, f: null },
];

const PU_DIISOS = [
  { name: "MDI (4,4'-)", eq: 125.13, mw: 250.26, nco: 33.6, note: "Solid, melts ~40 °C; handle melted under dry N₂" },
  { name: "TDI (80/20)", eq: 87.08, mw: 174.16, nco: 48.3, note: "High vapor pressure, a serious inhalation hazard" },
  { name: "IPDI", eq: 111.14, mw: 222.28, nco: 37.8, note: "Aliphatic, UV-stable products; slow, usually catalyzed" },
  { name: "HDI", eq: 84.10, mw: 168.20, nco: 50.0, note: "Aliphatic; monomer is volatile and hazardous" },
  { name: "H12MDI (Desmodur W)", eq: 131.18, mw: 262.35, nco: 32.0, note: "Aliphatic, low viscosity" },
  { name: "Custom (enter value below)", eq: null, mw: null, nco: null, note: "" },
];

const PU_CATALYSTS = [
  { name: "None", pct: null, note: "" },
  { name: "DBTDL (dibutyltin dilaurate)", pct: 0.02, note: "The standard tin gelation catalyst; strongly selective for NCO-OH. An organotin, increasingly regulated" },
  { name: "Stannous octoate (T-9)", pct: 0.05, note: "Common in castables and foams; less hydrolytically stable than DBTDL" },
  { name: "DABCO (TEDA, tertiary amine)", pct: 0.1, note: "Amine catalyst; also accelerates the water-NCO side reaction, so keep everything rigorously dry" },
  { name: "Bismuth neodecanoate", pct: 0.1, note: "Lower-toxicity tin alternative with good gelation selectivity" },
  { name: "Zinc octoate", pct: 0.2, note: "Mild; often paired with an amine or used in tin-free systems" },
  { name: "Custom (enter wt% below)", pct: null, note: "" },
];

const PU_EXTENDERS = [
  { name: "1,4-Butanediol (BDO)", eq: 45.06, mw: 90.12, type: "diol", note: "The workhorse urethane extender" },
  { name: "Ethylene glycol", eq: 31.03, mw: 62.07, type: "diol", note: "Higher hard-segment density than BDO" },
  { name: "1,6-Hexanediol", eq: 59.09, mw: 118.17, type: "diol", note: "Softer hard segments, better hydrolysis resistance" },
  { name: "Glycerol", eq: 30.70, mw: 92.09, type: "triol", note: "f = 3: crosslinker, not a linear extender" },
  { name: "Trimethylolpropane (TMP)", eq: 44.72, mw: 134.17, type: "triol", note: "f = 3: crosslinker, not a linear extender" },
  { name: "MOCA (diamine)", eq: 133.58, mw: 267.16, type: "amine", note: "Forms urea hard segments (urethane-urea). Suspected human carcinogen, strict handling controls required" },
  { name: "DETDA / Ethacure 100 (diamine)", eq: 89.14, mw: 178.27, type: "amine", note: "Liquid aromatic diamine, fast, with a short pot life" },
  { name: "Custom (enter value below)", eq: null, mw: null, type: "diol", note: "" },
];

function puFmt(n, digits) {
  if (!isFinite(n)) return "n/a";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 10000) return n.toFixed(0);
  if (abs >= 100) return n.toFixed(1);
  if (abs >= 1) return n.toFixed(digits == null ? 2 : digits);
  return n.toFixed(3);
}

function polyurethaneTemplate() {
  const opts = (list) => list.map((item, i) => `<option value="${i}">${escapeHtml(item.name)}</option>`).join("");
  return `
    <div class="panel-head">
      <div>
        <h2>Polyurethane</h2>
        <p>Two-step prepolymer route: cap a polyol with excess diisocyanate, then chain extend the prepolymer.</p>
      </div>
      <button type="button" class="copy-btn print-btn" onclick="window.print()">&#128424; Print recipe</button>
    </div>

    ${presetBarHTML("pu")}

    <div class="card">
      <label class="checkbox-row" style="margin-bottom:0;">
        <input type="checkbox" id="pu-simple-mode">
        <span>Simplified mode: diol-only block copolymer, molecular weights only</span>
      </label>
    </div>

    <div class="card">
      <h3>How this works</h3>
      <div class="pu-advanced-only">
        <p class="guide-note">
          First, <strong>cap</strong> a hydroxyl-terminated polyol with an excess of diisocyanate so every chain end
          becomes an isocyanate (the NCO:OH ratio, typically 1.6&ndash;2.2:1, sets how much free NCO remains). The
          theoretical %NCO below assumes the capping reaction goes to completion, with every polyol OH consumed and
          none left over, which is why measuring the real value in Step 2 matters. Second,
          <strong>chain extend</strong> the NCO-terminated prepolymer with a short diol or diamine, building the hard
          segments and driving molecular weight up. In practice, <strong>measure the real %NCO</strong> of your
          prepolymer before extending by following the isocyanate stretch at ~2270 cm<sup>&minus;1</sup> by in-line IR
          and quantify against a calibration. Side reactions, moisture, and polyol batch variation all pull the real
          value below theory, and Step 2 accepts your measured value for exactly that reason. Although the urethane
          bond forms by addition, with no small molecule split off, the chain still builds by step-growth, so its
          molecular weight is set by the Step 2 stoichiometry (the Carothers limit X<sub>n</sub> = (1 + r) &divide; (1 &minus; r),
          with r the equivalents ratio). That is the deeper reason the extender index has to sit close to 1.00: a
          couple percent off stoichiometry caps how high Mn can climb, quite apart from leaving free NCO for
          allophanate/biuret crosslinking.
        </p>
        <div class="guide-formula">
          Polyol eq wt = 56100 &divide; OH# &nbsp;|&nbsp; Diisocyanate eq wt = 4202 &divide; %NCO &nbsp;|&nbsp; %NCO<sub>prepolymer</sub> = 4202 &times; (eq NCO &minus; eq OH) &divide; total mass
        </div>
        <p class="guide-note" style="margin-top:8px;">
          OH# and %NCO are read directly off your polyol and isocyanate certificates of analysis. Nothing here is titrated as part of this synthesis. 56100 and 4202 are just the standard conversion constants for turning those two reporting conventions into equivalent weight (100 &times; 42.02, the molecular weight of the &minus;NCO group itself, for the isocyanate side).
        </p>
      </div>
      <div class="pu-simple-only">
        <p class="guide-note">
          A segmented polyurethane block copolymer, built the same two-step way, using molecular weights directly
          for every reagent. First, <strong>cap</strong> a diol (the soft segment, given as an Mn) with
          excess diisocyanate so both chain ends become isocyanates. Second, <strong>chain extend</strong> with a
          short diol to consume the leftover isocyanate, building the hard segment and driving up molecular weight.
          Follow the reaction by in-line IR (isocyanate stretch at ~2270 cm<sup>&minus;1</sup>) if you have the setup for it.
        </p>
        <div class="guide-formula">
          Polyol eq wt = Mn &divide; 2 &nbsp;|&nbsp; Diisocyanate eq wt = MW &divide; 2 &nbsp;|&nbsp; Extender eq wt = MW &divide; 2
        </div>
        <p class="guide-note" style="margin-top:8px;">
          Dividing by 2 assumes every reagent here is difunctional (a linear diol soft segment, a diisocyanate, and a diol chain extender), which is exactly what a segmented block copolymer needs.
        </p>
      </div>
    </div>

    <div class="card">
      <h3>Step 1: Prepolymer (capping)</h3>
      <div class="grid">
        <div class="field">
          <label for="pu-polyol-select">Polyol (diol)</label>
          <select id="pu-polyol-select">${opts(PU_POLYOLS)}</select>
          <span class="hint pu-advanced-only">Autofills OH number and functionality; edit freely</span>
          <span class="hint pu-simple-only">Autofills Mn; edit freely</span>
        </div>
        <div class="field pu-advanced-only">
          <label for="pu-ohn">OH number (mg KOH/g)</label>
          <input type="number" id="pu-ohn" value="56.1" step="any" min="0.1">
          <span class="hint">From the polyol's COA. Eq wt = 56100 &divide; OH#</span>
        </div>
        <div class="field pu-advanced-only">
          <label for="pu-f">Functionality (OH per chain)</label>
          <input type="number" id="pu-f" value="2" step="any" min="1">
          <span class="hint">2 for a diol; HTPB is often ~2.2&ndash;2.5</span>
        </div>
        <div class="field pu-simple-only">
          <label for="pu-mn">Polyol Mn (g/mol)</label>
          <input type="number" id="pu-mn" value="2000" step="any" min="1">
          <span class="hint">Number-average molecular weight of the diol soft segment</span>
        </div>
        <div class="field">
          <label for="pu-polyol-mass">Polyol mass (g)</label>
          <input type="number" id="pu-polyol-mass" value="100" step="any" min="0">
        </div>
        <div class="field">
          <label for="pu-iso-select">Diisocyanate</label>
          <select id="pu-iso-select">${opts(PU_DIISOS)}</select>
        </div>
        <div class="field pu-advanced-only">
          <label for="pu-iso-eq">Diisocyanate eq wt (g/eq NCO)</label>
          <input type="number" id="pu-iso-eq" value="125.13" step="any" min="1">
          <span class="hint">= 4202 &divide; %NCO of the isocyanate</span>
        </div>
        <div class="field pu-simple-only">
          <label for="pu-iso-mw">Diisocyanate MW (g/mol)</label>
          <input type="number" id="pu-iso-mw" value="250.26" step="any" min="1">
          <span class="hint">Molecular weight of the diisocyanate molecule</span>
        </div>
        <div class="field">
          <label for="pu-ratio">NCO : OH capping ratio</label>
          <input type="number" id="pu-ratio" value="2.0" step="any" min="1">
          <span class="hint">1.6&ndash;2.2 typical. Below ~2, some chain coupling during capping is unavoidable; at 2+ more free diisocyanate remains</span>
        </div>
      </div>
      <div class="stat-grid" id="pu-prep-stats" style="margin-top:16px;"></div>
    </div>

    <div class="card">
      <h3>Step 2: Chain extension</h3>
      <div class="grid">
        <div class="field">
          <label for="pu-prepoly-mass">Prepolymer mass to extend (g)</label>
          <input type="number" id="pu-prepoly-mass" value="" step="any" min="0">
          <span class="hint">Defaults to the full Step 1 batch; edit if extending a portion</span>
        </div>
        <div class="field pu-advanced-only">
          <label for="pu-nco-measured">%NCO of prepolymer (measured, optional)</label>
          <input type="number" id="pu-nco-measured" value="" step="any" min="0">
          <span class="hint">Leave blank to use the Step 1 theoretical value. For real work, quantify from your in-line IR calibration</span>
        </div>
        <div class="field">
          <label for="pu-ext-select">Chain extender <span class="pu-advanced-only">/ curative</span></label>
          <select id="pu-ext-select"></select>
          <span class="hint" id="pu-ext-note"></span>
        </div>
        <div class="field pu-advanced-only">
          <label for="pu-ext-eq">Extender eq wt (g/eq)</label>
          <input type="number" id="pu-ext-eq" value="45.06" step="any" min="1">
          <span class="hint">MW &divide; number of reactive OH/NH<sub>2</sub> groups</span>
        </div>
        <div class="field pu-simple-only">
          <label for="pu-ext-mw">Extender MW (g/mol)</label>
          <input type="number" id="pu-ext-mw" value="90.12" step="any" min="1">
          <span class="hint">Molecular weight of the diol chain extender</span>
        </div>
        <div class="field">
          <label for="pu-index">Extender index (eq OH per eq NCO)</label>
          <input type="number" id="pu-index" value="0.95" step="any" min="0.1" max="1.5">
          <span class="hint">0.90&ndash;1.00 typical; slightly sub-stoichiometric leaves NCO for allophanate/biuret crosslinking on cure</span>
        </div>
        <div class="field">
          <label for="pu-cat-select">Cure catalyst (optional)</label>
          <select id="pu-cat-select">${PU_CATALYSTS.map((c, i) => `<option value="${i}">${escapeHtml(c.name)}</option>`).join("")}</select>
          <span class="hint" id="pu-cat-note"></span>
        </div>
        <div class="field">
          <label for="pu-cat-pct">Catalyst loading (wt% of final batch)</label>
          <input type="number" id="pu-cat-pct" value="" step="any" min="0" max="5">
          <span class="hint">0.01&ndash;0.2 wt% typical; more catalyst = shorter pot life. The diol and diisocyanate reaction proceeds without a catalyst, and is often run uncatalyzed to suppress side reactions; the catalyst mainly buys rate and pot-life control, not a different product.</span>
        </div>
      </div>
      <div class="stat-grid" id="pu-ext-stats" style="margin-top:16px;"></div>
      <div id="pu-procedure"></div>
    </div>

    <div class="card pu-advanced-only">
      <h3>Reference data</h3>
      <p class="guide-note">Typical values for common building blocks. Always use the certificate of analysis for your actual lot, since OH number and %NCO vary batch to batch, and that variation is exactly why measured %NCO beats theoretical for the extension step.</p>
      <div class="table-scroll">
        <table class="recipe">
          <thead><tr><th>Diisocyanate</th><th>Eq wt (g/eq)</th><th>%NCO</th><th>Notes</th></tr></thead>
          <tbody>${PU_DIISOS.filter((d) => d.eq).map((d) =>
            `<tr><td>${d.name}</td><td class="num">${d.eq}</td><td class="num">${d.nco}</td><td>${d.note}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="table-scroll" style="margin-top:14px;">
        <table class="recipe">
          <thead><tr><th>Extender</th><th>Eq wt (g/eq)</th><th>Type</th><th>Notes</th></tr></thead>
          <tbody>${PU_EXTENDERS.filter((e) => e.eq).map((e) =>
            `<tr><td>${e.name}</td><td class="num">${e.eq}</td><td>${e.type}</td><td>${e.note}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="table-scroll" style="margin-top:14px;">
        <table class="recipe">
          <thead><tr><th>Cure catalyst</th><th>Typical loading (wt%)</th><th>Notes</th></tr></thead>
          <tbody>${PU_CATALYSTS.filter((c) => c.pct).map((c) =>
            `<tr><td>${c.name}</td><td class="num">${c.pct}</td><td>${c.note}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card pu-simple-only">
      <h3>Reference data</h3>
      <p class="guide-note">Typical molecular weights for common building blocks. Always use the certificate of analysis for your actual lot.</p>
      <div class="table-scroll">
        <table class="recipe">
          <thead><tr><th>Diisocyanate</th><th>MW (g/mol)</th><th>Notes</th></tr></thead>
          <tbody>${PU_DIISOS.filter((d) => d.mw).map((d) =>
            `<tr><td>${d.name}</td><td class="num">${d.mw}</td><td>${d.note}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="table-scroll" style="margin-top:14px;">
        <table class="recipe">
          <thead><tr><th>Diol extender</th><th>MW (g/mol)</th><th>Notes</th></tr></thead>
          <tbody>${PU_EXTENDERS.filter((e) => e.mw && e.type === "diol").map((e) =>
            `<tr><td>${e.name}</td><td class="num">${e.mw}</td><td>${e.note}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="table-scroll" style="margin-top:14px;">
        <table class="recipe">
          <thead><tr><th>Cure catalyst</th><th>Typical loading (wt%)</th><th>Notes</th></tr></thead>
          <tbody>${PU_CATALYSTS.filter((c) => c.pct).map((c) =>
            `<tr><td>${c.name}</td><td class="num">${c.pct}</td><td>${c.note}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function wirePolyurethanePanel() {
  let prepolyMassDirty = false;

  function isSimple() { return $("pu-simple-mode").checked; }

  // In simple mode only difunctional diol extenders make sense (no amine/triol
  // curatives), so the dropdown gets rebuilt with a filtered option list
  // whenever the mode toggles. Falls back to index 0 if the previous
  // selection doesn't exist in the new list.
  function populateExtenderSelect() {
    const sel = $("pu-ext-select");
    const prevValue = sel.value;
    const indices = PU_EXTENDERS.map((e, i) => i).filter((i) => !isSimple() || PU_EXTENDERS[i].type === "diol");
    sel.innerHTML = indices.map((i) => `<option value="${i}">${escapeHtml(PU_EXTENDERS[i].name)}</option>`).join("");
    sel.value = indices.includes(parseInt(prevValue, 10)) ? prevValue : String(indices[0]);
  }

  function applyExtenderDefaults() {
    const e = PU_EXTENDERS[parseInt($("pu-ext-select").value, 10)];
    if (!e) return;
    if (e.eq != null) $("pu-ext-eq").value = e.eq;
    if (e.mw != null) $("pu-ext-mw").value = e.mw;
    $("pu-ext-note").textContent = e.note || "";
  }

  function recalcPu() {
    const simple = isSimple();
    const mPolyol = parseFloat($("pu-polyol-mass").value);
    const ratio = parseFloat($("pu-ratio").value);
    const prepStats = $("pu-prep-stats");

    let f, eqwtPolyol;
    if (simple) {
      f = 2;
      const mn = parseFloat($("pu-mn").value);
      if (!(mn > 0)) {
        prepStats.innerHTML = '<div class="error-msg">Enter a polyol Mn, polyol mass, diisocyanate MW, and an NCO:OH ratio &ge; 1.</div>';
        $("pu-ext-stats").innerHTML = ""; $("pu-procedure").innerHTML = "";
        return;
      }
      eqwtPolyol = mn / 2;
    } else {
      const ohn = parseFloat($("pu-ohn").value);
      f = parseFloat($("pu-f").value);
      if (!(ohn > 0) || !(f >= 1)) {
        prepStats.innerHTML = '<div class="error-msg">Enter an OH number, functionality &ge; 1, polyol mass, diisocyanate eq wt, and an NCO:OH ratio &ge; 1.</div>';
        $("pu-ext-stats").innerHTML = ""; $("pu-procedure").innerHTML = "";
        return;
      }
      eqwtPolyol = PU_KOH / ohn;
    }

    const eqIso = simple ? parseFloat($("pu-iso-mw").value) / 2 : parseFloat($("pu-iso-eq").value);

    if (!(mPolyol > 0) || !(eqIso > 0) || !(ratio >= 1)) {
      prepStats.innerHTML = `<div class="error-msg">Enter a polyol mass, diisocyanate ${simple ? "MW" : "eq wt"}, and an NCO:OH ratio &ge; 1.</div>`;
      $("pu-ext-stats").innerHTML = ""; $("pu-procedure").innerHTML = "";
      return;
    }

    // ---- Step 1: capping ----
    const polyolMn = eqwtPolyol * f;
    const eqOH = mPolyol / eqwtPolyol;
    const eqNCO = eqOH * ratio;
    const mIso = eqNCO * eqIso;
    const mPrepTotal = mPolyol + mIso;
    const freeNCOeq = eqNCO - eqOH;
    const theoNCO = (PU_NCO_MW * freeNCOeq / mPrepTotal) * 100;
    const isoMassFraction = mIso / mPrepTotal;
    const idealMn = polyolMn + f * (2 * eqIso);

    prepStats.innerHTML =
      `<div class="stat"><div class="label">Polyol eq wt</div><div class="value">${puFmt(eqwtPolyol, 1)}</div><div class="sub">g/eq OH &middot; Mn &asymp; ${puFmt(polyolMn, 0)} g/mol at f = ${puFmt(f, 2)}</div></div>` +
      `<div class="stat"><div class="label">OH equivalents</div><div class="value">${puFmt(eqOH * 1000, 1)}</div><div class="sub">meq, from ${puFmt(mPolyol, 1)} g polyol</div></div>` +
      `<div class="stat"><div class="label">Diisocyanate to charge</div><div class="value">${puFmt(mIso, 2)} g</div><div class="sub">${puFmt(eqNCO * 1000, 1)} meq NCO at ${puFmt(ratio, 2)} : 1</div></div>` +
      (simple
        ? `<div class="stat"><div class="label">Free NCO remaining</div><div class="value">${puFmt(freeNCOeq * 1000, 1)}</div><div class="sub">meq, in ${puFmt(mPrepTotal, 1)} g prepolymer at 100% OH conversion</div></div>`
        : `<div class="stat"><div class="label">Theoretical %NCO</div><div class="value">${puFmt(theoNCO, 2)}%</div><div class="sub">of ${puFmt(mPrepTotal, 1)} g prepolymer at 100% OH conversion &middot; confirm by in-line IR</div></div>`) +
      `<div class="stat"><div class="label">Idealized capped adduct Mn</div><div class="value">${puFmt(idealMn, 0)}</div><div class="sub">g/mol${ratio < 2 ? " &middot; ratio &lt; 2: real Mn runs higher from chain coupling" : " &middot; real prepolymer also contains free diisocyanate"}</div></div>`;

    // Keep step 2's default mass in sync until the user edits it
    if (!prepolyMassDirty) $("pu-prepoly-mass").value = puFmt(mPrepTotal, 2);
    if (!simple) $("pu-nco-measured").placeholder = `${puFmt(theoNCO, 2)} (theoretical)`;

    // ---- Step 2: chain extension ----
    const mPre = parseFloat($("pu-prepoly-mass").value);
    const measured = simple ? NaN : parseFloat($("pu-nco-measured").value);
    const usingMeasured = !simple && isFinite(measured) && measured > 0;
    // Free-NCO-per-gram of prepolymer, computed once at Step 1 and simply
    // scaled by whatever mass is being extended - this sidesteps %NCO
    // entirely in simple mode while giving the identical result.
    const freeNCOperGram = freeNCOeq / mPrepTotal;
    const pctNCO = usingMeasured ? measured : theoNCO;
    const eqExt = simple ? parseFloat($("pu-ext-mw").value) / 2 : parseFloat($("pu-ext-eq").value);
    const index = parseFloat($("pu-index").value);
    const extStats = $("pu-ext-stats");
    const extSel = PU_EXTENDERS[parseInt($("pu-ext-select").value, 10)] || PU_EXTENDERS[0];

    if (!(mPre > 0) || !(eqExt > 0) || !(index > 0) || (!simple && !(pctNCO > 0))) {
      extStats.innerHTML = `<div class="error-msg">Enter a prepolymer mass, an extender ${simple ? "MW" : "eq wt"}, and an index${simple ? "" : ", plus a %NCO &gt; 0"}.</div>`;
      $("pu-procedure").innerHTML = "";
      return;
    }

    const eqNCOavail = simple ? mPre * freeNCOperGram : (mPre * pctNCO / 100) / PU_NCO_MW;
    const eqExtNeeded = eqNCOavail * index;
    const mExt = eqExtNeeded * eqExt;
    const mFinal = mPre + mExt;
    const hardSeg = ((mPre * isoMassFraction) + mExt) / mFinal * 100;

    const catSel = PU_CATALYSTS[parseInt($("pu-cat-select").value, 10)] || PU_CATALYSTS[0];
    const catPct = parseFloat($("pu-cat-pct").value);
    const useCat = catSel.name !== "None" && isFinite(catPct) && catPct > 0;
    const mCat = useCat ? (catPct / 100) * mFinal : 0;
    const catMassText = mCat < 1 ? `${puFmt(mCat * 1000, 1)} mg` : `${puFmt(mCat, 2)} g`;
    const catShort = catSel.name.replace(/ \(.*$/, "");

    extStats.innerHTML =
      `<div class="stat"><div class="label">NCO to consume</div><div class="value">${puFmt(eqNCOavail * 1000, 1)}</div><div class="sub">meq${simple ? ", from Step 1's free NCO" : `, at ${puFmt(pctNCO, 2)}%NCO (${usingMeasured ? "measured" : "theoretical"})`}</div></div>` +
      `<div class="stat"><div class="label">Extender to charge</div><div class="value">${puFmt(mExt, 2)} g</div><div class="sub">${puFmt(eqExtNeeded * 1000, 1)} meq at index ${puFmt(index, 2)}</div></div>` +
      `<div class="stat"><div class="label">Final batch mass</div><div class="value">${puFmt(mFinal, 1)} g</div><div class="sub">prepolymer + extender</div></div>` +
      `<div class="stat"><div class="label">Hard segment content</div><div class="value">${puFmt(hardSeg, 1)}%</div><div class="sub">diisocyanate + extender, by mass &middot; soft segment ${puFmt(100 - hardSeg, 1)}%</div></div>` +
      (useCat ? `<div class="stat"><div class="label">${escapeHtml(catShort)} to charge</div><div class="value">${catMassText}</div><div class="sub">${puFmt(catPct, 3)} wt% of final batch</div></div>` : "") +
      (!simple && extSel.type === "amine" ? `<div class="stat"><div class="label">Chemistry note</div><div class="value" style="font-size:var(--fs-base);">Urea hard segments</div><div class="sub">amine curatives give a urethane-urea; faster reaction, shorter pot life, harder product</div></div>` : "") +
      (!simple && extSel.type === "triol" ? `<div class="stat"><div class="label">Chemistry note</div><div class="value" style="font-size:var(--fs-base);">Crosslinked network</div><div class="sub">f = 3 curative: this is a thermoset formulation, not a linear TPU</div></div>` : "");

    const isoSel = PU_DIISOS[parseInt($("pu-iso-select").value, 10)] || PU_DIISOS[0];
    const polyolSel = PU_POLYOLS[parseInt($("pu-polyol-select").value, 10)] || PU_POLYOLS[0];
    const shortName = (s) => s.replace(/ \(.*$/, "");
    const irStep = simple
      ? `Follow the capping reaction by in-line IR if available: watch the isocyanate stretch at ~2270 cm<sup>&minus;1</sup> decay as the polyol OH is consumed (the urethane carbonyl grows in at ~1700&ndash;1730 cm<sup>&minus;1</sup>), plateauing once capping is complete. Store any unused prepolymer under dry inert gas, since it is moisture-reactive.`
      : `Follow the capping reaction by in-line IR: watch the isocyanate stretch at ~2270 cm<sup>&minus;1</sup> decay as the polyol OH is consumed (the urethane carbonyl grows in at ~1700&ndash;1730 cm<sup>&minus;1</sup>). The step is done when the NCO band plateaus at the level corresponding to the theoretical ${puFmt(theoNCO, 2)}% free NCO. Quantify against your calibration and enter the measured value in Step 2. Store any unused prepolymer under dry inert gas, since it is moisture-reactive.`;
    const puSteps = [
      `Dry ${puFmt(mPolyol, 1)} g of ${shortName(polyolSel.name)} at 80&ndash;100 &deg;C under vacuum (&lt;1&nbsp;torr) for 1&ndash;2&nbsp;h, until bubbling stops. Residual water consumes NCO and generates CO<sub>2</sub> bubbles in the final part.`,
      `Cool to 60&ndash;70 &deg;C and blanket with dry nitrogen. Charge ${puFmt(mIso, 2)} g of ${shortName(isoSel.name)} with stirring.`,
      `React at 70&ndash;80 &deg;C under dry N<sub>2</sub> for 2&ndash;3 h (aliphatic isocyanates are slower and may need a tin catalyst such as DBTDL at 0.01&ndash;0.05 wt%).`,
      irStep,
      `For chain extension: warm ${puFmt(mPre, 1)} g of prepolymer to 60&ndash;80 &deg;C to lower viscosity, and degas under vacuum until bubble-free.`,
      ...(useCat ? [`Pre-dissolve ${catMassText} of ${shortName(catSel.name)} in the chain extender (or dose it into the degassed prepolymer just before extension). At ${puFmt(catPct, 3)} wt%, expect the pot life to shorten noticeably, so run a small trial batch first.`] : []),
      `Add ${puFmt(mExt, 2)} g of ${shortName(extSel.name)}${extSel.type === "amine" ? " (melt MOCA at ~110 &deg;C first if using it)" : ""} and mix rapidly but thoroughly for 1&ndash;2 min, avoiding air entrainment.${extSel.type === "amine" ? " Amine curatives react fast, so know your pot life before you scale up." : ""}`,
      `Degas briefly if pot life allows, then cast into preheated, release-coated molds.`,
      `Cure (typical: 100 &deg;C for 16 h for aromatic systems; adjust to your chemistry). If the IR probe survives your cure setup, the extension/cure can be followed the same way: the 2270 cm<sup>&minus;1</sup> NCO band decaying to baseline is your endpoint. Post-cure/condition about a week at room temperature before testing.`,
      `Characterize: hardness and tensile after conditioning; confirm full NCO consumption by the absence of the 2270 cm<sup>&minus;1</sup> band; DSC/DMA for the soft-segment T<sub>g</sub> and hard-segment transitions.`,
    ];
    const catHazard = useCat && /DBTDL|octoate|neodecanoate/i.test(catSel.name)
      ? " Organotin and organometallic catalysts (DBTDL, stannous octoate, bismuth/zinc carboxylates) carry their own handling precautions, so avoid skin contact and check your SDS, particularly for organotins."
      : "";
    $("pu-procedure").innerHTML = procedureBlock(
      simple ? "diol-only block copolymer" : "two-step prepolymer route",
      puSteps,
      false,
      "Diisocyanates are potent respiratory and skin sensitizers. Handle them only with proper engineering controls (fume hood, sealed transfers), and note that MOCA is a suspected human carcinogen subject to strict occupational limits." + catHazard
    );
  }

  $("pu-simple-mode").addEventListener("change", function () {
    $("panel-pu").classList.toggle("pu-simple", this.checked);
    populateExtenderSelect();
    applyExtenderDefaults();
    recalcPu();
  });

  $("pu-polyol-select").addEventListener("change", function () {
    const p = PU_POLYOLS[parseInt(this.value, 10)];
    if (p && p.ohn != null) {
      $("pu-ohn").value = p.ohn;
      $("pu-f").value = p.f;
      $("pu-mn").value = puFmt((PU_KOH / p.ohn) * p.f, 0);
    }
    recalcPu();
  });
  $("pu-iso-select").addEventListener("change", function () {
    const d = PU_DIISOS[parseInt(this.value, 10)];
    if (d && d.eq != null) { $("pu-iso-eq").value = d.eq; $("pu-iso-mw").value = d.mw; }
    recalcPu();
  });
  $("pu-ext-select").addEventListener("change", function () {
    applyExtenderDefaults();
    recalcPu();
  });
  $("pu-cat-select").addEventListener("change", function () {
    const c = PU_CATALYSTS[parseInt(this.value, 10)];
    if (c) $("pu-cat-pct").value = c.pct != null ? c.pct : "";
    $("pu-cat-note").textContent = c ? c.note : "";
    recalcPu();
  });
  $("pu-prepoly-mass").addEventListener("input", () => { prepolyMassDirty = true; });

  ["pu-ohn", "pu-f", "pu-mn", "pu-polyol-mass", "pu-iso-eq", "pu-iso-mw", "pu-ratio",
   "pu-prepoly-mass", "pu-nco-measured", "pu-ext-eq", "pu-ext-mw", "pu-index", "pu-cat-pct"].forEach((id) => {
    $(id).addEventListener("input", recalcPu);
  });

  populateExtenderSelect();
  applyExtenderDefaults();
  $("pu-cat-note").textContent = PU_CATALYSTS[0].note;
  recalcPu();

  wirePresetBar("pu", () => collectPanelState("pu"), (state) => applyPanelState("pu", state, recalcPu));
}

/* ---------------------------------------------------------------------
   Emulsion polymerization
   Micellar (Smith-Ewart) nucleation: a water-soluble initiator (KPS)
   generates radicals in the aqueous phase, which are captured by
   surfactant (SDS) micelles above the CMC to nucleate particles; monomer
   diffuses in from droplets to feed particle growth. Particle number is
   the classic Smith-Ewart scaling estimate - an order-of-magnitude
   planning tool, not a validated prediction. An advanced option layers a
   RAFT or ATRP mediator on top for a controlled/living particle interior.
--------------------------------------------------------------------- */

const EM_NA = 6.02214076e23;

const EM_MONOMERS = [
  { name: "Styrene", mw: 104.15, density: 0.909, polyDensity: 1.05, phiSat: 0.60, kp: 176 },
  { name: "Methyl methacrylate", mw: 100.12, density: 0.940, polyDensity: 1.18, phiSat: 0.45, kp: 367 },
  { name: "n-Butyl acrylate", mw: 128.17, density: 0.898, polyDensity: 1.08, phiSat: 0.65, kp: 20000 },
  { name: "Vinyl acetate", mw: 86.09, density: 0.934, polyDensity: 1.19, phiSat: 0.35, kp: 3000 },
  { name: "Custom (enter values below)", mw: null, density: null, polyDensity: null, phiSat: null, kp: null },
];

const EM_SURFACTANTS = [
  { name: "SDS (sodium dodecyl sulfate)", mw: 288.38, cmc: 8.2, area: 0.40 },
  { name: "Custom (enter values below)", mw: null, cmc: null, area: null },
];

const EM_INITIATORS = [
  { name: "KPS (potassium persulfate)", mw: 270.32 },
  { name: "Custom (enter MW below)", mw: null },
];

function emFmt(n, digits) {
  if (!isFinite(n)) return "n/a";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 10000 || abs < 1e-3) return n.toExponential(2);
  if (abs >= 100) return n.toFixed(1);
  if (abs >= 1) return n.toFixed(digits == null ? 2 : digits);
  return n.toFixed(3);
}

function emulsionTemplate() {
  const opts = (list) => list.map((item, i) => `<option value="${i}">${escapeHtml(item.name)}</option>`).join("");
  return `
    <div class="panel-head">
      <div>
        <h2>Emulsion Polymerization</h2>
        <p>Micellar (Smith-Ewart) nucleation with SDS and KPS: predicted particle number and size, with an advanced option for a RAFT or ATRP mediator.</p>
      </div>
      <button type="button" class="copy-btn print-btn" onclick="window.print()">&#128424; Print recipe</button>
    </div>

    ${presetBarHTML("em")}

    <div class="card">
      <h3>How this works</h3>
      <p class="guide-note">
        Surfactant (SDS) above its critical micelle concentration (CMC) self-assembles into micelles; a
        water-soluble initiator (KPS, potassium persulfate) decomposes thermally in the aqueous phase to generate
        sulfate radical anions, which are captured by micelles to nucleate particles (Smith-Ewart Interval I).
        Monomer diffuses from larger, surfactant-stabilized droplets through the water phase to feed the growing
        particles (Interval II) until the droplets are exhausted (Interval III). Particle number is set almost
        entirely during nucleation and stays roughly constant afterward, so the final particle size is just the
        total polymer volume divided among however many particles nucleated. Because each particle propagates in
        near isolation between radical entries, that same particle number also sets the chain length, not just the
        rate: more particles means less termination and higher molecular weight. That is why emulsion can deliver
        high rate and high molecular weight at once, and why adding surfactant (more, smaller particles) lifts both,
        whereas more initiator raises the rate but lowers molecular weight, as in a bulk polymerization.
      </p>
      <div class="guide-formula">
        N &asymp; k (R<sub>i</sub> &divide; &mu;)<sup>0.4</sup> (a<sub>s</sub> &middot; [S])<sup>0.6</sup> &nbsp;&nbsp; (Smith-Ewart, particles per volume of water)
      </div>
      <p class="guide-note" style="margin-top:8px;">
        This is a textbook scaling estimate, not a validated simulation. Treat it as order-of-magnitude and
        useful for trends (more surfactant &rarr; smaller particles, more initiator &rarr; more particles), not as
        an exact prediction. Real particle size depends on agitation, addition method (batch vs. monomer-starved
        feed), electrolyte, trace metals, and impurities, none of which are captured here. Every reference constant
        below (a<sub>s</sub>, k<sub>p</sub>, &phi;<sub>sat</sub>, the initiator half-life) is editable, so use
        your own literature or supplier data where you have it.
      </p>
      <p class="guide-note" style="margin-top:8px;">
        The 0.6 (3/5) power on surfactant is the ideal Smith-Ewart limit, not a fixed law. Once particles nucleate
        and then coagulate, the observed surfactant exponent slides from about 1.2 at low surfactant down to 0.4 at
        high surfactant, one more reason to read this as order-of-magnitude. Styrene, with little radical desorption,
        tracks the ideal 0.6 (and 0.4 on R<sub>i</sub>) dependence most closely; more water-soluble monomers deviate more.
      </p>
      <p class="guide-note" style="margin-top:8px;">
        The Smith-Ewart picture also assumes radicals are captured by micelles, which holds best for styrene (water
        solubility ~0.07 g/L). Well above the CMC even methyl methacrylate (~16 g/L) still nucleates &gt;99%
        micellarly, but nearer the CMC, and for the more water-soluble vinyl acetate, a real fraction of particles
        nucleate homogeneously in the water phase, so treat the predicted particle number and size for those cases
        as a rougher, lower-confidence estimate.
      </p>
    </div>

    <div class="card">
      <h3>Recipe</h3>
      <div class="grid">
        <div class="field">
          <label for="em-monomer-select">Monomer</label>
          <select id="em-monomer-select">${opts(EM_MONOMERS)}</select>
          <span class="hint">Autofills density, polymer density, saturation swelling, and k<sub>p</sub>; edit freely</span>
        </div>
        <div class="field">
          <label for="em-monomer-mass">Monomer mass (g)</label>
          <input type="number" id="em-monomer-mass" value="100" step="any" min="0">
        </div>
        <div class="field">
          <label for="em-water-mass">Water mass (g)</label>
          <input type="number" id="em-water-mass" value="300" step="any" min="0">
        </div>
        <div class="field">
          <label for="em-conversion">Target conversion (%)</label>
          <input type="number" id="em-conversion" value="95" step="any" min="1" max="100">
        </div>
        <div class="field">
          <label for="em-surf-select">Surfactant</label>
          <select id="em-surf-select">${opts(EM_SURFACTANTS)}</select>
        </div>
        <div class="field">
          <label for="em-surf-mass">Surfactant mass (g)</label>
          <input type="number" id="em-surf-mass" value="3" step="any" min="0">
        </div>
        <div class="field">
          <label for="em-init-select">Initiator</label>
          <select id="em-init-select">${opts(EM_INITIATORS)}</select>
        </div>
        <div class="field">
          <label for="em-init-mass">Initiator mass (g)</label>
          <input type="number" id="em-init-mass" value="0.3" step="any" min="0">
        </div>
        <div class="field">
          <label for="em-temp">Reaction temperature (&deg;C)</label>
          <input type="number" id="em-temp" value="70" step="any">
          <span class="hint">Context only. k<sub>p</sub> and the half-life below should already be at (or near) this temperature</span>
        </div>
        <div class="field">
          <label for="em-half-life">Initiator half-life at this temperature (h)</label>
          <input type="number" id="em-half-life" value="5" step="any" min="0.01">
          <span class="hint">From your supplier/literature data at your actual temperature and pH. This varies a lot and matters a lot</span>
        </div>
        <div class="field">
          <label for="em-f">Initiator efficiency, f</label>
          <input type="number" id="em-f" value="1" step="any" min="0.01" max="1">
          <span class="hint">Fraction of radicals generated that successfully initiate; 1 is a common simplifying assumption for aqueous persulfate</span>
        </div>
        <div class="field">
          <label for="em-sek">Smith-Ewart constant, k</label>
          <select id="em-sek">
            <option value="0.53">0.53 (Case 2: micelles capture essentially all radicals)</option>
            <option value="0.37">0.37 (radical capture shared with existing particles)</option>
          </select>
        </div>
      </div>
      <div class="stat-grid" id="em-stats" style="margin-top:16px;"></div>
    </div>

    <div class="card">
      <label class="checkbox-row" style="margin-bottom:0;">
        <input type="checkbox" id="em-mediator-enable">
        <span>Advanced: add a controlled/living radical mediator (RAFT or ATRP)</span>
      </label>
      <div id="em-mediator-body" class="em-mediator-body" hidden style="margin-top:14px;">
        <div class="grid">
          <div class="field">
            <label for="em-mediator-type">Mediator</label>
            <select id="em-mediator-type">
              <option value="raft">RAFT agent (CTA)</option>
              <option value="atrp">ATRP (initiator + Cu catalyst)</option>
            </select>
            <span class="hint" id="em-mediator-hint"></span>
          </div>
          <div class="field">
            <label for="em-target-dp">Target DP ([M] : [mediator])</label>
            <input type="number" id="em-target-dp" value="200" step="any" min="1">
          </div>
        </div>

        <div class="grid em-mediator-raft" style="margin-top:12px;">
          <div class="field">
            <label for="em-cta-select">RAFT CTA</label>
            <select id="em-cta-select">${opts(RAFT_CTAS)}</select>
          </div>
          <div class="field">
            <label for="em-cta-mw">CTA MW (g/mol)</label>
            <input type="number" id="em-cta-mw" value="${RAFT_CTAS[0].mw}" step="any">
          </div>
        </div>

        <div class="grid em-mediator-atrp" style="margin-top:12px;">
          <div class="field">
            <label for="em-atrp-init-select">Alkyl halide initiator</label>
            <select id="em-atrp-init-select">${opts(ATRP_INITIATORS)}</select>
          </div>
          <div class="field">
            <label for="em-atrp-init-mw">Initiator MW (g/mol)</label>
            <input type="number" id="em-atrp-init-mw" value="${ATRP_INITIATORS[0].mw}" step="any">
          </div>
          <div class="field">
            <label for="em-cu-select">Cu source</label>
            <select id="em-cu-select">${opts(ATRP_CU_SOURCES)}</select>
          </div>
          <div class="field">
            <label for="em-cu-mw">Cu source MW (g/mol)</label>
            <input type="number" id="em-cu-mw" value="${ATRP_CU_SOURCES[0].mw}" step="any">
          </div>
          <div class="field">
            <label for="em-cu-eq">Cu : initiator ratio</label>
            <input type="number" id="em-cu-eq" value="1" step="any" min="0">
          </div>
          <div class="field">
            <label for="em-lig-select">Ligand</label>
            <select id="em-lig-select">${opts(ATRP_LIGANDS)}</select>
          </div>
          <div class="field">
            <label for="em-lig-mw">Ligand MW (g/mol)</label>
            <input type="number" id="em-lig-mw" value="${ATRP_LIGANDS[0].mw}" step="any">
          </div>
          <div class="field">
            <label for="em-lig-eq">Ligand : Cu ratio</label>
            <input type="number" id="em-lig-eq" value="1.1" step="any" min="0">
          </div>
        </div>

        <div class="stat-grid" id="em-mediator-stats" style="margin-top:16px;"></div>
      </div>
    </div>

    <div class="card">
      <div id="em-procedure"></div>
    </div>

    <div class="card">
      <h3>Reference data</h3>
      <p class="guide-note">Typical literature values. Always verify against your reagent's COA and your own kinetic data where it exists. k<sub>p</sub>, half-life, and swelling values here are approximate order-of-magnitude figures, not certified constants.</p>
      <div class="table-scroll">
        <table class="recipe">
          <thead><tr><th>Monomer</th><th>Density (g/mL)</th><th>Polymer density (g/mL)</th><th>&phi;<sub>sat</sub></th><th>k<sub>p</sub> (L/mol/s, ~50&deg;C)</th></tr></thead>
          <tbody>${EM_MONOMERS.filter((m) => m.mw).map((m) =>
            `<tr><td>${m.name}</td><td class="num">${m.density}</td><td class="num">${m.polyDensity}</td><td class="num">${m.phiSat}</td><td class="num">${m.kp}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="table-scroll" style="margin-top:14px;">
        <table class="recipe">
          <thead><tr><th>Surfactant</th><th>MW (g/mol)</th><th>CMC (mmol/L)</th><th>Area/molecule (nm&sup2;)</th></tr></thead>
          <tbody>${EM_SURFACTANTS.filter((s) => s.mw).map((s) =>
            `<tr><td>${s.name}</td><td class="num">${s.mw}</td><td class="num">${s.cmc}</td><td class="num">${s.area}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function wireEmulsionPanel() {
  function toggleMediatorFields() {
    const type = $("em-mediator-type").value;
    document.querySelectorAll(".em-mediator-raft").forEach((el) => { el.style.display = type === "raft" ? "" : "none"; });
    document.querySelectorAll(".em-mediator-atrp").forEach((el) => { el.style.display = type === "atrp" ? "" : "none"; });
    $("em-mediator-hint").textContent = type === "raft"
      ? "Ab initio emulsion RAFT: the same KPS above still generates the radicals; a CTA:initiator ratio of roughly 5-10:1 is typical."
      : "ATRP is normally run as a miniemulsion (pre-homogenized droplets carrying the catalyst), not classical ab initio emulsion. The particle size above assumes micellar nucleation and may not apply; treat it as reflecting the homogenized droplet size instead.";
  }

  function recalcEmulsion() {
    const mMonomer = parseFloat($("em-monomer-mass").value);
    const mWater = parseFloat($("em-water-mass").value);
    const conversion = parseFloat($("em-conversion").value);
    const mSurf = parseFloat($("em-surf-mass").value);
    const mInit = parseFloat($("em-init-mass").value);
    const halfLifeH = parseFloat($("em-half-life").value);
    const f = parseFloat($("em-f").value);
    const k = parseFloat($("em-sek").value);

    const monomerMw = parseFloat($("em-monomer-mw").value);
    const monomerDensity = parseFloat($("em-monomer-density").value);
    const polyDensity = parseFloat($("em-poly-density").value);
    const phiSat = parseFloat($("em-phi-sat").value);
    const kp = parseFloat($("em-kp").value);

    const surfMw = parseFloat($("em-surf-mw").value);
    const cmc = parseFloat($("em-cmc").value);
    const area = parseFloat($("em-area").value);
    const initMw = parseFloat($("em-init-mw").value);

    const stats = $("em-stats");
    const bad = [mMonomer, mWater, conversion, mSurf, mInit, halfLifeH, f, k,
      monomerMw, monomerDensity, polyDensity, phiSat, kp, surfMw, cmc, area, initMw]
      .some((v) => !isFinite(v));
    if (bad || mMonomer <= 0 || mWater <= 0 || halfLifeH <= 0) {
      stats.innerHTML = '<div class="error-msg">Fill in every field (use "Custom" and enter your own values if a reagent isn\'t listed).</div>';
      $("em-procedure").innerHTML = "";
      return null;
    }

    const Vwater = mWater; // cm3, assuming water density 1 g/mL

    // ---- Surfactant: total vs. micellar (above CMC) concentration ----
    const molSurf = mSurf / surfMw;
    const sTotalM = molSurf / (Vwater / 1000); // mol/L
    const sMicellarM = Math.max(sTotalM - cmc / 1000, 0);
    const belowCmc = sTotalM < cmc / 1000;
    const sMicellarMolecPerCm3 = sMicellarM * EM_NA / 1000;
    const areaCm2 = area * 1e-14; // nm^2 -> cm^2
    const asS = areaCm2 * sMicellarMolecPerCm3; // cm^-1

    // ---- Radical generation rate ----
    const kd = Math.log(2) / (halfLifeH * 3600); // s^-1
    const molInit = mInit / initMw;
    const initM = molInit / (Vwater / 1000); // mol/L
    const RiMolPerLs = 2 * f * kd * initM;
    const RiMolecPerCm3s = RiMolPerLs * EM_NA / 1000;

    // ---- Particle growth rate, mu (cm^3/s per particle) ----
    const MpMolPerL = phiSat * monomerDensity * 1000 / monomerMw; // saturation monomer conc in particle
    const v1Cm3 = monomerMw / (monomerDensity * EM_NA); // volume of one monomer molecule
    const mu = kp * MpMolPerL * v1Cm3;

    // ---- Smith-Ewart particle number ----
    const NperCm3 = k * Math.pow(RiMolecPerCm3s / mu, 0.4) * Math.pow(asS, 0.6);
    const NperL = NperCm3 * 1000;
    const totalParticles = NperL * (Vwater / 1000);

    // ---- Final particle size from mass balance ----
    const massPolymer = mMonomer * (conversion / 100);
    const volPolymerCm3 = massPolymer / polyDensity;
    const volPerParticleCm3 = volPolymerCm3 / totalParticles;
    const diamCm = Math.pow((6 * volPerParticleCm3) / Math.PI, 1 / 3);
    const diamNm = diamCm * 1e7;

    // ---- Solids content ----
    const totalCharge = mMonomer + mWater + mSurf + mInit;
    const solidsPct = ((massPolymer + mSurf) / totalCharge) * 100;

    stats.innerHTML =
      (belowCmc ? `<div class="stat" style="grid-column:1/-1;"><div class="label">Surfactant vs. CMC</div><div class="value" style="color:var(--danger);font-size:var(--fs-md);">Below CMC, no micelles</div><div class="sub">${emFmt(sTotalM * 1000, 2)} mmol/L total vs. ${emFmt(cmc, 2)} mmol/L CMC. Micellar nucleation doesn't apply here; particle number/size below aren't meaningful.</div></div>` : "") +
      `<div class="stat"><div class="label">Surfactant available for micelles</div><div class="value">${emFmt(sMicellarM * 1000, 2)}</div><div class="sub">mmol/L, above the ${emFmt(cmc, 2)} mmol/L CMC</div></div>` +
      `<div class="stat"><div class="label">Radical generation rate, R<sub>i</sub></div><div class="value">${emFmt(RiMolPerLs, 2)}</div><div class="sub">mol radicals / (L&middot;s), k<sub>d</sub> = ${emFmt(kd, 2)} s<sup>-1</sup></div></div>` +
      `<div class="stat"><div class="label">Predicted particle number</div><div class="value">${emFmt(NperL, 2)}</div><div class="sub">particles/L water &middot; ${emFmt(totalParticles, 2)} total</div></div>` +
      `<div class="stat"><div class="label">Predicted particle diameter</div><div class="value">${emFmt(diamNm, 1)} nm</div><div class="sub">at ${emFmt(conversion, 1)}% conversion &middot; order-of-magnitude estimate only</div></div>` +
      `<div class="stat"><div class="label">Solids content</div><div class="value">${emFmt(solidsPct, 1)}%</div><div class="sub">polymer + surfactant, of total charge</div></div>`;

    return { mMonomer, mWater, mSurf, mInit, conversion, monomerName: EM_MONOMERS[parseInt($("em-monomer-select").value, 10)] ? EM_MONOMERS[parseInt($("em-monomer-select").value, 10)].name.replace(/ \(.*$/, "") : "monomer", surfName: EM_SURFACTANTS[parseInt($("em-surf-select").value, 10)] ? EM_SURFACTANTS[parseInt($("em-surf-select").value, 10)].name.replace(/ \(.*$/, "") : "surfactant", initName: EM_INITIATORS[parseInt($("em-init-select").value, 10)] ? EM_INITIATORS[parseInt($("em-init-select").value, 10)].name.replace(/ \(.*$/, "") : "initiator", diamNm, solidsPct };
  }

  function recalcMediator(base) {
    const enabled = $("em-mediator-enable").checked;
    const mediatorStats = $("em-mediator-stats");
    if (!enabled || !base) { mediatorStats.innerHTML = ""; return null; }

    const type = $("em-mediator-type").value;
    const targetDP = parseFloat($("em-target-dp").value);
    const monomerMw = parseFloat($("em-monomer-mw").value);
    if (!(targetDP > 0) || !isFinite(monomerMw)) { mediatorStats.innerHTML = '<div class="error-msg">Enter a target DP.</div>'; return null; }

    const nMonomer = base.mMonomer / monomerMw;
    const nMediator = nMonomer / targetDP;

    if (type === "raft") {
      const ctaMw = parseFloat($("em-cta-mw").value);
      const ctaName = RAFT_CTAS[parseInt($("em-cta-select").value, 10)].name.replace(/ \(.*$/, "");
      const mCta = nMediator * ctaMw;
      const mnFull = targetDP * monomerMw + ctaMw;
      const mnPred = targetDP * (base.conversion / 100) * monomerMw + ctaMw;
      mediatorStats.innerHTML =
        `<div class="stat"><div class="label">${escapeHtml(ctaName)} to charge</div><div class="value">${emFmt(mCta, 3)} g</div><div class="sub">${emFmt(nMediator * 1000, 3)} mmol</div></div>` +
        `<div class="stat"><div class="label">Target Mn, full conversion</div><div class="value">${emFmt(mnFull, 0)}</div><div class="sub">g/mol</div></div>` +
        `<div class="stat"><div class="label">Predicted Mn at ${emFmt(base.conversion, 1)}%</div><div class="value">${emFmt(mnPred, 0)}</div><div class="sub">g/mol</div></div>`;
      return { type, name: ctaName, mass: mCta };
    }

    const initMw = parseFloat($("em-atrp-init-mw").value);
    const initName = ATRP_INITIATORS[parseInt($("em-atrp-init-select").value, 10)].name.replace(/ \(.*$/, "");
    const cuMw = parseFloat($("em-cu-mw").value);
    const cuName = ATRP_CU_SOURCES[parseInt($("em-cu-select").value, 10)].name.replace(/ \(.*$/, "");
    const cuEq = parseFloat($("em-cu-eq").value) || 0;
    const ligMw = parseFloat($("em-lig-mw").value);
    const ligName = ATRP_LIGANDS[parseInt($("em-lig-select").value, 10)].name.replace(/ \(.*$/, "");
    const ligEq = parseFloat($("em-lig-eq").value) || 0;

    const mInitiator = nMediator * initMw;
    const mCu = nMediator * cuEq * cuMw;
    const mLig = nMediator * cuEq * ligEq * ligMw;
    const mnFull = targetDP * monomerMw + initMw;
    const mnPred = targetDP * (base.conversion / 100) * monomerMw + initMw;
    mediatorStats.innerHTML =
      `<div class="stat"><div class="label">${escapeHtml(initName)} to charge</div><div class="value">${emFmt(mInitiator, 3)} g</div><div class="sub">${emFmt(nMediator * 1000, 3)} mmol</div></div>` +
      `<div class="stat"><div class="label">${escapeHtml(cuName)} to charge</div><div class="value">${emFmt(mCu, 3)} g</div><div class="sub">at ${emFmt(cuEq, 2)} : 1 vs. initiator</div></div>` +
      `<div class="stat"><div class="label">${escapeHtml(ligName)} to charge</div><div class="value">${emFmt(mLig, 3)} g</div><div class="sub">at ${emFmt(ligEq, 2)} : 1 vs. Cu</div></div>` +
      `<div class="stat"><div class="label">Target Mn, full conversion</div><div class="value">${emFmt(mnFull, 0)}</div><div class="sub">g/mol</div></div>` +
      `<div class="stat"><div class="label">Predicted Mn at ${emFmt(base.conversion, 1)}%</div><div class="value">${emFmt(mnPred, 0)}</div><div class="sub">g/mol</div></div>`;
    return { type, name: initName, mass: mInitiator };
  }

  function renderProcedure(base, mediator) {
    if (!base) { $("em-procedure").innerHTML = ""; return; }
    const steps = [
      `Charge ${emFmt(base.mWater, 1)} g of water and ${emFmt(base.mSurf, 2)} g of ${base.surfName} to the reactor, purge with nitrogen, and heat to the reaction temperature with agitation.`,
      mediator && mediator.type === "atrp"
        ? `Pre-homogenize the monomer with the ATRP catalyst system (and a costabilizer such as hexadecane) to form a miniemulsion before charging, since ATRP's hydrophobic catalyst won't redistribute between droplets the way monomer and radicals do in a classical batch charge.`
        : `Charge ${emFmt(base.mMonomer, 1)} g of monomer to the reactor with continued agitation.`,
      mediator && mediator.type === "raft"
        ? `Add ${emFmt(mediator.mass, 3)} g of ${mediator.name} along with the monomer. It partitions into the organic phase and mediates chain growth once particles nucleate.`
        : "",
      `Dissolve the initiator in a small aliquot of water and add it to start the reaction (or feed it in over time for better control of the exotherm).`,
      `Hold at temperature, monitoring conversion gravimetrically: pull a small aliquot, weigh it, dry to constant mass, and compare the nonvolatile fraction to the theoretical value at full conversion.`,
      `Once at target conversion, cool the batch and add a shortstop/inhibitor if you need to halt the reaction immediately.`,
      `Filter the latex through cheesecloth or a 100&ndash;325 mesh screen to remove any coagulum before use.`,
      `Characterize: particle size by DLS, Mn/&#272; by GPC after breaking the latex and isolating the polymer, and solids content by gravimetric analysis.`,
    ].filter(Boolean);
    const mediatorHazard = mediator && mediator.type === "atrp"
      ? " ATRP catalyst/ligand systems carry their own handling requirements, so check the SDS for the copper source and ligand."
      : (mediator && mediator.type === "raft" ? " RAFT agents are typically strongly colored (yellow/pink/red) and can have a distinct odor. This is normal, not necessarily a sign of decomposition." : "");
    $("em-procedure").innerHTML = procedureBlock(
      mediator ? `emulsion, ${mediator.type === "raft" ? "RAFT-mediated" : "ATRP-mediated"}` : "conventional emulsion",
      steps,
      false,
      "Potassium persulfate is a strong oxidizer. Keep it away from reducing agents and organics in bulk, and handle per its SDS. Monomers carry standard flammability/inhalation hazards; work in a fume hood with appropriate PPE." + mediatorHazard
    );
  }

  function recalcAll() {
    const base = recalcEmulsion();
    const mediator = recalcMediator(base);
    renderProcedure(base, mediator);
  }

  $("em-monomer-select").addEventListener("change", function () {
    const mo = EM_MONOMERS[parseInt(this.value, 10)];
    if (mo && mo.mw != null) {
      $("em-monomer-mw").value = mo.mw;
      $("em-monomer-density").value = mo.density;
      $("em-poly-density").value = mo.polyDensity;
      $("em-phi-sat").value = mo.phiSat;
      $("em-kp").value = mo.kp;
    }
    recalcAll();
  });
  $("em-surf-select").addEventListener("change", function () {
    const s = EM_SURFACTANTS[parseInt(this.value, 10)];
    if (s && s.mw != null) { $("em-surf-mw").value = s.mw; $("em-cmc").value = s.cmc; $("em-area").value = s.area; }
    recalcAll();
  });
  $("em-init-select").addEventListener("change", function () {
    const i = EM_INITIATORS[parseInt(this.value, 10)];
    if (i && i.mw != null) $("em-init-mw").value = i.mw;
    recalcAll();
  });

  $("em-mediator-enable").addEventListener("change", function () {
    $("em-mediator-body").hidden = !this.checked;
    recalcAll();
  });
  $("em-mediator-type").addEventListener("change", () => { toggleMediatorFields(); recalcAll(); });
  $("em-cta-select").addEventListener("change", function () {
    $("em-cta-mw").value = RAFT_CTAS[parseInt(this.value, 10)].mw;
    recalcAll();
  });
  $("em-atrp-init-select").addEventListener("change", function () {
    $("em-atrp-init-mw").value = ATRP_INITIATORS[parseInt(this.value, 10)].mw;
    recalcAll();
  });
  $("em-cu-select").addEventListener("change", function () {
    $("em-cu-mw").value = ATRP_CU_SOURCES[parseInt(this.value, 10)].mw;
    recalcAll();
  });
  $("em-lig-select").addEventListener("change", function () {
    $("em-lig-mw").value = ATRP_LIGANDS[parseInt(this.value, 10)].mw;
    recalcAll();
  });

  // Insert hidden fields for the currently-selected monomer/surfactant/initiator's
  // editable reference values (autofilled by the selects above, but need to
  // exist in the DOM for recalc to read/write them)
  const hiddenFieldsHtml = `
    <div class="grid" style="margin-top:12px;">
      <div class="field"><label for="em-monomer-mw">Monomer MW (g/mol)</label><input type="number" id="em-monomer-mw" value="${EM_MONOMERS[0].mw}" step="any"></div>
      <div class="field"><label for="em-monomer-density">Monomer density (g/mL)</label><input type="number" id="em-monomer-density" value="${EM_MONOMERS[0].density}" step="any"></div>
      <div class="field"><label for="em-poly-density">Polymer density (g/mL)</label><input type="number" id="em-poly-density" value="${EM_MONOMERS[0].polyDensity}" step="any"></div>
      <div class="field"><label for="em-phi-sat">Saturation swelling, &phi;<sub>sat</sub></label><input type="number" id="em-phi-sat" value="${EM_MONOMERS[0].phiSat}" step="any" min="0.05" max="0.95"></div>
      <div class="field"><label for="em-kp">k<sub>p</sub> (L/mol/s)</label><input type="number" id="em-kp" value="${EM_MONOMERS[0].kp}" step="any" min="0.1"></div>
      <div class="field"><label for="em-surf-mw">Surfactant MW (g/mol)</label><input type="number" id="em-surf-mw" value="${EM_SURFACTANTS[0].mw}" step="any"></div>
      <div class="field"><label for="em-cmc">CMC (mmol/L)</label><input type="number" id="em-cmc" value="${EM_SURFACTANTS[0].cmc}" step="any" min="0"></div>
      <div class="field"><label for="em-area">Area/molecule (nm&sup2;)</label><input type="number" id="em-area" value="${EM_SURFACTANTS[0].area}" step="any" min="0.01"></div>
      <div class="field"><label for="em-init-mw">Initiator MW (g/mol)</label><input type="number" id="em-init-mw" value="${EM_INITIATORS[0].mw}" step="any"></div>
    </div>
  `;
  $("em-monomer-select").closest(".card").querySelector(".stat-grid").insertAdjacentHTML("beforebegin", hiddenFieldsHtml);

  ["em-monomer-mass", "em-water-mass", "em-conversion", "em-surf-mass", "em-init-mass",
   "em-half-life", "em-f", "em-monomer-mw", "em-monomer-density", "em-poly-density",
   "em-phi-sat", "em-kp", "em-surf-mw", "em-cmc", "em-area", "em-init-mw",
   "em-target-dp", "em-cta-mw", "em-atrp-init-mw", "em-cu-mw", "em-cu-eq", "em-lig-mw", "em-lig-eq"].forEach((id) => {
    $(id).addEventListener("input", recalcAll);
  });
  $("em-sek").addEventListener("change", recalcAll);

  toggleMediatorFields();
  recalcAll();

  wirePresetBar("em", () => collectPanelState("em"), (state) => {
    applyPanelState("em", state, recalcAll);
    $("em-mediator-body").hidden = !$("em-mediator-enable").checked;
    toggleMediatorFields();
  });
}

/* ---------------------------------------------------------------------
   Block Copolymer builder
--------------------------------------------------------------------- */

function blockCopolymerTemplate() {
  return `
    <div class="panel-head">
      <div>
        <h2>Block Copolymer</h2>
        <p>Design sequential addition block copolymers (diblock, triblock, ...) for ATRP, RAFT, ROMP, or FRP.</p>
      </div>
      <button type="button" class="copy-btn print-btn" onclick="window.print()">&#128424; Print recipe</button>
    </div>

    ${presetBarHTML("bcp")}

    <div class="calc-inputs">
    <div class="card">
      <h3>Technique</h3>
      <div class="grid">
        <div class="field">
          <label>Polymerization technique</label>
          <select id="bcp-technique">
            ${TYPES.map((t) => `<option value="${t.id}">${t.label}</option>`).join("")}
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 id="bcp-agent-heading">Initiator (R–X)</h3>
      <label class="checkbox-row">
        <input type="checkbox" id="bcp-agent-macro-toggle">
        <span id="bcp-agent-macro-label">Chain extend from an existing macroinitiator (block copolymer)</span>
      </label>
      <div id="bcp-agent-normal-fields" class="grid"></div>
      <div id="bcp-agent-macro-fields" class="grid" style="display:none;">
        <div class="field">
          <label>Macroinitiator name (optional)</label>
          <input type="text" id="bcp-agent-macro-name" placeholder="e.g. PEG113-Br">
        </div>
        <div class="field">
          <label>Macroinitiator Mₙ (g/mol)</label>
          <input type="number" id="bcp-agent-macro-mn" value="5000" step="any" min="0">
          <span class="hint">Mₙ of the existing chain (GPC/NMR), including its reactive end group</span>
        </div>
      </div>
    </div>

    <div class="card" id="bcp-secondary-card" style="display:none;"></div>

    <div class="card">
      <h3>Chain scale (sets total moles of chains, from Block 1)</h3>
      <div class="field" style="margin-bottom:12px;">
        <label>Set scale by</label>
        <div class="radio-row">
          <label class="radio-opt"><input type="radio" name="bcp-scale-mode" value="mass" checked> Mass of Block 1 monomer</label>
          <label class="radio-opt"><input type="radio" name="bcp-scale-mode" value="moles"> Moles of Block 1 monomer</label>
          <label class="radio-opt"><input type="radio" name="bcp-scale-mode" value="conc"> Target concentration + volume</label>
        </div>
      </div>
      <div class="grid">
        <div class="field" id="bcp-scale-mass-field">
          <label>Block 1 monomer mass (g)</label>
          <input type="number" id="bcp-scale-mass" value="1" step="any" min="0">
        </div>
        <div class="field" id="bcp-scale-moles-field" style="display:none;">
          <label>Block 1 monomer amount (mmol)</label>
          <input type="number" id="bcp-scale-moles" value="10" step="any" min="0">
        </div>
        <div class="field" id="bcp-scale-conc-vol-field" style="display:none;">
          <label>Total reaction volume (mL)</label>
          <input type="number" id="bcp-scale-volume" value="10" step="any" min="0">
        </div>
        <div class="field" id="bcp-target-conc-field">
          <label id="bcp-target-conc-label">Target [monomer] (mol/L), optional</label>
          <input type="number" id="bcp-target-conc" value="1" step="any" min="0" placeholder="optional">
          <span class="hint" id="bcp-target-conc-hint">Also computes total volume &amp; solvent needed</span>
        </div>
      </div>
    </div>

    <div id="bcp-blocks"></div>

    <div style="margin: -4px 0 4px;">
      <button type="button" class="copy-btn" id="bcp-add-block">+ Add block</button>
    </div>
    </div><!-- /.calc-inputs -->

    <div class="calc-output">
    <div class="card" id="bcp-results">
      <h3>Results</h3>
      <div id="bcp-results-body"></div>
    </div>

    <details class="assumptions">
      <summary>Formulas &amp; assumptions</summary>
      <div class="body">
        <ul>
          <li>Each block's feed ratio is designed assuming the previous block reacted to completion before the next monomer was added (standard sequential addition protocol). Cumulative Mₙ values "at full conversion" chain onto each other in that order.</li>
          <li>The predicted Mₙ for a given block also accounts for that block's own stated conversion; earlier blocks are assumed fully converted by the time it's added.</li>
          <li>All blocks share the same population of chains (moles of agent/macroinitiator, set by Block 1's scale), one chain per agent molecule, 100% efficiency assumed.</li>
          <li>Composition (mol%/wt%) is calculated from the target feed ratios, not measured values.</li>
          <li>Solvent/volume is computed for the initial (Block 1) charge only. Later block additions change the total volume but aren't rediluted automatically.</li>
          <li><strong>Block order matters chemically</strong>, and this calculator doesn't check it. For RAFT (and analogously ATRP), the block whose propagating radical is the better homolytic leaving group must come first: methacrylates/methacrylamides before acrylates, styrenics, or acrylamides, and any of those before vinyl esters/amides. Reversing the order gives slow, incomplete reinitiation off the macro-agent. The RAFT tab's agent chooser flags this for specific pairings.</li>
          <li>See the single technique tabs for assumptions specific to ATRP, RAFT, ROMP, and FRP.</li>
        </ul>
      </div>
    </details>
    </div><!-- /.calc-output -->
  `;
}

function blockCardHTML(idx, monomerSet, isFirst) {
  return `
    <div class="card bcp-block" data-index="${idx}">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 class="block-title" style="margin:0;">Block</h3>
        ${isFirst ? "" : `<button type="button" class="copy-btn bcp-remove-block">Remove block</button>`}
      </div>
      <div class="grid">
        <div class="field">
          <label>Monomer</label>
          <select class="block-monomer-select">${optionsHTML(monomerSet)}</select>
        </div>
        <div class="field">
          <label>MW (g/mol)</label>
          <input type="number" class="block-monomer-mw" value="${monomerSet[0].mw}" step="any">
        </div>
        <div class="field">
          <label>Density (g/mL)</label>
          <input type="number" class="block-monomer-density" value="${monomerSet[0].density != null ? monomerSet[0].density : ""}" step="any" placeholder="optional">
        </div>
      </div>
      <div class="field" style="margin:12px 0;">
        <label>Target basis</label>
        <div class="radio-row">
          <label class="radio-opt"><input type="radio" name="bcp-block-${idx}-target-mode" value="mn" checked> ${isFirst ? "Target Mₙ of this block (g/mol, full conversion)" : "Target cumulative Mₙ after this block (g/mol, full conversion)"}</label>
          <label class="radio-opt"><input type="radio" name="bcp-block-${idx}-target-mode" value="dp"> Target DP added by this block</label>
        </div>
      </div>
      <div class="grid">
        <div class="field">
          <label class="block-target-label">${isFirst ? "Target Mₙ (g/mol)" : "Target cumulative Mₙ (g/mol)"}</label>
          <input type="number" class="block-target-value" value="${isFirst ? 20000 : 40000}" step="any" min="0">
        </div>
        <div class="field">
          <label>Conversion (%)</label>
          <input type="number" class="block-conversion" value="100" step="any" min="0" max="100">
        </div>
      </div>
    </div>`;
}

let bcpBlockCounter = 0;

function addBlock(monomerSet, isFirst) {
  const idx = bcpBlockCounter++;
  const wrap = document.createElement("div");
  wrap.innerHTML = blockCardHTML(idx, monomerSet, isFirst).trim();
  const blockEl = wrap.firstElementChild;
  $("bcp-blocks").appendChild(blockEl);

  bindDbSelect(
    blockEl.querySelector(".block-monomer-select"),
    blockEl.querySelector(".block-monomer-mw"),
    blockEl.querySelector(".block-monomer-density"),
    monomerSet,
    recalcBcp
  );

  const radios = blockEl.querySelectorAll('input[type="radio"]');
  radios.forEach((r) => {
    r.addEventListener("change", () => {
      const label = blockEl.querySelector(".block-target-label");
      const valueInput = blockEl.querySelector(".block-target-value");
      if (r.checked && r.value === "mn") {
        label.textContent = isFirst ? "Target Mₙ (g/mol)" : "Target cumulative Mₙ (g/mol)";
        valueInput.value = isFirst ? 20000 : 40000;
      } else if (r.checked && r.value === "dp") {
        label.textContent = "Target DP added by this block";
        valueInput.value = 100;
      }
      updateRadioStyles(radios);
      recalcBcp();
    });
  });
  updateRadioStyles(radios);

  renumberBlocks();
  return blockEl;
}

function renumberBlocks() {
  const blocks = Array.from(document.querySelectorAll("#bcp-blocks .bcp-block"));
  blocks.forEach((b, i) => {
    b.querySelector(".block-title").textContent = `Block ${i + 1}`;
  });
}

function resetBlocksToOne(techniqueId) {
  const monomerSet = techniqueId === "romp" ? CYCLIC_MONOMERS : VINYL_MONOMERS;
  $("bcp-blocks").innerHTML = "";
  addBlock(monomerSet, true);
}

function readBlockInputs(blockEl) {
  const monomerSelect = blockEl.querySelector(".block-monomer-select");
  const name = monomerSelect.options[monomerSelect.selectedIndex].text.split(" (")[0];
  const targetModeEl = blockEl.querySelector('input[type="radio"]:checked');
  return {
    name,
    mw: parseFloat(blockEl.querySelector(".block-monomer-mw").value),
    density: parseFloat(blockEl.querySelector(".block-monomer-density").value) || null,
    targetMode: targetModeEl ? targetModeEl.value : "dp",
    targetValue: parseFloat(blockEl.querySelector(".block-target-value").value),
    conversionPct: parseFloat(blockEl.querySelector(".block-conversion").value),
  };
}

function renderAgentSection(techniqueId) {
  const cfg = TYPES.find((t) => t.id === techniqueId);
  $("bcp-agent-heading").textContent = cfg.agentLabel;
  $("bcp-agent-macro-label").textContent = `Chain extend from an existing ${cfg.macroTerm} (block copolymer)`;
  $("bcp-agent-normal-fields").innerHTML = `
    <div class="field">
      <label>${cfg.agentLabel}</label>
      <select id="bcp-agent-select">${optionsHTML(cfg.agents)}</select>
    </div>
    <div class="field">
      <label>MW (g/mol)</label>
      <input type="number" id="bcp-agent-mw" value="${cfg.agents[0].mw}" step="any">
    </div>
  `;
  bindDbSelect($("bcp-agent-select"), $("bcp-agent-mw"), null, cfg.agents, recalcBcp);

  const secCard = $("bcp-secondary-card");
  if (cfg.secondary === "atrp") {
    secCard.style.display = "";
    secCard.innerHTML = `
      <h3>Catalyst system (relative to chain)</h3>
      <label class="checkbox-row">
        <input type="checkbox" id="bcp-cat-enable" checked>
        Include catalyst &amp; ligand in recipe
      </label>
      <div id="bcp-cat-fields" class="subsection">
        <div class="grid">
          <div class="field">
            <label>Cu source</label>
            <select id="bcp-cat-select">${optionsHTML(ATRP_CU_SOURCES)}</select>
          </div>
          <div class="field">
            <label>Cu source MW (g/mol)</label>
            <input type="number" id="bcp-cat-mw" value="${ATRP_CU_SOURCES[0].mw}" step="any">
          </div>
          <div class="field">
            <label>Cu equivalents (per chain)</label>
            <input type="number" id="bcp-cat-eq" value="1" step="any" min="0">
          </div>
        </div>
        <div class="grid" style="margin-top:12px;">
          <div class="field">
            <label>Ligand</label>
            <select id="bcp-lig-select">${optionsHTML(ATRP_LIGANDS)}</select>
          </div>
          <div class="field">
            <label>Ligand MW (g/mol)</label>
            <input type="number" id="bcp-lig-mw" value="${ATRP_LIGANDS[0].mw}" step="any">
          </div>
          <div class="field">
            <label>Ligand equivalents (per chain)</label>
            <input type="number" id="bcp-lig-eq" value="1" step="any" min="0">
          </div>
        </div>
      </div>`;
    bindDbSelect($("bcp-cat-select"), $("bcp-cat-mw"), null, ATRP_CU_SOURCES, recalcBcp);
    bindDbSelect($("bcp-lig-select"), $("bcp-lig-mw"), null, ATRP_LIGANDS, recalcBcp);
    $("bcp-cat-enable").addEventListener("change", () => {
      const enabled = $("bcp-cat-enable").checked;
      $("bcp-cat-fields").style.opacity = enabled ? "1" : "0.4";
      $("bcp-cat-fields").querySelectorAll("input,select").forEach((i) => (i.disabled = !enabled));
      recalcBcp();
    });
  } else if (cfg.secondary === "raft") {
    secCard.style.display = "";
    secCard.innerHTML = `
      <h3>Radical coinitiator</h3>
      <label class="checkbox-row">
        <input type="checkbox" id="bcp-cat-enable" checked>
        Include a radical initiator in recipe
      </label>
      <div id="bcp-cat-fields" class="subsection">
        <div class="grid">
          <div class="field">
            <label>Initiator</label>
            <select id="bcp-cat-select">${optionsHTML(RADICAL_INITIATORS)}</select>
          </div>
          <div class="field">
            <label>Initiator MW (g/mol)</label>
            <input type="number" id="bcp-cat-mw" value="${RADICAL_INITIATORS[0].mw}" step="any">
          </div>
          <div class="field">
            <label>[CTA] : [Initiator] ratio</label>
            <input type="number" id="bcp-cat-ratio" value="5" step="any" min="0.01">
            <span class="hint">Typically 5 to 10</span>
          </div>
        </div>
      </div>`;
    bindDbSelect($("bcp-cat-select"), $("bcp-cat-mw"), null, RADICAL_INITIATORS, recalcBcp);
    $("bcp-cat-enable").addEventListener("change", () => {
      const enabled = $("bcp-cat-enable").checked;
      $("bcp-cat-fields").style.opacity = enabled ? "1" : "0.4";
      $("bcp-cat-fields").querySelectorAll("input,select").forEach((i) => (i.disabled = !enabled));
      recalcBcp();
    });
  } else {
    secCard.style.display = "none";
    secCard.innerHTML = "";
  }
}

function computeBcpSecondary(res) {
  const cfg = res.cfg;
  let rowsHTML = "";
  const lines = [];
  if (cfg.secondary === "atrp") {
    if ($("bcp-cat-enable").checked) {
      const catMw = parseFloat($("bcp-cat-mw").value);
      const catEq = parseFloat($("bcp-cat-eq").value) || 0;
      const ligMw = parseFloat($("bcp-lig-mw").value);
      const ligEq = parseFloat($("bcp-lig-eq").value) || 0;
      const catName = $("bcp-cat-select").options[$("bcp-cat-select").selectedIndex].text.split(" (")[0];
      const ligName = $("bcp-lig-select").options[$("bcp-lig-select").selectedIndex].text.split(" (")[0];
      const nCat = res.nX_mol * catEq;
      const mCat = nCat * catMw;
      const nLig = res.nX_mol * ligEq;
      const mLig = nLig * ligMw;
      rowsHTML += `<tr><td>${catName}</td><td class="num">${fmtMol(nCat)}</td><td class="num">${fmtMass(mCat)}</td><td class="num">n/a</td></tr>`;
      rowsHTML += `<tr><td>${ligName}</td><td class="num">${fmtMol(nLig)}</td><td class="num">${fmtMass(mLig)}</td><td class="num">n/a</td></tr>`;
      lines.push(`${catName}: ${fmtMol(nCat)}, ${fmtMass(mCat)}`);
      lines.push(`${ligName}: ${fmtMol(nLig)}, ${fmtMass(mLig)}`);
    }
  } else if (cfg.secondary === "raft") {
    if ($("bcp-cat-enable").checked) {
      const initMw = parseFloat($("bcp-cat-mw").value);
      const ratio = parseFloat($("bcp-cat-ratio").value) || 1;
      const initName = $("bcp-cat-select").options[$("bcp-cat-select").selectedIndex].text.split(" (")[0];
      const nInit = res.nX_mol / ratio;
      const mInit = nInit * initMw;
      rowsHTML += `<tr><td>${initName}</td><td class="num">${fmtMol(nInit)}</td><td class="num">${fmtMass(mInit)}</td><td class="num">n/a</td></tr>`;
      lines.push(`${initName}: ${fmtMol(nInit)}, ${fmtMass(mInit)}`);
    }
  }
  return { rowsHTML, lines };
}

function computeBcp() {
  const techniqueId = $("bcp-technique").value;
  const cfg = TYPES.find((t) => t.id === techniqueId);
  const macroMode = $("bcp-agent-macro-toggle").checked;
  const mwX = macroMode ? parseFloat($("bcp-agent-macro-mn").value) : parseFloat($("bcp-agent-mw").value);
  const agentName = macroMode
    ? ($("bcp-agent-macro-name").value.trim() || cap(cfg.macroTerm))
    : $("bcp-agent-select").options[$("bcp-agent-select").selectedIndex].text.split(" (")[0];

  if (!(mwX > 0)) return { error: "Enter a valid agent / macroinitiator molecular weight." };

  const blockEls = Array.from(document.querySelectorAll("#bcp-blocks .bcp-block"));
  if (blockEls.length === 0) return { error: "Add at least one block." };

  const b1 = readBlockInputs(blockEls[0]);
  if (!(b1.mw > 0)) return { error: "Block 1 monomer MW must be greater than zero." };

  const DP1 = b1.targetMode === "mn" ? (b1.targetValue - mwX) / b1.mw : b1.targetValue;
  if (!isFinite(DP1) || DP1 <= 0) {
    return { error: "Block 1 target Mₙ must exceed the agent/macroinitiator Mₙ (or choose a positive DP)." };
  }

  const scaleMode = document.querySelector('input[name="bcp-scale-mode"]:checked').value;
  let nM1;
  let volTotalL = null;
  if (scaleMode === "mass") {
    const v = parseFloat($("bcp-scale-mass").value);
    if (!(v >= 0)) return { error: "Enter a valid Block 1 monomer mass." };
    nM1 = v / b1.mw;
  } else if (scaleMode === "moles") {
    const v = parseFloat($("bcp-scale-moles").value);
    if (!(v >= 0)) return { error: "Enter a valid Block 1 monomer amount." };
    nM1 = v / 1000;
  } else {
    const conc = parseFloat($("bcp-target-conc").value);
    const vol = parseFloat($("bcp-scale-volume").value);
    if (!(conc > 0) || !(vol >= 0)) return { error: "Enter a target concentration and total volume." };
    nM1 = (conc * vol) / 1000;
    volTotalL = vol / 1000;
  }
  const nX_mol = nM1 / DP1;

  if (scaleMode !== "conc") {
    const targetConcRaw = parseFloat($("bcp-target-conc").value);
    if (targetConcRaw > 0) volTotalL = nM1 / targetConcRaw;
  }

  let cumulativeMnFull = mwX;
  const blockResults = [];
  for (let i = 0; i < blockEls.length; i++) {
    const b = readBlockInputs(blockEls[i]);
    if (!(b.mw > 0)) return { error: `Block ${i + 1}: monomer MW must be greater than zero.` };
    const DPi = b.targetMode === "mn" ? (b.targetValue - cumulativeMnFull) / b.mw : b.targetValue;
    if (!isFinite(DPi) || DPi <= 0) {
      return { error: `Block ${i + 1}: target cumulative Mₙ must exceed the Mₙ after the previous block (or choose a positive DP).` };
    }
    const nMi = nX_mol * DPi;
    const massMi = nMi * b.mw;
    const volMi = b.density ? massMi / b.density : null;
    const mnAfterFull = cumulativeMnFull + DPi * b.mw;
    const conv = b.conversionPct / 100;
    const mnPredicted = cumulativeMnFull + DPi * conv * b.mw;
    blockResults.push({
      index: i, name: b.name, mw: b.mw, DP: DPi, conversionPct: b.conversionPct,
      nM: nMi, massM: massMi, volM: volMi,
      mnBeforeFull: cumulativeMnFull, mnAfterFull, mnPredicted,
    });
    cumulativeMnFull = mnAfterFull;
  }

  const totalDP = blockResults.reduce((s, b) => s + b.DP, 0);
  const totalMnFull = cumulativeMnFull;
  blockResults.forEach((b) => {
    b.molPct = (b.DP / totalDP) * 100;
    b.wtPct = ((b.DP * b.mw) / totalMnFull) * 100;
  });

  const massX = nX_mol * mwX;
  let solventVolumeML = null;
  if (volTotalL != null) {
    const vol1 = blockResults[0].volM || 0;
    solventVolumeML = volTotalL * 1000 - vol1;
  }

  const actualConc = volTotalL ? nM1 / volTotalL : null;
  const totalMnPredicted = blockResults[blockResults.length - 1].mnPredicted;

  return {
    error: null, cfg, macroMode, mwX, agentName, massX, nX_mol,
    blockResults, totalMnFull, totalMnPredicted, volTotalL, solventVolumeML, actualConc,
  };
}

function buildBcpRecipeText(res, secondary) {
  const lines = [];
  lines.push(`Block copolymer recipe (${res.cfg.label}), ${res.blockResults.length} block(s)`);
  lines.push(`Final Mₙ at full conversion: ${fmtNum(res.totalMnFull)} g/mol; predicted at stated conversions: ${fmtNum(res.totalMnPredicted)} g/mol`);
  lines.push("");
  res.blockResults.forEach((b) => {
    lines.push(`Block ${b.index + 1} (${b.name}): DP ${fmtNum(b.DP)}, cumulative Mₙ ${fmtNum(b.mnAfterFull)} g/mol (${fmtNum(b.molPct)} mol%, ${fmtNum(b.wtPct)} wt%)`);
  });
  lines.push("");
  lines.push(`${res.agentName}: ${fmtMol(res.nX_mol)}, ${fmtMass(res.massX)}`);
  secondary.lines.forEach((l) => lines.push(l));
  res.blockResults.forEach((b) => {
    lines.push(`Block ${b.index + 1} monomer, ${b.name}: ${fmtMol(b.nM)}, ${fmtMass(b.massM)}${b.volM != null ? `, ${fmtVol(b.volM)}` : ""}`);
  });
  if (res.volTotalL != null) {
    lines.push(`Solvent (to initial volume): ${fmtVol(res.solventVolumeML)}`);
    lines.push(`Initial reaction volume: ${fmtVol(res.volTotalL * 1000)}`);
  }
  return lines.join("\n");
}

function renderBcpResults(res) {
  const body = $("bcp-results-body");
  if (res.error) {
    body.innerHTML = `<div class="error-msg">${res.error}</div>`;
    return;
  }

  const statGrid = `
    <div class="stat-grid">
      <div class="stat">
        <div class="label">Blocks</div>
        <div class="value">${res.blockResults.length}</div>
        <div class="sub">sequential</div>
      </div>
      <div class="stat">
        <div class="label">Final Mₙ at full conversion</div>
        <div class="value">${fmtNum(res.totalMnFull)}</div>
        <div class="sub">g/mol</div>
      </div>
      <div class="stat">
        <div class="label">Predicted final Mₙ</div>
        <div class="value">${fmtNum(res.totalMnPredicted)}</div>
        <div class="sub">g/mol, at stated conversions</div>
      </div>
      <div class="stat" title="${escapeHtml(res.cfg.dispersityNote)}">
        <div class="label">Typical Đ (${res.cfg.label})</div>
        <div class="value">${res.cfg.typicalDj}</div>
        <div class="sub">literature range, not calculated</div>
      </div>
      ${res.actualConc != null ? `
      <div class="stat">
        <div class="label">Block 1 concentration</div>
        <div class="value">${fmtNum(res.actualConc)}</div>
        <div class="sub">mol/L</div>
      </div>` : ""}
    </div>
  `;

  const blockRows = res.blockResults.map((b) => `
    <tr>
      <td>Block ${b.index + 1}: ${b.name}</td>
      <td class="num">${fmtNum(b.DP)}</td>
      <td class="num">${fmtNum(b.mnAfterFull)}</td>
      <td class="num">${fmtNum(b.mnPredicted)}</td>
      <td class="num">${fmtNum(b.molPct)}%</td>
      <td class="num">${fmtNum(b.wtPct)}%</td>
    </tr>`).join("");

  const secondary = computeBcpSecondary(res);

  const monomerRows = res.blockResults.map((b, i) => `
    <tr>
      <td>Block ${b.index + 1} monomer, ${b.name}${i > 0 ? ` (add after Block ${i} reaches target conversion)` : ""}</td>
      <td class="num">${fmtMol(b.nM)}</td>
      <td class="num">${fmtMass(b.massM)}</td>
      <td class="num">${b.volM != null ? fmtVol(b.volM) : "n/a"}</td>
    </tr>`).join("");

  const volumeRows = res.volTotalL != null ? `
    <tr>
      <td>Solvent (to initial volume, Block 1 charge)</td>
      <td class="num">n/a</td><td class="num">n/a</td>
      <td class="num">${fmtVol(res.solventVolumeML)}</td>
    </tr>
    <tr>
      <td><strong>Initial reaction volume (Block 1)</strong></td>
      <td class="num">n/a</td><td class="num">n/a</td>
      <td class="num"><strong>${fmtVol(res.volTotalL * 1000)}</strong></td>
    </tr>
  ` : "";

  const bcpSteps = (function () {
    const first = res.blockResults[0];
    const steps = [
      `Set up Block 1 exactly as a normal ${res.cfg.label} run: charge ${fmtMass(res.massX)} of ${res.agentName} plus the catalyst/initiator system from the recipe table, then ${fmtMass(first.massM)}${first.volM != null ? ` (${fmtVol(first.volM)})` : ""} of ${first.name} (inhibitor removed).${res.volTotalL != null ? ` Add solvent to roughly ${fmtVol(res.volTotalL * 1000)}.` : ""}`,
      `Degas thoroughly (see the <a href="air-free-technique.html">air-free guide</a>) and run at your chosen temperature, tracking conversion by aliquot (see <a href="conversion-monitoring.html">monitoring conversion</a>).`,
    ];
    res.blockResults.slice(1).forEach((b, i) => {
      steps.push(
        `When Block ${i + 1} reaches its target conversion, pull a sample for GPC/NMR, then add ${fmtMass(b.massM)}${b.volM != null ? ` (${fmtVol(b.volM)})` : ""} of degassed ${b.name} directly to the living reaction. (Alternatively, isolate and purify the intermediate as a ${res.cfg.macroTerm} and start a fresh polymerization: cleaner blocks, but more work.)`
      );
    });
    steps.push(
      `Chain-end fidelity is everything in sequential addition. Keep conversions per block in the range where the chain ends stay living for your technique, and keep everything rigorously degassed between additions.`,
      `After the final block, quench as usual for ${res.cfg.label}, precipitate into a suitable non-solvent, filter, and dry under vacuum.`,
      `Characterize each stage: a clean shift of the whole GPC trace to higher molecular weight after each block, without a residual low-MW shoulder, is the signature of successful chain extension.`
    );
    return steps;
  })();

  body.innerHTML = `
    ${statGrid}
    <div class="table-scroll">
    <table class="recipe recipe-data">
      <thead><tr><th>Block</th><th>DP added</th><th>Cumulative Mₙ (full conv.)</th><th>Predicted Mₙ</th><th>mol%</th><th>wt%</th></tr></thead>
      <tbody>${blockRows}</tbody>
    </table>
    </div>
    <h3 style="margin-top:18px;">Recipe (order of addition)</h3>
    <div class="table-scroll">
    <table class="recipe recipe-data">
      <thead><tr><th>Component</th><th>Amount</th><th>Mass</th><th>Volume</th></tr></thead>
      <tbody>
        <tr><td>${res.agentName}</td><td class="num">${fmtMol(res.nX_mol)}</td><td class="num">${fmtMass(res.massX)}</td><td class="num">n/a</td></tr>
        ${secondary.rowsHTML}
        ${monomerRows}
        ${volumeRows}
      </tbody>
    </table>
    </div>
    ${procedureBlock(`sequential ${res.cfg.label}`, bcpSteps, false)}
    <div class="actions">
      <button class="copy-btn" id="bcp-copy-btn">Copy recipe as text</button>
    </div>
  `;

  const copyBtn = $("bcp-copy-btn");
  copyBtn.addEventListener("click", () => {
    const text = buildBcpRecipeText(res, secondary);
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy recipe as text"), 1400);
    });
  });
}

function recalcBcp() {
  renderBcpResults(computeBcp());
}

function collectBcpState() {
  const state = { blocks: [] };
  state.technique = $("bcp-technique").value;
  state.macroMode = $("bcp-agent-macro-toggle").checked;
  state.macroName = $("bcp-agent-macro-name").value;
  state.macroMn = $("bcp-agent-macro-mn").value;
  if (!state.macroMode) {
    state.agentSelect = $("bcp-agent-select").value;
    state.agentMw = $("bcp-agent-mw").value;
  }

  const cfg = TYPES.find((t) => t.id === state.technique);
  if (cfg.secondary === "atrp" || cfg.secondary === "raft") {
    state.secEnable = $("bcp-cat-enable").checked;
    state.secSelect = $("bcp-cat-select").value;
    state.secMw = $("bcp-cat-mw").value;
    if (cfg.secondary === "atrp") {
      state.ligSelect = $("bcp-lig-select").value;
      state.ligMw = $("bcp-lig-mw").value;
      state.catEq = $("bcp-cat-eq").value;
      state.ligEq = $("bcp-lig-eq").value;
    } else {
      state.ctaRatio = $("bcp-cat-ratio").value;
    }
  }

  state.scaleMode = document.querySelector('input[name="bcp-scale-mode"]:checked').value;
  state.scaleMass = $("bcp-scale-mass").value;
  state.scaleMoles = $("bcp-scale-moles").value;
  state.scaleVolume = $("bcp-scale-volume").value;
  state.targetConc = $("bcp-target-conc").value;

  document.querySelectorAll("#bcp-blocks .bcp-block").forEach((blockEl) => {
    const targetModeEl = blockEl.querySelector('input[type="radio"]:checked');
    state.blocks.push({
      monomerSelect: blockEl.querySelector(".block-monomer-select").value,
      mw: blockEl.querySelector(".block-monomer-mw").value,
      density: blockEl.querySelector(".block-monomer-density").value,
      targetMode: targetModeEl ? targetModeEl.value : "mn",
      targetValue: blockEl.querySelector(".block-target-value").value,
      conversion: blockEl.querySelector(".block-conversion").value,
    });
  });

  return state;
}

function applyBcpState(state) {
  $("bcp-technique").value = state.technique;
  $("bcp-technique").dispatchEvent(new Event("change", { bubbles: true }));

  $("bcp-agent-macro-toggle").checked = !!state.macroMode;
  $("bcp-agent-macro-toggle").dispatchEvent(new Event("change", { bubbles: true }));
  $("bcp-agent-macro-name").value = state.macroName || "";
  $("bcp-agent-macro-mn").value = state.macroMn || "";
  if (!state.macroMode && state.agentSelect !== undefined) {
    $("bcp-agent-select").value = state.agentSelect;
    $("bcp-agent-mw").value = state.agentMw;
  }

  if (state.secEnable !== undefined) {
    $("bcp-cat-enable").checked = state.secEnable;
    $("bcp-cat-enable").dispatchEvent(new Event("change", { bubbles: true }));
    $("bcp-cat-select").value = state.secSelect;
    $("bcp-cat-mw").value = state.secMw;
    if (state.ligSelect !== undefined) {
      $("bcp-lig-select").value = state.ligSelect;
      $("bcp-lig-mw").value = state.ligMw;
      $("bcp-cat-eq").value = state.catEq;
      $("bcp-lig-eq").value = state.ligEq;
    }
    if (state.ctaRatio !== undefined) {
      $("bcp-cat-ratio").value = state.ctaRatio;
    }
  }

  const scaleRadio = document.querySelector(`input[name="bcp-scale-mode"][value="${state.scaleMode}"]`);
  if (scaleRadio) {
    scaleRadio.checked = true;
    scaleRadio.dispatchEvent(new Event("change", { bubbles: true }));
  }
  $("bcp-scale-mass").value = state.scaleMass != null ? state.scaleMass : "";
  $("bcp-scale-moles").value = state.scaleMoles != null ? state.scaleMoles : "";
  $("bcp-scale-volume").value = state.scaleVolume != null ? state.scaleVolume : "";
  $("bcp-target-conc").value = state.targetConc != null ? state.targetConc : "";

  const monomerSet = state.technique === "romp" ? CYCLIC_MONOMERS : VINYL_MONOMERS;
  $("bcp-blocks").innerHTML = "";
  (state.blocks || []).forEach((blockState, i) => {
    const blockEl = addBlock(monomerSet, i === 0);
    blockEl.querySelector(".block-monomer-select").value = blockState.monomerSelect;
    blockEl.querySelector(".block-monomer-mw").value = blockState.mw;
    blockEl.querySelector(".block-monomer-density").value = blockState.density;
    const radio = blockEl.querySelector(`input[type="radio"][value="${blockState.targetMode}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }
    blockEl.querySelector(".block-target-value").value = blockState.targetValue;
    blockEl.querySelector(".block-conversion").value = blockState.conversion;
  });
  if (!state.blocks || !state.blocks.length) resetBlocksToOne(state.technique);

  recalcBcp();
}

function wireBlockCopolymerPanel() {
  renderAgentSection("atrp");
  resetBlocksToOne("atrp");

  $("bcp-technique").addEventListener("change", () => {
    const t = $("bcp-technique").value;
    renderAgentSection(t);
    resetBlocksToOne(t);
    recalcBcp();
  });

  const macroToggle = $("bcp-agent-macro-toggle");
  macroToggle.addEventListener("change", () => {
    $("bcp-agent-normal-fields").style.display = macroToggle.checked ? "none" : "";
    $("bcp-agent-macro-fields").style.display = macroToggle.checked ? "" : "none";
    recalcBcp();
  });
  $("bcp-agent-macro-name").addEventListener("input", recalcBcp);

  const scaleModeRadios = document.querySelectorAll('input[name="bcp-scale-mode"]');
  scaleModeRadios.forEach((r) => {
    r.addEventListener("change", () => {
      applyScaleModeGeneric("bcp");
      updateRadioStyles(scaleModeRadios);
      recalcBcp();
    });
  });
  updateRadioStyles(scaleModeRadios);
  applyScaleModeGeneric("bcp");

  $("bcp-add-block").addEventListener("click", () => {
    const t = $("bcp-technique").value;
    const monomerSet = t === "romp" ? CYCLIC_MONOMERS : VINYL_MONOMERS;
    addBlock(monomerSet, false);
    recalcBcp();
  });

  $("bcp-blocks").addEventListener("click", (e) => {
    if (e.target.matches(".bcp-remove-block")) {
      e.target.closest(".bcp-block").remove();
      renumberBlocks();
      recalcBcp();
    }
  });
  $("bcp-blocks").addEventListener("input", (e) => {
    if (e.target.matches('input[type="number"]')) recalcBcp();
  });

  const panelRoot = $("panel-bcp");
  panelRoot.addEventListener("input", (e) => {
    if (e.target.matches('input[type="number"]') && !e.target.closest("#bcp-blocks")) recalcBcp();
  });
  panelRoot.addEventListener("change", (e) => {
    if (e.target.matches("select") && !e.target.closest("#bcp-blocks")) recalcBcp();
  });

  recalcBcp();

  wirePresetBar("bcp", collectBcpState, applyBcpState);
}

/* ---------------------------------------------------------------------
   Stock Solutions
--------------------------------------------------------------------- */

function stockSolutionsTemplate() {
  return `
    <div class="panel-head">
      <div>
        <h2>Stock Solutions</h2>
        <p>Prepare, dilute, and dispense stock solutions for any reagent</p>
      </div>
      <button type="button" class="copy-btn print-btn" onclick="window.print()">&#128424; Print</button>
    </div>

    ${presetBarHTML("stock")}

    <div class="card">
      <h3>Prepare a Stock Solution</h3>
      <div class="grid">
        <div class="field">
          <label>Solute name</label>
          <input type="text" id="stock-prep-name" placeholder="e.g. CuBr" value="Reagent">
        </div>
        <div class="field">
          <label>MW (g/mol)</label>
          <input type="number" id="stock-prep-mw" value="143.45" step="any" min="0">
        </div>
      </div>
      <div class="field" style="margin:12px 0;">
        <label>Solve for</label>
        <div class="radio-row">
          <label class="radio-opt"><input type="radio" name="stock-prep-mode" value="mass" checked> Mass needed</label>
          <label class="radio-opt"><input type="radio" name="stock-prep-mode" value="conc"> Concentration achieved</label>
          <label class="radio-opt"><input type="radio" name="stock-prep-mode" value="vol"> Volume needed</label>
        </div>
      </div>
      <div class="grid">
        <div class="field" id="stock-prep-mass-field" style="display:none;">
          <label>Mass available (g)</label>
          <input type="number" id="stock-prep-mass" value="0.1" step="any" min="0">
        </div>
        <div class="field" id="stock-prep-conc-field">
          <label>Target concentration (mol/L)</label>
          <input type="number" id="stock-prep-conc" value="0.1" step="any" min="0">
        </div>
        <div class="field" id="stock-prep-vol-field">
          <label>Target volume (mL)</label>
          <input type="number" id="stock-prep-vol" value="10" step="any" min="0">
        </div>
      </div>
      <div class="stat-grid" id="stock-prep-results" style="margin-top:16px;"></div>
    </div>

    <div class="card">
      <h3>Dilute a Stock <span style="font-weight:400; color:var(--text-dim); font-size:0.8em;">(C&#8321;V&#8321; = C&#8322;V&#8322;)</span></h3>
      <div class="grid">
        <div class="field">
          <label>Stock concentration, C&#8321; (mol/L)</label>
          <input type="number" id="stock-dilute-c1" value="1" step="any" min="0">
        </div>
        <div class="field">
          <label>Target concentration, C&#8322; (mol/L)</label>
          <input type="number" id="stock-dilute-c2" value="0.1" step="any" min="0">
        </div>
        <div class="field">
          <label>Target final volume, V&#8322; (mL)</label>
          <input type="number" id="stock-dilute-v2" value="10" step="any" min="0">
        </div>
      </div>
      <div class="stat-grid" id="stock-dilute-results" style="margin-top:16px;"></div>
    </div>

    <div class="card">
      <h3>Dispense a Stock for a Target Amount</h3>
      <div class="grid">
        <div class="field">
          <label>Stock concentration (mol/L)</label>
          <input type="number" id="stock-dispense-conc" value="0.1" step="any" min="0">
        </div>
      </div>
      <div class="field" style="margin:12px 0;">
        <label>Target amount by</label>
        <div class="radio-row">
          <label class="radio-opt"><input type="radio" name="stock-dispense-mode" value="moles" checked> Moles</label>
          <label class="radio-opt"><input type="radio" name="stock-dispense-mode" value="mass"> Mass</label>
        </div>
      </div>
      <div class="grid">
        <div class="field" id="stock-dispense-moles-field">
          <label>Target amount (mmol)</label>
          <input type="number" id="stock-dispense-moles" value="0.5" step="any" min="0">
        </div>
        <div class="field" id="stock-dispense-mass-field" style="display:none;">
          <label>Target mass (mg)</label>
          <input type="number" id="stock-dispense-mass" value="50" step="any" min="0">
        </div>
        <div class="field" id="stock-dispense-mw-field" style="display:none;">
          <label>MW (g/mol)</label>
          <input type="number" id="stock-dispense-mw" value="143.45" step="any" min="0">
        </div>
      </div>
      <div class="stat-grid" id="stock-dispense-results" style="margin-top:16px;"></div>
    </div>
  `;
}

function applyStockPrepMode() {
  const mode = document.querySelector('input[name="stock-prep-mode"]:checked').value;
  $("stock-prep-mass-field").style.display = mode === "mass" ? "none" : "";
  $("stock-prep-conc-field").style.display = mode === "conc" ? "none" : "";
  $("stock-prep-vol-field").style.display = mode === "vol" ? "none" : "";
}

function applyStockDispenseMode() {
  const mode = document.querySelector('input[name="stock-dispense-mode"]:checked').value;
  $("stock-dispense-moles-field").style.display = mode === "mass" ? "none" : "";
  $("stock-dispense-mass-field").style.display = mode === "moles" ? "none" : "";
  $("stock-dispense-mw-field").style.display = mode === "moles" ? "none" : "";
}

function recalcStockPrepare() {
  const out = $("stock-prep-results");
  const mw = parseFloat($("stock-prep-mw").value);
  const mode = document.querySelector('input[name="stock-prep-mode"]:checked').value;
  const name = ($("stock-prep-name").value || "Solute").trim();

  if (!(mw > 0)) { out.innerHTML = '<div class="error-msg">Enter a valid MW.</div>'; return; }

  let massG, concM, volL;
  if (mode === "mass") {
    concM = parseFloat($("stock-prep-conc").value);
    volL = parseFloat($("stock-prep-vol").value) / 1000;
    if (!(concM >= 0) || !(volL >= 0)) { out.innerHTML = '<div class="error-msg">Enter a valid concentration and volume.</div>'; return; }
    massG = concM * volL * mw;
  } else if (mode === "conc") {
    massG = parseFloat($("stock-prep-mass").value);
    volL = parseFloat($("stock-prep-vol").value) / 1000;
    if (!(massG >= 0) || !(volL > 0)) { out.innerHTML = '<div class="error-msg">Enter a valid mass and volume.</div>'; return; }
    concM = (massG / mw) / volL;
  } else {
    massG = parseFloat($("stock-prep-mass").value);
    concM = parseFloat($("stock-prep-conc").value);
    if (!(massG >= 0) || !(concM > 0)) { out.innerHTML = '<div class="error-msg">Enter a valid mass and concentration.</div>'; return; }
    volL = (massG / mw) / concM;
  }

  out.innerHTML = `
    <div class="stat"><div class="label">${escapeHtml(name)} mass</div><div class="value">${fmtMass(massG)}</div></div>
    <div class="stat"><div class="label">Concentration</div><div class="value">${fmtNum(concM)}</div><div class="sub">mol/L</div></div>
    <div class="stat"><div class="label">Volume</div><div class="value">${fmtVol(volL * 1000)}</div></div>
    <div class="stat"><div class="label">Moles</div><div class="value">${fmtMol(massG / mw)}</div></div>
    ${procedureBlock(null, [
      `Tare a weighing vessel and weigh out ${fmtMass(massG)} of ${escapeHtml(name)}.`,
      `Dissolve in roughly 80% of the final solvent volume, stirring until fully dissolved.`,
      `Transfer quantitatively to a ${fmtVol(volL * 1000)} volumetric flask (or graduated vessel), rinsing the weighing vessel into it.`,
      `Fill to the mark with solvent, cap, and invert several times to mix.`,
      `Label with contents, concentration (${fmtNum(concM)} mol/L), solvent, date, and your initials.`,
    ], true)}
  `;
}

function recalcStockDilute() {
  const out = $("stock-dilute-results");
  const c1 = parseFloat($("stock-dilute-c1").value);
  const c2 = parseFloat($("stock-dilute-c2").value);
  const v2 = parseFloat($("stock-dilute-v2").value);

  if (!(c1 > 0) || !(c2 >= 0) || !(v2 >= 0)) { out.innerHTML = '<div class="error-msg">Enter valid concentrations and a target volume.</div>'; return; }
  if (c2 > c1) { out.innerHTML = '<div class="error-msg">Target concentration can\'t exceed the stock concentration. You can only dilute down.</div>'; return; }

  const v1 = (c2 * v2) / c1;
  const diluent = v2 - v1;
  out.innerHTML = `
    <div class="stat"><div class="label">Stock volume to use</div><div class="value">${fmtVol(v1)}</div></div>
    <div class="stat"><div class="label">Diluent to add</div><div class="value">${fmtVol(diluent)}</div></div>
    <div class="stat"><div class="label">Final volume</div><div class="value">${fmtVol(v2)}</div></div>
    ${procedureBlock(null, [
      `Measure ${fmtVol(v1)} of the stock solution accurately (volumetric pipette or syringe, per the precision you need).`,
      `Add diluent up to a final volume of ${fmtVol(v2)}. In a volumetric flask, fill to the mark, then cap and invert to mix.`,
      `Label the new solution with contents, concentration, solvent, date, and your initials.`,
    ], true)}
  `;
}

function recalcStockDispense() {
  const out = $("stock-dispense-results");
  const conc = parseFloat($("stock-dispense-conc").value);
  const mode = document.querySelector('input[name="stock-dispense-mode"]:checked').value;

  if (!(conc > 0)) { out.innerHTML = '<div class="error-msg">Enter a valid stock concentration.</div>'; return; }

  let molesTarget;
  if (mode === "moles") {
    const mmol = parseFloat($("stock-dispense-moles").value);
    if (!(mmol >= 0)) { out.innerHTML = '<div class="error-msg">Enter a valid target amount.</div>'; return; }
    molesTarget = mmol / 1000;
  } else {
    const massMg = parseFloat($("stock-dispense-mass").value);
    const mw = parseFloat($("stock-dispense-mw").value);
    if (!(massMg >= 0) || !(mw > 0)) { out.innerHTML = '<div class="error-msg">Enter a valid mass and MW.</div>'; return; }
    molesTarget = (massMg / 1000) / mw;
  }

  const volL = molesTarget / conc;
  out.innerHTML = `
    <div class="stat"><div class="label">Volume to dispense</div><div class="value">${fmtVol(volL * 1000)}</div></div>
    <div class="stat"><div class="label">Moles delivered</div><div class="value">${fmtMol(molesTarget)}</div></div>
  `;
}

function recalcAllStock() {
  recalcStockPrepare();
  recalcStockDilute();
  recalcStockDispense();
}

function wireStockSolutionsPanel() {
  const prepRadios = document.querySelectorAll('input[name="stock-prep-mode"]');
  prepRadios.forEach((r) => r.addEventListener("change", () => {
    applyStockPrepMode();
    updateRadioStyles(prepRadios);
    recalcAllStock();
  }));
  updateRadioStyles(prepRadios);
  applyStockPrepMode();

  const dispRadios = document.querySelectorAll('input[name="stock-dispense-mode"]');
  dispRadios.forEach((r) => r.addEventListener("change", () => {
    applyStockDispenseMode();
    updateRadioStyles(dispRadios);
    recalcAllStock();
  }));
  updateRadioStyles(dispRadios);
  applyStockDispenseMode();

  const panelRoot = $("panel-stock");
  panelRoot.addEventListener("input", (e) => {
    if (e.target.matches("input") && !e.target.closest(".preset-bar")) recalcAllStock();
  });

  recalcAllStock();

  wirePresetBar("stock", () => collectPanelState("stock"), (state) => applyPanelState("stock", state, recalcAllStock));
}

/* ---------------------------------------------------------------------
   App init / tabs
--------------------------------------------------------------------- */

function init() {
  const tabsEl = $("tabs");
  const appEl = $("app");

  TYPES.forEach((cfg, i) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (i === 0 ? " active" : "");
    btn.textContent = cfg.label;
    btn.dataset.target = cfg.id;
    btn.addEventListener("click", () => switchTab(cfg.id));
    tabsEl.appendChild(btn);

    const panel = document.createElement("section");
    panel.className = "panel" + (i === 0 ? " active" : "");
    panel.id = `panel-${cfg.id}`;
    panel.innerHTML = panelTemplate(cfg);
    appEl.appendChild(panel);
  });

  TYPES.forEach((cfg) => wirePanel(cfg));

  const puBtn = document.createElement("button");
  puBtn.className = "tab-btn";
  puBtn.textContent = "Polyurethane";
  puBtn.dataset.target = "pu";
  puBtn.addEventListener("click", () => switchTab("pu"));
  tabsEl.appendChild(puBtn);

  const puPanel = document.createElement("section");
  puPanel.className = "panel";
  puPanel.id = "panel-pu";
  puPanel.innerHTML = polyurethaneTemplate();
  appEl.appendChild(puPanel);

  wirePolyurethanePanel();

  const emBtn = document.createElement("button");
  emBtn.className = "tab-btn";
  emBtn.textContent = "Emulsion";
  emBtn.dataset.target = "em";
  emBtn.addEventListener("click", () => switchTab("em"));
  tabsEl.appendChild(emBtn);

  const emPanel = document.createElement("section");
  emPanel.className = "panel";
  emPanel.id = "panel-em";
  emPanel.innerHTML = emulsionTemplate();
  appEl.appendChild(emPanel);

  wireEmulsionPanel();

  const bcpBtn = document.createElement("button");
  bcpBtn.className = "tab-btn";
  bcpBtn.textContent = "Block Copolymer";
  bcpBtn.dataset.target = "bcp";
  bcpBtn.addEventListener("click", () => switchTab("bcp"));
  tabsEl.appendChild(bcpBtn);

  const bcpPanel = document.createElement("section");
  bcpPanel.className = "panel";
  bcpPanel.id = "panel-bcp";
  bcpPanel.innerHTML = blockCopolymerTemplate();
  appEl.appendChild(bcpPanel);

  wireBlockCopolymerPanel();

  const stockBtn = document.createElement("button");
  stockBtn.className = "tab-btn";
  stockBtn.textContent = "Stock Solutions";
  stockBtn.dataset.target = "stock";
  stockBtn.addEventListener("click", () => switchTab("stock"));
  tabsEl.appendChild(stockBtn);

  const stockPanel = document.createElement("section");
  stockPanel.className = "panel";
  stockPanel.id = "panel-stock";
  stockPanel.innerHTML = stockSolutionsTemplate();
  appEl.appendChild(stockPanel);

  wireStockSolutionsPanel();

  const sgBtn = document.createElement("button");
  sgBtn.className = "tab-btn";
  sgBtn.textContent = "Step-Growth";
  sgBtn.dataset.target = "sg";
  sgBtn.addEventListener("click", () => switchTab("sg"));
  tabsEl.appendChild(sgBtn);

  const sgPanel = document.createElement("section");
  sgPanel.className = "panel";
  sgPanel.id = "panel-sg";
  sgPanel.innerHTML = stepGrowthTemplate();
  appEl.appendChild(sgPanel);

  wireStepGrowthPanel();

  // Molecular-weight unit toggle, rendered at the end of the tab row
  const unitBtn = document.createElement("button");
  unitBtn.className = "tab-btn mw-unit-toggle";
  unitBtn.title = "Toggle how molecular weights are displayed (calculations are unchanged)";
  const refreshUnitBtn = () => {
    unitBtn.textContent = "Mₙ in " + (mwUnitPref() === "kg" ? "kg/mol" : "g/mol");
  };
  refreshUnitBtn();
  unitBtn.addEventListener("click", () => {
    try { localStorage.setItem(MW_UNIT_KEY, mwUnitPref() === "kg" ? "g" : "kg"); } catch (e) {}
    refreshUnitBtn();
    applyMwUnitDisplay();
  });
  tabsEl.appendChild(unitBtn);

  const mwObserver = new MutationObserver(() => {
    if (mwUnitPref() === "kg") requestAnimationFrame(applyMwUnitDisplay);
  });
  mwObserver.observe(appEl, { childList: true, subtree: true });
  applyMwUnitDisplay();

  // Share button: encodes the active tab's inputs into a URL hash so a
  // recipe can be sent as a link. Display-only base64 of the same state
  // object the preset system uses.
  const shareBtn = document.createElement("button");
  shareBtn.className = "tab-btn share-recipe-btn";
  shareBtn.textContent = "🔗 Share";
  shareBtn.title = "Copy a link that reopens the calculator with your current inputs";
  shareBtn.addEventListener("click", () => {
    const activeBtn = document.querySelector(".tab-btn.active");
    const tab = activeBtn && activeBtn.dataset.target;
    const reg = tab && STATE_REGISTRY[tab];
    if (!reg || !navigator.clipboard) return;
    const payload = JSON.stringify({ t: tab, s: reg.collect() });
    const url = location.origin + location.pathname + "#r=" + btoa(unescape(encodeURIComponent(payload)));
    navigator.clipboard.writeText(url).then(() => {
      const orig = shareBtn.textContent;
      shareBtn.textContent = "Link copied ✓";
      setTimeout(() => { shareBtn.textContent = orig; }, 1400);
    }).catch(() => {});
  });
  tabsEl.appendChild(shareBtn);

  // Restore a shared recipe from the URL hash; wins over the last-used tab
  let restoredFromHash = false;
  if (location.hash.indexOf("#r=") === 0) {
    try {
      const payload = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(3)))));
      if (payload && payload.t && STATE_REGISTRY[payload.t]) {
        switchTab(payload.t);
        STATE_REGISTRY[payload.t].apply(payload.s || {});
        restoredFromHash = true;
      }
    } catch (e) { /* malformed hash - ignore */ }
  }

  // A bare #tabid hash (e.g. calculator.html#pu) deep-links to that tab
  if (!restoredFromHash) {
    const hashTab = location.hash.replace("#", "");
    if (hashTab && document.getElementById(`panel-${hashTab}`)) {
      switchTab(hashTab);
      restoredFromHash = true;
    }
  }

  // Otherwise reopen on the technique the user was last working in
  if (!restoredFromHash) {
    let lastTab = null;
    try { lastTab = localStorage.getItem(LAST_TAB_KEY); } catch (e) {}
    if (lastTab && document.getElementById(`panel-${lastTab}`)) switchTab(lastTab);
  }
  syncWideLayout();
}

const LAST_TAB_KEY = "polytechniques_last_calc_tab";

// ---------------------------------------------------------------------------
// Step-growth panel
//
// Moved here from step-growth.html, which is now a redirect stub, on the same
// reasoning as the polyurethane calculator before it: this is a recipe-design
// calculation and belongs beside the other recipe-design calculations rather
// than on a page of its own.
//
// Two calculations sharing one mental model - functionality, conversion and
// stoichiometry. Xn says how long the chains get; the gel point says when they
// stop being chains at all.
// ---------------------------------------------------------------------------

function stepGrowthTemplate() {
  return `
    <div class="panel-head">
      <div>
        <h2>Step-Growth &amp; Gel Point</h2>
        <p>Degree of polymerization from conversion and stoichiometric imbalance, and the conversion at which a multifunctional formulation gels.</p>
      </div>
    </div>

    ${presetBarHTML("sg")}

    <div class="card">
      <h3>The tyranny of the last percent</h3>
      <p class="guide-note">
        Step-growth is unforgiving in a way chain-growth is not. Any two species can react with each other, so chain length is set entirely by how far the reaction has gone: at 90% conversion the average chain is ten units long, at 99% a hundred, at 99.9% a thousand. Nothing is a polymer until the very end, which is why a polyester or polyamide has to be driven to conversions that would be considered excellent in any other chemistry and are merely adequate here.
      </p>
      <div class="guide-formula">
        X<sub>n</sub> = (1 + r) &divide; (1 + r &minus; 2rp) &nbsp;&nbsp;&nbsp; r = N<sub>A</sub> &divide; N<sub>B</sub> &le; 1
      </div>
      <p class="guide-note">
        Stoichiometry is the second trap. An excess of one monomer eventually caps every chain end with the group in surplus, and nothing grows further however long the reaction runs. A monofunctional impurity or a deliberate endcapper counts <strong>twice</strong> in that ratio, because it consumes a group and terminates a chain rather than extending it: r = N<sub>A</sub> &divide; (N<sub>B</sub> + 2N<sub>B'</sub>). That is why a 1% monofunctional contaminant is far more damaging than a 1% weighing error.
      </p>
    </div>

    <div class="card">
      <h3>Degree of polymerization</h3>
      <div class="calc-grid">
        <label>Conversion p (0&ndash;1)
          <input type="number" id="sg-p" step="any" min="0" max="1" value="0.99">
        </label>
        <label>Equivalents of group A
          <input type="number" id="sg-na" step="any" min="0" value="1">
        </label>
        <label>Equivalents of group B
          <input type="number" id="sg-nb" step="any" min="0" value="1">
        </label>
        <label>Monofunctional endcapper (mol)
          <input type="number" id="sg-mono" step="any" min="0" value="0">
        </label>
        <label>Mass per structural unit (g/mol)
          <input type="number" id="sg-m0" step="any" min="0" value="0">
        </label>
      </div>
      <p class="guide-note" style="margin-top:8px;">
        The endcapper is taken to carry the group in excess, or group B if the two are balanced. Leave the unit mass at zero for X<sub>n</sub> alone.
      </p>
      <div class="stat-grid" id="sg-stats" style="margin-top:16px;"></div>
      <svg id="sg-curve" class="sg-curve" viewBox="0 0 720 320" preserveAspectRatio="xMidYMid meet"
           role="img" aria-label="Degree of polymerization against conversion on a logarithmic scale"></svg>

      <div class="table-scroll" id="sg-table-wrap" style="margin-top:12px;">
        <table class="recipe" id="sg-table">
          <thead><tr><th>Conversion p</th><th>X<sub>n</sub></th><th>M<sub>n</sub> (g/mol)</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <h3>Working backwards from a target</h3>
      <p class="guide-note">
        The question above is asked the wrong way round for planning a batch. What you actually know is the molar mass you need; what you want to be told is how far you must drive the reaction, and how accurately you must weigh. Both invert in closed form.
      </p>
      <div class="calc-grid">
        <label>Target
          <select id="sg-t-mode">
            <option value="xn">Degree of polymerization X<sub>n</sub></option>
            <option value="mn">Number-average molar mass M<sub>n</sub></option>
          </select>
        </label>
        <label>Target value
          <input type="number" id="sg-t-val" step="any" min="0" value="100">
        </label>
      </div>
      <p class="guide-note" style="margin-top:8px;">
        Uses the stoichiometry and unit mass entered above. Targeting M<sub>n</sub> needs a mass per structural unit.
      </p>
      <div class="stat-grid" id="sg-target-stats" style="margin-top:16px;"></div>
      <div id="sg-target-detail" class="guide-note" style="margin-top:10px;"></div>
    </div>

    <div class="card">
      <h3>Gel point</h3>
      <p class="guide-note">
        Add a monomer with three or more reactive groups and the chains stop being chains. Branches join branches, and at a well-defined conversion one molecule spans the whole vessel: the mixture stops flowing and cannot be recovered.
      </p>
      <p class="guide-note">
        Two models, and the disagreement is the lesson. <strong>Carothers</strong> asks when the number-average chain length becomes infinite, which is necessarily <em>after</em> the first infinite molecule appears, so it predicts gelation <strong>late</strong>. <strong>Flory&ndash;Stockmayer</strong> asks when the first infinite network appears but assumes every reaction is intermolecular; real systems waste conversion on intramolecular loops that build no network, so it predicts gelation <strong>early</strong>. The true gel point sits between them, usually nearer Flory&ndash;Stockmayer.
      </p>
      <div class="guide-formula">
        Carothers: p<sub>gel</sub> = 2 &divide; f<sub>avg</sub> &nbsp;&nbsp;&nbsp;&nbsp; Flory&ndash;Stockmayer: &alpha;<sub>c</sub> = 1 &divide; (f<sub>b</sub> &minus; 1)
      </div>
      <div class="dyn-row-labels">
        <span>Component</span>
        <span>Moles</span>
        <span>Functionality f</span>
        <span>Group</span>
        <span class="dyn-label-spacer"></span>
      </div>
      <div id="sg-gel-rows" class="dyn-rows"></div>
      <div class="actions" style="justify-content:flex-start; margin-top:6px; gap:8px;">
        <button type="button" class="copy-btn" id="sg-gel-add">+ Add component</button>
        <button type="button" class="copy-btn" id="sg-gel-demo">Load A&#8323; + B&#8322; example</button>
      </div>
      <div class="stat-grid" id="sg-gel-stats" style="margin-top:16px;"></div>
      <div id="sg-gel-detail" class="guide-note" style="margin-top:10px;"></div>
    </div>

    <div class="card">
      <h3>What these leave out</h3>
      <p class="guide-note">
        Both models assume every group of a kind is equally reactive and stays that way &mdash; Flory's equal-reactivity principle, which holds better than it has any right to for small monomers in a well-stirred melt. It fails when the second group on a monomer is deactivated by the first reacting, when viscosity climbs far enough that diffusion rather than chemistry sets the rate (which always happens near the gel point), and when chains are long enough that an end group struggles to find a partner.
      </p>
      <p class="guide-note">
        Neither knows anything about side reactions. A polyester that transesterifies, or a urethane forming allophanate above 120&nbsp;&deg;C, is building network by a route the functionality count never saw. Past the gel point, <a href="crosslink-density.html">Crosslink Density</a> measures what the network became.
      </p>
      <p class="guide-note">
        <strong>On the dispersity.</strong> &#272; = 1 + p is exact for the most probable distribution at balanced stoichiometry, so a step-growth polymer taken to high conversion is always close to 2 &mdash; that is a property of the mechanism, not of your technique. With the groups deliberately unbalanced there is no equally tidy closed form, and the obvious-looking extension of this one is wrong: simulating the polymerisation directly shows &#272; stays near 2 rather than narrowing as that extension predicts. The figure quoted here held to within about 1.5% of the simulation down to r = 0.8, which is well inside the uncertainty of any GPC that would measure it.
      </p>
    </div>
  `;
}

function wireStepGrowthPanel() {
  const $ = (id) => document.getElementById(id);
  const num = (id) => { const v = parseFloat($(id).value); return isFinite(v) ? v : NaN; };

  // A monofunctional species counts twice: it consumes a group AND stops a
  // chain, which is why trace monofunctional impurity is so much worse than
  // the same percentage of stoichiometric error.
  function ratio(nA, nB, mono) {
    const lo = Math.min(nA, nB), hi = Math.max(nA, nB);
    return lo / (hi + 2 * mono);
  }
  function carothersXn(r, p) {
    const d = 1 + r - 2 * r * p;
    return d <= 0 ? Infinity : (1 + r) / d;
  }

  function recalcDP() {
    const p = num("sg-p"), nA = num("sg-na"), nB = num("sg-nb"),
          mono = num("sg-mono") || 0, m0 = num("sg-m0") || 0;
    const stats = $("sg-stats"), wrap = $("sg-table-wrap"),
          body = document.querySelector("#sg-table tbody");
    if (!stats) return;

    if (!isFinite(p) || p < 0 || p > 1 || !isFinite(nA) || !isFinite(nB) || nA <= 0 || nB <= 0) {
      stats.innerHTML = '<div class="error-msg">Enter a conversion between 0 and 1 and a positive number of equivalents for both groups.</div>';
      wrap.style.display = "none";
      return;
    }

    const r = ratio(nA, nB, mono);
    const xn = carothersXn(r, p);
    const xnMax = carothersXn(r, 1);
    const mn = m0 > 0 ? xn * m0 : null;
    const imbalance = Math.abs(nA - nB) / Math.max(nA, nB) * 100;
    const note = mono > 0
      ? "monofunctional counted twice, as it caps a chain"
      : (imbalance < 1e-9 ? "groups balanced" : imbalance.toFixed(2) + "% excess of one group");

    stats.innerHTML =
      '<div class="stat"><div class="label">X<sub>n</sub> at p = ' + p + '</div><div class="value">' +
        (isFinite(xn) ? xn.toFixed(1) : "&infin;") + '</div><div class="sub">' +
        (mn ? "M<sub>n</sub> &asymp; " + Math.round(mn).toLocaleString() + " g/mol" : "enter a unit mass for M<sub>n</sub>") + '</div></div>' +
      '<div class="stat"><div class="label">Stoichiometric ratio r</div><div class="value">' + r.toFixed(4) +
        '</div><div class="sub">' + note + '</div></div>' +
      '<div class="stat"><div class="label">Ceiling at p = 1</div><div class="value">' +
        (isFinite(xnMax) ? xnMax.toFixed(1) : "&infin;") + '</div><div class="sub">' +
        (isFinite(xnMax) ? "the best this stoichiometry can reach" : "unbounded: groups exactly balanced") + '</div></div>' +
      // The most-probable (Flory) distribution: Xw/Xn = 1 + p exactly, at
      // balanced stoichiometry (Odian eq 2-97). A Monte Carlo of the actual
      // polymerisation held this to within 1.5% down to r = 0.8, so it is
      // quoted with imbalance too rather than withheld - but see the note
      // below, since a closed form for the imbalanced case is NOT 1 + p and
      // an obvious-looking derivation of one is wrong.
      '<div class="stat"><div class="label">Dispersity &#272;</div><div class="value">' +
        (1 + p).toFixed(3) + '</div><div class="sub">' +
        (mn ? "M<sub>w</sub> &asymp; " + Math.round(mn * (1 + p)).toLocaleString() + " g/mol" : "most probable distribution") +
        '</div></div>';

    // The ladder is the point: the last fraction of a percent does the work.
    const ladder = [0.90, 0.95, 0.98, 0.99, 0.995, 0.999, 0.9999];
    wrap.style.display = "";
    body.innerHTML = ladder.map((pp) => {
      const x = carothersXn(r, pp);
      const cls = Math.abs(pp - p) < 1e-9 ? ' class="sg-current"' : "";
      return "<tr" + cls + "><td class=\"num\">" + pp + "</td><td class=\"num\">" +
        (isFinite(x) ? x.toFixed(1) : "&infin;") + "</td><td class=\"num\">" +
        (m0 > 0 && isFinite(x) ? Math.round(x * m0).toLocaleString() : "&mdash;") + "</td></tr>";
    }).join("");
  }

  function makeGelRow(name, mol, f, group) {
    const row = document.createElement("div");
    row.className = "dyn-row sg-gel-row";
    row.innerHTML =
      '<input type="text" class="sg-g-name" placeholder="Component" value="' + (name || "") + '">' +
      '<input type="number" class="sg-g-mol" placeholder="Moles" step="any" min="0" value="' + (mol != null ? mol : "") + '">' +
      '<input type="number" class="sg-g-f" placeholder="f" step="1" min="1" value="' + (f != null ? f : "") + '">' +
      '<select class="sg-g-type"><option value="A">A</option><option value="B">B</option></select>' +
      '<button type="button" class="dyn-row-remove" aria-label="Remove component">&times;</button>';
    row.querySelector(".sg-g-type").value = group || "A";
    row.querySelector(".dyn-row-remove").addEventListener("click", () => { row.remove(); recalcGel(); });
    row.addEventListener("input", recalcGel);
    row.addEventListener("change", recalcGel);
    return row;
  }
  function addGelRow(name, mol, f, group) {
    $("sg-gel-rows").appendChild(makeGelRow(name, mol, f, group));
  }

  function recalcGel() {
    const stats = $("sg-gel-stats"), detail = $("sg-gel-detail");
    if (!stats) return;
    const comps = [];
    document.querySelectorAll(".sg-gel-row").forEach((row) => {
      const mol = parseFloat(row.querySelector(".sg-g-mol").value);
      const f = parseFloat(row.querySelector(".sg-g-f").value);
      if (!isFinite(mol) || !isFinite(f) || mol <= 0 || f < 1) return;
      comps.push({
        name: row.querySelector(".sg-g-name").value || "component",
        mol: mol, f: Math.round(f),
        type: row.querySelector(".sg-g-type").value
      });
    });

    if (comps.length < 2) {
      stats.innerHTML = '<div class="error-msg">Add at least two components with moles and a functionality.</div>';
      detail.innerHTML = ""; return;
    }
    if (!comps.some((c) => c.type === "A") || !comps.some((c) => c.type === "B")) {
      stats.innerHTML = '<div class="error-msg">A gelling system needs both an A group and a B group. Mark which monomer carries which.</div>';
      detail.innerHTML = ""; return;
    }

    let eqA = 0, eqB = 0, nMol = 0, eqTotal = 0;
    comps.forEach((c) => {
      const e = c.mol * c.f;
      if (c.type === "A") eqA += e; else eqB += e;
      nMol += c.mol; eqTotal += e;
    });

    // Both models run on the LIMITING group: an excess that can never find a
    // partner would otherwise flatter the average functionality.
    const limiting = Math.min(eqA, eqB);
    const fAvgAll = eqTotal / nMol;
    const fAvg = 2 * limiting / nMol;
    const pC = fAvg > 0 ? 2 / fAvg : Infinity;

    // Flory-Stockmayer: alpha = r p^2 rho / (1 - r p^2 (1-rho)), gel where
    // alpha reaches 1/(fb - 1). Solved for p in closed form.
    const limitType = eqA <= eqB ? "A" : "B";
    const r = limiting / Math.max(eqA, eqB);
    const branch = comps.filter((c) => c.type === limitType && c.f >= 3);
    const branchEq = branch.reduce((s, c) => s + c.mol * c.f, 0);
    const limitEq = comps.filter((c) => c.type === limitType).reduce((s, c) => s + c.mol * c.f, 0);
    const rho = limitEq > 0 ? branchEq / limitEq : 0;
    const branchMol = branch.reduce((s, c) => s + c.mol, 0);
    const fb = branchMol > 0 ? branchEq / branchMol : 0;
    const mixedBranch = branch.length > 1 && branch.some((c) => c.f !== branch[0].f);

    let pFS = null, fsNote = "";
    if (!branch.length) {
      fsNote = "no branch unit on the limiting group, so no gel forms &mdash; this is a linear system";
    } else {
      const ac = 1 / (fb - 1);
      const denom = r * (rho + ac * (1 - rho));
      pFS = denom > 0 ? Math.sqrt(ac / denom) : Infinity;
      if (!(pFS <= 1)) { fsNote = "exceeds 1, so this formulation cannot gel at any conversion"; pFS = null; }
    }

    stats.innerHTML =
      '<div class="stat"><div class="label">Flory&ndash;Stockmayer p<sub>gel</sub></div><div class="value">' +
        (pFS != null ? pFS.toFixed(4) : "&mdash;") + '</div><div class="sub">first infinite network; gels early</div></div>' +
      '<div class="stat"><div class="label">Carothers p<sub>gel</sub></div><div class="value">' +
        (isFinite(pC) && pC <= 1 ? pC.toFixed(4) : (pC > 1 ? "&gt; 1" : "&mdash;")) +
        '</div><div class="sub">infinite X<sub>n</sub>; gels late</div></div>' +
      '<div class="stat"><div class="label">Average functionality</div><div class="value">' + fAvg.toFixed(3) +
        '</div><div class="sub">on the limiting group (' + limitType + ')</div></div>';

    const lines = [];
    lines.push("<strong>Groups:</strong> " + eqA.toFixed(3) + " equivalents of A against " + eqB.toFixed(3) +
      " of B, so " + limitType + " is limiting and r = " + r.toFixed(4) + ".");
    if (fAvgAll !== fAvg) {
      lines.push("<strong>Note:</strong> counting every group regardless of partner would give f<sub>avg</sub> = " +
        fAvgAll.toFixed(3) + "; the value above discounts the " + Math.abs(eqA - eqB).toFixed(3) +
        " equivalents in excess, which can never react.");
    }
    if (branch.length) {
      lines.push("<strong>Branching:</strong> " + (rho * 100).toFixed(1) +
        "% of the limiting group sits on units with f &ge; 3, of functionality f<sub>b</sub> = " + fb.toFixed(2) + ".");
      if (mixedBranch) {
        lines.push("<em>Caution:</em> more than one branch functionality is present. Flory&ndash;Stockmayer is evaluated at their average, which is an approximation; the exact treatment needs the weight-average branch functionality.");
      }
      if (pFS != null && isFinite(pC) && pC <= 1) {
        lines.push("<strong>Expect the real gel point between " + pFS.toFixed(3) + " and " + pC.toFixed(3) +
          "</strong>, usually nearer the lower figure. Intramolecular loops consume conversion without building network, which pushes the measured value up from Flory&ndash;Stockmayer.");
      }
    } else if (fsNote) {
      lines.push("<strong>No gel:</strong> " + fsNote + ".");
    }
    detail.innerHTML = lines.join("<br>");
  }

  // ---- the hockey stick, drawn ----
  //
  // Xn against p with a LOG y axis, which is the only way the shape reads:
  // on a linear axis the whole curve is flat until it disappears vertically
  // off the top, and the interesting part - that each further decade of Xn
  // costs another factor of ten in unreacted groups - is invisible.
  //
  // SVG rather than canvas, following the chain-dimensions figure: it stays
  // crisp at any size and picks up the theme through CSS variables, so it
  // needs no redraw when the theme is switched.
  const SGV = { w: 720, h: 320, l: 62, r: 18, t: 16, b: 42, decades: 4 };

  function sgX(p) { return SGV.l + p * (SGV.w - SGV.l - SGV.r); }
  function sgY(xn) {
    const lo = 0, hi = SGV.decades;                       // log10(1) .. log10(10^4)
    const v = Math.min(Math.max(Math.log10(Math.max(xn, 1)), lo), hi);
    return SGV.h - SGV.b - (v - lo) / (hi - lo) * (SGV.h - SGV.t - SGV.b);
  }

  function drawCurve() {
    const svg = $("sg-curve");
    if (!svg) return;
    const p = num("sg-p"), nA = num("sg-na"), nB = num("sg-nb"), mono = num("sg-mono") || 0;
    if (!isFinite(nA) || !isFinite(nB) || nA <= 0 || nB <= 0) { svg.innerHTML = ""; return; }
    const r = ratio(nA, nB, mono);
    const ceiling = carothersXn(r, 1);

    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const parts = [];
    const plotW = SGV.w - SGV.l - SGV.r, plotH = SGV.h - SGV.t - SGV.b;

    parts.push('<rect x="' + SGV.l + '" y="' + SGV.t + '" width="' + plotW + '" height="' + plotH +
      '" fill="none" stroke="var(--border)" stroke-width="1"/>');

    // y gridlines, one per decade
    for (let d = 0; d <= SGV.decades; d++) {
      const y = sgY(Math.pow(10, d));
      parts.push('<line x1="' + SGV.l + '" y1="' + y + '" x2="' + (SGV.w - SGV.r) + '" y2="' + y +
        '" stroke="var(--border)" stroke-width="1" opacity="0.7"/>');
      // plain values rather than exponent notation: at four decades the
      // numbers are short enough to read directly, and 10,000 says more to
      // someone sizing a polyester than 10^4 does
      parts.push('<text x="' + (SGV.l - 8) + '" y="' + (y + 4) +
        '" text-anchor="end" font-size="12" fill="var(--text-dim)">' +
        Math.pow(10, d).toLocaleString() + "</text>");
    }
    // x ticks
    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach((tp) => {
      const x = sgX(tp);
      parts.push('<line x1="' + x + '" y1="' + (SGV.h - SGV.b) + '" x2="' + x + '" y2="' + (SGV.h - SGV.b + 5) +
        '" stroke="var(--text-dim)" stroke-width="1"/>');
      parts.push('<text x="' + x + '" y="' + (SGV.h - SGV.b + 19) +
        '" text-anchor="middle" font-size="12" fill="var(--text-dim)">' + tp.toFixed(1) + "</text>");
    });
    parts.push('<text x="' + (SGV.l + plotW / 2) + '" y="' + (SGV.h - 6) +
      '" text-anchor="middle" font-size="12" fill="var(--text-dim)">Conversion p</text>');
    parts.push('<text x="14" y="' + (SGV.t + plotH / 2) + '" text-anchor="middle" font-size="12" ' +
      'fill="var(--text-dim)" transform="rotate(-90 14 ' + (SGV.t + plotH / 2) + ')">Degree of polymerization</text>');

    // the balanced case as a faint reference whenever the charge is not balanced
    const path = (rr) => {
      const pts = [];
      for (let i = 0; i <= 600; i++) {
        const pp = i / 600;
        const x = carothersXn(rr, pp);
        if (!isFinite(x) || x > Math.pow(10, SGV.decades)) {
          // runs off the top: stop cleanly at the ceiling of the axis
          pts.push([sgX(pp), sgY(Math.pow(10, SGV.decades))]);
          break;
        }
        pts.push([sgX(pp), sgY(x)]);
      }
      return pts.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" ");
    };

    if (Math.abs(r - 1) > 1e-9) {
      parts.push('<path d="' + path(1) + '" fill="none" stroke="var(--text-dim)" stroke-width="1.5" ' +
        'stroke-dasharray="4 4" opacity="0.55"/>');
      // the ceiling this stoichiometry imposes, as a hard horizontal limit
      if (isFinite(ceiling) && ceiling <= Math.pow(10, SGV.decades)) {
        const yc = sgY(ceiling);
        parts.push('<line x1="' + SGV.l + '" y1="' + yc + '" x2="' + (SGV.w - SGV.r) + '" y2="' + yc +
          '" stroke="var(--danger)" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.9"/>');
        // Label at the LEFT end of the ceiling line. On the right it collided
        // with the operating-point label, which for any interesting
        // stoichiometry sits high and far right - exactly where this line is.
        parts.push('<text x="' + (SGV.l + 6) + '" y="' + (yc - 6) +
          '" text-anchor="start" font-size="12" fill="var(--danger)">ceiling ' + ceiling.toFixed(0) + '</text>');
      }
    }

    parts.push('<path d="' + path(r) + '" fill="none" stroke="var(--primary)" stroke-width="2.5"/>');

    // where you actually are
    if (isFinite(p) && p >= 0 && p <= 1) {
      const xn = carothersXn(r, p);
      if (isFinite(xn) && xn >= 1) {
        const cx = sgX(p), cy = sgY(xn);
        parts.push('<line x1="' + cx + '" y1="' + (SGV.h - SGV.b) + '" x2="' + cx + '" y2="' + cy +
          '" stroke="var(--primary)" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>');
        parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="var(--primary)"/>');
        const anchor = p > 0.72 ? "end" : "start";
        const dx = p > 0.72 ? -10 : 10;
        parts.push('<text x="' + (cx + dx) + '" y="' + (cy - 10) + '" text-anchor="' + anchor +
          '" font-size="13" font-weight="600" fill="var(--primary)">p ' + esc(p) + ' &#8594; X&#8345; ' +
          (xn > 9999 ? "&#8805;10&#8308;" : xn.toFixed(0)) + '</text>');
      }
    }

    svg.innerHTML = parts.join("");
  }

  // ---- working backwards from a target ----
  // Xn = (1+r)/(1+r-2rp) inverts to p = (1+r)(1 - 1/Xn) / 2r, and at p = 1 the
  // ceiling Xn = (1+r)/(1-r) inverts to r = (Xn-1)/(Xn+1). The second is the
  // one worth having: it says how accurately the two monomers must be weighed
  // before conversion is even discussed.
  function pForTarget(r, xn) { return (1 + r) * (1 - 1 / xn) / (2 * r); }
  function rForTarget(xn) { return (xn - 1) / (xn + 1); }

  function recalcTarget() {
    const stats = $("sg-target-stats"), detail = $("sg-target-detail");
    if (!stats) return;
    const mode = $("sg-t-mode").value;
    const val = num("sg-t-val");
    const nA = num("sg-na"), nB = num("sg-nb"), mono = num("sg-mono") || 0, m0 = num("sg-m0") || 0;

    if (!isFinite(val) || val <= 0 || !isFinite(nA) || !isFinite(nB) || nA <= 0 || nB <= 0) {
      stats.innerHTML = '<div class="error-msg">Enter a positive target and a valid stoichiometry above.</div>';
      detail.innerHTML = ""; return;
    }
    if (mode === "mn" && m0 <= 0) {
      stats.innerHTML = '<div class="error-msg">Targeting M<sub>n</sub> needs a mass per structural unit above.</div>';
      detail.innerHTML = ""; return;
    }
    const xnTarget = mode === "mn" ? val / m0 : val;
    if (xnTarget <= 1) {
      stats.innerHTML = '<div class="error-msg">That target is below one structural unit.</div>';
      detail.innerHTML = ""; return;
    }

    const r = ratio(nA, nB, mono);
    const pNeed = pForTarget(r, xnTarget);
    const rNeed = rForTarget(xnTarget);
    const ceiling = carothersXn(r, 1);
    const reachable = pNeed <= 1;

    stats.innerHTML =
      '<div class="stat"><div class="label">Conversion needed</div><div class="value">' +
        (reachable ? pNeed.toFixed(5) : "unreachable") + '</div><div class="sub">' +
        (reachable ? "at the stoichiometry entered above" : "this stoichiometry caps X<sub>n</sub> at " +
          (isFinite(ceiling) ? ceiling.toFixed(1) : "&infin;")) + '</div></div>' +
      '<div class="stat"><div class="label">Stoichiometry needed</div><div class="value">r &ge; ' +
        rNeed.toFixed(5) + '</div><div class="sub">within ' + ((1 - rNeed) * 100).toFixed(2) +
        '% of exact, even at complete conversion</div></div>' +
      '<div class="stat"><div class="label">Target X<sub>n</sub></div><div class="value">' +
        xnTarget.toFixed(1) + '</div><div class="sub">' +
        (mode === "mn" ? "from M<sub>n</sub> " + Math.round(val).toLocaleString() + " g/mol"
                       : (m0 > 0 ? "M<sub>n</sub> " + Math.round(xnTarget * m0).toLocaleString() + " g/mol" : "as entered")) +
        '</div></div>';

    const lines = [];
    lines.push("<strong>Weighing first, conversion second.</strong> Reaching X<sub>n</sub> = " + xnTarget.toFixed(0) +
      " demands the two functional groups be matched to within " + ((1 - rNeed) * 100).toFixed(2) +
      "% <em>however far the reaction is driven</em>. Miss that and no amount of time, vacuum or catalyst recovers it.");
    if (reachable) {
      lines.push("At the r = " + r.toFixed(4) + " entered above, the conversion required is <strong>" +
        pNeed.toFixed(5) + "</strong>, leaving " + ((1 - pNeed) * 100).toPrecision(3) + "% of groups unreacted.");
    } else {
      lines.push("<strong>Not reachable as charged.</strong> r = " + r.toFixed(4) + " caps X<sub>n</sub> at " +
        (isFinite(ceiling) ? ceiling.toFixed(1) : "&infin;") + ", below the target. Correct the stoichiometry before worrying about conversion.");
    }
    detail.innerHTML = lines.join("<br>");
  }

  ["sg-p", "sg-na", "sg-nb", "sg-mono", "sg-m0"].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener("input", () => { recalcDP(); recalcTarget(); drawCurve(); });
  });
  ["sg-t-val"].forEach((id) => { const el = $(id); if (el) el.addEventListener("input", recalcTarget); });
  $("sg-t-mode").addEventListener("change", recalcTarget);
  $("sg-gel-add").addEventListener("click", () => addGelRow("", null, null, "A"));
  $("sg-gel-demo").addEventListener("click", () => {
    $("sg-gel-rows").innerHTML = "";
    addGelRow("Triol (A₃)", 1, 3, "A");
    addGelRow("Diacid (B₂)", 1.5, 2, "B");
    recalcGel();
  });

  addGelRow("Triol (A₃)", 1, 3, "A");
  addGelRow("Diacid (B₂)", 1.5, 2, "B");
  recalcDP();
  recalcTarget();
  drawCurve();
  recalcGel();

  // Registers this tab with STATE_REGISTRY, which is what the preset bar AND
  // the Share button both read. Without it the Share button silently did
  // nothing here - `if (!reg) return;` - while working on every other tab.
  wirePresetBar("sg",
    function collect() {
      return {
        p: $("sg-p").value, na: $("sg-na").value, nb: $("sg-nb").value,
        mono: $("sg-mono").value, m0: $("sg-m0").value,
        tMode: $("sg-t-mode").value, tVal: $("sg-t-val").value,
        gel: Array.prototype.map.call(document.querySelectorAll(".sg-gel-row"), function (row) {
          return {
            n: row.querySelector(".sg-g-name").value,
            m: row.querySelector(".sg-g-mol").value,
            f: row.querySelector(".sg-g-f").value,
            t: row.querySelector(".sg-g-type").value
          };
        })
      };
    },
    function apply(s) {
      if (!s) return;
      const set = (id, v) => { if (v !== undefined && $(id)) $(id).value = v; };
      set("sg-p", s.p); set("sg-na", s.na); set("sg-nb", s.nb);
      set("sg-mono", s.mono); set("sg-m0", s.m0);
      set("sg-t-mode", s.tMode); set("sg-t-val", s.tVal);
      if (Array.isArray(s.gel)) {
        $("sg-gel-rows").innerHTML = "";
        s.gel.forEach(function (g) { addGelRow(g.n, g.m, g.f, g.t); });
      }
      recalcDP(); recalcTarget(); drawCurve(); recalcGel();
    });
}

function switchTab(targetId) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.target === targetId));
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${targetId}`));
  try { localStorage.setItem(LAST_TAB_KEY, targetId); } catch (e) {}
  syncWideLayout();
  summaryBar.refresh();
  revealActiveTab();
}

// On a phone the tab strip is one scrolling row, so the tab you are on can sit
// off-screen - most obviously on load, when the last tab you used is restored
// from localStorage and might be the eleventh. Bring it into view. inline:
// "nearest" so it does not yank a tab that is already visible to the centre.
function revealActiveTab() {
  const active = document.querySelector(".tab-btn.active");
  const bar = document.getElementById("tabs");
  if (!active || !bar || bar.scrollWidth <= bar.clientWidth) return;
  active.scrollIntoView({ inline: "nearest", block: "nearest" });
}

// Only panels split into .calc-inputs / .calc-output can use the two-column
// layout; the rest are a single sequence of cards and must stay one column.
function syncWideLayout() {
  const panel = document.querySelector(".panel.active");
  const wide = !!(panel && panel.querySelector(":scope > .calc-output"));
  document.body.classList.toggle("calc-wide", wide);
}

// Crossing the 1000px breakpoint swaps between the sticky two-column layout
// (where the bar is redundant) and the stacked one (where it is the point).
if (window.matchMedia) {
  const wide = window.matchMedia("(min-width: 1000px)");
  const onChange = () => summaryBar.refresh();
  if (wide.addEventListener) wide.addEventListener("change", onChange);
  else if (wide.addListener) wide.addListener(onChange);
}

document.addEventListener("DOMContentLoaded", init);
