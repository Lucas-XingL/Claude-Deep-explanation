#!/usr/bin/env bash
# Conform a piece of real material (a video or a still) for the opening shot.
#
#   bash footage.sh <input video|image> <out dir> [--from 6:10] [--duration 4] [--ratio 16:9] \
#        [--crop w:h:x:y] [--cover x:y:w:h] [--credit "画面：……"] [--keep-audio]
#
# Writes into <out dir>:
#   clip.mp4   (video input) cut from --from for --duration seconds, cropped to fill the ratio,
#              30 fps, the credit burned in at the top left, no audio unless --keep-audio.
#              A source shorter than --duration holds its last frame: the reveal scene
#              (templates/scene-reveal.html) starts from that same frame, so the hold is invisible.
#   last.png   the last frame without the credit (for an image input: the conformed image)
#   edges.png  a line drawing of last.png, dark lines on white, for the reveal scene
# --crop is applied to the source before it is scaled to fill the frame (cut off burned-in titles,
# logos or a watermark this way). --cover fills a burned-in title or logo from its surroundings (ffmpeg
# delogo) when it cannot be cropped away without losing the subject; the box must not touch the edge
# (source pixels; repeatable). Times accept seconds or m:ss.
set -euo pipefail
in="$1"; out="$2"; shift 2
from=0; dur=4; ratio=16:9; crop=""; credit=""; audio=0; cover=""
while [ $# -gt 0 ]; do
  case "$1" in
    --from) from="$2"; shift 2;; --duration) dur="$2"; shift 2;; --ratio) ratio="$2"; shift 2;;
    --crop) crop="$2"; shift 2;; --credit) credit="$2"; shift 2;; --keep-audio) audio=1; shift;;
    --cover) IFS=: read -r cx cy cw ch <<< "$2"; cover="${cover}delogo=x=$cx:y=$cy:w=$cw:h=$ch,"; shift 2;;
    *) echo "unknown option $1"; exit 2;;
  esac
done
case "$ratio" in 16:9) W=1920; H=1080;; 9:16) W=1080; H=1920;; 1:1) W=1080; H=1080;; 4:5) W=1080; H=1350;;
  *) echo "ratio must be 16:9, 9:16, 1:1 or 4:5"; exit 2;; esac
mkdir -p "$out"
fill="${cover}${crop:+crop=$crop,}scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H,setsar=1"

case "${in,,}" in
  *.jpg|*.jpeg|*.png|*.webp|*.bmp)
    ffmpeg -v error -y -i "$in" -vf "$fill" -frames:v 1 "$out/last.png" ;;
  *)
    a=(-an); [ "$audio" = 1 ] && a=(-c:a aac -b:a 160k)
    ffmpeg -v error -y -ss "$from" -t "$dur" -i "$in" \
      -vf "$fill,fps=30,tpad=stop_mode=clone:stop_duration=$dur,format=yuv420p" -t "$dur" \
      -c:v libx264 -crf 16 -preset medium "${a[@]}" -movflags +faststart "$out/clean.mp4"
    ffmpeg -v error -y -sseof -0.1 -i "$out/clean.mp4" -frames:v 1 -update 1 "$out/last.png"
    if [ -n "$credit" ]; then
      font=$(fc-match -f "%{file}" ":lang=zh-cn" 2>/dev/null || true)
      printf '%s' "$credit" > "$out/credit.txt"
      size=$((H / 40)); [ "$W" -lt "$H" ] && size=$((W / 26))
      ffmpeg -v error -y -i "$out/clean.mp4" -vf "drawtext=textfile='$out/credit.txt'${font:+:fontfile='$font'}:fontsize=$size:fontcolor=white:box=1:boxcolor=black@0.45:boxborderw=$((size / 2)):x=w*0.035:y=h*0.05" \
        -c:v libx264 -crf 16 -preset medium -c:a copy -movflags +faststart "$out/clip.mp4"
    else
      cp "$out/clean.mp4" "$out/clip.mp4"
    fi
    got=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/clip.mp4")
    echo "clip: $out/clip.mp4 (${got}s, ${W}x$H)" ;;
esac
ffmpeg -v error -y -i "$out/last.png" -vf "format=gray,edgedetect=low=0.06:high=0.18:mode=wires,negate" "$out/edges.png"
echo "still: $out/last.png · lines: $out/edges.png"
