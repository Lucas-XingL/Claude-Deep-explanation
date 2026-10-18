// The Roadster physics model. Every number on screen and in the narration comes from here.
// Levels follow research/facts.md: C = Tesla engineer's claim, B = reliable source, E = our estimate.
window.RS = (() => {
  const g0 = 9.80665;
  const M = {
    massCar: 1700,      // kg, target "just under 1,700 kg" (C, F14)
    massGas: 250,       // kg of air in 600 L (C, F15)
    thrustClaim: 80000, // N, "more than 80 kN" (C, F13)
    isp: 70,            // s, cold nitrogen/air thruster (B, F15: 70–80 s)
    muTyre: 1.6,        // assumed friction coefficient for the grip limit (E, F06)
    v60: 26.82,         // m/s = 60 mph
    t060: 0.81,         // s, Tesla's own timer (A, F08)
  };
  M.weight = (m = M.massCar) => m * g0;                                  // N
  M.massFlow = (T) => T / (M.isp * g0);                                  // kg/s for thrust T
  M.gramsPerNewtonSecond = () => 1000 / (M.isp * g0);                    // ≈ 1.46 g
  // Hover until the gas runs out, with the mass falling as gas is spent (E).
  M.hoverTime = () => {
    let m = M.massCar + M.massGas, gas = M.massGas, t = 0;
    const dt = 0.01;
    while (gas > 0) { const mdot = M.massFlow(m * g0); gas -= mdot * dt; m -= mdot * dt; t += dt; }
    return t;
  };
  M.gripLimit060 = (mu = M.muTyre) => M.v60 / (mu * g0);                  // s
  M.avgG = () => M.v60 / M.t060 / g0;                                     // g
  return M;
})();
