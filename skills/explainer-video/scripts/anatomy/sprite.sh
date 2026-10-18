#!/usr/bin/env bash
# Cut the anatomy object out of its paper background, for use as a sprite in 2D scenes
# (a side elevation for a physics diagram, a small icon of the object in a chart …).
#
#   bash sprite.sh <anatomy project> <built page .html> '<pose json>' <out.png>
#   e.g. bash sprite.sh car motion/shots/S01.html '{"yaw":-90,"pitch":0,"zoom":2.4}' scenes/_shared/car_side.png
#
# It renders the pose twice, once as given and once with the object pushed out of frame,
# and keeps whatever differs (a difference matte), then trims the transparent border.
# Build the page with --no-plate so the frame lines and corner text are not part of it.
set -euo pipefail
proj=$(cd "$1" && pwd); page="$2"; pose="$3"; out=$(realpath -m "$4")
command -v magick >/dev/null && IM=magick || IM=convert
[ -n "${CHROME_PATH:-}" ] || for c in /opt/pw-browsers/chromium /usr/bin/chromium /usr/bin/google-chrome; do [ -x "$c" ] && export CHROME_PATH="$c" && break; done
tmp=$(mktemp -d)
away=$(node -e "const p=JSON.parse(process.argv[1]);p.panX=(p.panX||0)+100000;console.log(JSON.stringify(p))" "$pose")
cd "$proj" && node motion/render.mjs poses "[$pose,$away]" "$tmp" --page "$page" > /dev/null
$IM "$tmp/p0.png" "$tmp/p1.png" -compose difference -composite -colorspace gray -level 0,6% -blur 0x0.6 "$tmp/alpha.png"
$IM "$tmp/p0.png" "$tmp/alpha.png" -alpha off -compose copy_opacity -composite -trim +repage "$out"
rm -rf "$tmp"
echo "wrote $out ($(identify -format '%wx%h' "$out"))"
