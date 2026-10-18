// Underbody section scene (S05/S06/S07). window.UNDERBODY(SCENE, SHOT) → { draw(t), ready, duration }.
// Pure function of t: dot paths, fan angle and fall are computed from t and the shot's word timings;
// nothing is carried from one frame to the next.
window.UNDERBODY = (SCENE, SHOT) => {
  const M = window.MODEL, GE = window.GEOM;
  const W = SCENE.width, H = SCENE.height, U = Math.min(W, H) / 1080, PORTRAIT = H > W;
  document.documentElement.style.setProperty("--mo-w", W + "px");
  document.documentElement.style.setProperty("--mo-h", H + "px");
  const cv = document.getElementById("c"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d");
  // style.json
  const PAL = { paper: "#F4F1EA", ink: "#1D1C1A", inkSoft: "#6B675F", rule: "#D8D2C4", accent: "#E4572E", second: "#2E86AB" };
  const FONT = '"Noto Sans CJK SC","Source Han Sans SC","PingFang SC","Microsoft YaHei","WenQuanYi Zen Hei",sans-serif';
  const MONO = '"JetBrains Mono","SFMono-Regular",Menlo,"DejaVu Sans Mono","WenQuanYi Zen Hei Mono",monospace';
  const SZ = { body: 44, label: 30, small: 22, note: 24 };
  const DUR = SHOT.duration || SCENE.duration, FPS = SCENE.fps || 30;
  const T_END = Math.max(1 / FPS, (Math.round(DUR * FPS) - 1) / FPS); // time of the last frame
  const ID = ["S05", "S06", "S07"].includes(SHOT.id) ? SHOT.id : "S05";

  // ---- timing helpers (templates/scene-paper.html) ----
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const lerp = (a, b, k) => a + (b - a) * k;
  const line = (id) => SHOT.lines.find((l) => l.id === id) || null;
  const SKIP = /[\s，。！？；：、,.!?;:“”"'（）()《》—…·-]/g;
  const wordAt = (id, phrase) => {
    const l = line(id); if (!l) return null;
    const p = phrase.replace(SKIP, "");
    if (l.words && l.words.length) {
      let s = ""; const at = [];
      for (const w of l.words) { const cs = [...w.text.replace(SKIP, "")]; cs.forEach((c, k) => { s += c; at.push(w.start + (w.end - w.start) * k / cs.length); }); }
      const k = s.indexOf(p); if (k >= 0) return at[[...s.slice(0, k)].length];
    }
    const txt = [...(l.text || "").replace(SKIP, "")], k = txt.join("").indexOf(p);
    return k < 0 ? l.start : l.start + (l.end - l.start) * [...txt.join("").slice(0, k)].length / Math.max(1, txt.length);
  };
  const w = (id, phrase) => { const v = wordAt(id, phrase); return v == null ? 0 : v; };
  const ls = (id) => (line(id) ? line(id).start : 0), le = (id) => (line(id) ? line(id).end : 0);
  const atWord = (t, id, phrase, len = 0.5, lead = 0.08) => { const v = wordAt(id, phrase); return v == null ? 0 : eo(seg(t, v - lead, v - lead + len)); };
  const atLine = (t, id, len = 0.6, lead = 0.15) => { const l = line(id); return l ? eo(seg(t, l.start - lead, l.start - lead + len)) : 0; };
  const pulse = (t, at) => seg(t, at - 0.1, at + 0.2) * (1 - seg(t, at + 0.7, at + 1.1));
  const solve = (f, target, a, b) => { // monotone f on [a,b]: the t where f(t) = target
    let lo = a, hi = b; const up = f(b) > f(a);
    for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if ((f(m) < target) === up) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const integ = (f, t) => { let a = 0; const n = Math.max(1, Math.ceil(t * 120)), h = t / n; for (let i = 0; i < n; i++) a += f((i + 0.5) * h) * h; return a; };
  const hash = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7 + 0.5) * 43758.5453; return x - Math.floor(x); };

  // ---- layout (screen) ----
  const LY = PORTRAIT
    ? { s: (W * 0.84) / GE.SPRITE_W, cx: W * 0.5, cy: H * 0.33, px: W * 0.08, pr: W * 0.92, py: H * 0.57, sx: W * 0.08, sy: H * 0.12 }
    : { s: 0.92 * U, cx: W * 0.378, cy: H * 0.454, px: W * 0.695, pr: W * 0.93, py: H * 0.139, sx: W * 0.07, sy: H * 0.08 };

  // ---- numbers: all from the model ----
  const WGT = M.weight();                                    // N, 1,700 kg × g (宣称 mass)
  const DP_W = M.dpFor(WGT);                                 // Pa needed to hang upside down (估算)
  const F_CLAIM = M.weight(M.downforceClaimKg), DP_CLAIM = M.dpFor(F_CLAIM);
  const EXAG = 20;                                           // drawing only: pressure difference ×20 (示意)
  const rhoOf = (dp) => 1 - EXAG * dp / M.pAtm;              // dot density / underbody arrow length
  const RHO5 = rhoOf(DP_W), RHO6 = rhoOf(DP_CLAIM);
  const FPX = 150;                                           // sprite px of arrow for one car weight
  const LP = 74;                                             // sprite px of a pressure arrow at 1 atm
  const kgfmt = (v) => Math.round(v).toLocaleString("en-US");

  // ---- per-shot schedule ----
  const NB = GE.FAN.blades, PERIOD = (2 * Math.PI) / NB, OMEGA = 2 * Math.PI * 1.6;
  const SC = {};
  if (ID === "S05") {
    const tFan = w("L007", "风扇");
    SC.fan = (t) => eio(seg(t, tFan - 0.05, tFan + 0.8));
    const Pend = integ(SC.fan, T_END), K = Math.max(1, Math.round((OMEGA * Pend) / PERIOD));
    SC.ang = (t) => (K * PERIOD * integ(SC.fan, t)) / Pend;  // whole blade periods by the last frame
    SC.a = w("L007", "抽走") + 0.5; SC.b = w("L007", "低") + 0.4;
    SC.dp = (t) => DP_W * eio(seg(t, SC.a, SC.b));
    SC.moveFrom = w("L007", "抽走");
  } else {
    const K = Math.max(1, Math.round((OMEGA * T_END) / PERIOD));
    SC.fan = () => 1; SC.ang = (t) => (K * PERIOD * t) / T_END;
  }
  if (ID === "S06") {
    SC.f0 = ls("L008") - 0.05; SC.f1 = w("L008", "车重") - 0.25;
    SC.dp = () => DP_W;                                                           // just holds the car (= weight)
  }
  if (ID === "S07") {
    SC.leave = w("L011", "离开");
    SC.gap1 = w("L011", "漏气") + 0.2;
    SC.gapM = (t) => 2 * M.sealGap * eio(seg(t, SC.leave, SC.gap1));            // m (示意)
    SC.seal = solve((t) => (M.suctionHolds(SC.gapM(t)) ? 0 : 1), 0.5, SC.leave, SC.gap1);
    SC.gone = w("L011", "没") + 0.05;
    SC.a = w("L010", "两千五百") - 0.1; SC.b = SC.a + 1.0; SC.moveFrom = SC.a - 0.2;
    SC.grow = (t) => DP_W + (DP_CLAIM - DP_W) * eio(seg(t, SC.a, SC.b));        // engineer's 2,500 kgf (宣称)
    SC.dp = (t) => SC.grow(t) * (1 - eio(seg(t, SC.seal, SC.gone)));
    const GAP_VIS = 11 / M.sealGap, FALL_VIS = 4.4;                              // sprite px (示意, 慢放)
    SC.fall = (t) => {
      if (t <= SC.seal) return 0;
      let v = 0, y = 0; const dt = 1 / 120;
      for (let s = SC.seal; s < t; s += dt) { const h = Math.min(dt, t - s); v += (Math.max(0, WGT - M.suctionFor(SC.dp(s))) / M.massCar) * h; y += v * h; }
      return y * FALL_VIS;
    };
    SC.dy = (t) => -(SC.gapM(t) * GAP_VIS + SC.fall(t));
  }

  function stateAt(t) {
    const st = { th: 0, k: 1, dy: 0, fan: SC.fan(t), ang: SC.ang(t), dp: SC.dp(t) };
    if (ID === "S06") { st.th = Math.PI * eio(seg(t, SC.f0, SC.f1)); st.k = 1 - 0.36 * Math.sin(st.th); }
    if (ID === "S07") { st.th = Math.PI; st.dy = SC.dy(t); }
    st.F = M.suctionFor(st.dp); st.rho = rhoOf(st.dp);
    return st;
  }

  // ---- dots: cavity air (stratified thresholds) and the air around the car ----
  const CAV = GE.CAV, ROAD = GE.ROAD, PCX = (GE.CAV.x0 + GE.CAV.x1) / 2;   // centre of the sealed area
  const jitterOf = (i, k0) => ({
    kx: Math.max(1, Math.round((0.35 + 0.5 * hash(i, k0)) * T_END)), ky: Math.max(1, Math.round((0.3 + 0.5 * hash(i, k0 + 1)) * T_END)),
    px: 2 * Math.PI * hash(i, k0 + 2), py: 2 * Math.PI * hash(i, k0 + 3),
  });
  const jit = (d, t, A) => [A * Math.sin((2 * Math.PI * d.j.kx * t) / T_END + d.j.px), A * Math.sin((2 * Math.PI * d.j.ky * t) / T_END + d.j.py)];
  const CD = [], COLS = 24, ROWS = 5, NC = COLS * ROWS;
  const cx0 = CAV.x0 + 9, cx1 = CAV.x1 - 4, cy0 = CAV.floor + 7, cy1 = ROAD.y - 5;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    CD.push({ i, hx: cx0 + ((c + 0.5 + 0.8 * (hash(i, 1) - 0.5)) * (cx1 - cx0)) / COLS, hy: cy0 + ((r + 0.5 + 0.8 * (hash(i, 2) - 0.5)) * (cy1 - cy0)) / ROWS, j: jitterOf(i, 3) });
  }
  CD.map((d) => d.i).sort((a, b) => hash(a, 9) - hash(b, 9)).forEach((i, rank) => (CD[i].u = (rank + 0.5) / NC));
  for (const d of CD) {
    if (ID === "S05" && d.u > RHO5) d.tau = solve((t) => rhoOf(SC.dp(t)), d.u, SC.a, SC.b);
    if (ID === "S07" && d.u <= RHO5 && d.u > RHO6) d.tau = solve((t) => rhoOf(SC.dp(t)), d.u, SC.a, SC.b);
    if (ID === "S07" && d.u > RHO6) d.arr = solve((t) => rhoOf(SC.dp(t)), d.u, SC.seal, SC.gone);
    d.gone = ID === "S06" && d.u > RHO5;
  }
  const AD = [], SP = 20.4;
  for (let y = -340, r = 0; y < ROAD.y; y += SP, r++) for (let x = -90, c = 0; x < 1275; x += SP, c++) {
    const i = 5000 + r * 80 + c;
    AD.push({ x: x + SP * 0.8 * (hash(i, 1) - 0.5), y: y + SP * 0.8 * (hash(i, 2) - 0.5), j: jitterOf(i, 3) });
  }
  const contour = (arr, x) => { const f = clamp(x, 0, 1178) / 10, i = Math.floor(f), j = Math.min(arr.length - 1, i + 1); return arr[i] + (arr[j] - arr[i]) * (f - i); };
  const topAt = (x) => contour(GE.TOP, x), botAt = (x) => contour(GE.BOT, x);
  function ambAlpha(x, y, dy) {
    if (y > ROAD.y - 3) return 0;
    if (x >= 0 && x <= 1178 && y > topAt(x) + dy - 6 && y < botAt(x) + dy + 5) return 0;
    if (x > CAV.x0 - 8 && x < CAV.x1 + 6 && y > CAV.floor + dy - 6 && y < ROAD.y + dy + 3) return 0;
    if (x > GE.DUCT.x0 - 6 && x < GE.DUCT.x1 + 4 && y > 216 + dy && y < 298 + dy) return 0;
    const ex = x < 0 ? -x : x > 1178 ? x - 1178 : 0, above = topAt(x) + dy - y;
    const under = y - ((x > CAV.x0 - 8 && x < CAV.x1 + 6 ? ROAD.y : botAt(x)) + dy);   // below the car, once it has fallen away
    return (1 - seg(ex, 30, 95)) * (above > 0 ? 1 - seg(above, 50, 105) : 1) * (under > 0 ? 1 - seg(under, 60, 130) : 1);
  }
  // A cavity dot at time t → {x, y, att, a} (sprite coords; att = moves with the car) or null.
  function cavDot(d, t, st) {
    const [jx, jy] = jit(d, t, 2.2);
    const still = { x: d.hx + jx, y: d.hy + jy, att: true, a: 1 };
    if (d.gone) return null;
    if (d.arr != null) {
      const t0 = Math.max(SC.seal, d.arr - 0.55);
      if (t >= d.arr) return still;
      if (t >= t0) {
        const s = seg(t, t0, d.arr), h = hash(d.i, 11), front = h < 0.3;
        const ex = front ? CAV.x0 - 45 - 70 * hash(d.i, 12) : d.hx + 30 * (hash(d.i, 13) - 0.5), ey = ROAD.y - (front ? 4 + 8 * hash(d.i, 14) : 2);
        return { x: lerp(ex, d.hx + jx, eo(s)), y: lerp(ey, d.hy + jy + st.dy, eo(s)), att: false, a: seg(s, 0, 0.3) };
      }
      if (d.tau == null) return null;                                              // left in S05, not back yet
    }
    if (d.tau != null) {
      const TA = clamp(Math.hypot(GE.EXIT.x - d.hx, GE.EXIT.y - d.hy) / 520, 0.3, 1.0), t0 = Math.max(SC.moveFrom, d.tau - TA);
      if (t <= t0) return still;
      if (t <= d.tau) { const s = seg(t, t0, d.tau), e = Math.pow(s, 1.7), sm = s * s * (3 - 2 * s); return { x: lerp(d.hx + jx * (1 - s), GE.EXIT.x, e), y: lerp(d.hy + jy * (1 - s), GE.EXIT.y, sm), att: true, a: 1 }; }
      const t1 = d.tau + 0.3, t2 = t1 + 0.25, t3 = t2 + 0.5;
      if (t < t1) return null;                                                     // behind the rear wheel
      if (t < t2) { const s = seg(t, t1, t2); return { x: lerp(GE.INLET.x, GE.OUTLET.x, s), y: lerp(GE.INLET.y, GE.OUTLET.y, s), att: true, a: 1 }; }
      if (t < t3) { const s = seg(t, t2, t3), h = hash(d.i, 7); return { x: GE.OUTLET.x + (110 + 40 * h) * s, y: GE.OUTLET.y + (24 * (hash(d.i, 8) - 0.5) - 10) * s, att: true, a: 1 - s }; }
      return null;
    }
    return still;
  }

  // ---- transforms: sprite coords → screen ----
  let st = null;
  const P = (x, y, att) => {
    const X = (x - GE.PIVOT.x) * LY.s, Y = (y + (att ? st.dy : 0) - GE.PIVOT.y) * LY.s, c = Math.cos(st.th), s = Math.sin(st.th);
    return [LY.cx + st.k * (X * c - Y * s), LY.cy + st.k * (X * s + Y * c)];
  };
  const setLocal = (att) => {
    const kS = st.k * LY.s, c = Math.cos(st.th) * kS, s = Math.sin(st.th) * kS, ox = -GE.PIVOT.x, oy = (att ? st.dy : 0) - GE.PIVOT.y;
    g.setTransform(c, s, -s, c, LY.cx + c * ox - s * oy, LY.cy + s * ox + c * oy);
  };
  const LW = (px) => (px * U) / (st.k * LY.s);

  // ---- drawing helpers (screen) ----
  function text(s, x, y, size, o = {}) {
    const { color = PAL.ink, weight = 600, align = "left", font = FONT, alpha = 1, bg = false } = o;
    if (alpha <= 0.003) return 0;
    g.save(); g.globalAlpha = alpha; g.font = `${weight} ${size * U}px ${font}`; g.textAlign = align; g.textBaseline = "middle";
    const tw = g.measureText(s).width;
    if (bg) { const x0 = align === "center" ? x - tw / 2 : align === "right" ? x - tw : x; g.fillStyle = "rgba(244,241,234,0.88)"; g.beginPath(); g.roundRect(x0 - 7 * U, y - size * U * 0.64, tw + 14 * U, size * U * 1.28, 6 * U); g.fill(); }
    g.fillStyle = color; g.fillText(s, x, y); g.restore(); return tw;
  }
  const measure = (s, size, font = FONT, weight = 600) => { g.save(); g.font = `${weight} ${size * U}px ${font}`; const v = g.measureText(s).width; g.restore(); return v; };
  function badge(label, x, y, color, alpha) {
    if (alpha <= 0.003) return 0;
    g.save(); g.globalAlpha = alpha; g.font = `600 ${SZ.small * U}px ${FONT}`;
    const bw = g.measureText(label).width + 22 * U, bh = 36 * U;
    g.fillStyle = "rgba(244,241,234,0.9)"; g.strokeStyle = color; g.lineWidth = 2 * U; g.beginPath(); g.roundRect(x, y - bh / 2, bw, bh, 6 * U); g.fill(); g.stroke();
    g.fillStyle = color; g.textBaseline = "middle"; g.fillText(label, x + 11 * U, y + 1 * U); g.restore(); return bw;
  }
  function arrow(x0, y0, x1, y1, color, width, alpha, o = {}) {
    const len = Math.hypot(x1 - x0, y1 - y0); if (alpha <= 0.003 || len < 1.5) return;
    const a = Math.atan2(y1 - y0, x1 - x0), ca = Math.cos(a), sa = Math.sin(a), hl = Math.min((o.head || 24) * U, len * 0.6), hw = hl * 0.55;
    const shaft = () => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - ca * hl * 0.8, y1 - sa * hl * 0.8); };
    const head = () => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - ca * hl - sa * hw, y1 - sa * hl + ca * hw); g.lineTo(x1 - ca * hl + sa * hw, y1 - sa * hl - ca * hw); g.closePath(); };
    g.save(); g.globalAlpha = alpha; g.lineCap = "round"; g.lineJoin = "round";
    if (o.halo) { g.strokeStyle = "rgba(244,241,234,0.95)"; g.lineWidth = (width + 7) * U; shaft(); g.stroke(); head(); g.lineWidth = 7 * U; g.stroke(); }
    g.strokeStyle = color; g.fillStyle = color; g.lineWidth = width * U;
    if (o.dash) g.setLineDash(o.dash.map((v) => v * U));
    shaft(); g.stroke(); g.setLineDash([]);
    if (!o.noHead) { head(); g.fill(); }
    g.restore();
  }
  function leader(x0, y0, x1, y1, alpha) {
    if (alpha <= 0.003) return;
    g.save(); g.globalAlpha = alpha * 0.8; g.strokeStyle = PAL.inkSoft; g.lineWidth = 1.6 * U;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.fillStyle = PAL.inkSoft; g.beginPath(); g.arc(x1, y1, 3.5 * U, 0, 2 * Math.PI); g.fill(); g.restore();
  }
  function hatch(x, y, wd, ht, step, color, lw, alpha) {
    g.save(); g.beginPath(); g.rect(x, y, wd, ht); g.clip(); g.globalAlpha = alpha; g.strokeStyle = color; g.lineWidth = LW(lw);
    g.beginPath(); for (let k = x - ht; k < x + wd; k += step) { g.moveTo(k, y + ht); g.lineTo(k + ht, y); } g.stroke(); g.restore();
  }
  function section(x, y, wd, ht) { // a cut part: hatched, outlined
    g.fillStyle = "#d9d2c3"; g.fillRect(x, y, wd, ht); hatch(x, y, wd, ht, 7, PAL.ink, 1, 0.45);
    g.strokeStyle = PAL.ink; g.lineWidth = LW(2); g.strokeRect(x, y, wd, ht);
  }

  const img = new Image();
  img.src = "../_shared/car_side.png";
  const ready = Promise.all([document.fonts.ready, new Promise((r) => (img.complete ? r() : ((img.onload = r), (img.onerror = r))))]);

  // ---- cues: what is shown, from the words ----
  function cues(t) {
    const q = { road: 0, ceil: 0, skirt: 0, fanL: 0, air: 0, fanHi: 0, roofHi: 1, ghost: 1, pres: 1, excess: 0, merge: 1, pulse: 0,
      weight: 0, wnum: 0, wgoal: 0, just: 0, claim: 0, support: 0, cavHi: 0, under: 1, atm: 1, note: 1, bAll: 0, bHead: 0, bVal: 0, bPct: 0,
      cA: 0, c1: 0, c2: 0, c3: 0, cb2: 0, cb3: 0, cDim: 1, leak: 0, grey: 0, off: 0, slow: 0 };
    if (ID === "S05") {
      const tAtm = w("L007", "大气");
      Object.assign(q, { road: 1, skirt: 1, fanL: atWord(t, "L007", "风扇"), air: atWord(t, "L007", "空气") * (1 - seg(t, tAtm, tAtm + 0.5)),
        fanHi: atWord(t, "L007", "风扇") * (1 - seg(t, w("L007", "风扇") + 1.6, w("L007", "风扇") + 2.2)),
        roofHi: atWord(t, "L007", "大气"), ghost: atWord(t, "L007", "气压变低"), under: atWord(t, "L007", "车底"), atm: atWord(t, "L007", "大气"),
        note: atWord(t, "L007", "气压变低"), excess: seg(t, tAtm + 0.15, tAtm + 0.55),
        merge: eio(seg(t, w("L007", "把车") - 0.1, w("L007", "路面") + 0.2)) });
    }
    if (ID === "S06") {
      const th = Math.PI * eio(seg(t, SC.f0, SC.f1)), fade = 1 - seg(th, 0, 0.6), tW = w("L008", "车重"), tU = w("L009", "车底气压");
      Object.assign(q, { road: fade, ceil: seg(th, Math.PI - 0.6, Math.PI), skirt: fade, fanL: fade,
        pres: 1 - 0.55 * seg(t, tW - 0.2, tW + 0.4) * (1 - seg(t, tU - 0.3, tU + 0.3)),
        pulse: pulse(t, w("L008", "这股力")), weight: atWord(t, "L008", "车重"), wgoal: atWord(t, "L008", "目标"), wnum: atWord(t, "L008", "一千七百"),
        just: eo(seg(t, tW + 0.4, tW + 0.9)), support: 1,
        cavHi: atWord(t, "L009", "车底气压") * (1 - seg(t, le("L009") - 0.3, le("L009") + 0.2)),
        bAll: 1, bHead: atWord(t, "L009", "算"), bVal: atWord(t, "L009", "车底气压"), bPct: atWord(t, "L009", "百分之三") });
    }
    if (ID === "S07") {
      const t10 = ls("L010"), tL = SC.leave;
      Object.assign(q, { ceil: 1, weight: 1, wgoal: 1, wnum: 1, support: 1 - seg(t, tL - 0.05, tL + 0.15),
        just: 1 - seg(t, SC.a, SC.a + 0.4), claim: atWord(t, "L010", "两千五百"),
        pres: 1 - 0.5 * seg(t, t10, t10 + 0.5) + 0.5 * seg(t, tL - 0.2, tL + 0.3), pulse: pulse(t, w("L010", "两千五百")),
        bAll: 1 - seg(t, t10 - 0.1, t10 + 0.4), bHead: 1, bVal: 1, bPct: 1,
        cA: seg(t, t10, t10 + 0.5), c1: eio(seg(t, t10 + 0.1, t10 + 0.9)), c2: eio(seg(t, w("L010", "两千五百") - 0.1, w("L010", "两千五百") + 0.7)),
        c3: eio(seg(t, w("L010", "屏幕") - 0.1, w("L010", "更高") + 0.1)), cb2: atWord(t, "L010", "两千五百"), cb3: atWord(t, "L010", "屏幕"),
        cDim: 1 - 0.6 * seg(t, tL - 0.2, tL + 0.3), leak: seg(t, SC.seal - 0.1, SC.seal + 0.3) * (1 - seg(t, SC.gone + 0.2, SC.gone + 0.7)),
        grey: seg(t, SC.gone - 0.1, SC.gone + 0.3), off: atWord(t, "L011", "没"), note: 1 - seg(t, SC.gone - 0.3, SC.gone), slow: atLine(t, "L011") });
    }
    return q;
  }

  // ---- the scene ----
  function drawRoad() {
    setLocal(false);
    const x0 = ROAD.x0, x1 = ROAD.x1, y = ROAD.y;
    g.fillStyle = "rgba(216,210,196,0.38)"; g.fillRect(x0, y, x1 - x0, ROAD.slab);
    hatch(x0, y, x1 - x0, ROAD.slab, 16, PAL.inkSoft, 1.2, 0.55);
    g.strokeStyle = PAL.ink; g.lineWidth = LW(3); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
  function drawAmbient(t) {
    g.fillStyle = PAL.second; const r = 3.1 * LY.s * st.k * (U / U);
    for (const d of AD) {
      const [jx, jy] = jit(d, t, 2.2), x = d.x + jx, y = d.y + jy, a = ambAlpha(x, y, st.dy);
      if (a <= 0.01) continue;
      const [sx, sy] = P(x, y, false); g.globalAlpha = 0.6 * a; g.beginPath(); g.arc(sx, sy, r, 0, 2 * Math.PI); g.fill();
    }
    g.globalAlpha = 1;
  }
  function drawCar(t, q) {
    const D = GE.DUCT, F = GE.FAN;
    setLocal(true);
    g.save(); g.beginPath(); g.rect(-30, -30, 1240, 360);
    g.rect(CAV.x0, CAV.floor, CAV.x1 - CAV.x0, ROAD.y - CAV.floor + 6); g.rect(D.x0 - 4, 218, D.x1 - D.x0 + 6, 80); g.clip("evenodd");
    if (img.complete && img.naturalWidth) g.drawImage(img, 0, 0);
    g.restore();
    // sealed underbody: tint, far-side skirt, floor pan and front lip in section
    g.fillStyle = "rgba(46,134,171,0.06)"; g.fillRect(CAV.x0, CAV.floor, CAV.x1 - CAV.x0, ROAD.y - CAV.floor);
    g.fillStyle = "rgba(216,210,196,0.5)"; g.fillRect(CAV.x0, CAV.skirtTop, CAV.x1 - CAV.x0, ROAD.y - CAV.skirtTop);
    hatch(CAV.x0, CAV.skirtTop, CAV.x1 - CAV.x0, ROAD.y - CAV.skirtTop, 12, PAL.inkSoft, 1, 0.4);
    g.strokeStyle = PAL.ink; g.lineWidth = LW(4); g.beginPath(); g.moveTo(CAV.x0, ROAD.y - 1); g.lineTo(CAV.x1, ROAD.y - 1); g.stroke();
    section(CAV.x0 - 6, CAV.floor - 9, CAV.x1 - CAV.x0 + 10, 9);
    section(CAV.x0 - 6, CAV.floor, 9, ROAD.y - CAV.floor - 1);
    // rear duct and fan (side view: the blades sweep up and down)
    g.fillStyle = "rgba(46,134,171,0.07)"; g.beginPath(); g.moveTo(D.x0, D.top0); g.lineTo(D.x1, D.top1); g.lineTo(D.x1, D.bot1); g.lineTo(D.x0, D.bot0); g.closePath(); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = LW(3); g.beginPath(); g.moveTo(D.x0, D.top0); g.lineTo(D.x1, D.top1); g.moveTo(D.x0, D.bot0); g.lineTo(D.x1, D.bot1); g.stroke();
    g.strokeStyle = PAL.inkSoft; g.lineWidth = LW(1.5); g.beginPath(); g.ellipse(F.x, F.y, 6, F.r, 0, 0, 2 * Math.PI); g.stroke();
    for (let k = 0; k < NB; k++) {
      const ph = st.ang + k * PERIOD, y = F.y + F.r * Math.sin(ph), c = Math.cos(ph);
      g.globalAlpha = c > 0 ? 1 : 0.35; g.strokeStyle = PAL.ink; g.lineWidth = LW(2 + 3 * Math.max(0, c)); g.lineCap = "round";
      g.beginPath(); g.moveTo(F.x - 7, y + 4); g.lineTo(F.x + 7, y - 4); g.stroke();
    }
    g.globalAlpha = 1; g.fillStyle = PAL.ink; g.fillRect(F.x - 10, F.y - 6, 20, 12);
    if (st.fan > 0.05) { // spin cue: an arc round the fan axis
      g.globalAlpha = 0.85 * st.fan; g.strokeStyle = PAL.accent; g.lineWidth = LW(2.5);
      g.beginPath(); g.ellipse(F.x, F.y, 15, F.r + 9, 0, -Math.PI * 0.62, Math.PI * 0.45); g.stroke();
      const ea = Math.PI * 0.45, ex = F.x + 15 * Math.cos(ea), ey = F.y + (F.r + 9) * Math.sin(ea);
      g.fillStyle = PAL.accent; g.beginPath(); g.moveTo(ex - 9, ey + 3); g.lineTo(ex + 4, ey - 8); g.lineTo(ex + 6, ey + 7); g.closePath(); g.fill(); g.globalAlpha = 1;
    }
    if (q.fanHi > 0) { g.globalAlpha = q.fanHi; g.strokeStyle = PAL.accent; g.lineWidth = LW(3); g.beginPath(); g.roundRect(D.x0 - 12, 206, D.x1 - D.x0 + 26, 100, 10); g.stroke(); g.globalAlpha = 1; }
    if (q.cavHi > 0) { g.globalAlpha = q.cavHi; g.strokeStyle = PAL.accent; g.lineWidth = LW(3); g.setLineDash([10, 7]); g.strokeRect(CAV.x0 - 4, CAV.floor - 4, CAV.x1 - CAV.x0 + 8, ROAD.y - CAV.floor + 6); g.setLineDash([]); g.globalAlpha = 1; }
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
  function drawCavityDots(t) {
    g.fillStyle = PAL.second; const r = 3.4 * LY.s * st.k;
    for (const d of CD) {
      const p = cavDot(d, t, st); if (!p || p.a <= 0.01) continue;
      const [sx, sy] = P(p.x, p.y, p.att); g.globalAlpha = 0.85 * p.a; g.beginPath(); g.arc(sx, sy, r, 0, 2 * Math.PI); g.fill();
    }
    g.globalAlpha = 1;
  }
  function drawPressure(t, q) {
    const roofX = [120, 210, 300, 390, 480, 570, 660, 750, 840, 930, 1020, 1110], underX = [345, 425, 505, 585, 665, 745, 820];
    for (const x of roofX) { const y = topAt(x) - 4, [ax, ay] = P(x, y - LP, true), [bx, by] = P(x, y, true); arrow(ax, ay, bx, by, PAL.second, 4 + q.roofHi, (0.5 + 0.5 * q.roofHi) * q.pres, { head: 18 }); }
    for (const x of underX) {
      const y = CAV.floor + 6, [tx, ty] = P(x, y, true), [ax, ay] = P(x, y + LP * st.rho, true), [gx, gy] = P(x, y + LP, true);
      arrow(gx, gy, ax, ay, PAL.second, 2.5, 0.75 * q.ghost * q.pres, { dash: [6, 5], noHead: true });
      arrow(ax, ay, tx, ty, PAL.second, 4, 0.9 * q.pres, { head: 18 });
    }
    // S05: the excess of each roof arrow over the underbody ones gathers into the suction arrow
    if (q.excess > 0 && q.merge < 1) {
      const [px, py] = P(PCX, ROAD.y - 3, true), full = (st.F / WGT) * FPX * LY.s * st.k, dv = [-Math.sin(st.th), Math.cos(st.th)];
      const tx = px - dv[0] * full * 0.5, ty = py - dv[1] * full * 0.5, m = eio(q.merge);
      for (const x of roofX) {
        const y = topAt(x) - 4 - LP, [ax, ay] = P(x, y, true), [bx, by] = P(x, y + LP * (1 - st.rho), true);
        const mx = lerp((ax + bx) / 2, tx, m), my = lerp((ay + by) / 2, ty, m), hl = (Math.hypot(bx - ax, by - ay) / 2) * (1 - 0.6 * m);
        g.save(); g.globalAlpha = q.excess * (1 - seg(q.merge, 0.7, 1)); g.strokeStyle = PAL.accent; g.lineWidth = 5 * U; g.lineCap = "round";
        g.beginPath(); g.moveTo(mx - dv[0] * hl, my - dv[1] * hl); g.lineTo(mx + dv[0] * hl, my + dv[1] * hl); g.stroke(); g.restore();
      }
    }
  }
  function drawForces(t, q) {
    const [cx, cy] = P(GE.CG.x, GE.CG.y, true), sc = (FPX * LY.s * st.k) / WGT, dv = [-Math.sin(st.th), Math.cos(st.th)];
    // suction: on the car, at the centre of the sealed area, tip on the side that touches the surface
    const [px, py] = P(PCX, ROAD.y - 3, true);
    const ls_ = st.F * sc * eio(seg(q.merge, 0.35, 1)), sa = ID === "S05" ? q.merge : 1;
    arrow(px - dv[0] * ls_, py - dv[1] * ls_, px, py, PAL.accent, 7 + 3 * q.pulse, sa, { halo: true, head: 28 });
    const sl = clamp(st.F / F_CLAIM * 3) * sa * (1 - 0.5 * q.grey), lx0 = px - dv[0] * ls_ * 0.5 - 18 * U, ly0 = py - dv[1] * ls_ * 0.5;
    text("吸力", lx0, ly0, SZ.label, { color: q.grey > 0.5 ? PAL.inkSoft : PAL.accent, align: "right", alpha: sl, bg: true });
    text("= 车重，刚好托住", lx0, ly0 + 40 * U, 26, { align: "right", alpha: q.just * sl, bg: true });
    const cw = measure("宣称", SZ.small) + 22 * U;
    badge("宣称", lx0 - cw, ly0 + 40 * U, PAL.accent, q.claim * sl);
    // ceiling on the tyres: from the contact toward the car, only while touching and suction > weight
    if (q.support > 0 && st.F > WGT && st.dy === 0) {
      const n = ((st.F - WGT) / 2) * sc, a = q.support * seg(st.F - WGT, 0, 0.08 * WGT);
      for (const c of GE.CONTACT) { const [px, py] = P(c.x, c.y, true); arrow(px, py, px - dv[0] * n, py - dv[1] * n, PAL.ink, 5, a, { halo: true, head: 16 }); }
      const [fx, fy] = P(GE.CONTACT[0].x, GE.CONTACT[0].y, true);
      text("支撑力", fx + 34 * U, fy - dv[1] * 40 * U, SZ.label, { alpha: a, bg: true });
    }
    // weight: from the centre of mass, straight down
    if (q.weight > 0) {
      const lw_ = WGT * sc * eo(q.weight);
      arrow(cx, cy, cx, cy + lw_, PAL.ink, 7, q.weight, { halo: true, head: 28 });
      g.save(); g.globalAlpha = q.weight; g.translate(cx, cy); g.rotate(st.th); const R = 10 * U;
      g.fillStyle = PAL.paper; g.strokeStyle = PAL.ink; g.lineWidth = 2 * U; g.beginPath(); g.arc(0, 0, R, 0, 2 * Math.PI); g.fill(); g.stroke();
      g.fillStyle = PAL.ink; for (const a0 of [0, Math.PI]) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, a0, a0 + Math.PI / 2); g.closePath(); g.fill(); } g.restore();
      const lx = cx + 24 * U, ly = cy + WGT * sc * 0.42;
      const wg = measure("目标", SZ.label);
      text("车重", lx + wg, ly, SZ.label, { alpha: q.weight * (1 - q.wgoal), bg: true });
      const w1 = text("目标车重", lx, ly, SZ.label, { alpha: q.weight * q.wgoal, bg: true }) || measure("目标车重", SZ.label);
      const w2 = text(`${kgfmt(M.massCar)} kg`, lx + w1 + 12 * U, ly, SZ.label, { alpha: q.wnum, bg: true });
      badge("宣称", lx + w1 + w2 + 34 * U, ly, PAL.accent, q.wnum);
      text(`≈ ${(WGT / 1000).toFixed(1)} kN`, lx, ly + 40 * U, 26, { font: MONO, weight: 500, color: PAL.inkSoft, alpha: q.wnum, bg: true });
    }
  }
  function drawLeak(t, q) {
    if (q.leak <= 0) return;
    for (const x of [400, 540, 680, 800]) { const [ax, ay] = P(x, ROAD.y + 4, false), [bx, by] = P(x, ROAD.y - 30, true); arrow(ax, ay, bx, by, PAL.second, 4, q.leak, { head: 16 }); }
    const [ax, ay] = P(CAV.x0 - 95, ROAD.y - 8, false), [bx, by] = P(CAV.x0 + 40, ROAD.y - 14, true); arrow(ax, ay, bx, by, PAL.second, 4, q.leak, { head: 16 });
    const [lx, ly] = P(760, ROAD.y + ROAD.slab + 30, false), [rx, ry] = P(760, ROAD.y, false);
    leader(lx, ly + (ry > ly ? 18 : -18) * U, rx, ry, q.leak);
    text("裙边漏气", lx, ly, SZ.label, { color: PAL.second, align: "center", alpha: q.leak, bg: true });
  }
  function drawLabels(t, q) {
    const out = ROAD.y + ROAD.slab + 30;
    const lab = (s, x, ax, ay, a) => { const [sx, sy] = P(x, out, false), [px, py] = P(ax, ay, true); leader(sx, sy - 18 * U, px, py, a); text(s, sx, sy, SZ.label, { align: "center", alpha: a, bg: true }); };
    if (q.road > 0) { const [sx, sy] = P(ROAD.x0 + 20, out, false); text("路面", sx, sy, SZ.label, { color: PAL.inkSoft, alpha: q.road }); }
    if (q.ceil > 0) { const [sx, sy] = P(ROAD.x1 - 20, out, false); text("坡道顶面", sx, sy, SZ.label, { color: PAL.inkSoft, alpha: q.ceil }); }
    if (q.skirt > 0) lab("裙边", 440, 440, ROAD.y - 12, q.skirt);
    if (q.air > 0) lab("车底空气", 690, 690, 245, q.air);
    if (q.fanL > 0) lab("风扇", 1160, GE.FAN.x + 4, GE.FAN.y + GE.FAN.r + 2, q.fanL);
  }
  function drawPanel(t, q) {
    const X = LY.px, R = LY.pr, PW = R - X, Y = LY.py;
    // A: live readings
    const grey = q.grey, cU = grey > 0.5 ? PAL.inkSoft : PAL.second, cA = grey > 0.5 ? PAL.inkSoft : PAL.ink, ga = 1 - 0.35 * grey;
    text("大气压", X, Y + 18 * U, SZ.label, { color: cA, alpha: q.atm * ga });
    text(`${(M.pAtm / 1000).toFixed(1)} kPa`, R, Y + 18 * U, 40, { font: MONO, weight: 600, color: cA, align: "right", alpha: q.atm * ga });
    text("车底气压", X, Y + 78 * U, SZ.label, { color: cU, alpha: q.under * ga });
    text(`${((M.pAtm - st.dp) / 1000).toFixed(1)} kPa`, R, Y + 78 * U, 40, { font: MONO, weight: 600, color: cU, align: "right", alpha: q.under * ga });
    text(`示意：箭头差值放大 ${EXAG} 倍`, X, Y + 128 * U, SZ.note, { color: PAL.inkSoft, weight: 500, alpha: q.note });
    text("吸力模型不再适用", X, Y + 132 * U, 34, { color: PAL.accent, alpha: q.off });
    // B: the pressure drop needed to hang upside down (估算)
    const yb = Y + 200 * U, bA = q.bAll;
    if (bA > 0.003) {
      text("倒挂所需", X, yb, SZ.label, { alpha: q.bHead * bA });
      text(`负压 ≈ ${(DP_W / 1000).toFixed(1)} kPa`, X, yb + 56 * U, 40, { alpha: q.bVal * bA });
      text(`≈ 大气压的 ${Math.round(M.dpPct(WGT))}%`, X, yb + 114 * U, 40, { color: PAL.accent, alpha: q.bPct * bA });
      const by = yb + 158 * U, bh = 24 * U, sl = (DP_W / M.pAtm) * PW;
      g.save(); g.globalAlpha = q.bVal * bA; g.fillStyle = "rgba(46,134,171,0.28)"; g.fillRect(X, by, PW - sl, bh);
      g.fillStyle = q.bPct > 0 ? PAL.accent : PAL.rule; g.globalAlpha = q.bVal * bA * (0.4 + 0.6 * q.bPct); g.fillRect(X + PW - sl, by, sl, bh);
      g.globalAlpha = q.bVal * bA; g.strokeStyle = PAL.ink; g.lineWidth = 1.5 * U; g.strokeRect(X, by, PW, bh); g.restore();
      text("按比例：整条 = 大气压", X, by + bh + 22 * U, SZ.note, { color: PAL.inkSoft, weight: 500, alpha: q.bVal * bA });
      badge(`估算：车底面积按 ${M.areaUnder} m²`, X, by + bh + 70 * U, PAL.second, q.bVal * bA);
    }
    // C: needed vs claimed vs shown on the live stream (kgf)
    if (q.cA > 0.003) {
      const ca = q.cA * q.cDim, barMax = PW - 130 * U, bx = (kg) => X + (kg / 5000) * barMax;
      text("吸力 · kgf", X, yb, SZ.label, { alpha: ca });
      const rows = [
        { lab: "倒挂所需", kg: M.kgf(WGT), val: kgfmt(M.kgf(WGT)), col: PAL.ink, k: q.c1, b: null },
        { lab: "工程师说", kg: M.downforceClaimKg, val: kgfmt(M.downforceClaimKg), col: PAL.accent, k: q.c2, b: ["宣称", PAL.accent, q.cb2] },
        { lab: "屏幕读数", kg: M.downforceScreenKg, val: "≈" + kgfmt(M.downforceScreenKg), col: PAL.inkSoft, k: q.c3, b: ["直播画面显示", PAL.inkSoft, q.cb3] },
      ];
      rows.forEach((r, i) => {
        const ly = yb + (52 + i * 88) * U, by = ly + 34 * U, a = ca * clamp(r.k * 4);
        const lw_ = text(r.lab, X, ly, 28, { alpha: a });
        if (r.b) badge(r.b[0], X + lw_ + 14 * U, ly, r.b[1], ca * r.b[2]);
        g.save(); g.globalAlpha = a; g.fillStyle = r.col; g.fillRect(X, by - 12 * U, (bx(r.kg) - X) * r.k, 24 * U); g.restore();
        text(r.val, X + (bx(r.kg) - X) * r.k + 10 * U, by, 28, { font: MONO, weight: 600, color: r.col === PAL.inkSoft ? PAL.ink : r.col, alpha: a * seg(r.k, 0.6, 1) });
      });
      const wx = bx(M.kgf(WGT)), y1 = yb + (52 + 2 * 88 + 54) * U;
      g.save(); g.globalAlpha = ca * clamp(q.c1 * 2); g.strokeStyle = PAL.ink; g.lineWidth = 2 * U; g.setLineDash([7 * U, 6 * U]); g.beginPath();
      for (let i = 0; i < 3; i++) { const by = yb + (52 + i * 88 + 34) * U; g.moveTo(wx, by - 14 * U); g.lineTo(wx, i === 2 ? y1 : by + 18 * U); } g.stroke(); g.restore();
      text("车重", wx, y1 + 18 * U, SZ.note, { align: "center", color: PAL.inkSoft, alpha: ca * clamp(q.c1 * 2) });
    }
  }

  function draw(t) {
    st = stateAt(t);
    const q = cues(t);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    drawRoad();
    drawAmbient(t);
    drawCar(t, q);
    drawCavityDots(t);
    drawPressure(t, q);
    drawLeak(t, q);
    drawForces(t, q);
    drawLabels(t, q);
    drawPanel(t, q);
    const bw = badge("示意 · 未按比例", LY.sx, LY.sy + 48 * U, PAL.inkSoft, 1);
    badge("慢放", LY.sx + bw + 12 * U, LY.sy + 48 * U, PAL.inkSoft, q.slow);
  }
  return { draw, ready, duration: DUR };
};
