#!/usr/bin/env node
// Render an HTML scene frame by frame (deterministic, never a screen recording).
//
//   node capture_frames.mjs scenes/S01/index.html --out scenes/S01/clip.mp4 \
//        --timeline audio/timeline.json --shot S01
//   node capture_frames.mjs scenes/S01/index.html --out scenes/S01/clip.mp4 --duration 6
//   node capture_frames.mjs scenes/S01/index.html --stills 0,2.5,5.9 --out check/S01
//
// Options:
//   --timeline <file> --shot <id>  duration and line times from audio/timeline.json
//   --duration <s>                 when there is no timeline (or SCENE.duration in the page)
//   --fps 30  --width 1920 --height 1080   (default: timeline/storyboard size, else 1920×1080)
//   --stills t1,t2,…               write PNG stills at these times into --out (a directory)
//   --frames <dir>                 also keep every frame as JPEG
//   --png                          lossless frames into the encoder (slower, larger)
//   --crf 16                       x264 quality for the clip
//
// The page contract (see references/render.md):
//   window.SCENE      {width, height, fps, duration}  set by this script before the page runs
//   window.SHOT       {id, duration, lines:[{id,start,end,text}]}  times relative to the shot
//   window.sceneReady optional Promise; capture waits for it (fonts, images, models)
//   window.renderFrame(t)  draws the frame at t seconds; may be async
// Also seeked at every frame: CSS/Web Animations, GSAP's global timeline, and
// requestAnimationFrame/performance.now/Date.now (virtual clock), with Math.random seeded.

import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, join, extname } from "node:path";
import { pathToFileURL } from "node:url";

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith("--")) { a._.push(k); continue; }
    const key = k.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) a[key] = true;
    else { a[key] = next; i++; }
  }
  return a;
}

async function loadChromium() {
  for (const name of ["playwright", "playwright-core"]) {
    try { return (await import(name)).chromium; } catch {}
    try { return createRequire(join(process.cwd(), "x.js"))(name).chromium; } catch {}
    try {
      const root = execSync("npm root -g", { encoding: "utf8" }).trim();
      return createRequire(join(root, "x.js"))(name).chromium;
    } catch {}
  }
  console.error("Playwright not found. Install it with: npm i -D playwright-core  (or npm i -g playwright)");
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const page_path = args._[0];
if (!page_path || !args.out) {
  console.error("usage: node capture_frames.mjs <scene.html> --out <clip.mp4|dir> [--timeline f --shot id | --duration s] [--stills t,…]");
  process.exit(2);
}

let shot = null, tl = null;
if (args.timeline) {
  tl = JSON.parse(readFileSync(args.timeline, "utf8"));
  if (!args.shot) { console.error("--timeline needs --shot"); process.exit(2); }
  shot = tl.shots.find((s) => s.id === args.shot);
  if (!shot) { console.error(`shot ${args.shot} not in ${args.timeline}`); process.exit(2); }
}
const fps = Number(args.fps || tl?.fps || 30);
const width = Number(args.width || tl?.width || 1920);
const height = Number(args.height || tl?.height || 1080);
let duration = Number(args.duration || shot?.duration || 0);

const chromium = await loadChromium();
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist",
         "--font-render-hinting=none", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.error(`[page ${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => console.error(`[page error] ${e.message}`));

const init = { SCENE: { width, height, fps, duration }, SHOT: shot ? { id: shot.id, duration: shot.duration, lines: shot.lines } : null };
await page.addInitScript((init) => {
  window.SCENE = init.SCENE;
  window.SHOT = init.SHOT;
  // Virtual clock: libraries that read time or use rAF become deterministic.
  let vt = 0;
  const base = Date.UTC(2026, 0, 1);
  const realRAF = window.requestAnimationFrame.bind(window);
  window.__realRAF = realRAF;
  let queue = [];
  window.requestAnimationFrame = (cb) => { queue.push(cb); return queue.length; };
  window.cancelAnimationFrame = () => {};
  performance.now = () => vt * 1000;
  Date.now = () => base + vt * 1000;
  // Seeded Math.random (mulberry32) so particles and noise are the same every render.
  let seed = 0x2f6b9d1;
  Math.random = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.__seek = async (t) => {
    vt = t;
    if (typeof window.renderFrame === "function") await window.renderFrame(t);
    for (const an of document.getAnimations()) { an.pause(); an.currentTime = t * 1000; }
    if (window.gsap?.globalTimeline) { window.gsap.globalTimeline.pause(); window.gsap.globalTimeline.time(t, false); }
    const q = queue; queue = [];
    for (const cb of q) cb(t * 1000);
    await new Promise((r) => realRAF(() => realRAF(r)));
  };
}, init);

await page.goto(pathToFileURL(resolve(page_path)).href, { waitUntil: "load" });
await page.evaluate(async () => { await document.fonts.ready; if (window.sceneReady) await window.sceneReady; });
if (!duration) duration = Number(await page.evaluate(() => window.SCENE?.duration || 0));
if (!duration && !args.stills) { console.error("no duration: pass --duration, --timeline/--shot, or set SCENE.duration"); process.exit(2); }

const shoot = (type) => page.screenshot(type === "png" ? { type: "png" } : { type: "jpeg", quality: 95 });

if (args.stills) {
  mkdirSync(args.out, { recursive: true });
  for (const s of String(args.stills).split(",")) {
    const t = Number(s);
    await page.evaluate((t) => window.__seek(t), t);
    const f = join(args.out, `t_${t.toFixed(2)}.png`);
    writeFileSync(f, await shoot("png"));
    console.log(f);
  }
  await browser.close();
  process.exit(0);
}

const total = Math.round(duration * fps);
const out = resolve(args.out);
mkdirSync(dirname(out), { recursive: true });
if (args.frames) mkdirSync(args.frames, { recursive: true });
const png = !!args.png;
const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps),
  "-c:v", png ? "png" : "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", String(args.crf || 16),
  "-pix_fmt", "yuv420p", "-r", String(fps), "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));

const t0 = Date.now();
for (let i = 0; i < total; i++) {
  const t = i / fps;
  await page.evaluate((t) => window.__seek(t), t);
  const buf = await shoot(png ? "png" : "jpeg");
  if (args.frames) writeFileSync(join(args.frames, `f_${String(i).padStart(5, "0")}.${png ? "png" : "jpg"}`), buf);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % fps === 0) process.stdout.write(`\r${shot?.id || "scene"} ${(t).toFixed(0)}/${duration.toFixed(1)}s`);
}
ff.stdin.end();
await done;
await browser.close();
console.log(`\nwrote ${out}  (${total} frames, ${width}×${height}@${fps}, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
