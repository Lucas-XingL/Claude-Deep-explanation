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

// shell, hi*, ground and bigLines are the explainer's shot channels (end of file); default 0 leaves older shots as they were.
export const FEATURE_DEFAULTS = { wheels: 0, fan: 0, skirt: 0, shell: 0, hiFan: 0, hiSkirt: 0, hiTank: 0, hiNozzle: 0, ground: 0, bigLines: 0 };

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
  return Math.max((Math.abs(b.wheels - a.wheels) * Math.PI * 355) / 180, (Math.abs(b.fan - a.fan) * Math.PI * 100) / 180, Math.abs(b.skirt - a.skirt) * 60, Math.abs((b.shell ?? 0) - (a.shell ?? 0)) * 1100);
}

// ---- Explainer shots (productions/roadster-launch S04, S08, S13) ---------------------------------
// shell 0…: each body panel moves along its explode direction by shell × its SHELL distance (mm);
//   chassis, tanks, feed line and nozzles stay
//   mounted (anatomy-route 5.3: max(apart, channel)). Values above 1 send the panels out of frame.
// hiFan / hiSkirt / hiTank / hiNozzle above 0.5: those parts are repainted in the "signal" material
//   (the accent), fan blades included.
// ground 0…1: opacity of a soft contact shadow on the road plane (z = 0) under the car, drawn in the
//   figure layer beneath every part, so a dropped skirt has a floor to meet.
// Labels may set fig / title; hint / readout sit under them, out of the bottom 16 % subtitle band,
//   and may hold "\n" for stacked lines.
// Labels may set big: lines ("\n") set large in ink on the left, above the subtitle band; line i
//   shows at opacity clamp(bigLines − i, 0, 1), rising into place as it fades in.
const SHELL = { roof: 950, rearwindow: 900, windshield: 900, deck: 850, hood: 820, "sideglass.R": 1100, "sideglass.L": 1100, "door.R": 700, "door.L": 700 };
const HIGHLIGHT = { hiFan: /^fan\.\d\./, hiSkirt: /^skirt\./, hiTank: /^(tank|feed)\./, hiNozzle: /^nozzle\./ };
const PLATE_CSS = `.mo .mo-corner[data-c="hint"],.mo .mo-corner[data-c="readout"]{top:34px;bottom:auto;font-family:"Noto Sans CJK SC","Source Han Sans SC","PingFang SC","WenQuanYi Zen Hei",sans-serif;font-size:15px;line-height:1.55;letter-spacing:.02em;text-transform:none;white-space:pre;color:rgba(29,28,26,.88);background:rgba(244,241,234,.82);padding:3px 7px}
.mo .mo-corner[data-c="hint"]{left:8px}.mo .mo-corner[data-c="readout"]{right:8px;text-align:right}.mo .mo-corner:empty{display:none}
.mo .mo-corner[data-c="fig"],.mo .mo-corner[data-c="title"]{font-size:11px}
.mo [data-hl] [data-r^="plane"] path:not(.iso-line){fill:#ec7067!important;stroke:#5e0f0c!important}.mo [data-hl] [data-r^="plane"] circle{fill:#7a1a1c!important}
.mo .mo-big{position:absolute;left:48px;top:42%;font-family:ui-monospace,"SF Mono",Menlo,Consolas,"WenQuanYi Zen Hei",monospace;font-size:34px;line-height:1.42;letter-spacing:.04em;color:#1D1C1A;white-space:pre;pointer-events:none}`;
let LOOK = null;
function dress(s) {
  const root = document.querySelector(".mo");
  if (!root) return;
  if (!LOOK) {
    root.insertAdjacentHTML("beforeend", `<style>${PLATE_CSS}</style>`); // after look.css, so it wins
    const all = [...root.querySelectorAll(".iso-stage [data-name]")];
    LOOK = Object.fromEntries(Object.entries(HIGHLIGHT).map(([k, re]) => [k, all.filter((n) => re.test(n.dataset.name)).map((n) => [n, n.dataset.mat])]));
  }
  for (const k in HIGHLIGHT) {
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
  if (s.label && s.label.big !== undefined) {
    if (!LOOK.big) {
      root.insertAdjacentHTML("beforeend", `<div class="mo-big"></div>`);
      LOOK.big = root.querySelector(".mo-big");
    }
    if (LOOK.big.dataset.src !== s.label.big) {
      LOOK.big.replaceChildren(...s.label.big.split("\n").map((t) => Object.assign(document.createElement("div"), { textContent: t })));
      LOOK.big.dataset.src = s.label.big;
    }
    [...LOOK.big.children].forEach((d, i) => {
      const o = Math.max(0, Math.min(1, (s.bigLines ?? 0) - i));
      d.style.opacity = o.toFixed(3);
      d.style.transform = `translateY(${((1 - o) * 12).toFixed(2)}px)`;
    });
  }
  const g = Math.max(0, Math.min(1, s.ground ?? 0));
  if (!g && !LOOK.ground) return;
  if (!LOOK.ground) {
    const svg = root.querySelector(".iso-stage svg");
    svg.insertAdjacentHTML("afterbegin", `<filter id="mo-ground" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${(DATA.basis.k * 120).toFixed(2)}"/></filter><path class="mo-ground" filter="url(#mo-ground)" fill="rgb(70,58,42)"/>`);
    LOOK.ground = svg.querySelector(".mo-ground");
  }
  LOOK.ground.setAttribute("opacity", (0.4 * g).toFixed(3));
  const M = orient(s.yaw, s.pitch, s.roll);
  const ring = Array.from({ length: 48 }, (_, j) => {
    const c = Math.cos((Math.PI * j) / 24), n = Math.sin((Math.PI * j) / 24);
    return screenOf(about(M, [1000 * Math.sign(c) * Math.abs(c) ** 0.3, 2150 * Math.sign(n) * Math.abs(n) ** 0.3, 0])).map((v) => v.toFixed(2)).join(" ");
  });
  LOOK.ground.setAttribute("d", `M${ring.join("L")}Z`);
}
