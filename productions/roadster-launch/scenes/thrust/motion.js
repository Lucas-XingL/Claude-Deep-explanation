// Motion of the car in the thrust figure (S09 and S10), as pure functions of the shot time t.
// World units are metres, x to the right, y up from the ground. Every time comes from the words
// of the narration (SHOT.lines[].words), so a new voice track moves the action with it.
//   S09: falling off the ramp upside down. The rear valve opens and the rear nozzle (its axis
//        passes through the CG) pushes the car forward; then a rear down nozzle, whose axis
//        misses the CG, spins it half a turn about the CG; a front down nozzle stops the spin;
//        it lands on its wheels. 示意: times and sizes are not to scale.
//   S10: the four down nozzles (two seen from the side, either side of the CG so the car does not
//        turn) lift the car while it drives forward; it flies over five vehicles and lands.
// Both shots meet at X_LAND, the car at rest on its wheels.
(function (root) {
  const SP = root.CAR2D.SP;
  const SKIP = /[\s，。！？；：、,.!?;:“”"'（）()《》—…·-]/g;
  const X_LAND = -2.85;                   // m, where S09 ends and S10 starts
  const NOSE = SP.cg[0] / SP.pxm, TAIL = (SP.w - SP.cg[0]) / SP.pxm;   // m ahead of / behind the CG

  function timing(SHOT) {
    const line = (id) => SHOT.lines.find((l) => l.id === id) || null;
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
    return { line, wordAt };
  }

  // ---------------------------------------------------------------- S09: push, then half a turn
  function makeS09(T) {
    const L14 = T.line("L014"), L15 = T.line("L015");
    const tOpen = T.wordAt("L014", "开"), tOff = L14.end;          // rear valve
    const tSpin = T.wordAt("L015", "车身");                         // rear down nozzle fires
    const tStop = T.wordAt("L015", "翻身") + 0.2;                   // spin stopped: upright
    const d = 0.75, coast = tStop - tSpin - 2 * d;                  // burst, coast, counter-burst
    const alpha = Math.PI / (d * (d + coast));                      // rad/s² (示意 time)
    const tLand = T.wordAt("L015", "翻身") + 0.95;
    const y0 = 4.4, DX = 4.0;                                       // CG height at t=0; drift before landing
    const Tb = tOff - tOpen, a = DX / (0.5 * Tb * Tb + Tb * (tLand - tOff)), vLand = a * Tb;
    const slideT = 0.35, slide = vLand * slideT / 2;
    const X0 = X_LAND + DX + slide;
    const theta = (t) => {
      const u = t - tSpin;
      if (u <= 0) return 0;
      if (u < d) return 0.5 * alpha * u * u;
      if (u < d + coast) return 0.5 * alpha * d * d + alpha * d * (u - d);
      if (u < 2 * d + coast) { const w = u - d - coast; return 0.5 * alpha * d * d + alpha * d * coast + alpha * d * w - 0.5 * alpha * w * w; }
      return Math.PI;
    };
    const pose = (t) => {
      let dx;
      if (t < tOpen) dx = 0;
      else if (t < tOff) dx = 0.5 * a * (t - tOpen) ** 2;
      else if (t < tLand) dx = 0.5 * a * Tb * Tb + a * Tb * (t - tOff);
      else { const u = Math.min(t - tLand, slideT); dx = DX + vLand * u - vLand * u * u / (2 * slideT); }
      const y = t < tLand ? y0 - (y0 - SP.cgH) * (t / tLand) ** 5 : SP.cgH;
      return { x: X0 - dx, y, phi: -Math.PI + theta(t), wheel: 0, landed: t >= tLand };
    };
    const jets = [
      { name: "rear", pt: SP.rearExit, dir: [1, 0], on: tOpen, off: tOff },
      { name: "downR", pt: SP.downR, dir: [0, 1], on: tSpin, off: tSpin + d },
      { name: "downF", pt: SP.downF, dir: [0, 1], on: tStop - d, off: tStop },
    ];
    return { pose, jets, tOpen, tOff, tSpin, tStop, tLand, d, theta };
  }

  // ---------------------------------------------------------------- S10: lift-off and the jump
  const VEHICLES = [   // front views, parked side by side across the path (generic shapes, no marks)
    { kind: "sedan", w: 1.85, h: 1.45 }, { kind: "pickup", w: 2.1, h: 1.95 }, { kind: "semi", w: 2.5, h: 3.6 },
    { kind: "suv", w: 1.95, h: 1.7 }, { kind: "small", w: 1.85, h: 1.42 },
  ];
  function makeS10(T) {
    const tGo = T.wordAt("L017", "推力");          // starts to drive forward
    const tFire = T.wordAt("L017", "车");          // "车就能离地": down valves open
    const tLand = T.wordAt("L017", "过去") + 0.5;
    const r = 2.6;                                  // thrust / weight during the jump (示意)
    const hApex = 5.0;                              // CG height at the top of the jump
    const R = hApex - SP.cgH, F = tLand - tFire;
    const S = F / (Math.sqrt(r / (r - 1)) + 1), gS = 2 * R / (S * S);   // 示意 gravity (slowed)
    const tau = S / Math.sqrt((r - 1) * r);         // burst length
    const a1 = (r - 1) * gS, vB = a1 * tau, hB = SP.cgH + 0.5 * a1 * tau * tau;
    const height = (t) => {
      const u = t - tFire;
      if (u <= 0) return SP.cgH;
      if (u < tau) return SP.cgH + 0.5 * a1 * u * u;
      return Math.max(SP.cgH, hB + vB * (u - tau) - 0.5 * gS * (u - tau) ** 2);
    };
    const build = (D) => {
      const v = D / F, aD = v / (tFire - tGo), xF = X_LAND + 0.5 * v * (tFire - tGo), xL = xF + D, Tstop = 0.7;
      const xAt = (t) => {
        if (t < tGo) return X_LAND;
        if (t < tFire) return X_LAND + 0.5 * aD * (t - tGo) ** 2;
        if (t < tLand) return xF + v * (t - tFire);
        const u = Math.min(t - tLand, Tstop); return xL + v * u - v * u * u / (2 * Tstop);
      };
      // Lowest height of the car's underside over each ground point, sampled along the flight.
      const x0 = xF - NOSE - 1, x1 = xL + TAIL + 1, dxg = 0.05, n = Math.ceil((x1 - x0) / dxg);
      const prof = new Float64Array(n).fill(Infinity);
      for (let t = tFire; t <= tLand + 0.3; t += 1 / 240) {
        const xc = xAt(t), yb = height(t) - SP.cgH;
        for (let i = Math.max(0, Math.floor((xc - TAIL - x0) / dxg)); i < n && x0 + i * dxg <= xc + NOSE; i++) prof[i] = Math.min(prof[i], yb);
      }
      const clearAt = (a, b) => { let m = Infinity; for (let i = Math.floor((a - x0) / dxg); i <= Math.ceil((b - x0) / dxg); i++) m = Math.min(m, prof[Math.max(0, Math.min(n - 1, i))]); return m; };
      // Semi under the highest stretch, the others either side.
      let best = 0, bx = 0; for (let i = 0; i < n; i++) { const x = x0 + i * dxg; const c = clearAt(x - 1.25, x + 1.25); if (c > best) { best = c; bx = x; } }
      const gap = 0.6, out = []; const mid = VEHICLES[2];
      out[2] = { ...mid, x: bx - mid.w / 2 };
      out[1] = { ...VEHICLES[1], x: out[2].x - gap - VEHICLES[1].w }; out[0] = { ...VEHICLES[0], x: out[1].x - gap - VEHICLES[0].w };
      out[3] = { ...VEHICLES[3], x: out[2].x + mid.w + gap }; out[4] = { ...VEHICLES[4], x: out[3].x + VEHICLES[3].w + gap };
      const mOf = (o) => clearAt(o.x, o.x + o.w) - o.h;
      for (let k = 0; k < 80 && Math.abs(mOf(out[0]) - mOf(out[4])) > 0.05; k++) {   // centre the row under the arc
        const sh = mOf(out[0]) < mOf(out[4]) ? 0.05 : -0.05; for (const o of out) o.x += sh;
      }
      const margin = Math.min(...out.map(mOf));
      return { v, xF, xL, xAt, veh: out, margin, Tstop };
    };
    let B = build(18);
    for (let D = 18; D <= 40 && B.margin < 0.45; D += 0.25) B = build(D);   // widen the jump until it clears
    const pose = (t) => {
      const x = B.xAt(t);
      return { x, y: height(t), phi: 0, wheel: -(x - X_LAND) / (SP.wheelR / SP.pxm), landed: t >= tLand };
    };
    const jets = [
      { name: "downF", pt: SP.downF, dir: [0, 1], on: tFire, off: tFire + tau },
      { name: "downR", pt: SP.downR, dir: [0, 1], on: tFire, off: tFire + tau },
    ];
    return { pose, jets, tGo, tFire, tLand, tau, r, gS, vehicles: B.veh, margin: B.margin, v: B.v, xF: B.xF, xL: B.xL };
  }

  root.THRUST_MOTION = (SHOT) => {
    const T = timing(SHOT);
    return { T, X_LAND, NOSE, TAIL, VEHICLES, s09: () => makeS09(T), s10: () => makeS10(T) };
  };
})(typeof window !== "undefined" ? window : globalThis);
