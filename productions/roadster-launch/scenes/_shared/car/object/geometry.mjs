// A neutral two-seat electric sports car in the "Rocket" configuration described at the
// 15 Oct 2026 Roadster event: rear suction fans, cold-gas tanks (200 L behind the seat,
// 400 L in place of the passenger seat), 4 rear + 4 down + 2 side nozzles, two rear motors.
// Millimetres. x = right, y = front, z = up. Width ~2 m (reported); length, height and the
// body shape are our own estimates, drawn without any maker's badge.
import * as G from "../kit/lathe.mjs";
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
const NX = [-1, 0, 0];
const NY = [0, -1, 0];
const NZ = [0, 0, -1];
const FONT = "Helvetica, Arial, sans-serif";
const deg = (a) => (a * Math.PI) / 180;
const line = (d, tone = "lo") => `<path class="iso-line" data-tone="${tone}" d="${d}"/>`;
const ring = (r, steps = 48, cx = 0, cy = 0) =>
  Array.from({ length: steps }, (_, j) => `${j ? "L" : "M"}${(cx + r * Math.cos((TAU * j) / steps)).toFixed(2)} ${(cy + r * Math.sin((TAU * j) / steps)).toFixed(2)}`).join("") + "Z";
// Annulus sector around (cy, cz) in a (y, z) plane: inner chord, outer arc (CCW).
const sector = ([cy, cz], ri, ro, a0, a1, steps = 3) => {
  const P = (r, a) => [cy + r * Math.cos(a), cz + r * Math.sin(a)];
  const out = [P(ri, a0)];
  for (let j = 0; j <= steps; j++) out.push(P(ro, a0 + ((a1 - a0) * j) / steps));
  out.push(P(ri, a1));
  return out;
};
// A slab of thickness t along a 2D segment A→B, offset to the left of A→B (CCW quad).
const slab = (A, B, t) => {
  const d = [B[0] - A[0], B[1] - A[1]];
  const n = Math.hypot(d[0], d[1]);
  const L = [(-d[1] / n) * t, (d[0] / n) * t];
  return [A, B, [B[0] + L[0], B[1] + L[1]], [A[0] + L[0], A[1] + L[1]]];
};
const rrect = (x0, y0, x1, y1, r, steps = 4) => {
  const out = [];
  const c = (cx, cy, a0) => { for (let j = 0; j <= steps; j++) { const a = a0 + (j / steps) * (Math.PI / 2); out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  c(x1 - r, y0 + r, -Math.PI / 2); c(x1 - r, y1 - r, 0); c(x0 + r, y1 - r, Math.PI / 2); c(x0 + r, y0 + r, Math.PI);
  return out;
};

export const CAR = {
  L2: 2140, wheelbase: 2825, track: 1700, zWheel: 360, rTire: 355, tireW: 300,
  archIn: 395, archOut: 440, xIn: 690, xOut: 1000,
};

export function buildObject(T, { layer }) {
  const parts = {};
  const groups = {};
  const explode = [];
  const anchors = {};
  const features = [];
  const L = layer;
  const root = T.group("root", { free: { origin: [0, 0, 560] } });
  groups.root = root;
  const assembly = (name, dir, travel, delay = 0, parent = root) => {
    const g = T.group(name, { parent, slide: { direction: unit(dir), travel } });
    groups[name] = g;
    explode.push({ name, travel, delay });
    return g;
  };
  const hinge = (name, parent, point, axis, range = [-36000, 36000]) => {
    const g = T.group(name, { parent, hinge: { point, axis, range } });
    groups[name] = g;
    return g;
  };
  const part = (p) => (parts[p.name] = p);
  const prism = (axis, u) => (name, group, poly, s0, s1, o = {}) =>
    part(T.prism({ name, group, layer: L, F: frame([0, 0, 0], axis, u), polygon: poly, s0, s1, steps: 5, tone: o.tone ?? "hi", crease: o.crease ?? "lo", bevel: o.bevel ?? 0, material: o.material, lit: o.lit, details: o.details }));
  const prismX = prism(AX.x, AX.y); // polygon in (y, z), extruded along x
  const prismY = prism(AX.y, AX.z); // polygon in (z, x), extruded along y
  const prismZ = prism(AX.z, AX.x); // polygon in (x, y), extruded along z
  const roundAlong = (name, group, axis, o, s0, s1, r, opt = {}) =>
    part(T.round({ name, group, layer: L, F: frame(o, axis, Math.abs(axis[2]) > 0.9 ? AX.x : AX.z), s0, s1, r, tone: opt.tone ?? "hi", crease: opt.crease ?? "lo", material: opt.material, lit: opt.lit, details: opt.details }));
  const plane = (p, o, u, v, svg, normal, fade = [0.04, 0.3]) => T.plane({ part: p, o, u, v, svg, normal, fade });
  const C = CAR;
  const yF = C.wheelbase / 2, yR = -C.wheelbase / 2, zW = C.zWheel;
  const sides = [1, -1];
  const sideName = (s) => (s > 0 ? "R" : "L");
  const PAINT = "porcelain";

  // ---- Floor and battery (core) ------------------------------------------------------------
  const core = assembly("core", AX.z, 0, 0);
  const floor = prismZ("floor.tray", core, rrect(-680, -1250, 680, 1250, 60), 110, 260, { material: "gunmetal", tone: "hi" });
  void floor;
  const battG = assembly("battery.lid", AX.z, 0, 0);
  const lid = prismZ("battery.lid", battG, rrect(-660, -1230, 660, 1230, 50), 260, 275, { material: "steel", tone: "hi" });
  {
    // 4680 cells (46 mm across) seen through a cut-away corner of the titanium lid.
    let cells = "";
    for (let y = -1150; y <= 1150; y += 48) for (let x = -600; x <= 600; x += 48) {
      const xx = x + (Math.round((y + 1150) / 48) % 2 ? 24 : 0);
      if (xx > 600) continue;
      cells += `<circle cx="${xx}" cy="${-y}" r="20" style="fill:none;stroke:#8c8f96;stroke-width:2.2"/>`;
    }
    plane(lid, [0, 0, 275.5], [1, 0, 0], [0, -1, 0], cells + line("M-600 0H600M0 -1150V1150", "mid"), AX.z);
  }
  anchors.battery = [0, 0, 275];

  // ---- Wheels -----------------------------------------------------------------------------------
  for (const [ax, ay] of [["F", yF], ["R", yR]]) {
    for (const s of sides) {
      const name = `wheel.${ax}${sideName(s)}`;
      const W = assembly(`${name}.off`, [s, 0, 0], 900, 0.18);
      const g = hinge(name, W, [0, ay, zW], AX.x);
      const xIn = s * (C.xOut - C.tireW), xOut = s * C.xOut;
      const lo = Math.min(xIn, xOut), hi = Math.max(xIn, xOut);
      const tire = roundAlong(`${name}.tire`, g, AX.x, [0, ay, zW], lo, hi, C.rTire, { material: "rubber", tone: "hi", details: { ribs: { s0: lo + 20, s1: hi - 20, count: 90, tone: "lo" } } });
      // Rim face: spokes and the brake disc behind them.
      const face = s > 0 ? hi : lo;
      let spokes = `<circle r="${C.rTire - 95}" style="fill:#c9ccd2"/><circle r="${C.rTire - 120}" style="fill:#5d6068"/>`;
      for (let i = 0; i < 10; i++) {
        const a = (TAU * i) / 10;
        spokes += `<path d="M${(40 * Math.cos(a - 0.12)).toFixed(1)} ${(40 * Math.sin(a - 0.12)).toFixed(1)}L${(232 * Math.cos(a - 0.05)).toFixed(1)} ${(232 * Math.sin(a - 0.05)).toFixed(1)}L${(232 * Math.cos(a + 0.05)).toFixed(1)} ${(232 * Math.sin(a + 0.05)).toFixed(1)}L${(40 * Math.cos(a + 0.12)).toFixed(1)} ${(40 * Math.sin(a + 0.12)).toFixed(1)}Z" style="fill:#d9dbe0;stroke:#4d4f55;stroke-width:2"/>`;
      }
      spokes += `<circle r="44" style="fill:#d9dbe0;stroke:#4d4f55;stroke-width:2"/>` + `<path class="iso-line" data-tone="mid" d="${ring(C.rTire - 95, 72)}"/>`;
      plane(tire, [face + s * 0.5, ay, zW], [0, -s, 0], [0, 0, -1], spokes, [s, 0, 0]);
      anchors[name] = [face, ay, zW];
    }
  }
  // Brake calipers stay with the upright (not the turning wheel), just inside each rim.
  for (const [ax, ay] of [["F", yF], ["R", yR]]) {
    for (const s of sides) {
      const g = assembly(`caliper.${ax}${sideName(s)}`, [s, 0, 0], 700, 0.2);
      const x0 = s * (C.xOut - C.tireW - 40), x1 = s * (C.xOut - C.tireW - 4);
      prismX(`caliper.${ax}${sideName(s)}`, g, sector([ay, zW], 120, 230, deg(20), deg(70), 3), Math.min(x0, x1), Math.max(x0, x1), { material: "signal", tone: "hi" });
    }
  }

  // ---- Wheel arches (outer band x 690…1000) ------------------------------------------------------
  for (const [ax, ay] of [["F", yF], ["R", yR]]) {
    for (const s of sides) {
      const g = assembly(`arch.${ax}${sideName(s)}`, [s * 0.5, 0, 1], 520, 0.08);
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a0 = (Math.PI * i) / n, a1 = (Math.PI * (i + 1)) / n;
        prismX(`arch.${ax}${sideName(s)}.${i}`, g, sector([ay, zW], C.archIn, C.archOut, a0, a1, 3), Math.min(s * C.xIn, s * C.xOut), Math.max(s * C.xIn, s * C.xOut), { material: PAINT, tone: "hi", crease: "faint" });
      }
    }
  }
  // Front and rear corners, ahead of / behind the wheels.
  for (const s of sides) {
    const xr = [Math.min(s * C.xIn, s * C.xOut), Math.max(s * C.xIn, s * C.xOut)];
    const gF = assembly(`corner.F${sideName(s)}`, [s * 0.6, 1, 0.2], 620, 0.06);
    const y0 = yF + C.archOut;
    const fc = prismX(`corner.F${sideName(s)}`, gF, [[y0, 160], [2090, 180], [C.L2, 420], [2085, 520], [y0, 600]], xr[0], xr[1], { material: PAINT, tone: "hi" });
    void fc;
    const gR = assembly(`corner.R${sideName(s)}`, [s * 0.6, -1, 0.2], 620, 0.06);
    const y1 = yR - C.archOut;
    prismX(`corner.R${sideName(s)}`, gR, [[-2090, 180], [y1, 160], [y1, 660], [-2090, 620], [-C.L2, 420]], xr[0], xr[1], { material: PAINT, tone: "hi" });
  }
  // Doors (outer skin) and the tub side behind them.
  for (const s of sides) {
    const yA = yF - C.archOut, yB = yR + C.archOut;
    const prof = [[yB, 150], [yA, 150], [yA, 700], [600, 780], [-500, 800], [yB, 760]];
    const tub = assembly(`tub.${sideName(s)}`, [s, 0, 0], 0, 0);
    prismX(`tub.${sideName(s)}`, tub, [[yB, 150], [yA, 150], [yA, 540], [yB, 560]], Math.min(s * C.xIn, s * 930), Math.max(s * C.xIn, s * 930), { material: "gunmetal", tone: "mid" });
    const door = assembly(`door.${sideName(s)}`, [s, 0, 0.15], 700, 0.04);
    const d = prismX(`door.${sideName(s)}`, door, prof, Math.min(s * 930, s * C.xOut), Math.max(s * 930, s * C.xOut), { material: PAINT, tone: "hi", bevel: 6 });
    // A shut line and a flush handle on the skin.
    plane(d, [s * (C.xOut + 0.5), 0, 450], [0, -s, 0], [0, 0, -1], line(`M${-s * 900} 120H${s * 900}`, "faint") + `<rect x="-90" y="-250" width="180" height="22" rx="11" style="fill:#c9c6bf;stroke:#55534f;stroke-width:2"/>`, [s, 0, 0]);
    const skirt = assembly(`skirt.${sideName(s)}`, NZ, 380, 0.3);
    prismX(`skirt.${sideName(s)}`, skirt, [[yB + 40, 70], [yA - 40, 70], [yA - 40, 148], [yB + 40, 148]], Math.min(s * 880, s * 990), Math.max(s * 880, s * 990), { material: "rubber", tone: "hi" });
    groups[`skirt.${sideName(s)}`] = skirt;
  }

  // ---- Front: bumper, frunk, hood ---------------------------------------------------------------
  const bumper = assembly("bumper", AX.y, 650, 0.04);
  const bp = prismX("bumper", bumper, [[1900, 160], [2090, 180], [C.L2, 420], [2095, 500], [1900, 540]], -C.xIn, C.xIn, { material: PAINT, tone: "hi" });
  plane(bp, [0, C.L2 - 18, 455], [1, 0, 0], [0, 0, -1], `<rect x="-640" y="-12" width="1280" height="24" rx="12" style="fill:#f4f2ec;stroke:#55534f;stroke-width:2.5"/>` + line("M-560 60H560", "faint"), AX.y);
  prismZ("frunk", core, rrect(-600, 1100, 600, 1880, 50), 300, 520, { material: "gunmetal", tone: "mid" });
  const hoodG = assembly("hood", [0, 0.35, 1], 820, 0.02);
  const hoodPoly = [[1000, 740], [2110, 522], [2110, 547], [1000, 765]];
  prismX("hood", hoodG, hoodPoly, -C.xIn, C.xIn, { material: PAINT, tone: "hi", bevel: 6 });
  anchors.nose = [0, C.L2, 420];

  // ---- Cockpit ----------------------------------------------------------------------------------
  const W0 = [995, 768], W1 = [275, 1128];
  const ws = assembly("windshield", [0, 0.4, 1], 760, 0.01);
  prismX("windshield", ws, slab(W1, W0, 16).reverse(), -640, 640, { material: "glass", tone: "hi", crease: "faint" });
  for (const s of sides) prismX(`pillar.${sideName(s)}`, ws, slab(W1, W0, 22).reverse(), Math.min(s * 640, s * 690), Math.max(s * 640, s * 690), { material: PAINT, tone: "hi" });
  const roofG = assembly("roof", AX.z, 950, 0);
  prismZ("roof", roofG, rrect(-600, -350, 600, 265, 40), 1128, 1150, { material: "rubber", tone: "hi" });
  const R0 = [-350, 1128], R1 = [-1100, 822];
  const rw = assembly("rearwindow", [0, -0.4, 1], 760, 0.01);
  prismX("rearwindow", rw, slab(R0, R1, 16).reverse(), -620, 620, { material: "glass", tone: "hi", crease: "faint" });
  for (const s of sides) {
    const g = assembly(`sideglass.${sideName(s)}`, [s, 0, 0.3], 560, 0.02);
    prismX(`sideglass.${sideName(s)}`, g, [[-980, 815], [930, 790], [250, 1112], [-345, 1112]], Math.min(s * 640, s * 660), Math.max(s * 640, s * 660), { material: "glass", tone: "hi", crease: "faint" });
  }
  const dashG = assembly("dash", [0, 0.2, 1], 600, 0.1);
  prismX("dash", dashG, [[600, 560], [980, 560], [980, 735], [600, 700]], -640, -10, { material: "rubber", tone: "hi" });
  const yoke = hinge("yoke", dashG, [-330, 520, 760], AX.y, [-90, 90]);
  roundAlong("yoke.column", dashG, NY, [-330, 600, 740], 0, 40, 26, { material: "steel" });
  prismY("yoke", yoke, [[700, -470], [700, -190], [820, -230], [820, -430]].map(([z, x]) => [z, x]), 480, 520, { material: "rubber", tone: "hi" });
  const seatG = assembly("seat", AX.z, 700, 0.12);
  prismZ("seat.base", seatG, rrect(-520, -400, -140, 100, 40), 276, 380, { material: "knit", tone: "hi" });
  prismX("seat.back", seatG, [[-420, 380], [-330, 380], [-470, 900], [-560, 900]], -520, -140, { material: "knit", tone: "hi" });
  anchors.cockpit = [-330, 0, 700];

  // ---- Cold-gas system ----------------------------------------------------------------------------
  // 400 L composite tank where the passenger seat would be (axis along y).
  const tankP = assembly("tank.passenger", AX.z, 1000, 0.1); // was 1250: rose through the roof and windshield
  {
    const o = [330, 0, 560];
    roundAlong("tank.passenger.body", tankP, AX.y, o, -300, 640, 270, { material: "gunmetal", tone: "hi", details: { seams: [-150, 0, 150, 300, 450], rules: [] } });
    roundAlong("tank.passenger.domeF", tankP, AX.y, o, 640, 760, [270, 150], { material: "gunmetal", tone: "hi" });
    roundAlong("tank.passenger.domeR", tankP, AX.y, o, -420, -300, [150, 270], { material: "gunmetal", tone: "hi" });
    roundAlong("tank.passenger.valve", tankP, AX.y, o, 760, 820, 60, { material: "brass", tone: "hi" });
    anchors.tankP = [330, 200, 830];
  }
  // 200 L tank behind the seat (axis along x).
  const tankR = assembly("tank.rear", AX.z, 900, 0.12); // was 1150: rose through the rear window
  {
    const o = [0, -800, 560];
    roundAlong("tank.rear.body", tankR, AX.x, o, -520, 520, 220, { material: "gunmetal", tone: "hi", details: { seams: [-300, -100, 100, 300] } });
    roundAlong("tank.rear.domeR", tankR, AX.x, o, 520, 620, [220, 120], { material: "gunmetal", tone: "hi" });
    roundAlong("tank.rear.domeL", tankR, AX.x, o, -620, -520, [120, 220], { material: "gunmetal", tone: "hi" });
    roundAlong("tank.rear.valve", tankR, AX.x, o, 620, 680, 55, { material: "brass", tone: "hi" });
    anchors.tankR = [0, -800, 780];
  }
  // Feed line (our illustration; the real plumbing is not public): from the 200 L tank's rear face
  // through a valve back to a manifold just ahead of the fascia, level with the four rear nozzles.
  const feed = assembly("feed", AX.z, 800, 0.12);
  roundAlong("feed.line.0", feed, NY, [0, -1022, 540], 0, 50, 26, { material: "steel", tone: "hi" });
  roundAlong("feed.valve", feed, NY, [0, -1072, 540], 0, 70, 52, { material: "brass", tone: "hi" });
  roundAlong("feed.line.1", feed, NY, [0, -1142, 540], 0, 730, 26, { material: "steel", tone: "hi" });
  roundAlong("feed.manifold", feed, AX.x, [0, -1902, 540], -380, 380, 30, { material: "steel", tone: "hi" });
  anchors.feed = [0, -1520, 560];
  // Rear nozzles behind the licence-plate area (exhaust along −y).
  const nozzR = assembly("nozzles.rear", NY, 1100, 0.02);
  for (const [i, x] of [-330, -110, 110, 330].entries()) {
    const o = [x, -C.L2, 540];
    roundAlong(`nozzle.rear.${i}.valve`, nozzR, NY, o, 2, 40, 48, { material: "steel", tone: "hi" });
    roundAlong(`nozzle.rear.${i}.bell`, nozzR, NY, o, 40, 150, [30, 78], { material: "chrome", tone: "hi", details: { seams: [60] } });
    anchors[`nozzle.rear.${i}`] = [x, -C.L2 - 150, 540];
  }
  anchors.nozzles = [0, -C.L2 - 150, 540];
  // Four downward nozzles near the corners (the "Rocket" lift system).
  const nozzD = assembly("nozzles.down", NZ, 520, 0.24);
  for (const [i, [x, y]] of [[560, 1700], [-560, 1700], [560, -1750], [-560, -1750]].entries()) {
    const o = [x, y, 298];
    roundAlong(`nozzle.down.${i}.valve`, nozzD, NZ, o, 0, 40, 46, { material: "steel", tone: "hi" });
    roundAlong(`nozzle.down.${i}.bell`, nozzD, NZ, o, 40, 140, [28, 70], { material: "chrome", tone: "hi" });
    anchors[`nozzle.down.${i}`] = [x, y, 158];
  }
  // Two sideways nozzles at the front corners for yaw.
  for (const s of sides) {
    const g = assembly(`nozzle.side.${sideName(s)}`, [s, 0, 0], 520, 0.06);
    const o = [s * C.xOut, 2000, 420];
    roundAlong(`nozzle.side.${sideName(s)}`, g, [s, 0, 0], o, 2, 80, [22, 52], { material: "chrome", tone: "hi" });
  }

  // ---- Rear: deck, fascia, fans, diffuser, motors -------------------------------------------------
  const deckG = assembly("deck", [0, -0.3, 1], 850, 0.02);
  prismX("deck", deckG, slab([-1105, 818], [-2130, 690], 25).map(([y, z]) => [y, z]).reverse(), -C.xIn, C.xIn, { material: PAINT, tone: "hi", bevel: 6 });
  const fasG = assembly("fascia", [0, -1, 0.25], 780, 0.04);
  const fas = prismX("fascia", fasG, [[-2130, 400], [-1950, 400], [-1950, 660], [-2130, 660]], -C.xIn, C.xIn, { material: PAINT, tone: "hi" });
  plane(fas, [0, -2130.5, 620], [-1, 0, 0], [0, 0, -1], `<rect x="-660" y="-10" width="1320" height="20" rx="10" style="fill:#d9563a;stroke:#6d2a1c;stroke-width:2"/>`, NY);
  prismZ("diffuser", core, rrect(-680, -2130, 680, -1600, 30), 110, 140, { material: "gunmetal", tone: "hi" });
  const fansG = assembly("fans", NY, 900, 0.1);
  for (const [i, x] of [-480, -160, 160, 480].entries()) {
    const g = hinge(`fan.${i}`, fansG, [x, -2080, 262], AX.y);
    const o = [x, -2080, 262];
    const house = roundAlong(`fan.${i}.shroud`, fansG, AX.y, o, -50, 50, 118, { material: "gunmetal", tone: "hi" });
    void house;
    const hub = roundAlong(`fan.${i}.hub`, g, NY, o, 50, 70, 40, { material: "steel", tone: "hi" });
    let blades = "";
    for (let k = 0; k < 9; k++) {
      const a = (TAU * k) / 9;
      blades += `<path d="M${(38 * Math.cos(a)).toFixed(1)} ${(38 * Math.sin(a)).toFixed(1)}Q${(80 * Math.cos(a + 0.5)).toFixed(1)} ${(80 * Math.sin(a + 0.5)).toFixed(1)} ${(108 * Math.cos(a + 0.35)).toFixed(1)} ${(108 * Math.sin(a + 0.35)).toFixed(1)}L${(108 * Math.cos(a + 0.6)).toFixed(1)} ${(108 * Math.sin(a + 0.6)).toFixed(1)}Q${(70 * Math.cos(a + 0.75)).toFixed(1)} ${(70 * Math.sin(a + 0.75)).toFixed(1)} ${(38 * Math.cos(a + 0.5)).toFixed(1)} ${(38 * Math.sin(a + 0.5)).toFixed(1)}Z" style="fill:#3b3d42;stroke:#1d1e21;stroke-width:1.5"/>`;
    }
    plane(house, [x, -2130.5, 262], [-1, 0, 0], [0, 0, -1], `<circle r="112" style="fill:#2a2b2f"/>`, NY);
    plane(hub, [x, -2150.5, 262], [-1, 0, 0], [0, 0, -1], blades + `<circle r="38" style="fill:#c9ccd2;stroke:#4d4f55;stroke-width:2"/>`, NY);
  }
  anchors.fans = [0, -2140, 262];
  for (const s of sides) {
    const g = assembly(`motor.${sideName(s)}`, NZ, 500, 0.3);
    const o = [0, yR, zW];
    const lo = (a, b) => [Math.min(s * a, s * b), Math.max(s * a, s * b)];
    const [m0, m1] = lo(140, 460);
    roundAlong(`motor.${sideName(s)}`, g, AX.x, o, m0, m1, 150, { material: "steel", tone: "hi", details: { seams: [s > 0 ? 200 : -200, s > 0 ? 400 : -400] } });
    const [r0, r1] = lo(460, 600);
    roundAlong(`gear.${sideName(s)}`, g, AX.x, o, r0, r1, 120, { material: "gunmetal", tone: "hi" });
  }
  anchors.motors = [0, yR, 510];

  anchors.body = [0, 0, 560];
  anchors.side = [1000, 0, 450];
  anchors.tail = [0, -C.L2, 500];
  for (let i = 0; i <= 6; i++) {
    const f = { yoke: (i - 3) * 20 };
    for (const n of ["wheel.FR", "wheel.FL", "wheel.RR", "wheel.RL"]) f[n] = i * 50;
    for (let k = 0; k < 4; k++) f[`fan.${k}`] = i * 60;
    features.push(f);
  }
  return { parts, groups, explode, root, anchors, features, counts: { nozzles: 10, tanks: 2 } };
}
export function explodeValues(explode, apart, { stretch = 0.55 } = {}) {
  const out = {};
  for (const { name, travel, delay } of explode) {
    const t = Math.max(0, Math.min(1, (apart - delay * stretch) / (1 - stretch)));
    out[name] = travel * t * t * (3 - 2 * t);
  }
  return out;
}
