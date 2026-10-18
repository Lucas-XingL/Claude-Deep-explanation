// S04 (Fig 3) "秘密在车尾这四个风扇，和车底两侧的裙边。"
// Low behind the right rear quarter, push in on the tail. On "风扇" the four fans light up and spin up;
// on "裙边" the side skirts light up and drop onto the road (the contact shadow is the road), so the
// underbody is closed off. Ends where the fans and the right skirt are both in view.
// When `phrase` is spoken in line `id` (from templates/anatomy-shot.mjs).
function wordTime(shot, id, phrase) {
  const SKIP = /[\s，。！？；：、,.!?;:“”"'（）()《》—…·-]/g, l = shot.lines.find((x) => x.id === id);
  if (!l) return 0;
  const p = phrase.replace(SKIP, "");
  if (l.words?.length) {
    let s = ""; const at = [];
    for (const w of l.words) { const cs = [...w.text.replace(SKIP, "")]; cs.forEach((c, k) => { s += c; at.push(w.start + (w.end - w.start) * k / cs.length); }); }
    const k = s.indexOf(p); if (k >= 0) return at[[...s.slice(0, k)].length];
  }
  const txt = (l.text || "").replace(SKIP, ""), k = txt.indexOf(p);
  return k < 0 ? l.start : l.start + (l.end - l.start) * [...txt.slice(0, k)].length / Math.max(1, [...txt].length);
}

export function make(shot) {
  const W = (id, phrase) => wordTime(shot, id, phrase);
  const D = shot.duration;
  const lead = 0.15; // style.json motion.highlightLead
  const f0 = W("L006", "风扇") - lead; // fans light and spin up
  const s0 = W("L006", "裙边") - lead; // skirts light and drop
  const spin = 0.8, rate = 360; // spin-up time (s) and running speed (°/s, illustrative, well below the real rpm)
  return {
    keys: [
      { t: 0, yaw: -112, pitch: 3, roll: 0, zoom: 2.5, focus: [200, -300, 380], panX: -35, panY: -30, apart: 0, wheels: 0, fan: 0, skirt: 0, shell: 0, hiFan: 0, hiSkirt: 0, hiTank: 0, hiNozzle: 0, ground: 1, glow: [0.55, 0.6, 0.75] },
      { t: f0, yaw: -124, pitch: 5, zoom: 3.1, focus: [200, -500, 360], panX: -80, panY: -32, fan: 0, hiFan: 0, ease: "io" },
      { t: f0 + 0.1, hiFan: 1, ease: "lin" },
      { t: f0 + spin, fan: (rate * spin) / 2, ease: "si" },
      { t: s0, yaw: -130, pitch: 7, zoom: 3.55, focus: [200, -650, 340], panX: -105, panY: -35, skirt: 0, hiSkirt: 0, ease: "io" },
      { t: s0 + 0.1, hiSkirt: 1, ease: "lin" },
      { t: s0 + 0.6, skirt: 1, ease: "so" },
      { t: D, yaw: -133, pitch: 8, zoom: 3.7, panX: -112, panY: -35, fan: (rate * spin) / 2 + rate * (D - f0 - spin), ease: "lin" },
    ],
    // Every label entry is complete: the page shows the latest entry as it is, and each render job
    // starts mid-shot.
    labels: [
      [0, "", ""],
      [f0, "", "4 个风扇"],
      [f0 + 0.6, "", "4 个风扇\n每个约 20 kW · 宣称"],
      [s0, "裙边 · 放下贴地", "4 个风扇\n每个约 20 kW · 宣称"],
    ].map(([t, hint, readout]) => ({ t, fig: "Fig 3", title: "Anatomy · 电动跑车 · 吸地", hint, readout })),
  };
}
