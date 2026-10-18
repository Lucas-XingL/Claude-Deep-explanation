#!/usr/bin/env bash
# Render one storyboard shot from a HyperFrames composition into scenes/<id>/clip.mp4.
#
#   bash render_shot.sh <composition dir> <timeline.json> <id> <out clip.mp4> \
#        [--quality draft|looks|delivery] [--workers auto|N] [--format mp4|mov|webm] \
#        [--stills-only [--stills-at 2,9] [--stills-out <dir>]] [--no-check] [--check-args "<…>"] [--force]
#
# What it takes care of:
#   - a build copy with the shot's timing (build_shot.mjs): shot.js with window.SCENE/SHOT, the
#     root's data-duration/width/height from the timeline, ../_shared/ files brought inside;
#   - the gate before rendering: `hyperframes check` (lint, runtime errors, layout overflow,
#     motion, WCAG contrast) with the subtitle band at the bottom reserved as an error zone
#     (safe.bottomForSubs of the project's style.json, else the skill's: nothing of the scene may
#     sit where subtitles go). Any error stops the script. --no-check runs only the lint;
#   - telemetry off, and no frame descriptions sent anywhere (snapshot --describe false);
#   - afterwards the clip's length is compared with the shot's and a middle frame is saved next
#     to the clip (<out>.check.png): look at it before moving on;
#   - a shot whose composition, shared files, timing and options are unchanged is not rendered
#     again (<out>.inputs.sha256); --force renders it anyway.
# --stills-only writes stills of the shot (five across it, or at --stills-at seconds) into
# --stills-out <dir> (default check/<id>/) and stops:
# the stills for the plan page (step 6) and for looking at a shot before rendering it.
# --format mov or webm keeps transparency (a label layer to lay over another clip with ffmpeg);
# a shot for assemble.py is the default mp4.
# The hyperframes command: $HYPERFRAMES if set, else the one setup.sh installed, else hyperframes
# on PATH, else npx hyperframes@HF_VERSION.
set -euo pipefail
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1
HF_VERSION=${HF_VERSION:-0.8.172}
here=$(cd "$(dirname "$0")" && pwd)
comp=$(cd "$1" && pwd); timeline=$(realpath "$2"); id="$3"; out=$(realpath -m "$4"); shift 4
quality=looks; workers=auto; format=mp4; stills=0; stillsat=""; stillsout=""; check=1; checkargs=""; force=0
while [ $# -gt 0 ]; do
  case "$1" in
    --quality) quality="$2"; shift 2;; --workers) workers="$2"; shift 2;; --format) format="$2"; shift 2;;
    --stills-only) stills=1; shift;; --stills-at) stillsat="$2"; shift 2;; --stills-out) stillsout=$(realpath -m "$2"); shift 2;;
    --no-check) check=0; shift;; --check-args) checkargs="$2"; shift 2;; --force) force=1; shift;;
    *) echo "unknown option $1"; exit 2;;
  esac
done
tools=${HF_TOOLS:-${XDG_CACHE_HOME:-$HOME/.cache}/explainer-video/hyperframes}
if [ -n "${HYPERFRAMES:-}" ]; then read -ra hf <<< "$HYPERFRAMES"
elif [ -x "$tools/node_modules/.bin/hyperframes" ]; then hf=("$tools/node_modules/.bin/hyperframes")
elif command -v hyperframes >/dev/null; then hf=(hyperframes)
else hf=(npx --yes "hyperframes@$HF_VERSION"); fi

