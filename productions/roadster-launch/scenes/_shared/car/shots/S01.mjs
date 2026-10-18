// S01 hook: the car rolls in (L001), lifts and flips about its long axis while L002 describes the
// demos, settles into a hero view for Musk's claim (L003), then comes apart to show the tanks,
// nozzles and fans behind the question (L004).
export function make(shot) {
  const L = Object.fromEntries(shot.lines.map((l) => [l.id, l]));
  const D = shot.duration;
  const f0 = L.L002.start + 1.6, f1 = f0 + 1.7; // the flip
  const x0 = L.L004.start + 0.2, x1 = x0 + 1.5; // the explode
  return {
    keys: [
      { t: 0, yaw: -58, pitch: 10, roll: 0, zoom: 2.5, focus: "body", panX: 0, panY: 0, apart: 0, wheels: 0, fan: 0, skirt: 0, glow: [0.5, 0.5, 0.7] },
      { t: f0 - 0.6, yaw: -84, pitch: 6, zoom: 2.4, panY: 0, wheels: 1300, ease: "io" },
      { t: f0, panY: 0, pitch: 6, ease: "lin" },
      { t: f0 + 0.55, panY: 110, pitch: 120, ease: "si" },
      { t: f1 - 0.35, panY: 95, pitch: 330, ease: "lin" },
      { t: f1, panY: 0, pitch: 366, wheels: 1500, ease: "so" },
      { t: L.L003.start + 0.4, yaw: -40, pitch: 382, zoom: 2.7, ease: "io" },
      { t: x0, yaw: -36, pitch: 384, zoom: 2.75, apart: 0, fan: 0, ease: "lin" },
      { t: x1, yaw: -32, pitch: 392, zoom: 2.3, apart: 1, fan: 240, ease: "o" },
      { t: D, yaw: -24, pitch: 394, zoom: 2.25, apart: 1, fan: 720, ease: "lin" },
    ],
    labels: [
      { t: 0, hint: "2026-10-15 · 发布会", readout: "原型车 · 车上无人" },
      { t: L.L003.start, hint: "宣称", readout: "“飞行汽车是真的”" },
      { t: x0, hint: "拆开看", readout: "{parts} 个零件 · {nozzles} 个喷口 · {tanks} 个气瓶" },
    ],
  };
}
