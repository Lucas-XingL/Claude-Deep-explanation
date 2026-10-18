// Feature channels for the Roadster film: wheels turning, fans spinning, skirts dropping.
export const FILM = {
  fig: "Fig 1",
  title: "电动跑车 · 冷气推进",
  radius: 3300,
  label: "A two-seat electric sports car with rear suction fans, two composite cold-gas tanks and ten nozzles, turning, taken apart and put back together.",
  bounds: [
    [-1080, 1080],
    [-2300, 2200],
    [60, 1160],
  ],
};

export const FIGURE = {
  title: "电动跑车 · 剖解",
  start: { yaw: -35, pitch: 18 },
  label: "A neutral model of a thruster-equipped sports car built from {parts} parts.",
  keys: [
    { mark: "raised", label: "吸地：车尾风扇、侧裙" },
    { mark: "lit", label: "推进：气瓶、阀门、喷口" },
    { mark: "edge", label: "驱动：电池、两台后电机" },
  ],
  caption: "{parts} 个零件；外形是示意，不对应任何品牌外观。",
};

export const FEATURE_DEFAULTS = { wheels: 0, fan: 0, skirt: 0 };

export const FEATURE_KEYS = [
  { key: "w", channel: "wheels", name: "wheels", unit: "°", step: 90, ease: 0.2, verb: "rolls the wheels" },
  { key: "f", channel: "fan", name: "fans", unit: "°", step: 120, ease: 0.2, verb: "spins the fans" },
  { key: "s", channel: "skirt", name: "skirts", unit: "", values: [0, 1], ease: 0.3, verb: "drops the skirts" },
];

export function featureValues(s, values) {
  const out = { ...values };
  for (const n of ["wheel.FR", "wheel.FL", "wheel.RR", "wheel.RL"]) out[n] = -s.wheels;
  for (let k = 0; k < 4; k++) out[`fan.${k}`] = s.fan * (k % 2 ? 1 : -1);
  for (const n of ["skirt.R", "skirt.L"]) out[n] = Math.max(values[n] ?? 0, 60 * s.skirt);
  return out;
}

export function featureTravel(a, b) {
  return Math.max((Math.abs(b.wheels - a.wheels) * Math.PI * 355) / 180, (Math.abs(b.fan - a.fan) * Math.PI * 100) / 180, Math.abs(b.skirt - a.skirt) * 60);
}
