#!/usr/bin/env node
// Make a renderable copy of a HyperFrames composition for one storyboard shot.
//
//   node build_shot.mjs <composition dir> <timeline.json> <shot id> <build dir> [--exclude <name>]…
//
// - copies the composition into <build dir> (without .hyperframes/, node_modules/, renders/ and
//   any --exclude'd name, e.g. the clip being rendered when it sits next to index.html);
// - files the composition loads from ../_shared/ (fonts, GSAP, model.js, paper.css) are copied
//   into the build and the references rewritten: hyperframes serves the project folder only;
// - writes shot.js (window.SCENE and window.SHOT, the same objects capture_frames.mjs gives an
//   HTML scene) into the build and into the composition, so `hyperframes preview` of the source
//   shows the real narration times;
// - sets the root composition's data-duration, data-width and data-height from the timeline;
// - resolves narration times written on clips (a registry block, a video, a sub-composition):
//     data-start="@L004"            when line L004 starts
//     data-start="@L004:零点八-0.3"  0.3 s before that phrase is spoken (same matching as wordAt)
//     data-duration="@rest"         until the end of the shot
//     data-duration="@L006"         until line L006 starts (also with :phrase and ±seconds)
// Prints {build, duration, width, height, fps} as JSON.
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";

const args = process.argv.slice(2);
const exclude = new Set([".hyperframes", "node_modules", "renders"]);
const pos = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--exclude") exclude.add(args[++i]);
  else pos.push(args[i]);
}
const [compArg, timelineArg, id, buildArg] = pos;
if (!buildArg) {
  console.error("usage: node build_shot.mjs <composition dir> <timeline.json> <shot id> <build dir> [--exclude <name>]");
  process.exit(2);
}
const comp = resolve(compArg), build = resolve(buildArg);
const tl = JSON.parse(readFileSync(timelineArg, "utf8"));
const shot = tl.shots.find((s) => s.id === id);
if (!shot) { console.error(`shot ${id} is not in ${timelineArg}`); process.exit(2); }
const width = tl.width || 1920, height = tl.height || 1080, fps = tl.fps || 30;
if (!existsSync(join(comp, "index.html"))) { console.error(`${comp}/index.html not found`); process.exit(2); }

rmSync(build, { recursive: true, force: true });
cpSync(comp, build, { recursive: true, filter: (src) => src === comp || !exclude.has(basename(src)) });

// ../_shared/ → _shared/ inside the build (one more ../ per folder level for nested files).
const shared = resolve(comp, "..", "_shared");
const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? (n === "_shared" && dir === build ? [] : walk(p)) : [p];
});
let usesShared = false;
for (const file of walk(build).filter((f) => /\.(html|css|js|mjs)$/.test(f))) {
  const depth = relative(build, file).split(sep).length - 1;
  const from = "../".repeat(depth + 1) + "_shared/", to = "../".repeat(depth) + "_shared/";
  const text = readFileSync(file, "utf8");
  if (text.includes(from)) {
    usesShared = true;
    writeFileSync(file, text.split(from).join(to));
  }
}
if (usesShared) {
  if (!existsSync(shared)) { console.error(`the composition loads ../_shared/ but ${shared} does not exist (run scripts/hyperframes/setup.sh)`); process.exit(2); }
  cpSync(shared, join(build, "_shared"), { recursive: true });
}

// shot.js: the same SCENE/SHOT objects an HTML scene gets from capture_frames.mjs.
const SCENE = { width, height, fps, duration: shot.duration };
const SHOT = { id: shot.id, duration: shot.duration, lines: shot.lines };
const js = "// Written by scripts/hyperframes/build_shot.mjs from audio/timeline.json; do not edit.\n"
  + `window.SCENE = ${JSON.stringify(SCENE)};\nwindow.SHOT = ${JSON.stringify(SHOT)};\n`;
writeFileSync(join(build, "shot.js"), js);
writeFileSync(join(comp, "shot.js"), js);

// Root composition: duration and size from the timeline.
const index = join(build, "index.html");
let html = readFileSync(index, "utf8");
const m = html.match(/<([a-z][\w-]*)\b[^>]*\bdata-composition-id=["'][^"']*["'][^>]*>/i);
if (!m) { console.error("index.html has no element with data-composition-id (the root composition)"); process.exit(2); }
let tag = m[0];
for (const [k, v] of [["data-duration", shot.duration], ["data-width", width], ["data-height", height]]) {
  const re = new RegExp(`\\s${k}=["'][^"']*["']`);
  tag = re.test(tag) ? tag.replace(re, ` ${k}="${v}"`) : tag.replace(/\s*>$/, ` ${k}="${v}">`);
}
html = html.replace(m[0], tag);

// Narration times on clips.
const SKIP = /[\s，。！？；：、,.!?;:“”"'（）()《》—…·-]/g;
const wordAt = (lid, phrase) => {
  const l = shot.lines.find((x) => x.id === lid);
  if (!l) { console.error(`line ${lid} is not in shot ${id}`); process.exit(2); }
  const p = (phrase || "").replace(SKIP, "");
  if (!p) return l.start;
  if (l.words && l.words.length) {
    let s = ""; const at = [];
    for (const w of l.words) { const cs = [...w.text.replace(SKIP, "")]; cs.forEach((c, k) => { s += c; at.push(w.start + (w.end - w.start) * k / cs.length); }); }
    const k = s.indexOf(p); if (k >= 0) return at[[...s.slice(0, k)].length];
  }
  const txt = (l.text || "").replace(SKIP, ""), k = txt.indexOf(p);
  if (k < 0) console.error(`warning: "${phrase}" is not in ${lid}; using the line's start`);
  return k < 0 ? l.start : l.start + (l.end - l.start) * [...txt.slice(0, k)].length / Math.max(1, [...txt].length);
};
const resolveAt = (ref) => {
  const r = ref.match(/^@(L\w+)(?::([^+\-]+))?([+-][\d.]+)?$/);
  if (!r) { console.error(`cannot read "${ref}": use @L004, @L004:phrase, @L004:phrase-0.3 or @rest`); process.exit(2); }
  return Math.max(0, wordAt(r[1], r[2]) + Number(r[3] || 0));
};
const r3 = (x) => Math.round(x * 1000) / 1000;
html = html.replace(/<[a-z][\w-]*\b[^>]*\bdata-(?:start|duration)=["']@[^"']*["'][^>]*>/gi, (t) => {
  const st = t.match(/\sdata-start=["']([^"']*)["']/);
  const start = st && st[1].startsWith("@") ? resolveAt(st[1]) : Number(st ? st[1] : 0);
  t = t.replace(/(\sdata-start=["'])@[^"']*(["'])/, `$1${r3(start)}$2`);
  return t.replace(/(\sdata-duration=["'])(@[^"']*)(["'])/, (_, a, ref, b) =>
    `${a}${r3(Math.max(0.1, (ref === "@rest" ? shot.duration : resolveAt(ref)) - start))}${b}`);
});
writeFileSync(index, html);
console.log(JSON.stringify({ build, duration: shot.duration, width, height, fps }));
