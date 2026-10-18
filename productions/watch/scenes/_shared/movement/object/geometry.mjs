// A teaching model of a self-winding mechanical watch movement, seen through a display caseback.
// World units are millimetres. z is up (towards the caseback); the dial and hands face -z.
// Layout is schematic (small seconds at 6 o'clock); frequency, escape-wheel teeth and
// train ratios follow the numbers in film.mjs (WATCH), which also drives every moving part.
import * as G from "../kit/lathe.mjs";
import { WATCH } from "./film.mjs";
const TAU = Math.PI * 2;
const unit = G.unit3;
const sub = G.sub3;
const mul = G.mul3;
const dot = G.dot3;
const cross = G.cross3;
export const frame = (o, a, u) => {
  const A = unit(a);
  const U = unit(sub(u, mul(A, dot(u, A))));
  return { o, a: A, u: U, v: cross(A, U) };
};
const AX = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const NZ = [0, 0, -1];
const FONT = "Helvetica, Arial, sans-serif";
const deg = (a) => (a * Math.PI) / 180;
const pol = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
const ring = (r, steps = 72, cx = 0, cy = 0) =>
  Array.from({ length: steps }, (_, j) => {
    const a = (TAU * j) / steps;
    return `${j ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(3)} ${(cy + r * Math.sin(a)).toFixed(3)}`;
  }).join("") + "Z";
const line = (d, tone = "lo") => `<path class="iso-line" data-tone="${tone}" d="${d}"/>`;
const text = (x, y, s, size, { tone = "hi", anchor = "middle", weight = 400 } = {}) =>
  `<text class="iso-face-text" data-tone="${tone}" font-size="${size}" text-anchor="${anchor}"${weight !== 400 ? ` font-weight="${weight}"` : ""} style="font-family:${FONT};letter-spacing:.08em" transform="translate(${x.toFixed(3)} ${y.toFixed(3)})">${s}</text>`;
