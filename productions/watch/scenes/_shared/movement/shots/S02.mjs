// S02: the caseback and rotor lift away and we push in on the balance and the escapement (L015),
// the movement running in real time.
export function make(shot) {
  const D = shot.duration;
  const t0 = 11.67; // continue the movement time from S01
  return {
    keys: [
      { t: 0, yaw: -26.5, pitch: 44.5, roll: 0, zoom: 2.55, focus: "rotor", panX: 0, panY: 0, apart: 0, tau: t0, rotor: 152, back: 0, glow: [0.52, 0.45, 0.7] },
      { t: 1.4, back: 1, zoom: 2.9, focus: "balance", yaw: -24, pitch: 48, ease: "io" },
      { t: D, yaw: -18, pitch: 54, zoom: 4.2, focus: "balance", tau: t0 + D, rotor: 152, ease: "io" },
    ],
    labels: [
      { t: 0, hint: "摆轮 · 擒纵机构", readout: "28800 次/小时 · 每秒 8 次" },
    ],
  };
}
