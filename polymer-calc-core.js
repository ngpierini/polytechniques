// Pure recipe math for the polymerization calculator.
//
// This is the chemistry engine with the DOM peeled away: it takes a plain
// params object and returns numbers. It has no reference to the page, to
// localStorage, or to any formatting, so the identical code can run in the
// browser (app.js), in a Node script, in a test, or behind a future API,
// without dragging the UI along. Keeping it separate is what lets the site
// grow a backend or an app later without reimplementing the math.
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();       // Node / CommonJS
  } else {
    root.PolymerCalcCore = factory();  // browser global
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Feed-ratio / molecular-weight engine shared by the ATRP, RAFT, ROMP and
  // FRP panels. p carries: targetMode ("mn"|"dp"), targetValue, mwM, mwX,
  // conversionPct, scaleMode ("mass"|"moles"|"conc"), scaleValue, targetConc,
  // totalVolumeML, densityM. Returns { error } on invalid input, else the
  // moles/masses/volumes and predicted vs full-conversion Mn.
  function computeCore(p) {
    const conversion = p.conversionPct / 100;

    let R;
    if (p.targetMode === "mn") {
      R = (p.targetValue - p.mwX) / p.mwM;
    } else {
      R = p.targetValue;
    }
    if (!isFinite(R) || R <= 0) {
      return { error: "Target Mₙ must be greater than the controlling agent's molecular weight (or choose a positive target DP)." };
    }
    if (!(p.mwM > 0) || !(p.mwX > 0)) {
      return { error: "Molecular weights must be greater than zero." };
    }

    let nM_mol;
    let volTotalL = null;

    if (p.scaleMode === "mass") {
      if (!(p.scaleValue >= 0)) return { error: "Enter a valid monomer mass." };
      nM_mol = p.scaleValue / p.mwM;
    } else if (p.scaleMode === "moles") {
      if (!(p.scaleValue >= 0)) return { error: "Enter a valid monomer amount." };
      nM_mol = p.scaleValue / 1000;
    } else {
      if (!(p.targetConc > 0) || !(p.totalVolumeML >= 0)) {
        return { error: "Enter a target concentration and total volume." };
      }
      nM_mol = (p.targetConc * p.totalVolumeML) / 1000;
      volTotalL = p.totalVolumeML / 1000;
    }

    const massM_g = nM_mol * p.mwM;
    const nX_mol = nM_mol / R;
    const massX_g = nX_mol * p.mwX;

    if (p.scaleMode !== "conc" && p.targetConc > 0) {
      volTotalL = nM_mol / p.targetConc;
    }

    let solventVolumeML = null;
    let volMonomerML = null;
    if (volTotalL != null) {
      volMonomerML = p.densityM ? massM_g / p.densityM : 0;
      solventVolumeML = volTotalL * 1000 - volMonomerML;
    }

    const predictedMn = R * conversion * p.mwM + p.mwX;
    const theoreticalMnFull = R * p.mwM + p.mwX;
    const actualConc = volTotalL ? nM_mol / volTotalL : null;

    return {
      R, nM_mol, massM_g, nX_mol, massX_g,
      volTotalL, solventVolumeML, volMonomerML,
      predictedMn, theoreticalMnFull, conversion, actualConc,
    };
  }

  // Weighable stock masses (mg) and dissolving volumes (mL) the planner picks
  // from, so it only ever suggests amounts you could actually measure out.
  const STOCK_MASS_LADDER_MG = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
  const STOCK_VOL_LADDER_ML = [0.5, 1, 2, 5, 10, 20, 25, 50, 100];

  // Without `force`, returns null when the component can simply be weighed.
  // With `force` (the "work entirely from stocks" mode) it always plans, which
  // means the stock has to scale with the target rather than sitting on the
  // small end of the ladder. Either way it picks a weigh/dissolve/deliver
  // combination landing near the user's preferred pipette volume, preferring
  // the smallest stock that gets there so reagent isn't wasted.
  function planStockSolution(massG, prefs, force) {
    const targetMg = massG * 1000;
    if (!(targetMg > 0)) return null;
    if (!force && targetMg >= prefs.minWeighMg) return null;
    let best = null;
    STOCK_MASS_LADDER_MG.forEach((massMg) => {
      if (massMg < prefs.minWeighMg) return;      // must itself be weighable
      if (massMg < targetMg * 1.25) return;       // draw an aliquot, not the whole lot
      STOCK_VOL_LADDER_ML.forEach((volML) => {
        const aliquotUL = volML * 1000 * (targetMg / massMg);
        if (aliquotUL < 20) return;               // below reliable pipetting
        if (aliquotUL > 5000) return;             // past syringe territory
        const score = Math.abs(Math.log(aliquotUL / prefs.aliquotUL))
          + 0.20 * Math.log(volML / 0.5)
          + 0.20 * Math.log(massMg / prefs.minWeighMg + 1);
        if (!best || score < best.score) {
          best = { massMg, volML, aliquotUL, concMgML: massMg / volML, score };
        }
      });
    });
    return best;
  }

  return {
    computeCore: computeCore,
    planStockSolution: planStockSolution,
    STOCK_MASS_LADDER_MG: STOCK_MASS_LADDER_MG,
    STOCK_VOL_LADDER_ML: STOCK_VOL_LADDER_ML,
  };
});
