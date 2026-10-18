// S13 (Fig 9, the close) L023 "所以，倒挂靠吸，翻身靠喷，能飞的只有几秒钟。" L024 "离真正的飞行汽车还很远，但离最快的车，可能已经很近了。"
// The parts snap together into the whole car behind its right rear quarter. On "倒挂" the fans and skirts
// flash, on "翻身" the nozzles flash, and the three conclusions stack up in the corner on their words.
// Through L024 the camera circles round the right side to a slightly high front three-quarter hero
// view, where it settles 1.4 s before the end and holds (picture only).
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
  const a1 = 1.05; // assembled
  const s0 = W("L023", "倒挂") - lead; // fans + skirts flash
  const n0 = W("L023", "翻身") - lead; // nozzles flash (and the fans and skirts go back)
  const c0 = W("L023", "能飞") - lead; // third conclusion; nozzles go back
  const settle = D - 1.4; // hero pose reached; held to the end
  return {
    keys: [
      { t: 0, yaw: -140, pitch: 24, roll: 0, zoom: 2.15, focus: "body", panX: 0, panY: 0, apart: 1, wheels: 0, fan: 0, skirt: 0, shell: 0, hiFan: 0, hiSkirt: 0, hiTank: 0, hiNozzle: 0, ground: 0, glow: [0.5, 0.52, 0.72] },
      { t: 0.5, ground: 0, ease: "lin" },
      { t: a1, yaw: -136, pitch: 21, zoom: 2.4, apart: 0, ease: "io" },
      { t: a1 + 0.5, ground: 1, ease: "so" },
      { t: s0, hiFan: 0, hiSkirt: 0, ease: "lin" },
      { t: s0 + 0.1, hiFan: 1, hiSkirt: 1, ease: "lin" },
      { t: n0, hiFan: 1, hiSkirt: 1, hiNozzle: 0, ease: "lin" },
      { t: n0 + 0.1, hiFan: 0, hiSkirt: 0, hiNozzle: 1, ease: "lin" },
      { t: c0, yaw: -129, pitch: 20.5, zoom: 2.45, hiNozzle: 1, ease: "lin" },
      { t: c0 + 0.1, hiNozzle: 0, ease: "lin" },
      { t: settle, yaw: -42, pitch: 19, zoom: 2.8, panY: 8, ease: "io" },
      { t: D, yaw: -41, pitch: 19, zoom: 2.81, panY: 8, ease: "lin" },
    ],
    // Every label entry is complete: the page shows the latest entry as it is, and each render job
    // starts mid-shot.
    labels: [
      [0, ""],
      [s0, "倒挂靠吸"],
      [n0, "倒挂靠吸\n翻身靠喷"],
      [c0, "倒挂靠吸\n翻身靠喷\n能飞几秒"],
    ].map(([t, readout]) => ({ t, fig: "Fig 9", title: "Anatomy · 电动跑车", hint: "", readout })),
  };
}
