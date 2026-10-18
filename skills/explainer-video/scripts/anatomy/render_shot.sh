#!/usr/bin/env bash
# Build and render one storyboard shot from an anatomy-reveal project into scenes/<id>/clip.mp4.
#
#   bash render_shot.sh <anatomy project> <shot.mjs> <timeline.json> <id> <out clip.mp4> \
#        [--ratio 16:9] [--jobs 3] [--step 8] [--most 6] [--stills-only] [--min-parts 40] [--force]
#
# What it takes care of (each one cost us a render):
#   - render.mjs takes positional args; in blur mode the unused third one swallows the next
#     option, so --page would be ignored and the template's example object rendered. We pass "_".
#   - the clip's folder is created before encoding (ffmpeg does not create it).
#   - MAGICK falls back to ImageMagick 6 "convert" when "magick" is missing.
#   - the shot is split into --jobs time ranges rendered in parallel, then encoded once.
#   - afterwards the clip's length is compared with the shot's and a middle frame is saved
#     next to the clip (<out>.check.png): look at it before moving on.
#   - the model's part count is read from the built page; under --min-parts (40, the anatomy
#     "Figure" scale) the script stops: a dozen boxes is a toy, not an anatomy figure. Pass
#     --min-parts 0 only for a deliberately simple object, and say why in the storyboard notes.
#   - a shot whose object, keys, timing and options are unchanged is not rendered again
#     (<out>.inputs.sha256 records them); --force renders it anyway.
# --stills-only renders five stills of the built page into <out dir>/stills/ and stops.
set -euo pipefail
proj=$(cd "$1" && pwd); shotfile=$(realpath "$2"); timeline=$(realpath "$3"); id="$4"; out=$(realpath -m "$5"); shift 5
ratio=16:9; jobs=3; step=8; most=6; stills=0; minparts=40; force=0
while [ $# -gt 0 ]; do
  case "$1" in
    --ratio) ratio="$2"; shift 2;; --jobs) jobs="$2"; shift 2;; --step) step="$2"; shift 2;;
    --most) most="$2"; shift 2;; --stills-only) stills=1; shift;; --min-parts) minparts="$2"; shift 2;;
    --force) force=1; shift;;
    *) echo "unknown option $1"; exit 2;;
  esac
done
# Cache: the object's code, this shot's keys, its timing and the options, hashed together.
key=$( { cat "$shotfile"
  find "$proj/object" "$proj/motion" "$proj/kit" -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.css' -o -name '*.json' \) \
       -not -path '*/motion/shots/*' -print0 2>/dev/null | sort -z | xargs -0 cat
  node -e "const t=require('$timeline');console.log(JSON.stringify(t.shots.find(s=>s.id==='$id')))"
  echo "$ratio $step $most"; cat "$0"; } | sha256sum | cut -c1-64)
if [ "$stills" = 0 ] && [ "$force" = 0 ] && [ -f "$out" ] && [ "$(cat "$out.inputs.sha256" 2>/dev/null)" = "$key" ]; then
  echo "cached: $out (object, keys, timing and options unchanged; --force to render again)"; exit 0
fi
command -v magick >/dev/null || export MAGICK="${MAGICK:-convert}"
[ -n "${CHROME_PATH:-}" ] || for c in /opt/pw-browsers/chromium /usr/bin/chromium /usr/bin/google-chrome; do [ -x "$c" ] && export CHROME_PATH="$c" && break; done
cd "$proj"
[ -f motion/build-shot.mjs ] || node "$(dirname "$0")/setup_shots.mjs" "$proj"
page="motion/shots/$id.html"
node motion/build-shot.mjs --shot "$shotfile" --timeline "$timeline" --id "$id" --ratio "$ratio" --out "shots/$id.html" | tail -1
parts=$(grep -o '"counts":{"parts":[0-9]*' "$page" | head -1 | grep -o '[0-9]*$' || true)
echo "model: ${parts:-?} parts"
if [ -n "$parts" ] && [ "$parts" -lt "$minparts" ]; then
  echo "the model has $parts parts, under the minimum of $minparts (40 is the anatomy Figure scale). Model the parts the narration names" >&2
  echo "and the ones a viewer needs to recognise the object (see references/anatomy-route.md 2 and 5)." >&2
  exit 1
fi
dur=$(node -e "const t=require('$timeline');console.log(t.shots.find(s=>s.id==='$id').duration)")
mkdir -p "$(dirname "$out")"
if [ "$stills" = 1 ]; then
  ts=$(node -e "const d=$dur;console.log([0.02,0.25,0.5,0.75,0.98].map(f=>(f*d).toFixed(2)).join(','))")
  node motion/render.mjs stills "$ts" "$(dirname "$out")/stills" --page "$page" | grep -v "forced" || true
  echo "stills in $(dirname "$out")/stills"; exit 0
fi
frames="out/blur_$id"; rm -rf "$frames"; mkdir -p out
pids=()
for ((j = 0; j < jobs; j++)); do
  from=$(node -e "console.log(($dur*$j/$jobs).toFixed(3))"); to=$(node -e "console.log(($dur*($j+1)/$jobs).toFixed(3))")
  node motion/render.mjs blur "$frames" _ --page "$page" --step "$step" --most "$most" --from "$from" --to "$to" > "out/render_${id}_$j.log" 2>&1 &
  pids+=($!)
done
fail=0; for p in "${pids[@]}"; do wait "$p" || fail=1; done
[ "$fail" = 0 ] || { echo "a render job failed: see $proj/out/render_${id}_*.log"; exit 1; }
node motion/encode.mjs "$frames" "$out" | tail -1
got=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
node -e "const g=$got,d=$dur;if(Math.abs(g-d)>0.1){console.error('clip is '+g+' s, shot is '+d+' s');process.exit(1)}"
ffmpeg -v error -y -ss "$(node -e "console.log($dur/2)")" -i "$out" -frames:v 1 "$out.check.png"
echo "$key" > "$out.inputs.sha256"
echo "ok: $out (${got}s) · check frame: $out.check.png"