# Cache: the composition's files, ../_shared/, this shot's timing and the options, hashed together.
shot_json=$(node -e "const t=require('$timeline');const s=t.shots.find(s=>s.id==='$id');if(!s){console.error('shot $id is not in $timeline');process.exit(2)}console.log(JSON.stringify([s,t.width,t.height,t.fps]))")
key=$( { cd "$comp"
  find . -type f -not -path './.hyperframes/*' -not -path './node_modules/*' -not -path './renders/*' \
       -not -name 'shot.js' -not -name "$(basename "$out")*" -print0 | sort -z | xargs -0 sha256sum
  if grep -rqs --include='*.html' --include='*.css' --include='*.js' '\.\./_shared/' .; then
    (cd ../_shared 2>/dev/null && find . -type f -print0 | sort -z | xargs -0 sha256sum)
  fi
  echo "$shot_json $quality $format $check $checkargs"; cat "$here/render_shot.sh" "$here/build_shot.mjs"; } | sha256sum | cut -c1-64)
if [ "$stills" = 0 ] && [ "$force" = 0 ] && [ -f "$out" ] && [ "$(cat "$out.inputs.sha256" 2>/dev/null)" = "$key" ]; then
  echo "cached: $out (composition, timing and options unchanged; --force to render again)"; exit 0
fi

build=$(mktemp -d "${TMPDIR:-/tmp}/hf-$id-XXXXXX")
trap 'rm -rf "$build"' EXIT
info=$(node "$here/build_shot.mjs" "$comp" "$timeline" "$id" "$build" --exclude "$(basename "$out")" \
       --exclude "$(basename "$out").check.png" --exclude "$(basename "$out").inputs.sha256")
dur=$(node -e "console.log(($info).duration)"); fps=$(node -e "console.log(($info).fps)")
w=$(node -e "console.log(($info).width)"); h=$(node -e "console.log(($info).height)")

# The subtitle band: safe.bottomForSubs of the project's style.json (the skill's when there is none).
style="$here/../../templates/style.json"
for d in "$comp/.." "$comp/../.." "$comp/../../.."; do [ -f "$d/style.json" ] && style="$d/style.json" && break; done
band=$(node -e "const s=require('$(realpath "$style")').safe;const p=$h>$w;console.log((1-(p?s.portrait:s.landscape).bottomForSubs).toFixed(2))")
if [ "$check" = 1 ]; then
  # shellcheck disable=SC2086
  "${hf[@]}" check "$build" --caption-zone "x0=0;y0=$band;x1=1;y1=1;severity=error" $checkargs \
    || { echo "hyperframes check failed for $id: fix the findings above (layout, contrast, lint) and run again" >&2; exit 1; }
else
  "${hf[@]}" lint "$build" || { echo "hyperframes lint failed for $id" >&2; exit 1; }
fi

mkdir -p "$(dirname "$out")"
if [ "$stills" = 1 ]; then
  ts=${stillsat:-$(node -e "const d=$dur;console.log([0.02,0.25,0.5,0.75,0.98].map(f=>(f*d).toFixed(2)).join(','))")}
  stillsout=${stillsout:-$PWD/check/$id}
  "${hf[@]}" snapshot "$build" --at "$ts" --no-end --describe false -o "$stillsout" | tail -1
  echo "stills in $stillsout"; exit 0
fi
# Render inside the build folder (hyperframes writes work-<uuid>/ and .<name>.hf-transaction-*/
# next to its output while it runs), then move the finished clip into place.
"${hf[@]}" render "$build" -o "$build/clip.$format" --fps "$fps" --quality "$quality" --workers "$workers" --format "$format" --strict \
  > "$build/render.log" 2>&1 || { tail -40 "$build/render.log"; echo "hyperframes render failed for $id" >&2; exit 1; }
mv -f "$build/clip.$format" "$out"
got=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
node -e "const g=$got,d=$dur;if(Math.abs(g-d)>0.1){console.error('clip is '+g+' s, shot is '+d+' s');process.exit(1)}"
ffmpeg -v error -y -ss "$(node -e "console.log($dur/2)")" -i "$out" -frames:v 1 "$out.check.png"
echo "$key" > "$out.inputs.sha256"
echo "ok: $out (${got}s) · check frame: $out.check.png"
