// S01 hook: the dial facing us with the small seconds hand stepping in real time (L001);
// on L002 the watch flips over to show the rotor and the movement, and we drift toward the balance.
export function make(shot) {
  const L = Object.fromEntries(shot.lines.map((l) => [l.id, l]));
  const D = shot.duration;
  const flip0 = L.L002.start - 0.35, flip1 = flip0 + 1.7;
  const tau = (t) => t; // real time: the seconds hand steps 8 times a second
  return {
    keys: [
      { t: 0, yaw: -6, pitch: -64, roll: 0, zoom: 1.85, focus: "dial", panX: 0, panY: 0, apart: 0, tau: tau(0), rotor: 0, back: 0, glow: [0.5, 0.48, 0.66] },
      { t: flip0, yaw: 6, pitch: -58, roll: 0, zoom: 2.0, focus: "dial", tau: tau(flip0), ease: "lin" },
      { t: flip0 + 0.85, yaw: -6, pitch: -8, roll: 4, zoom: 1.75, ease: "io" },
      { t: flip1, yaw: -20, pitch: 38, roll: 0, zoom: 1.9, focus: "body", rotor: 0, ease: "io", glow: [0.52, 0.45, 0.7] },
      { t: D - 0.2, yaw: -26, pitch: 44, zoom: 2.5, focus: "rotor", rotor: 150, tau: tau(D - 0.2), ease: "io" },
      { t: D, yaw: -26.5, pitch: 44.5, zoom: 2.55, rotor: 152, tau: tau(D), ease: "lin" },
    ],
    labels: [
      { t: 0, hint: "表盘 · 小秒针", readout: "没有电池" },
      { t: flip1 - 0.4, hint: "后盖 · 摆陀", readout: "示意机芯 · {parts} 个零件" },
    ],
  };
}
