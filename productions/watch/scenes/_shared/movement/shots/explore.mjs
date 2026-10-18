export function make(shot) {
  return { keys: [{ t: 0, yaw: 0, pitch: 30, roll: 0, zoom: 1, focus: "body", panX: 0, panY: 0, apart: 0, tau: 0, rotor: 0, back: 0, glow: [0.5, 0.45, 0.7] }, { t: shot.duration, ease: "lin" }], labels: [{ t: 0, hint: "", readout: "" }] };
}
