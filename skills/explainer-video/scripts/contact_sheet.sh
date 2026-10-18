#!/usr/bin/env bash
# Contact sheets and technical checks from a rendered video.
#
#   bash contact_sheet.sh out/final.mp4 check/final [every_seconds=5] [cols=3] [rows=3]
#
# Writes <outdir>/sheet_01.jpg … (each tile stamped with its timestamp), then prints:
#   black frames (blackdetect), long frozen stretches (freezedetect), loudness (EBU R128).
set -euo pipefail
in="${1:?video}"; out="${2:?output dir}"; every="${3:-5}"; cols="${4:-3}"; rows="${5:-3}"
mkdir -p "$out"
font=$(fc-match -f '%{file}' 'DejaVu Sans' 2>/dev/null || true)
ff=""; [ -n "$font" ] && ff=":fontfile='$font'"
# select (not fps=): fps re-times the frames it keeps, so a tile stamped 00:10 could show 00:12.5.
# select keeps each frame's own time, so the stamp is the moment the tile really shows.
ffmpeg -v error -y -i "$in" -vf "select='isnan(prev_selected_t)+gte(t-prev_selected_t\\,${every})',scale=640:-2,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.7${ff},tile=${cols}x${rows}" -fps_mode passthrough "$out/sheet_%02d.jpg"
ls "$out"/sheet_*.jpg

echo "--- duration"
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$in"
echo "--- black frames (>0.5s)"
ffmpeg -v info -i "$in" -vf "blackdetect=d=0.5:pix_th=0.06" -an -f null - 2>&1 | grep -o 'black_start.*' || echo "none"
echo "--- frozen stretches (>4s, a held frame where motion was expected?)"
ffmpeg -v info -i "$in" -vf "freezedetect=n=0.002:d=4" -an -f null - 2>&1 | grep -oE 'freeze_(start|duration): [0-9.]+' | paste - - || echo "none"
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$in" | grep -q .; then
  echo "--- loudness (target about -16 LUFS integrated, true peak below -1 dBTP)"
  ffmpeg -v info -i "$in" -af ebur128=peak=true -vn -f null - 2>&1 | grep -A12 'Summary' | grep -E 'I:|Peak:' || true
else
  echo "--- no audio stream"
fi
