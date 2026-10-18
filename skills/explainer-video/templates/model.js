// The film's numeric model: every number on screen, in the narration and in the sound effects
// comes from here. Copy to scenes/_shared/model.js. Load it in 2D scenes with
// <script src="../_shared/model.js"></script>, and in Node with:
//   node -e "global.window={};require('./scenes/_shared/model.js');window.MODEL.report()"
// Mark every constant with its level and fact id from research/facts.md.
window.MODEL = (() => {
  const g0 = 9.80665;
  const M = {
    // ---- given: from a source (one line each: value, unit, level, fact id) ----
    mass: 1700,        // kg        C  F14  "just under 1,700 kg"
    thrust: 80000,     // N         C  F13  "more than 80 kN"
    isp: 70,           // s         B  F15  cold-gas specific impulse
    // ---- assumed: values we chose; label them 估算 / 示意 on screen ----
    mu: 1.6,           // –         E  F06  tyre friction, typical range 1.4–1.8
  };
  // ---- computed from the above (E: our estimates; say so on screen and in the narration) ----
  M.weight = () => M.mass * g0;                         // N
  M.massFlow = (T) => T / (M.isp * g0);                 // kg/s for a thrust T
  // ---- where the model holds: outside it, scenes show "模型不再适用" instead of extrapolating ----
  M.suctionHolds = (gap) => gap < 0.02;                 // m; fan suction only while the skirt seals
  // ---- time functions the scenes draw from (keep them pure: same t, same answer) ----
  M.thrustAt = (t, t0 = 0, t1 = 2) => M.thrust * Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  // ---- the numbers the script says aloud, to check against script.md before recording ----
  M.report = () => {
    const rows = {
      "车重 (kN)": M.weight() / 1000,
      "推力 / 车重": M.thrust / M.weight(),
      "悬停耗气 (kg/s)": M.massFlow(M.weight()),
    };
    for (const [k, v] of Object.entries(rows)) console.log(k.padEnd(14), +v.toFixed(3));
  };
  return M;
})();
