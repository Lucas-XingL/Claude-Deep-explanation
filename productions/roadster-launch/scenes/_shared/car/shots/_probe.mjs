// Scratch probe for framing (not a storyboard shot): a sequence of fixed poses, one per second.
const P = JSON.parse(process.env.PROBE || "[]");
export function make(shot) {
  const keys = [];
  P.forEach((p, i) => { keys.push({ t: i, ...p, ease: "lin" }); keys.push({ t: i + 0.98, ...p, ease: "lin" }); });
  keys[0] = { roll: 0, panX: 0, panY: 0, apart: 0, wheels: 0, fan: 0, skirt: 0, glow: [0.5, 0.5, 0.7], focus: "body", ...keys[0], t: 0 };
  return { keys, labels: [{ t: 0, hint: "probe", readout: "{parts} parts" }] };
}
