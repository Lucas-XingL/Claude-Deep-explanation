// One gear model shared by every shot, so angles, counts and readouts always agree.
// m = module (tooth size in px), z = tooth count, theta = rotation in radians.
window.GEAR = {
  pitch: (m, z) => (m * z) / 2,                       // pitch radius
  // Angle of a gear with z2 teeth driven by a gear with z1 teeth at angle th1 (meshing on the
  // line of centres, driver on the left). Equal teeth pass per unit time: th2 = -th1 * z1/z2.
  follow: (th1, z1, z2) => -th1 * (z1 / z2) + Math.PI / z2 + Math.PI,
  revs: (th) => Math.abs(th) / (2 * Math.PI),
  draw(g, cx, cy, m, z, theta, { fill = "#ddd", stroke = "#333", lw = 2, hub = true } = {}) {
    const r = (m * z) / 2, ra = r + m, rd = r - 1.25 * m, step = (2 * Math.PI) / z;
    g.save(); g.translate(cx, cy); g.rotate(theta);
    g.beginPath();
    for (let i = 0; i < z; i++) {
      const a = i * step;
      // Tooth: root → flank up → tip → flank down, as a simple trapezoid.
      const pts = [[rd, a - step * 0.5], [rd, a - step * 0.28], [ra, a - step * 0.14], [ra, a + step * 0.14], [rd, a + step * 0.28]];
      pts.forEach(([rr, aa], j) => { const x = rr * Math.cos(aa), y = rr * Math.sin(aa); (i === 0 && j === 0) ? g.moveTo(x, y) : g.lineTo(x, y); });
    }
    g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = stroke; g.lineJoin = "round"; g.stroke();
    if (hub) {
      g.beginPath(); g.arc(0, 0, Math.max(6, r * 0.18), 0, Math.PI * 2); g.fillStyle = stroke; g.fill();
      g.beginPath(); g.moveTo(0, 0); g.lineTo(rd * 0.8, 0); g.lineWidth = lw * 1.5; g.stroke(); // index mark to count turns
    }
    g.restore();
  },
};
