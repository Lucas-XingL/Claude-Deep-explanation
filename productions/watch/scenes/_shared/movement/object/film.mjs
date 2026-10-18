// One numeric model drives every moving part of the movement (and the 2D escapement scenes,
// which load the same numbers from ../../model.js). Sources: research/facts.md.
export const WATCH = {
  vph: 28800, // ETA 2824-2: 28,800 vibrations per hour → 8 beats/s, 4 Hz (F08)
  hz: 4,
  amplitude: 280, // balance amplitude, degrees each side of rest (healthy 270–315°)
  lift: 50, // ETA 2824-2 lift angle (F12)
  forkAngle: 8, // lever swing each side; total 16° (typical 12–20°)
  // A typical 4 Hz going train (F04, illustrative, not a named calibre): wheel teeth / pinion leaves.
  teeth: { barrel: 80, centerPinion: 14, center: 75, thirdPinion: 10, third: 72, fourthPinion: 9, fourth: 96, escapePinion: 8, escape: 20 },
  r: { barrel: 5.2, centerPinion: 0.91, center: 3.75, thirdPinion: 0.5, third: 2.88, fourthPinion: 0.36, fourth: 2.88, escapePinion: 0.24, escape: 1.6, roller: 0.62, balance: 4.3 },
  forkDist: 2.1, // pallet arbor to escape-wheel centre
  forkLen: 2.3, // pallet arbor to the fork's notch
  angles: { barrel: 120, third: -15, fourth: -100, escape: -175, fork: -150 }, // layout, degrees
  rotate: -45, // turns the whole layout so the seconds arbor sits at 6 o'clock
  clock0: 10 * 3600 + 8 * 60 + 30, // the time the hands show at tau = 0 (10:08:30)
};

// tau: movement time in seconds. Returns every angle in degrees.
export function movement(tau) {
  const W = WATCH;
  const A = W.amplitude;
  const psi = 2 * Math.PI * W.hz * tau;
  const balance = A * Math.sin(psi);
  const half = (W.lift / 2) * (Math.PI / 180);
  const delta = Math.asin(Math.min(1, W.lift / 2 / A)); // phase half-width of the lift
  // Beats completed: crossing k spans psi in [kπ − δ, kπ + δ]; inside it the escapement works.
  const k = Math.max(0, Math.floor((psi + delta) / Math.PI));
  const p = Math.max(0, Math.min(1, (psi - (k * Math.PI - delta)) / (2 * delta)));
  // Within one beat: unlock (no wheel motion), impulse (wheel turns), drop (fast), lock.
  const g = p < 0.2 ? 0 : p < 0.8 ? 0.82 * ((p - 0.2) / 0.6) : p < 0.9 ? 0.82 + 0.18 * ((p - 0.8) / 0.1) : 1;
  const teethDone = 0.5 * (k + g);
  const escape = (-360 * teethDone) / W.teeth.escape;
  const fork = W.forkAngle * Math.max(-1, Math.min(1, (balance * Math.PI) / 180 / half));
  const T = W.teeth;
  const fourth = (-escape * T.escapePinion) / T.fourth;
  const third = (-fourth * T.fourthPinion) / T.third;
  const center = (-third * T.thirdPinion) / T.center;
  const barrel = (-center * T.centerPinion) / T.barrel;
  const clock = W.clock0 + tau;
  return {
    balance, fork, escape, fourth, third, center, barrel,
    seconds: fourth + ((W.clock0 % 60) / 60) * 360,
    minute: center + ((W.clock0 % 3600) / 3600) * 360,
    hour: (center + ((W.clock0 % 3600) / 3600) * 360) / 12 + Math.floor(W.clock0 / 3600) * 30,
    beats: k + p, clock,
  };
}

export const FILM = {
  fig: "Fig 1",
  title: "机械表机芯",
  radius: 22,
  label: "A self-winding mechanical watch movement in its case, seen through the caseback: rotor, bridges, gear train, escapement and balance, taken apart and put back together.",
  bounds: [
    [-19, 19],
    [-25, 25],
    [-3, 5.6],
  ],
};

export const FIGURE = {
  title: "机械表机芯 · 剖解",
  start: { yaw: -20, pitch: 40 },
  label: "A teaching model of a self-winding movement built from {parts} parts.",
  keys: [
    { mark: "raised", label: "能量：摆陀、发条盒" },
    { mark: "lit", label: "传动：中心轮、三轮、四轮" },
    { mark: "edge", label: "计时：擒纵轮、擒纵叉、摆轮游丝" },
  ],
  caption: "{parts} 个零件，所有运动由同一个时间模型驱动：摆轮每秒摆动 8 次。",
};

export const FEATURE_DEFAULTS = { tau: 0, rotor: 0, back: 0 };

export const FEATURE_KEYS = [
  { key: "t", channel: "tau", name: "movement time", unit: "s", step: 0.125, ease: 0.3, verb: "lets the movement run one beat" },
  { key: "r", channel: "rotor", name: "rotor", unit: "°", step: 60, ease: 0.25, verb: "swings the rotor" },
];

export function featureValues(s, values) {
  const m = movement(s.tau);
  return {
    ...values,
    balance: m.balance,
    fork: m.fork,
    "wheel.escape": m.escape,
    "wheel.fourth": m.fourth,
    "wheel.third": m.third,
    "wheel.center": m.center,
    barrel: m.barrel,
    "hand.seconds": m.seconds,
    "hand.minute": m.minute,
    "hand.hour": m.hour,
    rotor: s.rotor,
    // back: 0…1 lifts the caseback and rotor away, to look into the movement.
    caseback: Math.max(values.caseback ?? 0, 34 * s.back),
    "rotor.lift": Math.max(values["rotor.lift"] ?? 0, 28 * s.back),
  };
}

export function featureTravel(a, b) {
  const ma = movement(a.tau);
  const mb = movement(b.tau);
  const arc = (d, r) => (Math.abs(d) * Math.PI * r) / 180;
  return Math.max(Math.abs(b.back - a.back) * 30, arc(mb.balance - ma.balance, WATCH.r.balance), arc(mb.escape - ma.escape, WATCH.r.escape), arc(b.rotor - a.rotor, 12), arc(mb.seconds - ma.seconds, 3));
}
