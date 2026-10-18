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

// shell and hi* are the explainer's shot channels (end of file); default 0 leaves older shots as they were.
export const FEATURE_DEFAULTS = { wheels: 0, fan: 0, skirt: 0, shell: 0, hiFan: 0, hiSkirt: 0, hiTank: 0, hiNozzle: 0 };

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
  for (const n in SHELL) out[n] = Math.max(values[n] ?? 0, SHELL[n] * (s.shell ?? 0));
  if (typeof document !== "undefined") dress(s);
  return out;
}

export function featureTravel(a, b) {
  return Math.max((Math.abs(b.wheels - a.wheels) * Math.PI * 355) / 180, (Math.abs(b.fan - a.fan) * Math.PI * 100) / 180, Math.abs(b.skirt - a.skirt) * 60, Math.abs((b.shell ?? 0) - (a.shell ?? 0)) * 950);
}

// ---- Explainer shots (productions/roadster-launch S04, S08, S13) ---------------------------------
// shell 0…1: the body panels lift by shell × their explode travel; chassis, tanks and nozzles stay
//   mounted (anatomy-route 5.3, max(apart, channel)).
// hiFan / hiSkirt / hiTank / hiNozzle above 0.5: those parts are repainted in the "signal" material
//   (the accent), fan blades included.
// Labels may set fig / title; hint / readout sit under them, out of the bottom 16 % subtitle band,
//   and may hold "\n" for stacked lines.
const SHELL = { roof: 950, rearwindow: 760, windshield: 760, deck: 850, hood: 820, "sideglass.R": 560, "sideglass.L": 560, "door.R": 700, "door.L": 700 };
const HIGHLIGHT = { hiFan: /^fan\.\d\./, hiSkirt: /^skirt\./, hiTank: /^(tank|feed)\./, hiNozzle: /^nozzle\./ };
const PLATE_CSS = `.mo .mo-corner[data-c="hint"],.mo .mo-corner[data-c="readout"]{top:34px;bottom:auto;font-family:"Noto Sans CJK SC","Source Han Sans SC","PingFang SC","WenQuanYi Zen Hei",sans-serif;font-size:15px;line-height:1.55;letter-spacing:.02em;text-transform:none;white-space:pre;color:rgba(29,28,26,.88);background:rgba(244,241,234,.82);padding:3px 7px}
.mo .mo-corner[data-c="hint"]{left:8px}.mo .mo-corner[data-c="readout"]{right:8px;text-align:right}.mo .mo-corner:empty{display:none}
.mo [data-hl] [data-r^="plane"] path:not(.iso-line){fill:#ec7067!important;stroke:#5e0f0c!important}.mo [data-hl] [data-r^="plane"] circle{fill:#7a1a1c!important}`;
let LOOK = null;
function dress(s) {
  const root = document.querySelector(".mo");
  if (!root) return;
  if (!LOOK) {
    document.head.insertAdjacentHTML("beforeend", `<style>${PLATE_CSS}</style>`);
    const all = [...root.querySelectorAll(".iso-stage [data-name]")];
    LOOK = Object.fromEntries(Object.entries(HIGHLIGHT).map(([k, re]) => [k, all.filter((n) => re.test(n.dataset.name)).map((n) => [n, n.dataset.mat])]));
  }
  for (const k in LOOK) {
    const on = (s[k] ?? 0) > 0.5;
    for (const [n, mat] of LOOK[k]) if (n.hasAttribute("data-hl") !== on) {
      n.dataset.mat = on ? "signal" : mat;
      n.toggleAttribute("data-hl", on);
    }
  }
  for (const c of ["fig", "title"]) {
    const el = root.querySelector(`.mo-corner[data-c="${c}"]`);
    if (s.label && s.label[c] !== undefined && el.textContent !== s.label[c]) el.textContent = s.label[c];
  }
}
