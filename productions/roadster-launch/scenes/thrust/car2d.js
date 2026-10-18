// 2D helpers shared by the thrust (S09, S10) and gas (S11) figures: the anatomy car's side sprite
// (../_shared/car_side.png), its nozzles, gas jets and force arrows, drawn on the paper look.
// Everything is a pure function of the arguments (no state between frames).
window.CAR2D = (() => {
  // Sprite geometry, in sprite pixels (1178 × 309, nose at the LEFT). Positions match the anatomy
  // model (scenes/_shared/car/object/geometry.mjs): rear nozzles at z 540 mm, down nozzles at
  // y +1700 / −1750 mm. The centre of gravity is our assumption (示意): midway between the down
  // nozzles, at the height of the rear nozzle axis.
  const SP = {
    w: 1178, h: 309, len: 4.43,
    cg: [576, 164],
    rearExit: [1176, 164], rearValve: [1136, 164],
    downR: [1035, 266], downF: [117, 266],
    wheels: [[195, 212], [942, 212]], wheelR: 96, bottom: 307,
  };
  SP.pxm = SP.w / SP.len;                         // sprite px per metre
  SP.cgH = (SP.bottom - SP.cg[1]) / SP.pxm;       // CG height when standing on its wheels (m)

  // pose: {X, Y, phi, k, mirror, wheel}: CG on screen, rotation (canvas, clockwise +),
  // screen px per sprite px, mirror = nose to the right, wheel spin angle.
  const toScreen = (P, p) => {
    const lx = (p[0] - SP.cg[0]) * P.k * (P.mirror ? -1 : 1), ly = (p[1] - SP.cg[1]) * P.k;
    const c = Math.cos(P.phi), s = Math.sin(P.phi);
    return [P.X + lx * c - ly * s, P.Y + lx * s + ly * c];
  };
  const dirToScreen = (P, d) => {
    const lx = d[0] * (P.mirror ? -1 : 1), ly = d[1], c = Math.cos(P.phi), s = Math.sin(P.phi);
    return [lx * c - ly * s, lx * s + ly * c];
  };

  function drawCar(g, img, P, { alpha = 1, bells = true } = {}) {
    if (!img.complete || !img.naturalWidth) return;
    g.save(); g.globalAlpha = alpha;
    g.translate(P.X, P.Y); g.rotate(P.phi); g.scale(P.mirror ? -P.k : P.k, P.k);
    g.drawImage(img, -SP.cg[0], -SP.cg[1]);
    for (const [cx, cy] of SP.wheels) {
      if (!P.wheel) break;
      g.save(); g.beginPath(); g.arc(cx - SP.cg[0], cy - SP.cg[1], SP.wheelR, 0, Math.PI * 2); g.clip();
      g.translate(cx - SP.cg[0], cy - SP.cg[1]); g.rotate(P.wheel); g.drawImage(img, -cx, -cy); g.restore();
    }
    if (bells) for (const [x, y] of [SP.downF, SP.downR]) {   // the two visible down nozzles
      g.beginPath(); g.moveTo(x - 6 - SP.cg[0], y - 34 - SP.cg[1]); g.lineTo(x + 6 - SP.cg[0], y - 34 - SP.cg[1]);
      g.lineTo(x + 14 - SP.cg[0], y - SP.cg[1]); g.lineTo(x - 14 - SP.cg[0], y - SP.cg[1]); g.closePath();
      g.fillStyle = "#c3c6cc"; g.fill(); g.lineWidth = 2.2; g.strokeStyle = "#3c3a36"; g.stroke();
    }
    g.restore();
  }

  // Deterministic noise.
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  // A cold-gas jet from nozzle exit E along unit direction u (screen). o: {t, on, off, len, w0,
  // seed, U, groundY}. The core shows while the valve is open; particles already emitted keep
  // flying for `life` seconds after it closes. Returns the core visibility (0..1).
  function jet(g, E, u, o) {
    const life = 0.3, rate = 90, U = o.U || 1;
    if (o.t < o.on || o.t > o.off + life) return 0;
    const n = [-u[1], u[0]];
    const kOn = clamp((o.t - o.on) / 0.06) * (1 - clamp((o.t - o.off) / 0.06));
    const L = o.len, w0 = o.w0;
    const gy = o.groundY ?? Infinity;
    g.save();
    if (kOn > 0) {
      const grd = g.createLinearGradient(E[0], E[1], E[0] + u[0] * L, E[1] + u[1] * L);
      grd.addColorStop(0, `rgba(46,134,171,${0.7 * kOn})`); grd.addColorStop(0.3, `rgba(80,155,190,${0.45 * kOn})`);
      grd.addColorStop(1, "rgba(120,175,212,0)");
      g.fillStyle = grd; g.beginPath();
      const a = w0 / 2, b = w0 / 2 + L * 0.2;
      g.moveTo(E[0] + n[0] * a, E[1] + n[1] * a); g.lineTo(E[0] + u[0] * L + n[0] * b, E[1] + u[1] * L + n[1] * b);
      g.lineTo(E[0] + u[0] * L - n[0] * b, E[1] + u[1] * L - n[1] * b); g.lineTo(E[0] - n[0] * a, E[1] - n[1] * a);
      g.closePath(); g.save(); if (gy < Infinity) { g.clip(clipAbove(g, gy)); } g.fill(); g.restore();
      for (let j = 1; j <= 3; j++) {   // shock diamonds: a fast, under-expanded jet
        const d = j * 0.16 * L, x = E[0] + u[0] * d, y = E[1] + u[1] * d;
        if (y > gy) break;
        g.fillStyle = `rgba(255,255,255,${(0.75 - j * 0.18) * kOn})`;
        g.beginPath(); g.ellipse(x, y, w0 * 0.22, w0 * 0.12, Math.atan2(u[1], u[0]), 0, Math.PI * 2); g.fill();
      }
    }
    const k0 = Math.max(0, Math.ceil((o.t - life - o.on) * rate)), k1 = Math.floor((Math.min(o.t, o.off) - o.on) * rate);
    for (let k = k0; k <= k1; k++) {
      const age = o.t - (o.on + k / rate); if (age < 0 || age > life) continue;
      const r1 = hash(k + o.seed), r2 = hash(k * 1.37 + o.seed + 7.1), r3 = hash(k * 2.11 + o.seed + 3.3);
      const f = age / life;
      const d = L * (0.08 + 1.05 * f) * (0.75 + 0.5 * r1);
      let lat = (r2 - 0.5) * (w0 * 0.8 + d * 0.5);
      let x = E[0] + u[0] * d + n[0] * lat, y = E[1] + u[1] * d + n[1] * lat;
      if (y > gy) { const over = y - gy; y = gy - over * 0.25 - 2 * U; x += (r2 < 0.5 ? -1 : 1) * over * 1.6; }
      const rad = (3 + 13 * f) * (0.6 + 0.8 * r3) * U;
      g.fillStyle = r3 > 0.6 ? `rgba(255,255,255,${0.8 * (1 - f)})` : `rgba(46,134,171,${0.55 * (1 - f)})`;
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    return kOn;
  }
  function clipAbove(g, gy) { const p = new Path2D(); p.rect(-1e4, -1e4, 3e4, gy + 1e4); return p; }

  // Force arrow with a paper-coloured halo so it reads on top of the car.
  function arrow(g, x0, y0, x1, y1, color, width, alpha = 1, head = 26) {
    if (alpha <= 0 || Math.hypot(x1 - x0, y1 - y0) < 2) return;
    const a = Math.atan2(y1 - y0, x1 - x0), h = Math.min(head, Math.hypot(x1 - x0, y1 - y0) * 0.6);
    const path = () => {
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - Math.cos(a) * h * 0.7, y1 - Math.sin(a) * h * 0.7);
    };
    const tip = () => {
      g.beginPath(); g.moveTo(x1, y1);
      g.lineTo(x1 - Math.cos(a - 0.42) * h, y1 - Math.sin(a - 0.42) * h);
      g.lineTo(x1 - Math.cos(a + 0.42) * h, y1 - Math.sin(a + 0.42) * h); g.closePath();
    };
    g.save(); g.globalAlpha = alpha; g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = "rgba(244,241,234,.9)"; g.lineWidth = width + 6; path(); g.stroke(); tip(); g.lineWidth = 6; g.stroke();
    g.strokeStyle = color; g.fillStyle = color; g.lineWidth = width; path(); g.stroke(); tip(); g.fill();
    g.restore();
  }

  // Centre-of-gravity symbol: a circle with two opposite quarters filled.
  function cgMark(g, x, y, r, alpha = 1, ink = "#1D1C1A") {
    if (alpha <= 0) return;
    g.save(); g.globalAlpha = alpha;
    g.fillStyle = "#F4F1EA"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = ink;
    for (const a0 of [0, Math.PI]) { g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, a0 - Math.PI / 2, a0); g.closePath(); g.fill(); }
    g.strokeStyle = ink; g.lineWidth = r * 0.22; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.restore();
  }

  return { SP, toScreen, dirToScreen, drawCar, jet, arrow, cgMark, hash, clamp };
})();
