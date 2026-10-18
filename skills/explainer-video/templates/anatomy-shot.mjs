// One storyboard shot of an anatomy object, for scripts/anatomy/render_shot.sh.
// Copy to <anatomy project>/shots/<id>.mjs and change the keys.
//
// make(shot) gets the shot's entry from audio/timeline.json:
//   shot.duration                      seconds
//   shot.lines = [{ id, start, end }]  narration times relative to the start of the shot
// and returns { keys, labels } in seconds (no retiming happens).
//
// Rules learned the hard way:
// - The first key (t = 0) sets EVERY channel: camera (yaw, pitch, roll, zoom, focus, panX, panY),
//   apart, glow, and every feature channel of your film.mjs. A channel missing at t = 0 holds
//   its first later value from the very start.
// - A channel that should stay put and then move (apart at 0 until the question, then 1) needs a
//   "hold" key where the move starts ({ t: x0, apart: 0 }); otherwise it interpolates from t = 0.
// - Tie moments to words: use L.<id>.start / .end rather than hard-coded seconds, so a re-recorded
//   line moves the motion with it.
// - The last shot pose should equal the next shot's first pose if the cut is a match cut.
// - ease is the ease INTO a key: "io" for moves, "lin" for drifts and running machinery,
//   "whip" (≈0.24 s) to change subject, "o" for an explode, "so"/"si" to settle/start.
// - Feature channels must not reuse the camera names (yaw, pitch, roll, zoom, panX, panY, focus).
export function make(shot) {
  const L = Object.fromEntries(shot.lines.map((l) => [l.id, l]));
  const D = shot.duration;
  const first = shot.lines[0] ?? { start: 0, end: D };
  const x0 = first.end - 1.2; // e.g. come apart near the end of the first line
  return {
    keys: [
      { t: 0, yaw: -35, pitch: 18, roll: 0, zoom: 2.0, focus: "body", panX: 0, panY: 0, apart: 0, glow: [0.5, 0.5, 0.7] /* , feature channels … */ },
      { t: x0, yaw: -30, pitch: 20, zoom: 2.1, apart: 0, ease: "lin" },          // hold apart = 0 until here
      { t: Math.min(D, x0 + 1.4), yaw: -26, pitch: 24, zoom: 1.7, apart: 1, ease: "o" },
      { t: D, yaw: -22, pitch: 25, zoom: 1.65, apart: 1, ease: "lin" },
    ],
    // Plate corners: hint (bottom left) and readout (bottom right). {parts}, {assemblies} and
    // any key of the object's counts are filled in.
    labels: [
      { t: 0, hint: "", readout: "" },
      { t: x0, hint: "拆开看", readout: "{parts} 个零件" },
    ],
  };
}