// Convex polygon of a circle (CCW).
const disc = (r, n = 48, cx = 0, cy = 0) => Array.from({ length: n }, (_, j) => pol(r, (TAU * j) / n)).map(([x, y]) => [x + cx, y + cy]);
// Convex hull (monotone chain), CCW.
function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const crs = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [];
  for (const q of p) {
    while (lo.length >= 2 && crs(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up = [];
  for (const q of p.reverse()) {
    while (up.length >= 2 && crs(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
// A rounded convex blob around pivot points: the hull of small circles.
const blob = (pts, r, n = 16) => hull(pts.flatMap(([x, y]) => disc(r, n, x, y)));
// Annulus sector as a convex polygon: inner chord, outer arc.
const sector = (ri, ro, a0, a1, steps = 4) => {
  const out = [pol(ri, a0)];
  for (let j = 0; j <= steps; j++) out.push(pol(ro, a0 + ((a1 - a0) * j) / steps));
  out.push(pol(ri, a1));
  return out;
};

// Parallel stripes (Côtes de Genève) clipped to a convex polygon, as plane-drawing path data.
function stripes(poly, step = 0.9, angle = 1.15) {
  const dir = [Math.cos(angle), Math.sin(angle)];
  const nrm = [-dir[1], dir[0]];
  const ds = poly.map(([x, y]) => x * nrm[0] + y * nrm[1]);
  let d = "";
  for (let c = Math.min(...ds) + step / 2; c < Math.max(...ds); c += step) {
    // Clip the line {p · nrm = c} against each edge of the polygon.
    const hits = [];
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i], B = poly[(i + 1) % poly.length];
      const a = A[0] * nrm[0] + A[1] * nrm[1] - c, b = B[0] * nrm[0] + B[1] * nrm[1] - c;
      if ((a <= 0 && b > 0) || (a > 0 && b <= 0)) {
        const t = a / (a - b);
        hits.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]);
      }
    }
    if (hits.length >= 2) {
      const [P, Q] = hits;
      const inset = 0.25;
      const L = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
      if (L < 2 * inset) continue;
      const k = inset / L;
      const P2 = [P[0] + (Q[0] - P[0]) * k, P[1] + (Q[1] - P[1]) * k], Q2 = [Q[0] - (Q[0] - P[0]) * k, Q[1] - (Q[1] - P[1]) * k];
      d += `M${P2[0].toFixed(3)} ${(-P2[1]).toFixed(3)}L${Q2[0].toFixed(3)} ${(-Q2[1]).toFixed(3)}`;
    }
  }
  return d;
}

// ---- Layout -------------------------------------------------------------------------
export const LAYOUT = (() => {
  const W = WATCH;
  const A = W.angles;
  const at = (P, dist, a) => [P[0] + dist * Math.cos(deg(a)), P[1] + dist * Math.sin(deg(a))];
  const center = [0, 0];
  const barrel = at(center, W.r.barrel + W.r.centerPinion + 0.05, A.barrel);
  const third = at(center, W.r.center + W.r.thirdPinion + 0.05, A.third);
  const fourth = at(third, W.r.third + W.r.fourthPinion + 0.05, A.fourth);
  const escape = at(fourth, W.r.fourth + W.r.escapePinion + 0.05, A.escape);
  const fork = at(escape, W.forkDist, A.fork);
  const balance = at(fork, W.forkLen + W.r.roller + 0.05, A.fork);
  const c = Math.cos(deg(W.rotate)), s = Math.sin(deg(W.rotate));
  const rot = ([x, y]) => [x * c - y * s, x * s + y * c];
  const out = { center, barrel, third, fourth, escape, fork, balance };
  for (const k in out) out[k] = rot(out[k]);
  return { ...out, rotor: [0, 0] };
})();

// ---- z levels (mm) ----
export const Z = {
  caseLo: -3.0, caseHi: 5.0, backHi: 5.6,
  dialLo: -2.1, dialHi: -1.75,
  plateLo: -1.6, plateHi: 0,
  wheel: [0.9, 1.15], fourth: [0.45, 0.7],
  barrel: [1.3, 2.5],
  escape: [1.25, 1.45], fork: [1.5, 1.65], forkHorn: [1.35, 1.5],
  roller: [1.5, 1.65], staff: [0.3, 1.5],
  balRim: [1.85, 2.25], balArm: [1.98, 2.12],
  spring: [2.3, 2.38],
  bridgeLo: 2.5, bridgeHi: 3.2,
  cockLo: 2.5, cockHi: 3.3,
  rotorLo: 3.6, rotorHi: 4.1,
  glassLo: 4.75, glassHi: 5.2,
};

export function buildObject(T, { layer }) {
  const parts = {};
  const groups = {};
  const explode = [];
  const anchors = {};
  const features = [];
  const L = layer;
  const root = T.group("root", { free: { origin: [0, 0, 1.2] } });
  groups.root = root;
  const assembly = (name, dir, travel, delay = 0, parent = root) => {
    const g = T.group(name, { parent, slide: { direction: unit(dir), travel } });
    groups[name] = g;
    explode.push({ name, travel, delay });
    return g;
  };
  const turn = (name, parent, [x, y]) => {
    const g = T.group(name, { parent, turn: { pivot: [x, y] } });
    groups[name] = g;
    return g;
  };
  const part = (p) => (parts[p.name] = p);
  const prismZ = (name, group, poly, s0, s1, o = {}) =>
    part(T.prism({ name, group, layer: L, F: frame([0, 0, 0], AX.z, AX.x), polygon: poly, s0, s1, steps: 5, tone: o.tone ?? "hi", crease: o.crease ?? "lo", bevel: o.bevel ?? 0, material: o.material, lit: o.lit, details: o.details }));
  const up = (x, y) => frame([x, y, 0], AX.z, AX.x);
  const round = (name, group, [x, y], s0, s1, r, o = {}) =>
    part(T.round({ name, group, layer: L, F: up(x, y), s0, s1, r, ends: o.ends, tone: o.tone ?? "hi", crease: o.crease ?? "lo", material: o.material, lit: o.lit, details: o.details }));
  const plane = (p, o, u, v, svg, normal, fade = [0.04, 0.3]) => T.plane({ part: p, o, u, v, svg, normal, fade });
  // Top face (seen from +z, 12 o'clock up) and bottom face (seen from the dial side).
  const TOP = { u: [1, 0, 0], v: [0, -1, 0] };
  const BOT = { u: [-1, 0, 0], v: [0, -1, 0] };
  const topPlane = (p, [x, y], z, svg) => plane(p, [x, y, z + 0.01], TOP.u, TOP.v, svg, AX.z);
  const screw = (name, group, [x, y], z, r = 0.45) => {
    const s = round(name, group, [x, y], z, z + 0.18, r, { material: "gunmetal", tone: "hi" });
    topPlane(s, [x, y], z + 0.18, line(`M${-r * 0.8} 0H${r * 0.8}`, "hi"));
    return s;
  };
  const jewel = (name, group, [x, y], z, r = 0.38) => {
    const j = round(name, group, [x, y], z, z + 0.08, r, { material: "signal", tone: "hi" });
    topPlane(j, [x, y], z + 0.08, `<circle r="${(r * 0.32).toFixed(3)}" style="fill:#5a1a1a"/>`);
    return j;
  };
  // A toothed wheel: a gilt disc with its teeth drawn on the rim and four crossings (spokes).
  const wheel = (name, group, P, r, teeth, [s0, s1], o = {}) => {
    const w = round(name, group, P, s0, s1, r, { material: o.material ?? "gold", tone: "hi", details: { ribs: { s0, s1, count: teeth, tone: "lo" } } });
    let notch = "";
    for (let i = 0; i < teeth; i++) {
      const a = (TAU * i) / teeth;
      const [x0, y0] = pol(r - 0.22, a);
      const [x1, y1] = pol(r - 0.02, a);
      notch += `M${x0.toFixed(3)} ${(-y0).toFixed(3)}L${x1.toFixed(3)} ${(-y1).toFixed(3)}`;
    }
    let spokes = "";
    const hub = Math.max(0.35, r * 0.18);
    if (o.spokes !== 0 && r > 1.4) {
      const n = o.spokes ?? 4;
      for (let i = 0; i < n; i++) {
        const a0 = (TAU * i) / n + 0.32;
        const a1 = (TAU * (i + 1)) / n - 0.32;
        const ri = hub + 0.25;
        const ro = r - 0.55;
        const P0 = pol(ri, a0), P1 = pol(ro, a0), P2 = pol(ro, a1), P3 = pol(ri, a1);
        spokes += `<path d="M${P0[0].toFixed(3)} ${(-P0[1]).toFixed(3)}L${P1[0].toFixed(3)} ${(-P1[1]).toFixed(3)}A${ro} ${ro} 0 0 0 ${P2[0].toFixed(3)} ${(-P2[1]).toFixed(3)}L${P3[0].toFixed(3)} ${(-P3[1]).toFixed(3)}A${ri} ${ri} 0 0 1 ${P0[0].toFixed(3)} ${(-P0[1]).toFixed(3)}Z" style="fill:#6f5a2c;opacity:.55"/>`;
      }
    }
    topPlane(w, P, s1, line(notch, "lo") + spokes + `<path class="iso-line" data-tone="mid" d="${ring(r - 0.25, 64)}"/>`);
    return w;
  };
  const pinion = (name, group, P, r, leaves, [s0, s1]) => round(name, group, P, s0, s1, r, { material: "steel", tone: "hi", details: { ribs: { s0, s1, count: leaves, tone: "lo" } } });

  const W = WATCH;
  const LY = LAYOUT;

  // ---- Case (core) -------------------------------------------------------------------
  const core = assembly("core", AX.z, 0, 0);
  // The case drops away below when the watch comes apart, so the movement rises clear of it.
  const caseG = assembly("case", NZ, 18, 0);
  const caseIn = 13.6;
  const caseOut = 19.0;
  const segs = 18;
  for (let i = 0; i < segs; i++) {
    const a0 = deg(184) + (deg(352) * i) / segs;
    const a1 = deg(184) + (deg(352) * (i + 1)) / segs;
    prismZ(`case.ring.${i}`, caseG, sector(caseIn, caseOut, a0, a1, 4), Z.caseLo, Z.caseHi, { material: "steel", tone: "hi", crease: "faint" });
  }
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    // The inner edge is a chord just outside the case ring, so the lug meets it with a hairline gap.
    const yIn = (x) => Math.sqrt(19.6 * 19.6 - x * x);
    const poly = hull([[sx * 9.2, sy * yIn(9.2)], [sx * 12.6, sy * yIn(12.6)], [sx * 12.6, sy * 24.5], [sx * 9.2, sy * 24.5]]);
    prismZ(`case.lug.${sx > 0 ? "R" : "L"}${sy > 0 ? "t" : "b"}`, caseG, poly, Z.caseLo + 0.6, 2.0, { material: "steel", tone: "hi", bevel: 0.3 });
  }
  // Crown and stem at 3 o'clock.
  {
    const F = frame([0, 0, 0.8], [-1, 0, 0], AX.z);
    part(T.round({ name: "crown.stem", group: caseG, layer: L, F, s0: 13.4, s1: 19.0, r: 0.42, tone: "hi", crease: "lo", material: "steel" }));
    part(T.round({ name: "crown.tube", group: caseG, layer: L, F, s0: 19.0, s1: 19.9, r: 1.1, tone: "hi", crease: "lo", material: "steel" }));
    part(T.round({ name: "crown", group: caseG, layer: L, F, s0: 19.9, s1: 22.4, r: 2.4, tone: "hi", crease: "lo", material: "steel", details: { ribs: { s0: 20.1, s1: 22.2, count: 40, tone: "lo" } } }));
    anchors.crown = [-21, 0, 0.8];
  }

  // ---- Dial and hands (face -z) ---------------------------------------------------------
  const dialG = assembly("dial", NZ, 9, 0.05);
  const dialPart = round("dial", dialG, [0, 0], Z.dialLo, Z.dialHi, 13.2, { material: "porcelain", tone: "hi" });
  {
    let ticks = "";
    for (let i = 0; i < 60; i++) {
      const a = (TAU * i) / 60;
      const r0 = i % 5 ? 12.2 : 11.2;
      const [x0, y0] = pol(r0, a), [x1, y1] = pol(12.7, a);
      ticks += `M${x0.toFixed(3)} ${y0.toFixed(3)}L${x1.toFixed(3)} ${y1.toFixed(3)}`;
    }
    const [sx, sy] = LY.fourth;
    let sub = `<path class="iso-line" data-tone="mid" d="${ring(3.2, 48, -sx, -sy)}"/>`;
    for (let i = 0; i < 12; i++) {
      const a = (TAU * i) / 12;
      const [x0, y0] = pol(2.6, a), [x1, y1] = pol(3.1, a);
      sub += line(`M${(x0 - sx).toFixed(3)} ${(y0 - sy).toFixed(3)}L${(x1 - sx).toFixed(3)} ${(y1 - sy).toFixed(3)}`, "lo");
    }
    // Seen from the dial side, x is mirrored (BOT.u = -x) and 12 o'clock stays up.
    const svg = line(ticks, "lo") + sub + text(0, -5.2, "AUTOMATIC", 0.9, { tone: "mid" }) + `<path class="iso-line" data-tone="mid" d="${ring(12.75, 96)}"/>`;
    plane(dialPart, [0, 0, Z.dialLo - 0.01], BOT.u, BOT.v, svg, NZ);
  }
  const handsG = assembly("hands", NZ, 6, 0, dialG);
  const handHour = turn("hand.hour", handsG, [0, 0]);
  const handMin = turn("hand.minute", handsG, [0, 0]);
  const handSec = turn("hand.seconds", handsG, LY.fourth);
  {
    const leaf = (len, w, tail) => [[-w * 0.35, -tail], [w * 0.35, -tail], [w / 2, len * 0.25], [0.04, len], [-0.04, len], [-w / 2, len * 0.25]];
    // Stacked from the dial outwards: seconds and hour hands, then the minute hand.
    round("hand.cannon", handHour, [0, 0], Z.dialLo - 0.3, Z.dialLo, 0.7, { material: "steel", tone: "hi" });
    prismZ("hand.hour", handHour, leaf(7.4, 1.0, 1.0), Z.dialLo - 0.45, Z.dialLo - 0.3, { material: "gunmetal", tone: "hi" });
    round("hand.minute.hub", handMin, [0, 0], Z.dialLo - 0.75, Z.dialLo - 0.45, 0.55, { material: "steel", tone: "hi" });
    prismZ("hand.minute", handMin, leaf(11.4, 0.8, 1.4), Z.dialLo - 0.9, Z.dialLo - 0.75, { material: "gunmetal", tone: "hi" });
    const [sx, sy] = LY.fourth;
    round("hand.seconds.hub", handSec, LY.fourth, Z.dialLo - 0.2, Z.dialLo, 0.35, { material: "signal", tone: "hi" });
    prismZ("hand.seconds", handSec, [[sx - 0.08, sy - 0.8], [sx + 0.08, sy - 0.8], [sx + 0.05, sy + 2.9], [sx - 0.05, sy + 2.9]], Z.dialLo - 0.3, Z.dialLo - 0.2, { material: "signal", tone: "hi" });
    anchors.dial = [0, 0, Z.dialLo];
    anchors.seconds = [LY.fourth[0], LY.fourth[1], Z.dialLo];
  }

  // ---- Main plate -------------------------------------------------------------------------
  const plate = prismZ("plate", core, disc(12.8, 72), Z.plateLo, Z.plateHi, { material: "steel", tone: "hi", bevel: 0.15 });
  {
    let perlage = "";
    for (let r = 2; r < 12.4; r += 1.3) {
      const n = Math.round((TAU * r) / 1.5);
      for (let j = 0; j < n; j++) {
        const [x, y] = pol(r, (TAU * j) / n + r);
        perlage += `<circle cx="${x.toFixed(2)}" cy="${(-y).toFixed(2)}" r=".55" style="fill:none;stroke:#b9b7b0;stroke-width:.06"/>`;
      }
    }
    topPlane(plate, [0, 0], Z.plateHi, perlage);
  }
  anchors.plate = [0, 0, 0];

  // ---- Barrel (mainspring) --------------------------------------------------------------
  const barrelA = assembly("barrel.lift", AX.z, 9, 0.2);
  const barrelG = turn("barrel", barrelA, LY.barrel);
  const drum = wheel("barrel.drum", barrelG, LY.barrel, W.r.barrel, W.teeth.barrel, W.z ? W.z.barrel : Z.barrel, { spokes: 0 });
  {
    // The coiled mainspring seen on the drum's lid.
    let d = "";
    const [x0, y0] = [0, 0];
    for (let k = 0; k <= 9 * 48; k++) {
      const a = (k / 48) * TAU;
      const r = 0.9 + (W.r.barrel - 1.4 - 0.9) * (k / (9 * 48));
      const [x, y] = pol(r, a);
      d += `${k ? "L" : "M"}${(x0 + x).toFixed(3)} ${(y0 - y).toFixed(3)}`;
    }
    topPlane(drum, LY.barrel, Z.barrel[1] + 0.005, line(d, "mid"));
  }
  round("barrel.arbor", barrelG, LY.barrel, Z.plateHi + 0.05, Z.barrel[0], 1.0, { material: "steel", tone: "hi" });
  anchors.barrel = [LY.barrel[0], LY.barrel[1], Z.barrel[1]];

  // ---- Going train ---------------------------------------------------------------------
  const trainA = assembly("train.lift", AX.z, 6, 0.26);
  const centerG = turn("wheel.center", trainA, LY.center);
  wheel("wheel.center", centerG, LY.center, W.r.center, W.teeth.center, Z.wheel);
  pinion("pinion.center", centerG, LY.center, W.r.centerPinion, W.teeth.centerPinion, [Z.wheel[1], Z.barrel[1] - 0.2]);
  round("arbor.center", centerG, LY.center, Z.plateHi + 0.05, Z.wheel[0], 0.3, { material: "steel", tone: "hi" });
  const thirdG = turn("wheel.third", trainA, LY.third);
  wheel("wheel.third", thirdG, LY.third, W.r.third, W.teeth.third, [Z.wheel[0] + 0.45, Z.wheel[1] + 0.45]);
  pinion("pinion.third", thirdG, LY.third, W.r.thirdPinion, W.teeth.thirdPinion, [Z.wheel[0] - 0.15, Z.wheel[1] + 0.15]);
  const fourthG = turn("wheel.fourth", trainA, LY.fourth);
  wheel("wheel.fourth", fourthG, LY.fourth, W.r.fourth, W.teeth.fourth, Z.fourth);
  round("arbor.fourth", fourthG, LY.fourth, Z.fourth[1], Z.wheel[1] + 0.03, 0.2, { material: "steel", tone: "hi" });
  pinion("pinion.fourth", fourthG, LY.fourth, W.r.fourthPinion, W.teeth.fourthPinion, [Z.wheel[1] + 0.03, Z.wheel[1] + 0.62]);
  anchors.train = [(LY.center[0] + LY.fourth[0]) / 2, (LY.center[1] + LY.fourth[1]) / 2, Z.wheel[1]];
  anchors.center = [LY.center[0], LY.center[1], Z.wheel[1]];
  anchors.third = [LY.third[0], LY.third[1], Z.wheel[1]];
  anchors.fourth = [LY.fourth[0], LY.fourth[1], Z.wheel[1]];

  // ---- Escapement ------------------------------------------------------------------------
  const escA = assembly("escape.lift", AX.z, 9, 0.2);
  const escG = turn("wheel.escape", escA, LY.escape);
  {
    const P = LY.escape;
    const r = W.r.escape;
    const e = round("wheel.escape", escG, P, Z.escape[0], Z.escape[1], r - 0.35, { material: "steel", tone: "hi" });
    topPlane(e, P, Z.escape[1], `<path class="iso-line" data-tone="mid" d="${ring(r * 0.35, 32)}"/>`);
    // Club teeth: one small convex prism per tooth on the rim.
    for (let i = 0; i < W.teeth.escape; i++) {
      const a = (TAU * i) / W.teeth.escape;
      const t = [pol(r - 0.34, a - 0.09), pol(r - 0.34, a + 0.1), pol(r, a + 0.05), pol(r, a - 0.02)].map(([x, y]) => [x + P[0], y + P[1]]);
      prismZ(`escape.tooth.${i}`, escG, t, Z.escape[0], Z.escape[1], { material: "steel", tone: "hi" });
    }
    pinion("pinion.escape", escG, P, W.r.escapePinion, W.teeth.escapePinion, [Z.fourth[0], Z.escape[0] - 0.03]);
    anchors.escape = [P[0], P[1], Z.escape[1]];
  }
  const forkA = assembly("fork.lift", AX.z, 10.5, 0.17);
  const forkG = turn("fork", forkA, LY.fork);
  {
    const P = LY.fork;
    const toEsc = Math.atan2(LY.escape[1] - P[1], LY.escape[0] - P[0]);
    const toBal = Math.atan2(LY.balance[1] - P[1], LY.balance[0] - P[0]);
    const at = (r, a) => [P[0] + r * Math.cos(a), P[1] + r * Math.sin(a)];
    const bar = (name, A, B, w, z) => {
      const dx = B[0] - A[0], dy = B[1] - A[1];
      const n = Math.hypot(dx, dy);
      const ox = (-dy / n) * (w / 2), oy = (dx / n) * (w / 2);
      return prismZ(name, forkG, [[A[0] - ox, A[1] - oy], [B[0] - ox, B[1] - oy], [B[0] + ox, B[1] + oy], [A[0] + ox, A[1] + oy]].reverse(), z[0], z[1], { material: "steel", tone: "hi" });
    };
    // Lever body towards the balance; pallet arms spanning the escape wheel.
    bar("fork.body", at(0.56, toBal), at(W.forkLen - 0.35, toBal), 0.38, Z.fork);
    const span = deg(36);
    const pA = at(W.forkDist * 0.95, toEsc + span), pB = at(W.forkDist * 0.95, toEsc - span);
    bar("fork.arm.entry", at(0.56, toEsc + 0.25), pA, 0.32, Z.fork);
    bar("fork.arm.exit", at(0.56, toEsc - 0.25), pB, 0.32, Z.fork);
    round("fork.hub", forkG, P, Z.fork[0], Z.fork[1], 0.55, { material: "steel", tone: "hi" });
    round("fork.arbor", forkG, P, Z.plateHi + 0.05, Z.fork[0], 0.18, { material: "steel", tone: "hi" });
    // Ruby pallet stones.
    for (const [nm, Q, a] of [["entry", pA, toEsc + span], ["exit", pB, toEsc - span]]) {
      const c = [Q[0], Q[1]];
      const d = [Math.cos(a + Math.PI), Math.sin(a + Math.PI)];
      const s = [-d[1], d[0]];
      const pts = [[-0.12, -0.05], [0.12, -0.05], [0.12, 0.55], [-0.12, 0.45]].map(([u, v]) => [c[0] + s[0] * u + d[0] * v, c[1] + s[1] * u + d[1] * v]);
      prismZ(`fork.pallet.${nm}`, forkG, hull(pts), Z.fork[1], Z.fork[1] + 0.12, { material: "signal", tone: "hi" });
    }
    // Horns at the fork end embrace the impulse pin.
    const end = at(W.forkLen, toBal);
    const s = [-Math.sin(toBal), Math.cos(toBal)];
    for (const k of [-1, 1]) {
      const c = [end[0] + s[0] * k * 0.4, end[1] + s[1] * k * 0.4];
      prismZ(`fork.horn.${k > 0 ? "a" : "b"}`, forkG, disc(0.13, 10, c[0], c[1]), Z.forkHorn[0], Z.fork[0], { material: "steel", tone: "hi" });
    }
    anchors.fork = [P[0], P[1], Z.fork[1]];
  }
  const balA = assembly("balance.lift", AX.z, 12.5, 0.12);
  const balG = turn("balance", balA, LY.balance);
  {
    const P = LY.balance;
    const r = W.r.balance;
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a0 = (TAU * i) / n, a1 = (TAU * (i + 1)) / n;
      prismZ(`balance.rim.${i}`, balG, sector(r - 0.42, r, a0, a1, 3).map(([x, y]) => [x + P[0], y + P[1]]), Z.balRim[0], Z.balRim[1], { material: "gold", tone: "hi", crease: "faint" });
    }
    for (let i = 0; i < 3; i++) {
      const a = (TAU * i) / 3 + 0.3;
      const A = pol(0.3, a), B = pol((r - 0.42) * Math.cos(Math.PI / n) - 0.02, a);
      const s = [-Math.sin(a) * 0.17, Math.cos(a) * 0.17];
      prismZ(`balance.arm.${i}`, balG, [[A[0] - s[0], A[1] - s[1]], [B[0] - s[0], B[1] - s[1]], [B[0] + s[0], B[1] + s[1]], [A[0] + s[0], A[1] + s[1]]].map(([x, y]) => [x + P[0], y + P[1]]), Z.balArm[0], Z.balArm[1], { material: "gold", tone: "hi" });
    }
    round("balance.staff", balG, P, Z.staff[0], Z.staff[1], 0.22, { material: "steel", tone: "hi" });
    round("balance.staff.upper", balG, P, Z.roller[1], Z.balArm[0], 0.22, { material: "steel", tone: "hi" });
    round("balance.collet", balG, P, Z.balArm[1], Z.spring[0], 0.32, { material: "steel", tone: "hi" });
    round("balance.roller", balG, P, Z.roller[0], Z.roller[1], W.r.roller, { material: "steel", tone: "hi" });
    // Impulse jewel on the roller, pointing at the fork at rest.
    const toFork = Math.atan2(LY.fork[1] - P[1], LY.fork[0] - P[0]);
    const ip = [P[0] + (W.r.roller - 0.12) * Math.cos(toFork), P[1] + (W.r.roller - 0.12) * Math.sin(toFork)];
    prismZ("balance.impulse", balG, disc(0.1, 8, ip[0], ip[1]), Z.forkHorn[0], Z.roller[0], { material: "signal", tone: "hi" });
    // Timing screws on the rim.
    for (let i = 0; i < 6; i++) {
      const a = (TAU * i) / 6 + 0.26;
      const [x, y] = pol(r - 0.21, a);
      round(`balance.screw.${i}`, balG, [x + P[0], y + P[1]], Z.balRim[1], Z.balRim[1] + 0.1, 0.16, { material: "gold", tone: "mid" });
    }
    anchors.balance = [P[0], P[1], Z.balRim[1]];
  }
  // Hairspring: a flat spiral under the cock, drawn on a thin carrier disc that does not turn.
  const springA = assembly("spring.lift", AX.z, 14, 0.1);
  {
    const P = LY.balance;
    const carrier = round("hairspring", springA, P, Z.spring[0], Z.spring[1], W.r.balance - 0.9, { material: "glass", tone: "faint", crease: "faint" });
    let d = "";
    const turns = 11;
    for (let k = 0; k <= turns * 60; k++) {
      const a = (k / 60) * TAU;
      const rr = 0.45 + (W.r.balance - 1.15 - 0.45) * (k / (turns * 60));
      const [x, y] = pol(rr, a);
      d += `${k ? "L" : "M"}${x.toFixed(3)} ${(-y).toFixed(3)}`;
    }
    topPlane(carrier, P, Z.spring[1], `<path d="${d}" style="fill:none;stroke:#3b5b8c;stroke-width:.07"/>`);
    anchors.hairspring = [P[0], P[1], Z.spring[1]];
  }

  // ---- Bridges ------------------------------------------------------------------------------
  const barrelBridgeA = assembly("bridge.barrel", AX.z, 17, 0.05);
  {
    const B = LY.barrel;
    const poly = blob([B, [B[0] - 2.5, B[1] + 3.2], [B[0] + 3.4, B[1] + 2.0]], 3.0, 16).filter(([x, y]) => Math.hypot(x, y) < 12.6);
    const bpoly = hull(poly);
    const p = prismZ("bridge.barrel", barrelBridgeA, bpoly, Z.bridgeLo, Z.bridgeHi, { material: "steel", tone: "hi", bevel: 0.12 });
    topPlane(p, [0, 0], Z.bridgeHi, line(stripes(bpoly), "faint"));
    const ratchet = round("ratchet", barrelBridgeA, B, Z.bridgeHi, Z.bridgeHi + 0.2, W.r.barrel - 1.2, { material: "steel", tone: "hi", details: { ribs: { s0: Z.bridgeHi, s1: Z.bridgeHi + 0.2, count: 60, tone: "lo" } } });
    topPlane(ratchet, B, Z.bridgeHi + 0.2, line(ring(1.4, 40), "mid") + line(`M-1 0H1M0 -1V1`, "lo"));
    screw("screw.ratchet", barrelBridgeA, B, Z.bridgeHi + 0.2, 0.7);
    // Bridge screws sit outside the ratchet wheel.
    for (const [i, d] of [[-2.5, 3.2], [3.4, 2.0]].entries()) {
      const n = Math.hypot(d[0], d[1]);
      const q = [B[0] + (d[0] / n) * 4.75, B[1] + (d[1] / n) * 4.75];
      if (Math.hypot(q[0], q[1]) < 12) screw(`screw.bb.${i}`, barrelBridgeA, q, Z.bridgeHi);
    }
    anchors.ratchet = [B[0], B[1], Z.bridgeHi + 0.2];
  }
  const trainBridgeA = assembly("bridge.train", AX.z, 16, 0.06);
  {
    const pts = [LY.center, LY.third, LY.fourth, LY.escape];
    const tpoly = blob(pts, 1.3, 14);
    const p = prismZ("bridge.train", trainBridgeA, tpoly, Z.bridgeLo, Z.bridgeHi, { material: "steel", tone: "hi", bevel: 0.12 });
    topPlane(p, [0, 0], Z.bridgeHi, line(stripes(tpoly), "faint"));
    for (const [nm, P] of [["third", LY.third], ["fourth", LY.fourth], ["escape", LY.escape]]) jewel(`jewel.${nm}`, trainBridgeA, P, Z.bridgeHi);
    const mid = [(LY.third[0] + LY.fourth[0]) / 2 + 1.2, (LY.third[1] + LY.fourth[1]) / 2];
    screw("screw.train", trainBridgeA, mid, Z.bridgeHi);
  }
  const palletBridgeA = assembly("bridge.pallet", AX.z, 15, 0.07);
  {
    // Put the screw lobe on whichever side of the fork is farthest from the escape wheel and balance.
    const base = Math.atan2(LY.fork[1] - LY.balance[1], LY.fork[0] - LY.balance[0]);
    const lobe = [base + Math.PI / 2, base - Math.PI / 2]
      .map((a) => [LY.fork[0] + 1.1 * Math.cos(a), LY.fork[1] + 1.1 * Math.sin(a)])
      .sort((p, q) => Math.min(Math.hypot(q[0] - LY.escape[0], q[1] - LY.escape[1]), Math.hypot(q[0] - LY.balance[0], q[1] - LY.balance[1])) - Math.min(Math.hypot(p[0] - LY.escape[0], p[1] - LY.escape[1]), Math.hypot(p[0] - LY.balance[0], p[1] - LY.balance[1])))[0];
    prismZ("bridge.pallet", palletBridgeA, blob([LY.fork, lobe], 0.62, 12), Z.bridgeLo, Z.bridgeHi - 0.1, { material: "steel", tone: "hi", bevel: 0.1 });
    jewel("jewel.fork", palletBridgeA, LY.fork, Z.bridgeHi - 0.1, 0.3);
    screw("screw.pallet", palletBridgeA, lobe, Z.bridgeHi - 0.1, 0.36);
  }
  const cockA = assembly("cock", AX.z, 19, 0.04);
  {
    const P = LY.balance;
    const out = Math.atan2(P[1], P[0]);
    const foot = [P[0] + 3.8 * Math.cos(out + 0.55), P[1] + 3.8 * Math.sin(out + 0.55)];
    const poly = hull([...disc(1.3, 16, P[0], P[1]), ...disc(2.0, 16, foot[0], foot[1])]).filter(([x, y]) => Math.hypot(x, y) < 12.7);
    const cpoly = hull(poly);
    const c = prismZ("cock", cockA, cpoly, Z.cockLo, Z.cockHi, { material: "steel", tone: "hi", bevel: 0.12 });
    topPlane(c, [0, 0], Z.cockHi, line(stripes(cpoly), "faint"));
    jewel("jewel.balance", cockA, P, Z.cockHi, 0.55);
    screw("screw.cock", cockA, foot, Z.cockHi, 0.55);
    // Regulator index arm over the cock.
    const R = [P[0] + 2.6 * Math.cos(out + 2.6), P[1] + 2.6 * Math.sin(out + 2.6)];
    const s = [-Math.sin(out + 2.6) * 0.12, Math.cos(out + 2.6) * 0.12];
    const Q = [P[0] + 0.7 * Math.cos(out + 2.6), P[1] + 0.7 * Math.sin(out + 2.6)];
    prismZ("cock.regulator", cockA, [[Q[0] - s[0], Q[1] - s[1]], [R[0] - s[0], R[1] - s[1]], [R[0] + s[0], R[1] + s[1]], [Q[0] + s[0], Q[1] + s[1]]], Z.cockHi, Z.cockHi + 0.08, { material: "steel", tone: "mid" });
    anchors.cock = [P[0], P[1], Z.cockHi];
  }

  // ---- Rotor (automatic winding) ------------------------------------------------------------
  const rotorA = assembly("rotor.lift", AX.z, 24, 0.02);
  const rotorG = turn("rotor", rotorA, LY.rotor);
  {
    const half = [];
    for (let j = 0; j <= 24; j++) half.push(pol(12.2, Math.PI + (Math.PI * j) / 24));
    half.push([0, 0.0001]);
    const rpoly = hull([...half, [-1.2, 1.2], [1.2, 1.2]]);
    const r = prismZ("rotor", rotorG, rpoly, Z.rotorLo, Z.rotorHi, { material: "steel", tone: "hi", bevel: 0.15 });
    const inner = hull([...Array.from({ length: 25 }, (_, j) => pol(10.1, Math.PI + (Math.PI * j) / 24)), [-1.2, 1.0], [1.2, 1.0]]);
    topPlane(r, [0, 0], Z.rotorHi, line(stripes(inner, 0.8, 0), "faint") + text(0, 6.6, "25 JEWELS · 28800 A/h", 0.8, { tone: "mid" }));
    // The heavy rim of the rotor.
    for (let i = 0; i < 6; i++) {
      const a0 = Math.PI + (Math.PI * i) / 6, a1 = Math.PI + (Math.PI * (i + 1)) / 6;
      prismZ(`rotor.weight.${i}`, rotorG, sector(10.3, 12.2, a0, a1, 3), Z.rotorHi, Z.rotorHi + 0.45, { material: "gold", tone: "hi", crease: "faint" });
    }
    round("rotor.bearing", rotorG, [0, 0], Z.rotorHi, Z.rotorHi + 0.35, 1.6, { material: "steel", tone: "hi", details: { seams: [Z.rotorHi + 0.18] } });
    screw("rotor.screw", rotorG, [0, 0], Z.rotorHi + 0.35, 0.6);
    anchors.rotor = [0, -6, Z.rotorHi + 0.4];
  }
  round("rotor.post", rotorA, [0, 0], Z.bridgeHi + 0.05, Z.rotorLo, 0.9, { material: "steel", tone: "hi" });

  // ---- Caseback with sapphire window ----------------------------------------------------------
  const backA = assembly("caseback", AX.z, 30, 0);
  {
    for (let i = 0; i < 18; i++) {
      const a0 = (TAU * i) / 18, a1 = (TAU * (i + 1)) / 18;
      prismZ(`caseback.ring.${i}`, backA, sector(12.0, caseOut, a0, a1, 3), Z.caseHi, Z.backHi, { material: "steel", tone: "hi", crease: "faint" });
    }
  }

  anchors.body = [0, 0, 1.2];
  anchors.movement = [0, 0, Z.bridgeHi];

  // Poses the build must prove: the train at several angles, the rotor round, the balance swinging.
  for (let i = 0; i <= 8; i++) {
    const a = i * 45;
    features.push({ rotor: a, balance: -270 + i * 67.5, fork: (i % 2 ? 1 : -1) * W.forkAngle, "wheel.escape": a / 3, "wheel.fourth": a / 7, "wheel.third": -a / 11, "wheel.center": a / 13, barrel: -a / 17, "hand.seconds": a, "hand.minute": a / 3, "hand.hour": a / 9 });
  }
  return { parts, groups, explode, root, anchors, features, counts: { jewels: 25 } };
}
export function explodeValues(explode, apart, { stretch = 0.55 } = {}) {
  const out = {};
  for (const { name, travel, delay } of explode) {
    const t = Math.max(0, Math.min(1, (apart - delay * stretch) / (1 - stretch)));
    out[name] = travel * t * t * (3 - 2 * t);
  }
  return out;
}
