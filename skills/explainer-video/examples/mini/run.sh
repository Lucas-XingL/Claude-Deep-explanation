#!/usr/bin/env bash
# End-to-end smoke test of the pipeline: placeholder voice → timeline → frames → film → checks.
# Swap --engine placeholder for a real TTS (see references/audio.md) to hear actual narration.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SK="$HERE/../../scripts"

python3 "$SK/lint_project.py" "$HERE"
python3 "$SK/tts_lines.py" "$HERE" --engine placeholder
python3 "$SK/timeline.py" "$HERE"
for id in S01 S02 S03; do
  node "$SK/capture_frames.mjs" "$HERE/scenes/$id/index.html" \
       --timeline "$HERE/audio/timeline.json" --shot "$id" --out "$HERE/scenes/$id/clip.mp4"
done
python3 "$SK/assemble.py" "$HERE"
bash "$SK/contact_sheet.sh" "$HERE/out/final.mp4" "$HERE/check" 2
echo "done: $HERE/out/final.mp4  (look at $HERE/check/sheet_*.jpg)"
