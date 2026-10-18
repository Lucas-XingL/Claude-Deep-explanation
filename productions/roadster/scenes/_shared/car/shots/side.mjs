// A still side elevation used as the car sprite in the 2D physics scenes.
export function make(shot) {
  return { keys: [{ t: 0, yaw: -90, pitch: 0, roll: 0, zoom: 2.4, focus: "body", panX: 0, panY: 0, apart: 0, wheels: 0, fan: 0, skirt: 0, glow: [0.5, 0.5, 0.7] }, { t: shot.duration, ease: "lin" }], labels: [{ t: 0, hint: "", readout: "" }] };
}
