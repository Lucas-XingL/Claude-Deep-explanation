#!/usr/bin/env bash
# End-to-end smoke test of the pipeline, in the skill's order:
#   1. plan: estimated timeline (no voice yet) → stills → plan page for the user to confirm;
#   2. film: placeholder voice → timeline → frames (skipped when unchanged) → score → film → checks.
# Swap --engine placeholder for a real TTS (see references/audio.md) to hear actual narration.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SK="$HERE/../../scripts"

# 1. Plan page. In a real project, stop after this step until the user confirms.
python3 "$SK/lint_project.py" "$HERE"
python3 "$SK/timeline.py" "$HERE" --out plan/est > /dev/null
node "$SK/capture_frames.mjs" "$HERE/scenes/S01/index.html" --timeline "$HERE/plan/est/timeline.json" --shot S01 \
     --stills 3 --out "$HERE/plan/stills/S01" > /dev/null
node "$SK/capture_frames.mjs" "$HERE/scenes/S02/index.html" --timeline "$HERE/plan/est/timeline.json" --shot S02 \
     --stills 2,11 --out "$HERE/plan/stills/S02" > /dev/null
python3 "$SK/make_plan.py" "$HERE"

# 2. Full film.
python3 "$SK/tts_lines.py" "$HERE" --engine placeholder
python3 "$SK/timeline.py" "$HERE"
for id in S01 S02 S03; do
  node "$SK/capture_frames.mjs" "$HERE/scenes/$id/index.html" \
       --timeline "$HERE/audio/timeline.json" --shot "$id" --out "$HERE/scenes/$id/clip.mp4"
done
python3 "$SK/make_bed.py" "$HERE/audio/bed.wav" --timeline "$HERE/audio/timeline.json" --storyboard "$HERE/storyboard.json"
python3 "$SK/assemble.py" "$HERE" --bgm "$HERE/audio/bed.wav"
bash "$SK/contact_sheet.sh" "$HERE/out/final.mp4" "$HERE/check" 2
python3 "$SK/check_sync.py" "$HERE"
echo "done: $HERE/out/final.mp4  (look at $HERE/check/sheet_*.jpg; the plan page is $HERE/plan/index.html)"
