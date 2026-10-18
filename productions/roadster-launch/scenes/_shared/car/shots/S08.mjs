// S08 (Fig 5) L012 "离开坡道以后，翻身靠的是推进器。" L013 "据工程师介绍，车里装着碳纤维高压气瓶，额定压力约是胎压的三百倍。"
// High behind the right rear quarter, the whole car on its shadow. On "推进器" the nozzles light up. Between
// the two lines the body panels lift away (shell channel; chassis, tanks, feed line and nozzles stay
// mounted), then the camera pushes in on the gas system. On "气瓶" both tanks and the feed line light up,
// so tank → feed line → nozzles reads as one lit path. Readouts: rated pressure (claimed) and ≈ 300 × tyre
// pressure (our estimate, model.js), each on its word.
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
  const L = Object.fromEntries(shot.lines.map((l) => [l.id, l]));
  const W = (id, phrase) => wordTime(shot, id, phrase);
  const D = shot.duration;
  const lead = 0.15; // style.json motion.highlightLead
  const n0 = W("L012", "推进器") - lead; // nozzles light
  const x0 = L.L012.end - 0.8, x1 = x0 + 2.0; // the body panels lift away between the lines
  const k0 = W("L013", "气瓶") - lead; // tanks and feed line light
  const p0 = W("L013", "额定") - lead; // rated pressure readout
  const r0 = W("L013", "三百") - lead; // ≈ 300 × tyre pressure readout
  const open = 9; // × each panel's explode travel: far enough that every panel leaves the frame
  return {
    keys: [
      { t: 0, yaw: -143, pitch: 26, roll: 0, zoom: 2.25, focus: "body", panX: 0, panY: -10, apart: 0, wheels: 0, fan: 0, skirt: 0, shell: 0, hiFan: 0, hiSkirt: 0, hiTank: 0, hiNozzle: 0, ground: 1, glow: [0.5, 0.55, 0.75] },
      { t: n0, yaw: -139, pitch: 27, zoom: 2.4, hiNozzle: 0, ease: "io" },
      { t: n0 + 0.1, hiNozzle: 1, ease: "lin" },
      { t: x0, yaw: -137, pitch: 28, zoom: 2.45, focus: "body", shell: 0, ease: "lin" },
      { t: x1, yaw: -131, pitch: 33, zoom: 2.6, focus: [100, -700, 560], shell: open, ease: "io" },
      { t: k0, yaw: -124, pitch: 36, zoom: 3.2, focus: [130, -1100, 560], panX: -20, panY: -10, hiTank: 0, ease: "io" },
      { t: k0 + 0.1, hiTank: 1, ease: "lin" },
      { t: D, yaw: -120, pitch: 37, zoom: 3.45, focus: [120, -1050, 560], panX: -30, ease: "lin" },
    ],
    // Every label entry is complete: the page shows the latest entry as it is, and each render job
    // starts mid-shot.
    labels: [
      [0, "", ""],
      [n0, "推进器喷口", ""],
      [k0, "推进器喷口\n管路走向为示意", "碳纤维高压气瓶"],
      [p0, "推进器喷口\n管路走向为示意", "碳纤维高压气瓶\n额定约 690 bar · 宣称"],
      [r0, "推进器喷口\n管路走向为示意", "碳纤维高压气瓶\n额定约 690 bar · 宣称\n≈ 胎压 300 倍 · 估算"],
    ].map(([t, hint, readout]) => ({ t, fig: "Fig 5", title: "Anatomy · 电动跑车 · 冷气推进", hint, readout })),
  };
}
