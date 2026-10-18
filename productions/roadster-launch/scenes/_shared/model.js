// The Roadster launch film's numeric model: every number on screen, in the narration and in the
// sound effects comes from here. Levels and fact ids follow research/facts.md.
//   node -e "global.window={};require('./scenes/_shared/model.js');window.MODEL.report()"
window.MODEL = (() => {
  const g0 = 9.80665;
  const M = {
    // ---- given: from a source (value, unit, level, fact id) ----
    massCar: 1700,           // kg   C  F14  "just under 1,700 kg"
    fans: 4,                 // -    B  F26  four rear fans
    fanPower: 20000,         // W    C  F14  about 20 kW each
    downforceClaimKg: 2500,  // kgf  C  F10  Moravy: "like 2,500 kilos"
    downforceScreenKg: 4700, // kgf  B  F11  Electrek's reading of the on-screen figure
    thrustClaim: 80000,      // N    C  F13  "more than 80 kN" (total, peak or average not said)
    massGas: 250,            // kg   C  F15  gas in the Rocket's 600 L
    tankRatedBar: 690,       // bar  C  F12  10,000 psi rating (not the fill pressure)
    isp: 70,                 // s    B  F24  cold-gas thruster, 70–80 s
    burnClaim: 5,            // s    C  F18  "about 5 s" of thrust per fill
    t060: 0.81,              // s    A  F08  Tesla's own timer
    pAtm: 101325,            // Pa   B  F21  sea-level standard atmosphere
    // ---- assumed: values we chose; label them 估算 / 示意 on screen ----
    areaUnder: 6,            // m²   E  F21  sealed underbody area inside the skirts (not published)
    tyreBar: 2.3,            // bar  E  F22  a typical car tyre (33 psi)
    sealGap: 0.02,           // m    E  F21  skirt-to-road gap above which the seal is lost (示意)
  };
  // ---- computed from the above ----
  M.weight = (m = M.massCar) => m * g0;                       // N
  M.kgf = (F) => F / g0;                                      // N → kgf
  M.dpFor = (F) => F / M.areaUnder;                           // Pa under the car for a suction force F
  M.dpPct = (F) => (100 * M.dpFor(F)) / M.pAtm;               // % of the atmosphere
  M.suctionFor = (dp) => dp * M.areaUnder;                    // N for an underbody pressure drop dp
  // Normal force the road (or ceiling) puts on the tyres, at standstill (no speed term):
  M.normalUpright = (F) => M.weight() + F;
  M.normalInverted = (F) => F - M.weight();                   // < 0 means it falls
  M.massFlow = (T) => T / (M.isp * g0);                       // kg/s for thrust T
  M.gramsPerNs = () => 1000 / (M.isp * g0);                    // g of gas per newton per second (≈1.46)
  M.tankVsTyre = () => M.tankRatedBar / M.tyreBar;             // ≈300
  M.thrustToWeight = () => M.thrustClaim / M.weight();         // ≈4.8
  // Hovering on the gas: state at time t (s), integrated from 0 so any frame can ask for any t.
  M.hoverAt = (t) => {
    let m = M.massCar + M.massGas, gas = M.massGas, s = 0;
    const dt = 0.01;
    while (s < t && gas > 0) { const mdot = M.massFlow(m * g0); gas -= mdot * dt; m -= mdot * dt; s += dt; }
    const T = gas > 0 ? m * g0 : 0;
    return { gas: Math.max(0, gas), thrust: T, mdot: gas > 0 ? M.massFlow(T) : 0, empty: gas <= 0 };
  };
  M.hoverTime = () => {                                       // s, gas spent while hovering (E)
    let m = M.massCar + M.massGas, gas = M.massGas, t = 0;
    const dt = 0.01;
    while (gas > 0) { const mdot = M.massFlow(m * g0); gas -= mdot * dt; m -= mdot * dt; t += dt; }
    return t;
  };
  // ---- where the model holds: outside it, scenes say "模型不再适用" instead of extrapolating ----
  M.suctionHolds = (gap) => gap < M.sealGap;
  // ---- the numbers the script says aloud ----
  M.report = () => {
    const W = M.weight(), Fc = M.downforceClaimKg * g0, Fs = M.downforceScreenKg * g0;
    const rows = {
      "车重 (kN)": W / 1000,
      "倒挂所需吸力 (kgf)": M.kgf(W),
      "倒挂所需车底负压 (kPa)": M.dpFor(W) / 1000,
      "倒挂所需负压占大气压 (%)": M.dpPct(W),
      "宣称 2500 kg 时负压 (kPa)": M.dpFor(Fc) / 1000,
      "宣称 2500 kg 时占大气压 (%)": M.dpPct(Fc),
      "宣称 2500 kg 时倒挂余量 (kN)": M.normalInverted(Fc) / 1000,
      "屏幕 4700 kg 时负压 (%)": M.dpPct(Fs),
      "平均加速度 (g)": 26.82 / M.t060 / g0,
      "理想悬停时间 (s)": M.hoverTime(),
      "每牛每秒耗气 (g)": M.gramsPerNs(),
      "额定压力 / 胎压": M.tankVsTyre(),
      "推力 / 车重": M.thrustToWeight(),
      "悬停开始耗气 (kg/s)": M.hoverAt(0).mdot,
    };
    for (const [k, v] of Object.entries(rows)) console.log(k.padEnd(24), +v.toFixed(2));
  };
  return M;
})();
if (typeof module !== "undefined") module.exports = window.MODEL;
